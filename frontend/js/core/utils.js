/**
 * utils.js — Shared utility helpers
 * Small, reusable functions used across multiple modules.
 */

/**
 * Format an ISO date string into a human-readable locale string.
 * @param {string} isoDate - ISO 8601 date string
 * @returns {string} Formatted date and time (e.g. "21 Mar 2026, 02:30 PM")
 */
function formatDate(isoDate) {
    if (!isoDate) return '–';
    return new Date(isoDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

/**
 * Retrieve the current logged-in user from localStorage.
 * @returns {object|null} Parsed user object or null
 */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('evUser'));
    } catch {
        return null;
    }
}

/**
 * Save a user object to localStorage.
 * @param {object} user
 */
function saveCurrentUser(user) {
    localStorage.setItem('evUser', JSON.stringify(user));
}
