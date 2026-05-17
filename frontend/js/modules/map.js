/**
 * map.js — Map, Booking Flow & Frame Animation module
 *
 * Handles:
 *  - initMap()           : Leaflet map setup with station markers
 *  - selectStation()     : Station selection + routing
 *  - initBookingFlow()   : Slot loading, price calc, payment flow
 *  - updatePrice()       : Estimated cost calculation
 *  - initFrameAnimation(): Scroll-based hero canvas animation (index page)
 */

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let map;
let currentStationId    = null;
let currentStationPrice = 15;
let selectedSlot        = null;   // { slotId: Number|null, slotTime: String }
let calculatedPrice     = 0;
let userLocation        = null;
let routingControl      = null;

// ---------------------------------------------------------------------------
// Map Initialisation
// ---------------------------------------------------------------------------

function initMap() {
    // Center on India (Nagpur) at zoom level 5 to see all stations
    map = L.map('map').setView([21.1458, 79.0882], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Fetch dynamic stations from backend API
    fetch(`${API_BASE_URL}/stations`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                renderStations(data);
            } else {
                renderStations(STATIC_STATIONS); // Fallback
            }
        })
        .catch(err => {
            console.warn('Failed to fetch stations from API. Using static fallback.', err);
            renderStations(STATIC_STATIONS);
        });

    // Render a marker for each station
    function renderStations(stations) {
        stations.forEach(station => {
            const marker = L.marker([station.latitude, station.longitude]).addTo(map);
            marker.bindPopup(`
                <strong style="color:var(--bg-dark)">${station.name}</strong><br>
                <span style="color:var(--bg-dark)">₹${station.pricePerKwh}/kWh • ${station.totalSlots} Ports</span><br>
                <button onclick="selectStation(${station.id}, '${station.name}', ${station.pricePerKwh}, ${station.latitude}, ${station.longitude})"
                        style="margin-top:5px; padding:3px 8px; background:var(--accent-neon); border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
                    Select Station
                </button>
            `);
        });
    }

    // HTML5 geolocation — move map to user's position
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userLocation = L.latLng(lat, lng);
            map.setView([lat, lng], 13);

            L.circleMarker([lat, lng], {
                radius: 8,
                fillColor: '#39ff14',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map).bindPopup('You are here');
        });
    }
}

// ---------------------------------------------------------------------------
// Station Selection
// ---------------------------------------------------------------------------

/**
 * Called when user clicks "Select Station" inside a map popup.
 * Guards against unauthenticated users before proceeding.
 */
