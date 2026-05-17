/**
 * main.js — Application entry point
 *
 * Loads in order:
 *  1. js/core/api.js     (API_BASE_URL)
 *  2. js/core/utils.js   (getCurrentUser, saveCurrentUser, formatDate)
 *  3. js/modules/auth.js (checkAuth, handleLogout, changePassword)
 *  4. js/modules/map.js  (initMap, initBookingFlow, initFrameAnimation, updatePrice)
 *  5. js/modules/history.js (loadUserBookings)
 *
 * Each HTML page includes these files via individual <script> tags.
 * main.js is the final script loaded — it wires the right functions
 * to the right pages based on what DOM elements are present.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Frame animation — index page hero section
    if (document.getElementById('heroCanvas')) {
        initFrameAnimation();
    }

    // Map page — interactive map + booking flow
    if (document.getElementById('map')) {
        initMap();
        initBookingFlow();
    }

    // History page — user's booking list
    if (document.getElementById('bookingListContainer')) {
        loadUserBookings();
    }

    // Map page — set date input to today by default
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Always run auth check to update navbar state
    checkAuth();

    // Map page — wire up login modal dismiss button
    const btnDismiss = document.getElementById('btnDismissLoginModal');
    if (btnDismiss) {
        btnDismiss.addEventListener('click', () => {
            document.getElementById('loginRequiredModal').classList.add('hidden');
        });
    }
});
