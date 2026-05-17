/**
 * admin.js — Admin Portal module
 *
 * Handles:
 *  - Auth gate (admin-only access)
 *  - Dashboard stats + recent bookings
 *  - Station management (CRUD)
 *  - Slot management (add, status change, delete)
 *  - Booking management (verify OTP, cancel)
 *  - User management (list, block/delete)
 */

const API = 'http://localhost:8080/api';
let allStations = [];

document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();

    if (!user) {
        // Not logged in at all
        document.getElementById('loginGate').style.display = 'flex';
    } else if (user.role !== 'ADMIN') {
        // Logged in but not admin
        alert('⛔ Access Denied: You do not have admin privileges.');
        window.location.href = 'index.html';
    } else {
        // Authenticated admin — show UI
        document.getElementById('adminUI').style.display = 'flex';

        const initial = user.name ? user.name.charAt(0).toUpperCase() : 'A';
        document.getElementById('adminNavAuth').innerHTML = `
            <span style="color: var(--text-light); font-weight: 500; align-self: center;">
                Hi, <span style="color: var(--accent-neon);">${user.name}</span>
            </span>
            <div class="profile-container" id="profileContainer">
                <div class="profile-circle" id="profileBtn" title="${user.name}">${initial}</div>
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="dropdown-header">
                        <div class="dropdown-name">${user.name}</div>
                        <div class="dropdown-email">${user.email}</div>
                    </div>
                    <button class="dropdown-btn" onclick="openChangePasswordModal()">
                        <span style="font-size:1.2rem;">🔒</span> Change Password
                    </button>
                    <button class="dropdown-btn dropdown-btn-danger" style="margin-top:5px;" onclick="handleLogout()">
                        <span style="font-size:1.2rem;">🚪</span> Logout
                    </button>
                </div>
            </div>`;

        // Dropdown toggle
        document.getElementById('profileBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('profileDropdown').classList.toggle('show');
        });
        document.addEventListener('click', () => {
            const pd = document.getElementById('profileDropdown');
            if (pd) pd.classList.remove('show');
        });

        initAdmin();
    }
});

async function initAdmin() {
    await Promise.all([loadDashboard(), loadStations(), loadBookings(), loadUsers()]);
}

// ---------------------------------------------------------------------------
// Tab Switching
// ---------------------------------------------------------------------------

function switchTab(name) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ---------------------------------------------------------------------------
// Alert Banner
// ---------------------------------------------------------------------------

