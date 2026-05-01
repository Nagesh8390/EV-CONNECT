/**
 * Static Data Configuration
 * Replaces backend database calls for structural data like Stations and Slots.
 */

const STATIC_STATIONS = [
    { id: 1, name: 'Mumbai Ultra-Fast Charger (Bandra)',  latitude: 19.0596, longitude: 72.8295, pricePerKwh: 18.0, totalSlots: 8, address: 'Bandra West, Mumbai' },
    { id: 2, name: 'Pune Tech Park Hub (Hinjewadi)',       latitude: 18.5913, longitude: 73.7389, pricePerKwh: 15.0, totalSlots: 10, address: 'Hinjewadi, Pune' },
    { id: 3, name: 'Nagpur Highway Express',               latitude: 21.1458, longitude: 79.0882, pricePerKwh: 14.5, totalSlots: 4, address: 'Highway, Nagpur' },
    { id: 4, name: 'Nashik City Center EV Hub',            latitude: 20.0110, longitude: 73.7903, pricePerKwh: 16.0, totalSlots: 6, address: 'City Center, Nashik' }
];

const STATIC_SLOTS = [
    { id: 1, slotTime: "10:00-12:00", status: "AVAILABLE" },
    { id: 2, slotTime: "13:00-15:00", status: "AVAILABLE" },
    { id: 3, slotTime: "16:00-18:00", status: "AVAILABLE" },
    { id: 4, slotTime: "19:00-21:00", status: "AVAILABLE" },
    { id: 5, slotTime: "22:00-00:00", status: "AVAILABLE" }
];

// If using ES modules, export these. But based on the project structure,
// it seems script tags are used globally.
window.STATIC_STATIONS = STATIC_STATIONS;
window.STATIC_SLOTS = STATIC_SLOTS;
