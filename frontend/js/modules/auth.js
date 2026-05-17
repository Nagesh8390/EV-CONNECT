/**
 * auth.js — Authentication & user profile module
 *
 * Handles:
 *  - checkAuth()         : Reads localStorage and updates the navbar UI
 *  - handleLogout()      : Clears session and redirects to home
 *  - Change Password     : Modal open/close/submit logic
 */

// ---------------------------------------------------------------------------
// Nav Auth Check
// ---------------------------------------------------------------------------

/**
 * Inspect the current session and update the navbar accordingly.
 * If logged in → show profile avatar + dropdown.
 * If not logged in → show Login / Sign Up buttons, hide Admin Portal link.
 */
function checkAuth() {
    const user = getCurrentUser();
    const navAuthContainer = document.querySelector('.nav-auth');
    const navLinks = document.querySelector('.nav-links');

    // Standalone display element (used on map page)
    const navUserDisplay = document.getElementById('navUserDisplay');
    if (navUserDisplay && user) {
        navUserDisplay.textContent = `Hi, ${user.name}`;
        navUserDisplay.href = '#';
    }

    if (user && navAuthContainer) {
        // Build the profile avatar + dropdown HTML
        const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

        navAuthContainer.innerHTML = `
            <span style="color: var(--text-light); font-weight: 500; align-self: center;">
                Hi, <span style="color: var(--accent-neon);">${user.name}</span>
            </span>
            <div class="profile-container" id="profileContainer">
                <div class="profile-circle" id="profileBtn" title="${user.name}">
                    ${initial}
                </div>
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="dropdown-header">
                        <div class="dropdown-name">${user.name}</div>
                        <div class="dropdown-email">${user.email}</div>
                    </div>
                    <button class="dropdown-btn" onclick="openChangePasswordModal()">
                        <span style="font-size: 1.2rem;">🔒</span> Change Password
                    </button>
                    <button class="dropdown-btn dropdown-btn-danger" style="margin-top: 5px;" onclick="handleLogout()">
                        <span style="font-size: 1.2rem;">🚪</span> Logout
                    </button>
                </div>
            </div>
        `;

        // Toggle dropdown on avatar click
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');

        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!navAuthContainer.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });

        // Inject Change Password modal into body (only once)
        if (!document.getElementById('cpModal')) {
            const cpModalHTML = `
            <div id="cpModal" class="modal hidden">
                <div class="modal-content glass-panel" style="max-width: 400px;">
                    <h2 style="color:var(--accent-neon); margin-bottom:1.5rem;">Change Password</h2>
                    <div class="cp-group">
                        <label>Old Password</label>
                        <input type="password" id="cpOldPassword" placeholder="Enter old password">
                    </div>
                    <div class="cp-group">
                        <label>New Password</label>
                        <input type="password" id="cpNewPassword" placeholder="Enter new password">
                    </div>
                    <div class="cp-group">
                        <label>Confirm New Password</label>
                        <input type="password" id="cpConfirmPassword" placeholder="Confirm new password">
                    </div>
                    <p id="cpError" style="color: #ff4c4c; font-size: 0.9rem; margin-bottom: 1rem; display: none;"></p>
                    <p id="cpSuccess" style="color: #39ff14; font-size: 0.9rem; margin-bottom: 1rem; display: none;"></p>
                    <div style="display:flex; gap:1rem; margin-top:2rem;">
                        <button class="btn-primary" onclick="submitChangePassword()" style="flex:1;">Update</button>
                        <button class="btn-signup" onclick="closeChangePasswordModal()" style="flex:1; border-color:var(--text-muted); color:var(--text-light);">Cancel</button>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', cpModalHTML);
        }

        // Show/hide nav links based on role
        if (navLinks) {
            navLinks.querySelectorAll('a').forEach(link => {
                const text = link.textContent.trim();
                if (text === 'Account') {
                    link.parentElement.style.display = 'none';
                }
                if (text === 'Admin Portal') {
                    link.parentElement.style.display = (user.role === 'ADMIN') ? 'list-item' : 'none';
                }
            });
        }

        // Re-fetch role from backend if stale session is missing it
        if (!user.role && user.id) {
            fetch(`${API_BASE_URL}/auth/users`)
                .then(r => r.ok ? r.json() : [])
                .then(users => {
                    const freshUser = users.find(u => u.id === user.id);
                    if (freshUser && freshUser.role) {
                        const merged = { ...user, role: freshUser.role };
                        saveCurrentUser(merged);
                        checkAuth(); // Re-run with updated role
                    }
                })
                .catch(() => {});
        }
    } else {
        // Not logged in — hide Admin Portal from public visitors
        if (navLinks) {
            navLinks.querySelectorAll('a').forEach(link => {
                if (link.textContent.trim() === 'Admin Portal') {
                    link.parentElement.style.display = 'none';
                }
            });
        }
    }
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

window.handleLogout = function () {
    localStorage.removeItem('evUser');
    // All pages are inside pages/, so index.html is a sibling
    window.location.href = 'index.html';
};

// ---------------------------------------------------------------------------
// Change Password Modal
// ---------------------------------------------------------------------------

window.openChangePasswordModal = function () {
    const cpModal = document.getElementById('cpModal');
    if (!cpModal) return;
    document.getElementById('profileDropdown').classList.remove('show');
    cpModal.classList.remove('hidden');
    document.getElementById('cpOldPassword').value = '';
    document.getElementById('cpNewPassword').value = '';
    document.getElementById('cpConfirmPassword').value = '';
    document.getElementById('cpError').style.display = 'none';
    document.getElementById('cpSuccess').style.display = 'none';
};

window.closeChangePasswordModal = function () {
    const cpModal = document.getElementById('cpModal');
    if (cpModal) cpModal.classList.add('hidden');
};

window.submitChangePassword = async function () {
    const oldPass     = document.getElementById('cpOldPassword').value;
    const newPass     = document.getElementById('cpNewPassword').value;
    const confirmPass = document.getElementById('cpConfirmPassword').value;
    const errorEl     = document.getElementById('cpError');
    const successEl   = document.getElementById('cpSuccess');

    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    if (!oldPass || !newPass || !confirmPass) {
        errorEl.textContent = 'Please fill in all fields.';
        errorEl.style.display = 'block';
        return;
    }

    if (newPass !== confirmPass) {
        errorEl.textContent = 'New passwords do not match.';
        errorEl.style.display = 'block';
        return;
    }

    const user = getCurrentUser();
    if (!user || !user.id) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                oldPassword: oldPass,
                newPassword: newPass
            })
        });

        const data = await response.json();

        if (response.ok) {
            successEl.textContent = data.message || 'Password changed successfully!';
            successEl.style.display = 'block';
            setTimeout(() => {
                closeChangePasswordModal();
            }, 2000);
        } else {
            errorEl.textContent = data.error || 'Failed to change password.';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorEl.textContent = 'Server error. Please try again later.';
        errorEl.style.display = 'block';
    }
};
