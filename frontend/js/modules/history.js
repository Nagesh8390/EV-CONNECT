/**
 * history.js — Booking history module
 *
 * Handles fetching and rendering the user's booking list.
 * Merges backend bookings with any locally-stored offline fallbacks.
 */

async function loadUserBookings() {
    const user = getCurrentUser();
    const container = document.getElementById('bookingListContainer');

    if (!user || !user.id) {
        container.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top: 2rem;">
            Please <a href="login.html" style="color:var(--accent-neon)">login</a> to view your bookings.
        </p>`;
        return;
    }

    // 1. Pull any locally-cached offline bookings for this user
    const localBookings = JSON.parse(localStorage.getItem('evBookings') || '[]')
        .filter(b => b.userId == user.id); // loose equality — int vs string IDs

    let apiBookings = [];

    // 2. Try fetching from the backend
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/user/${user.id}`);
        if (response.ok) {
            apiBookings = await response.json();
        }
    } catch {
        console.warn('Backend unavailable. Showing local bookings only.');
    }

    // 3. Merge — avoid showing duplicates that exist in both sources
    const combined = [...apiBookings];

    localBookings.forEach(local => {
        const alreadySynced = combined.some(apiB => apiB.otp == local.otp);
        if (!alreadySynced) {
            combined.push({
                isLocal: true,
                station: { id: local.stationId },
                slot: { id: local.slotId },
                bookingDate: local.bookingDate, // "YYYY-MM-DD"
                timeSlot: local.timeSlot,       // e.g. "10:00-12:00"
                createdAt: local.createdAt,     // Timestamp
                otp: local.otp
            });
        }
    });

    // 4. Tab State
    let currentTab = 'upcoming';

    // Set up tab event listeners
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.textContent.trim().toLowerCase().includes('past') ? 'past' : 'upcoming';
            renderBookings();
        });
    });

    function renderBookings() {
        container.innerHTML = '';
        
        // Filter based on tab
        const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filtered = combined.filter(booking => {
            // Compare bookingDate (YYYY-MM-DD) with today
            const bDate = booking.bookingDate || '';
            const isPast = bDate < todayStr;
            return currentTab === 'past' ? isPast : !isPast;
        });

        if (filtered.length === 0) {
            const emptyMsg = currentTab === 'past' ? 'No previous data found.' : 'No upcoming bookings found.';
            container.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top: 2rem;">
                ${emptyMsg}
            </p>`;
            return;
        }

        filtered.forEach(booking => {
            const card = document.createElement('div');
            card.className = 'booking-card glass-panel';

            const stationName = (booking.station && booking.station.name)
                ? booking.station.name
                : `Station #${booking.station?.id ?? '–'}`;

            const title       = booking.isLocal ? `${stationName} *Offline*` : stationName;
            const borderColor = booking.isLocal ? '#ff4c4c' : 'var(--accent-neon)';

            const slotTime = booking.timeSlot
                ? booking.timeSlot
                : (booking.slot && booking.slot.slotTime)
                   ? booking.slot.slotTime
                   : `Slot #${booking.slot?.id ?? '–'}`;

            const createdAtDate = booking.createdAt
                ? new Date(booking.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })
                : '–';
                
            const targetDate = booking.bookingDate || '–';

            card.innerHTML = `
                <div class="booking-details">
                    <h3>⚡ ${title}</h3>
                    <div class="booking-meta">
                        <span>📅 Target Date: ${targetDate}</span>
                        <span>🕐 Slot: ${slotTime}</span>
                        <span id="status-badge-${booking.id}" class="status-badge ${currentTab === 'past' ? '' : 'status-upcoming'}">
                            ${currentTab === 'past' ? 'Completed' : 'Wait for Verification'}
                        </span>
                    </div>
                    <div style="margin-top:0.5rem; font-size:0.8rem; color:var(--text-muted)">
                        Booked on: ${createdAtDate}
                    </div>
                </div>
            `;

            container.appendChild(card);

            // Start polling if this is an upcoming booking (today or future)
            if (currentTab === 'upcoming' && booking.id && !booking.isLocal) {
                startPollingStatus(booking.id);
            }
        });
    }

    let activePolls = {};
    // Tracks the INITIAL status when polling starts — prevents already-SUCCESS
    // bookings (verified in a previous session) from triggering "Charging Started"
    let initialStatusSnapshot = {};

    async function startPollingStatus(bookingId) {
        if (activePolls[bookingId]) return;

        // Step 1: Fetch the CURRENT status right now (snapshot)
        try {
            const snapRes = await fetch(`${API_BASE_URL}/bookings/${bookingId}/payment-status`);
            if (snapRes.ok) {
                const snapData = await snapRes.json();
                initialStatusSnapshot[bookingId] = snapData.status;
                // If it's ALREADY SUCCESS — update badge immediately and stop (no polling needed)
                if (snapData.status === 'SUCCESS') {
                    updateChargingBadge(bookingId);
                    return;
                }
            }
        } catch (err) {
            console.warn('Snapshot fetch error', err);
        }

        // Step 2: Only start polling if it was NOT already SUCCESS
        activePolls[bookingId] = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/payment-status`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'SUCCESS') {
                        clearInterval(activePolls[bookingId]);
                        updateChargingBadge(bookingId);
                    }
                }
            } catch (err) {
                console.warn('Polling error', err);
            }
        }, 3000);
    }

    function updateChargingBadge(bookingId) {
        const badge = document.getElementById(`status-badge-${bookingId}`);
        if (badge) {
            badge.textContent = 'Charging Started \u26a1';
            badge.classList.remove('status-upcoming');
            badge.style.background = 'rgba(57, 255, 20, 0.2)';
            badge.style.color = '#39ff14';
            badge.style.border = '1px solid #39ff14';
        }
    }

    // Initial render
    renderBookings();
}