function showAlert(msg, isError = false) {
    const el = document.getElementById('globalAlert');
    el.textContent = msg;
    el.className   = `alert ${isError ? 'alert-error' : 'alert-success'}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3500);
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

async function loadDashboard() {
    try {
        const [stRes, bkRes, usRes] = await Promise.all([
            fetch(`${API}/stations`),
            fetch(`${API}/bookings/admin`),
            fetch(`${API}/auth/users`)
        ]);

        const stations = stRes.ok ? await stRes.json() : [];
        const bookings = bkRes.ok ? await bkRes.json() : [];
        const users    = usRes.ok ? await usRes.json() : [];

        // Count available slots across all stations
        let availableSlots = 0;
        for (const st of stations) {
            const slots = window.STATIC_SLOTS || [];
            availableSlots += slots.filter(s => s.status === 'AVAILABLE').length;
        }

        document.getElementById('statStations').textContent   = stations.length;
        document.getElementById('statBookings').textContent   = bookings.length;
        document.getElementById('statUsers').textContent      = users.length;
        document.getElementById('statActiveSlots').textContent = availableSlots;

        // Recent bookings table (last 10, newest first)
        const tbody  = document.getElementById('dashRecentBody');
        const recent = bookings.slice(-10).reverse();
        tbody.innerHTML = recent.length === 0
            ? `<tr><td colspan="5" style="color:var(--text-muted)">No bookings yet.</td></tr>`
            : recent.map(b => `
                <tr>
                    <td>#${b.id}</td>
                    <td>${b.user?.name || b.user?.id || '–'}</td>
                    <td>${b.station?.name || b.station?.id || '–'}</td>
                    <td><span style="color:var(--text-muted)">Hidden</span></td>
                    <td>${new Date(b.bookingDate).toLocaleDateString()}</td>
                </tr>`).join('');
    } catch (e) {
        console.warn('Dashboard load error:', e);
    }
}

// ---------------------------------------------------------------------------
// Stations
// ---------------------------------------------------------------------------

async function loadStations() {
    try {
        allStations = window.STATIC_STATIONS || [];
        renderStationTable();
        populateStationSelects();
    } catch (e) { console.warn(e); }
}

function renderStationTable() {
    const tbody = document.getElementById('stationTableBody');
    tbody.innerHTML = allStations.length === 0
        ? `<tr><td colspan="6" style="color:var(--text-muted)">No stations found.</td></tr>`
        : allStations.map(s => `
            <tr>
                <td>#${s.id}</td>
                <td><strong>${s.name}</strong></td>
                <td>${s.address || '–'}</td>
                <td>₹${s.pricePerKwh}</td>
                <td>${s.totalSlots}</td>
                <td style="display:flex; gap:0.4rem;">
                    <button class="btn-sm btn-outline" onclick="openEditStation(${s.id})">✏️ Edit</button>
                    <button class="btn-sm btn-danger-sm" onclick="deleteStation(${s.id})">🗑️ Delete</button>
                </td>
            </tr>`).join('');
}

function populateStationSelects() {
    const opts = allStations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    document.getElementById('slotStationId').innerHTML   = `<option value="">Select...</option>${opts}`;
    document.getElementById('viewSlotStation').innerHTML = `<option value="">Select station to view slots...</option>${opts}`;
}

document.getElementById('addStationForm').addEventListener('submit', async e => {
    e.preventDefault();
    showAlert('Adding stations is disabled in static mode.', true);
});

async function deleteStation(id) {
    if (!confirm('Delete this station? This cannot be undone.')) return;
    showAlert('Deleting stations is disabled in static mode.', true);
}

function openEditStation(id) {
    const s = allStations.find(x => x.id === id);
    if (!s) return;
    document.getElementById('editStationId').value  = s.id;
    document.getElementById('editSName').value      = s.name;
    document.getElementById('editSLat').value       = s.latitude;
    document.getElementById('editSLng').value       = s.longitude;
    document.getElementById('editSAddr').value      = s.address;
    document.getElementById('editSPrice').value     = s.pricePerKwh;
    document.getElementById('editSSlots').value     = s.totalSlots;
    document.getElementById('editStationModal').classList.add('open');
}

function closeEditModal() {
    document.getElementById('editStationModal').classList.remove('open');
}

document.getElementById('editStationForm').addEventListener('submit', async e => {
    e.preventDefault();
    showAlert('Editing stations is disabled in static mode.', true);
    closeEditModal();
});

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

document.getElementById('addSlotForm').addEventListener('submit', async e => {
    e.preventDefault();
    showAlert('Adding slots is disabled in static mode.', true);
});

async function loadSlotsForStation(stationId) {
    const tbody = document.getElementById('slotTableBody');
    if (!stationId) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted)">Select a station above.</td></tr>`;
        return;
    }
    try {
        const slots = window.STATIC_SLOTS || [];
        tbody.innerHTML = slots.length === 0
            ? `<tr><td colspan="5" style="color:var(--text-muted)">No slots for this station.</td></tr>`
            : slots.map(sl => `
                <tr>
                    <td>#${sl.id}</td>
                    <td>${sl.slotTime || '–'}</td>
                    <td><span class="badge ${sl.status === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}">${sl.status}</span></td>
                    <td>
                        <select onchange="changeSlotStatus(${stationId}, ${sl.id}, this.value)"
                                style="background:rgba(255,255,255,0.05); border:1px solid var(--glass-border); color:white; padding:0.3rem 0.5rem; border-radius:6px; font-size:0.8rem;">
                            <option value="AVAILABLE" ${sl.status === 'AVAILABLE' ? 'selected' : ''}>AVAILABLE</option>
                            <option value="BOOKED"    ${sl.status === 'BOOKED'    ? 'selected' : ''}>BOOKED</option>
                            <option value="RESERVED"  ${sl.status === 'RESERVED'  ? 'selected' : ''}>RESERVED</option>
                        </select>
                    </td>
                    <td><button class="btn-sm btn-danger-sm" onclick="deleteSlot(${stationId}, ${sl.id})">🗑️ Delete</button></td>
                </tr>`).join('');
    } catch {
        tbody.innerHTML = `<tr><td colspan="5" style="color:#ff4c4c">Error loading slots.</td></tr>`;
    }
}

async function deleteSlot(stationId, slotId) {
    if (!confirm(`Delete slot #${slotId}? This cannot be undone.`)) return;
    showAlert('Deleting slots is disabled in static mode.', true);
}