window.selectStation = function (id, name, price, lat, lng) {
    const sessionUser = getCurrentUser();
    if (!sessionUser) {
        showLoginRequired('You need to be logged in to select a charging station and make a booking.');
        return;
    }

    currentStationId    = id;
    currentStationPrice = price;

    const select = document.getElementById('stationSelect');
    select.innerHTML = `<option value="${id}">${name}</option>`;

    map.closePopup();
    updatePrice();

    // Draw route from user location to selected station
    if (userLocation && lat && lng) {
        if (routingControl) map.removeControl(routingControl);

        routingControl = L.Routing.control({
            waypoints: [userLocation, L.latLng(lat, lng)],
            routeWhileDragging: false,
            addWaypoints: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#39ff14', opacity: 0.8, weight: 6 }]
            },
            createMarker: function () { return null; }
        }).addTo(map);

        // Wire up "Open in Google Maps" button
        const btnDir = document.getElementById('btnGetDirections');
        if (btnDir) {
            btnDir.classList.remove('hidden');
            btnDir.onclick = () => {
                const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`;
                window.open(url, '_blank');
            };
        }
    }
};

// ---------------------------------------------------------------------------
// Login Required Modal Helper
// ---------------------------------------------------------------------------

function showLoginRequired(msg) {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        if (msg) document.getElementById('loginRequiredMsg').textContent = msg;
        modal.classList.remove('hidden');
    } else {
        window.location.href = 'login.html';
    }
}

// ---------------------------------------------------------------------------
// Booking Flow (slots + payment)
// ---------------------------------------------------------------------------

function initBookingFlow() {

    // --- Internal: Load available slots for selected station + date ---
    async function loadSlots() {
        if (!currentStationId) return;
        const container    = document.getElementById('slotsContainer');
        const selectedDate = document.getElementById('bookingDate').value;
        if (!selectedDate) return;

        container.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1; text-align: center; padding: 1rem 0;">Loading slots...</p>';

        try {
            // 1. Use static slots
            const dbSlots = window.STATIC_SLOTS || [];

            // 2. Fetch specific bookings for this date to know which ones are taken TODAY
            const bookRes      = await fetch(`${API_BASE_URL}/bookings/station/${currentStationId}/date/${selectedDate}`);
            const dateBookings = bookRes.ok ? await bookRes.json() : [];

            // Five fixed 2-hour time labels that match what the backend stores
            const predefinedSlots = [
                '10:00-12:00',
                '13:00-15:00',
                '16:00-18:00',
                '19:00-21:00',
                '22:00-00:00'
            ];
            const displaySlots = [
                '10:00 AM - 12:00 PM',
                '01:00 PM - 03:00 PM',
                '04:00 PM - 06:00 PM',
                '07:00 PM - 09:00 PM',
                '10:00 PM - 12:00 AM'
            ];

            container.innerHTML = '';
            let anyAvailable = false;

            predefinedSlots.forEach((slotTime, index) => {
                // Look up the existing DB slot for this time label (for the ID if it exists)
                const existingSlot = dbSlots.find(s => s.slotTime === slotTime);
                
                // A slot is booked if there's a booking for this specific time slot on this specific date
                const isBooked = dateBookings.some(b => b.timeSlot === slotTime);

                const btn       = document.createElement('div');
                btn.className   = `slot-btn ${isBooked ? 'booked' : 'available'}`;
                btn.textContent = displaySlots[index];

                // Store BOTH the DB id (may be null if not yet in DB) and the time label
                btn.dataset.time   = slotTime;
                btn.dataset.slotId = existingSlot ? existingSlot.id : '';

                if (!isBooked) {
                    anyAvailable = true;
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.slot-btn.available').forEach(s => s.classList.remove('selected'));
                        e.target.classList.add('selected');
                        // Save both the db id and the time label for the booking request
                        selectedSlot = {
                            slotTime: e.target.dataset.time,
                            slotId:   e.target.dataset.slotId ? Number(e.target.dataset.slotId) : null
                        };
                    });
                }
                container.appendChild(btn);
            });

            if (!anyAvailable) {
                container.innerHTML = '<p style="color: #ff4c4c; grid-column: 1 / -1; text-align: center; padding: 1rem 0; font-weight: bold;">No slot available. Please try after some time.</p>';
            }
        } catch (err) {
            console.error('Failed to load slots', err);
            container.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1; text-align: center; padding: 1rem 0;">Error loading slots. Please try again later.</p>';
        }
    }

    // Reload slots when date changes
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.addEventListener('change', () => {
            selectedSlot = null;
            loadSlots();
        });
    }

    // Override selectStation to also reload slots after station pick
    const originalSelectStation = window.selectStation;
    window.selectStation = function (id, name, price, lat, lng) {
        originalSelectStation(id, name, price, lat, lng);
        selectedSlot = null;
        loadSlots();
    };

    // Recalc price when car model or charge target changes
    document.getElementById('carModelSelect').addEventListener('change', updatePrice);
    document.getElementById('chargeTarget').addEventListener('input', updatePrice);

    // Dummy Payment Method Tab logic
    let selectedPaymentMethod = 'SIMULATED_CARD';

    if(document.getElementById('tabCardBtn')) {
        const cardBtn = document.getElementById('tabCardBtn');
        const upiBtn = document.getElementById('tabUpiBtn');
        const stationBtn = document.getElementById('tabStationBtn');
        const demoInput = document.getElementById('demoPaymentInput');

        cardBtn.addEventListener('click', () => {
            selectedPaymentMethod = 'SIMULATED_CARD';
            cardBtn.style.background = 'rgba(57, 255, 20, 0.1)';
            cardBtn.style.borderColor = 'var(--accent-neon)';
            cardBtn.style.color = 'var(--accent-neon)';
            cardBtn.style.fontWeight = '500';

            [upiBtn, stationBtn].forEach(btn => {
                btn.style.background = 'transparent';
                btn.style.borderColor = 'var(--glass-border)';
                btn.style.color = 'var(--text-muted)';
                btn.style.fontWeight = 'normal';
            });
            demoInput.style.display = 'block';
            demoInput.value = '4111 1111 1111 1111';
        });

        upiBtn.addEventListener('click', () => {
            selectedPaymentMethod = 'SIMULATED_UPI';
            upiBtn.style.background = 'rgba(57, 255, 20, 0.1)';
            upiBtn.style.borderColor = 'var(--accent-neon)';
            upiBtn.style.color = 'var(--accent-neon)';
            upiBtn.style.fontWeight = '500';

            [cardBtn, stationBtn].forEach(btn => {
                btn.style.background = 'transparent';
                btn.style.borderColor = 'var(--glass-border)';
                btn.style.color = 'var(--text-muted)';
                btn.style.fontWeight = 'normal';
            });
            demoInput.style.display = 'block';
            demoInput.value = 'user@upi';
        });

        stationBtn.addEventListener('click', () => {
            selectedPaymentMethod = 'PAY_ON_STATION';
            stationBtn.style.background = 'rgba(57, 255, 20, 0.1)';
            stationBtn.style.borderColor = 'var(--accent-neon)';
            stationBtn.style.color = 'var(--accent-neon)';
            stationBtn.style.fontWeight = '500';

            [cardBtn, upiBtn].forEach(btn => {
                btn.style.background = 'transparent';
                btn.style.borderColor = 'var(--glass-border)';
                btn.style.color = 'var(--text-muted)';
                btn.style.fontWeight = 'normal';
            });
            demoInput.style.display = 'none';
        });
    }

    // "Proceed to Pay" button
    document.getElementById('btnProceedToPay').addEventListener('click', () => {
        const sessionUser = getCurrentUser();
        if (!sessionUser) {
            showLoginRequired('You need to be logged in to make a booking.');
            return;
        }
        if (!currentStationId) return alert('Please select a station from the map first.');
        if (!selectedSlot)     return alert('Please select an available time slot.');
        if (calculatedPrice <= 0) return alert('Please enter a valid charge percentage.');

        document.getElementById('payAmountDisplay').textContent = `₹ ${calculatedPrice.toFixed(2)}`;

        // Reset modal state
        document.getElementById('payStep1').classList.remove('hidden');
        
        const cBtn = document.getElementById('btnConfirmPay');
        if (cBtn) { cBtn.textContent = 'Confirm Booking'; cBtn.disabled = false; }

        document.getElementById('paymentModal').classList.remove('hidden');
    });

    // "Cancel Payment" button
    document.getElementById('btnCancelPay').addEventListener('click', () => {
        document.getElementById('paymentModal').classList.add('hidden');
    });

    // "Confirm Payment" button — starts the animation flow
    document.getElementById('btnConfirmPay').addEventListener('click', async () => {
        const user = getCurrentUser();
        if (!user || !user.id) {
            document.getElementById('paymentModal').classList.add('hidden');
            showLoginRequired('Your session has expired. Please login again to complete booking.');
            return;
        }

        const btn = document.getElementById('btnConfirmPay');
        btn.textContent = 'Processing...';
        btn.disabled    = true;

        // Skip animation steps and directly book
        let txId  = 'EV' + Math.floor(Math.random() * 1000000);
        let otp   = Math.floor(100000 + Math.random() * 900000);

        const selectedDate = document.getElementById('bookingDate').value;
        const bookingBody = {
            userId:      Number(user.id),
            stationId:   Number(currentStationId),
            slotId:      selectedSlot.slotId,
            slotTime:    selectedSlot.slotTime,
            bookingDate: selectedDate
        };

        try {
            // ── Step 1: Create booking ────────────────────────────────────────────
            const bookingRes = await fetch(`${API_BASE_URL}/bookings/bookSlot`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(bookingBody)
            });

            if (!bookingRes.ok) {
                const errText = await bookingRes.text();
                alert('Booking failed: ' + errText);
                btn.textContent = 'Confirm Booking';
                btn.disabled    = false;
                return;
            }

            const booking = await bookingRes.json();
            otp = booking.otp || otp;

            // ── Step 2: Process payment ───────────────────────────────────────────
            const paymentBody = {
                bookingId:     Number(booking.id),
                amount:        parseFloat(calculatedPrice.toFixed(2)),
                paymentMethod: selectedPaymentMethod
            };

            const payRes = await fetch(`${API_BASE_URL}/payments/fakePayment`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(paymentBody)
            });

            if (payRes.ok) {
                const payData = await payRes.json();
                txId = payData.transactionId || txId;
            }

            // ── Step 3: Show success screen ───────────────────────────────────────
            document.getElementById('txIdDisplay').textContent = txId;
            const successTitleEl = document.getElementById('successTitle');
            if (successTitleEl) {
                successTitleEl.textContent = selectedPaymentMethod === 'PAY_ON_STATION' 
                    ? 'Booking Confirmed!' 
                    : 'Payment Successful!';
            }

            const otpDisplayEl = document.getElementById('otpDisplay');
            if(otpDisplayEl) {
                 otpDisplayEl.textContent = "Sent to your Email 📧";
                 otpDisplayEl.style.fontSize = "0.9rem";
            }
            document.getElementById('paymentModal').classList.add('hidden');
            document.getElementById('successModal').classList.remove('hidden');

        } catch (error) {
            console.warn('Network error — backend unreachable:', error);
            const localBookings = JSON.parse(localStorage.getItem('evBookings') || '[]');
            localBookings.push({
                id:          Date.now(),
                userId:      Number(user.id),
                stationId:   currentStationId,
                slotId:      selectedSlot.slotId,
                bookingDate: selectedDate,
                timeSlot:    selectedSlot.slotTime,
                createdAt:   new Date().toISOString(),
                otp,
                txId,
                paymentMethod: selectedPaymentMethod
            });
            localStorage.setItem('evBookings', JSON.stringify(localBookings));

            document.getElementById('txIdDisplay').textContent = txId;
            const fallbackOtpEl = document.getElementById('otpDisplay');
            if(fallbackOtpEl) {
                fallbackOtpEl.textContent = "Sent to your Email 📧";
                fallbackOtpEl.style.fontSize = "0.9rem";
            }
            document.getElementById('paymentModal').classList.add('hidden');
            document.getElementById('successModal').classList.remove('hidden');
        }
    });
}

// ---------------------------------------------------------------------------
// Price Calculation
// ---------------------------------------------------------------------------

function updatePrice() {
    if (!document.getElementById('carModelSelect')) return;

    const batteryCap   = parseFloat(document.getElementById('carModelSelect').value);
    const chargePercent = parseFloat(document.getElementById('chargeTarget').value);
    const kwhNeeded    = batteryCap * (chargePercent / 100);

    calculatedPrice = kwhNeeded * currentStationPrice;
    document.getElementById('priceDisplay').textContent = `₹ ${calculatedPrice.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Hero Frame Animation (index.html scroll-based canvas)
// ---------------------------------------------------------------------------

function initFrameAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const context    = canvas.getContext('2d');
    const frameCount = 191; // frames 0–191

    // Asset path relative to pages/index.html
    const currentFrame = index =>
        `../assets/models/frame_${index.toString().padStart(3, '0')}_delay-0.041s.jpg`;

    const images  = [];
    const state   = { frame: 0 };

    // Preload all frames
    for (let i = 0; i <= frameCount; i++) {
        const img = new Image();
        img.src   = currentFrame(i);
        images.push(img);
    }

    // Draw image scaled to fill canvas while maintaining aspect ratio
    function drawImageScaled(img, ctx) {
        const c       = ctx.canvas;
        const hRatio  = c.width  / img.width;
        const vRatio  = c.height / img.height;
        const ratio   = Math.max(hRatio, vRatio);
        const shiftX  = (c.width  - img.width  * ratio) / 2;
        const shiftY  = (c.height - img.height * ratio) / 2;

        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);
    }

    // High-DPI render
    function render() {
        const ratio = window.devicePixelRatio || 1;
        const w     = window.innerWidth;
        const h     = window.innerHeight;

        canvas.width        = w * ratio;
        canvas.height       = h * ratio;
        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px';

        context.imageSmoothingEnabled  = true;
        context.imageSmoothingQuality  = 'high';

        if (images[state.frame]?.complete) {
            drawImageScaled(images[state.frame], context);
        }
    }

    // Draw first frame as soon as it loads
    images[0].onload = render;

    // Re-render on resize (keeps canvas sharp)
    window.addEventListener('resize', () => requestAnimationFrame(render));

    // Scroll → frame index mapping
    window.addEventListener('scroll', () => {
        const heroSection = document.getElementById('hero-section');
        const rect        = heroSection.getBoundingClientRect();

        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
            const maxScroll    = heroSection.scrollHeight - window.innerHeight;
            const fraction     = window.scrollY / maxScroll;
            let frameIndex     = Math.min(frameCount, Math.ceil(fraction * frameCount));
            frameIndex         = Math.max(0, Math.min(frameCount, frameIndex));

            requestAnimationFrame(() => {
                state.frame = frameIndex;
                render();
            });
        }
    });
}