async function changeSlotStatus(stationId, slotId, status) {
    showAlert('Changing slot status is disabled in static mode.', true);
    loadDashboard();
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

async function loadBookings() {
    const tbody = document.getElementById('bookingTableBody');
    try {
        const res      = await fetch(`${API}/bookings/admin`);
        const bookings = res.ok ? await res.json() : [];
        tbody.innerHTML = bookings.length === 0
            ? `<tr><td colspan="9" style="color:var(--text-muted)">No bookings yet.</td></tr>`
            : bookings.reverse().map(b => `
                 <tr id="booking-row-${b.id}">
                    <td>#${b.id}</td>
                    <td>${b.user?.name || b.user?.id || '–'}</td>
                    <td>${b.station?.name || b.station?.id || '–'}</td>
                    <td>#${b.slot?.id || '–'}</td>
                    <td>
                        ${!b.otp
                            ? `<span style="color:#ff9900;font-size:0.8rem;">\u2014already verified\u2014</span>`
                            : `<span style="color:var(--text-muted);">Hidden</span>`
                        }
                    </td>
                    <td>${new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td>
                        <div class="verify-row">
                            <input type="text" id="otpInput_${b.id}" placeholder="Enter OTP" maxlength="6" ${!b.otp ? 'disabled' : ''}>
                            <button class="btn-sm btn-success-sm" onclick="verifyOtp(${b.id})" ${!b.otp ? 'disabled' : ''}>✓ Verify</button>
                        </div>
                    </td>
                    <td id="payStatus_${b.id}">
                        ${!b.otp
                            ? `<span style="color:#39ff14; font-weight:bold; font-size:0.9rem;">\u2705 SUCCESS</span>`
                            : `<span style="color:var(--text-muted); font-size:0.85rem;">Pending</span>`
                        }
                    </td>
                    <td><button class="btn-sm btn-danger-sm" onclick="cancelBooking(${b.id})">✕ Cancel</button></td>
                </tr>`).join('');
    } catch {
        tbody.innerHTML = `<tr><td colspan="8" style="color:#ff4c4c">Error loading bookings.</td></tr>`;
    }
}

function verifyOtp(id) {
    const entered = document.getElementById(`otpInput_${id}`).value.trim();
    if (!entered) return showAlert('Please enter OTP.', true);
    
    fetch(`${API}/bookings/admin/${id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: entered })
    })
    .then(async res => {
        const statusCell = document.getElementById(`payStatus_${id}`);
        if (res.ok) {
            showAlert(`✅ OTP Verified! Payment set to SUCCESS.`);
            if (statusCell) {
                statusCell.innerHTML = `<span style="color:#39ff14; font-weight:bold; font-size:0.9rem;">✅ SUCCESS</span>`;
            }
            // Disable the input & button so it can't be re-submitted
            const input = document.getElementById(`otpInput_${id}`);
            const row = document.getElementById(`booking-row-${id}`);
            if (input) input.disabled = true;
            if (row) {
                const btn = row.querySelector('.btn-success-sm');
                if (btn) btn.disabled = true;
            }
        } else {
            const err = await res.json();
            showAlert(`❌ ${err.error || 'Invalid OTP'}`, true);
            if (statusCell) {
                statusCell.innerHTML = `<span style="color:#ff4c4c; font-weight:bold; font-size:0.9rem;">❌ FAILED</span>`;
            }
        }
    })
    .catch(() => showAlert('Backend unreachable.', true));
}

async function cancelBooking(id) {
    if (!confirm(`Cancel booking #${id}? The slot will be freed.`)) return;
    try {
        const res = await fetch(`${API}/bookings/admin/${id}`, { method: 'DELETE' });
        if (res.ok) { showAlert(`Booking #${id} cancelled.`); loadBookings(); loadDashboard(); }
        else showAlert('Failed to cancel booking.', true);
    } catch { showAlert('Backend unreachable.', true); }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

async function loadUsers() {
    const tbody = document.getElementById('userTableBody');
    try {
        const res   = await fetch(`${API}/auth/users`);
        const users = res.ok ? await res.json() : [];
        tbody.innerHTML = users.length === 0
            ? `<tr><td colspan="4" style="color:var(--text-muted)">No users found.</td></tr>`
            : users.map(u => `
                <tr>
                    <td>#${u.id}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>
                        <button class="btn-sm btn-danger-sm" onclick="blockUser(${u.id}, '${u.name}')">🚫 Block / Delete</button>
                    </td>
                </tr>`).join('');
    } catch {
        tbody.innerHTML = `<tr><td colspan="4" style="color:#ff4c4c">Error loading users.</td></tr>`;
    }
}

async function blockUser(id, name) {
    if (!confirm(`Block / delete user "${name}" (ID: ${id})? Their account will be removed.`)) return;
    try {
        const res = await fetch(`${API}/auth/users/${id}`, { method: 'DELETE' });
        if (res.ok) { showAlert(`User "${name}" removed.`); loadUsers(); loadDashboard(); }
        else showAlert('Failed to remove user.', true);
    } catch { showAlert('Backend unreachable.', true); }
}
