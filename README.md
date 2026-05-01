# ⚡ EV Connect

> **A full-stack Electric Vehicle charging slot booking platform.**
> Built with **HTML + Vanilla JavaScript** (Frontend) and **Spring Boot 3 + MySQL** (Backend).

![Java](https://img.shields.io/badge/Java-Spring%20Boot%203-brightgreen?style=flat-square&logo=spring)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%2B%20Vanilla%20JS-yellow?style=flat-square&logo=javascript)
![Database](https://img.shields.io/badge/Database-MySQL-blue?style=flat-square&logo=mysql)
![Map](https://img.shields.io/badge/Map-Leaflet.js%20%2B%20OSRM-9cf?style=flat-square)
![Email](https://img.shields.io/badge/Email-Gmail%20SMTP-red?style=flat-square&logo=gmail)
![Status](https://img.shields.io/badge/Status-v1.0%20Complete-success?style=flat-square)

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Complete File Structure](#3-complete-file-structure)
4. [Backend Files — What Each File Does](#4-backend-files--what-each-file-does)
5. [Frontend Files — What Each File Does](#5-frontend-files--what-each-file-does)
6. [All API Endpoints](#6-all-api-endpoints)
7. [Database Tables & Relationships](#7-database-tables--relationships)
8. [Complete Data Flow — Frontend → Backend → Database](#8-complete-data-flow--frontend--backend--database)
9. [How Data is Fetched Back](#9-how-data-is-fetched-back-database--frontend)
10. [Map API & Distance Calculation](#10-map-api--distance-calculation)
11. [How Emails Are Sent to Users](#11-how-emails-are-sent-to-users)
12. [What Happens When the Database Goes Offline](#12-what-happens-when-the-database-goes-offline)
13. [Full Booking Lifecycle — Step by Step](#13-full-booking-lifecycle--step-by-step)
14. [Admin Panel Flow](#14-admin-panel-flow)

---

## 1. Project Overview

**EV Connect** is a web application that allows users to find, book, and pay for EV charging slots — and track their session status in real time.

### What Users Can Do
- 🗺️ Find EV charging stations on a **live interactive map**
- 📅 View available time slots for any selected date
- 💳 Book a slot and pay through a **simulated payment gateway**
- 📧 Receive a **6-digit OTP via email** for station verification
- ⚡ Track booking status in real time — badge changes to **"Charging Started ⚡"** after admin OTP verification

### What Admins Can Do
- ➕ Add / ✏️ Edit / 🗑️ Delete charging stations
- 📋 View all bookings across all users
- 🔐 Verify OTPs submitted by users at the station
- 👤 Delete user accounts

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | All UI pages and client-side logic |
| **Map Rendering** | [Leaflet.js](https://leafletjs.com/) | Open-source interactive map |
| **Map Routing** | [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/) + OSRM | Route drawing & distance calculation |
| **Backend** | Spring Boot 3 (Java) | REST API server on port `8080` |
| **Database** | MySQL via Spring Data JPA / Hibernate | Persistent data storage |
| **Email** | Spring Mail — JavaMailSender (Gmail SMTP) | OTP & booking confirmation emails |
| **Build Tool** | Maven (`pom.xml`) | Dependency management & build |

---

## 3. Complete File Structure

```
change-project/
├── README.md                          ← You are here
├── logo.png                           ← Project logo
│
├── ev-connect-frontend/               ← All UI pages and client-side code
│   ├── pages/
│   │   ├── index.html                 ← Landing / Home page (with EV car animation)
│   │   ├── login.html                 ← Login page
│   │   ├── register.html              ← User registration page
│   │   ├── map.html                   ← Interactive map + slot booking page
│   │   ├── history.html               ← User's booking history + status polling
│   │   ├── admin.html                 ← Admin portal (CRUD + OTP verification)
│   │   ├── about.html
│   │   ├── contact.html
│   │   ├── privacy-policy.html
│   │   └── terms.html
│   │
│   ├── js/
│   │   ├── main.js                    ← App entry point: wires functions to pages on DOMContentLoaded
│   │   ├── core/
│   │   │   ├── api.js                 ← Defines API_BASE_URL (http://localhost:8080/api)
│   │   │   ├── utils.js               ← Helpers: getCurrentUser(), saveCurrentUser(), formatDate()
│   │   │   └── data.js                ← Static fallback station list (used when backend is offline)
│   │   └── modules/
│   │       ├── auth.js                ← Login / logout / navbar / change-password logic
│   │       ├── map.js                 ← Leaflet map, station markers, slot booking, payment flow
│   │       ├── history.js             ← Booking history fetch, render, real-time status polling
│   │       └── admin.js               ← Admin CRUD for stations, bookings, users, OTP verify
│   │
│   ├── css/                           ← All stylesheets
│   ├── assets/                        ← Images + EV car animation frames (191 frames)
│   ├── dummy-payment/                 ← Payment animation UI (card, spinner, OTP screens)
│   └── templates/                     ← Reusable HTML partials (navbar, footer)
│
└── ev-connect-backend/                ← Spring Boot backend
    ├── pom.xml                        ← Maven dependencies
    └── src/main/java/com/evconnect/backend/
        ├── BackendApplication.java    ← App entry point (@SpringBootApplication)
        ├── config/
        │   ├── CorsConfig.java        ← Allows frontend to call backend across origins (CORS)
        │   └── DatabaseSeeder.java    ← Seeds 10 stations automatically on first startup
        ├── controller/
        │   ├── AuthController.java    ← /api/auth — register, login, change-password
        │   ├── BookingController.java ← /api/bookings — book slot, get bookings, verify OTP
        │   ├── StationController.java ← /api/stations — station CRUD
        │   ├── SlotController.java    ← /api/stations/{id}/slots — slot management
        │   └── PaymentController.java ← /api/payments — simulated payment
        ├── service/
        │   ├── AuthService.java       ← Register / login / change-password logic
        │   ├── BookingService.java    ← Core booking logic + OTP generation & verification
        │   ├── StationService.java    ← Station add / update / delete logic
        │   ├── SlotService.java       ← Slot create / update / delete logic
        │   ├── PaymentService.java    ← Simulate payment + trigger confirmation email
        │   └── EmailService.java      ← Build & send HTML OTP email (async)
        ├── entity/
        │   ├── User.java              ← users table model
        │   ├── Station.java           ← stations table model
        │   ├── Slot.java              ← slots table model
        │   ├── Booking.java           ← bookings table model
        │   └── Payment.java           ← payments table model
        ├── repository/
        │   ├── UserRepository.java    ← JPA queries for users
        │   ├── StationRepository.java ← JPA queries for stations
        │   ├── SlotRepository.java    ← JPA queries for slots
        │   ├── BookingRepository.java ← JPA queries for bookings (incl. duplicate check)
        │   └── PaymentRepository.java ← JPA queries for payments
        └── dto/
            ├── LoginRequest.java           ← { email, password }
            ├── BookingRequest.java         ← { userId, stationId, slotId, slotTime, bookingDate }
            ├── PaymentRequest.java         ← { bookingId, amount }
            └── ChangePasswordRequest.java  ← { userId, oldPassword, newPassword }
```

---

## 4. Backend Files — What Each File Does

### 🚀 `BackendApplication.java`
The **entry point** of the Spring Boot application. Running this file starts the server on port `8080`.
Also has `@EnableAsync` which enables the asynchronous email-sending thread pool.

---

### ⚙️ Config

#### `CorsConfig.java`
- **Problem it solves:** Browsers block requests from one origin (frontend: `file://` or a local port) to another (backend: `localhost:8080`). This is called a **CORS violation**.
- **What it does:** Configures Spring Boot to allow **all origins, all HTTP methods, and all headers**, so the frontend can freely call the backend API.

#### `DatabaseSeeder.java`
- Runs automatically every time the backend starts.
- Checks `SELECT COUNT(*) FROM stations`. If the table is **empty** (first run), it inserts **10 pre-defined charging stations** across India (Mumbai, Pune, Delhi, Bangalore, Nagpur, Nashik).
- Ensures the map is never blank — you always have stations to browse on a fresh database.

---

### 🎮 Controllers — The "Door" (Receives HTTP Requests)

Controllers receive HTTP requests from the frontend and delegate work to Services. They never contain business logic themselves.

| Controller | Base Path | Responsibility |
|---|---|---|
| `AuthController` | `/api/auth` | User registration, login, password change |
| `BookingController` | `/api/bookings` | Booking creation, retrieval, OTP verification, cancellation |
| `StationController` | `/api/stations` | Station CRUD (create, read, update, delete) |
| `SlotController` | `/api/stations/{stationId}/slots` | Slot management (nested under stations) |
| `PaymentController` | `/api/payments` | Simulated payment processing |

---

### 🧠 Services — The "Brain" (Contains Business Logic)

#### `AuthService.java`
- **`register(user)`** → Checks if email already exists; if not, saves the new user to DB.
- **`login(email, password)`** → Looks up user by email, compares password, returns user object.
- **`changePassword(userId, oldPass, newPass)`** → Validates old password, then updates to new password.

#### `BookingService.java` ← *Most important service*
- **`bookSlot(...)`** → Full booking logic:
  1. Validates `userId` is not null and exists in DB (authentication guard)
  2. Looks up the station and slot in DB
  3. Checks if the **exact date + time slot combination** is already booked (unique constraint check)
  4. If no slot object exists for that time, **auto-creates one**
  5. Generates a **random 6-digit OTP** (e.g. `847293`)
  6. Sets OTP expiry to **24 hours from now**
  7. Saves the booking row in the database
- **`getUserBookings(userId)`** → Returns all bookings for a specific user.
- **`getBookingsByStationAndDate(stationId, date)`** → Returns booked slots for a station on a given date (used to highlight taken slots on the map page).
- **`getAllBookings()`** → Admin: returns every booking in the system.
- **`cancelBooking(id)`** → Deletes a booking and frees the slot.
- **`verifyOtpAndUpdatePayment(bookingId, otp)`** → Admin OTP verification:
  1. Checks OTP has not expired
  2. Compares the entered OTP with the stored OTP
  3. If match: sets payment status to `SUCCESS`, **clears the OTP** to prevent reuse
- **`getPaymentStatus(bookingId)`** → Returns `"SUCCESS"` or `"PENDING"` — polled by the history page.

#### `StationService.java`
Simple CRUD wrapper around `StationRepository`:
`getAllStations()`, `getStationById(id)`, `addStation()`, `updateStation()`, `removeStation()`

#### `SlotService.java`
- `getSlotsByStation(stationId)` — Lists all slots for a station
- `createSlot(slot)` — Admin adds a new slot
- `deleteSlot(slotId)` — Admin removes a slot
- `updateSlotStatus(slotId, status)` — Changes slot to `AVAILABLE` or `BOOKED`

#### `PaymentService.java`
- **`processFakePayment(bookingId, amount)`**:
  1. Fetches the booking from DB
  2. Creates a `Payment` record with status `"PENDING"` and a random transaction ID (e.g. `EV-AB12CD34`)
  3. Saves it to the `payments` table
  4. Calls `emailService.sendBookingConfirmation(booking)` — this triggers the OTP email (async)
  5. Returns the payment object to the frontend

#### `EmailService.java`
- **`sendBookingConfirmation(booking)`**:
  - Marked `@Async` — runs on a **separate background thread**, so email sending never delays the API response.
  - Builds a styled HTML email containing: user name, 6-digit OTP (large bold), station name, booking date, time slot.
  - Sends via **Gmail SMTP** using `JavaMailSender`.
  - If email fails, it **logs a warning but never crashes** the booking flow.

---

### 🗄️ Entities — Database Table Definitions

#### `User.java` → Table: `users`
| Field | Type | Description |
|---|---|---|
| `id` | Long (PK) | Auto-increment primary key |
| `name` | String | User's full name |
| `email` | String (UNIQUE) | Login email — must be unique across all users |
| `password` | String | Password (plain text — demo only) |
| `role` | String | `"USER"` or `"ADMIN"` |

#### `Station.java` → Table: `stations`
| Field | Type | Description |
|---|---|---|
| `id` | Long (PK) | Auto-increment primary key |
| `name` | String | Station display name |
| `latitude` | Double | GPS latitude (for map pin placement) |
| `longitude` | Double | GPS longitude (for map pin placement) |
| `address` | String | Human-readable address |
| `pricePerKwh` | Double | Charging price per kilowatt-hour (₹) |
| `totalSlots` | Integer | Number of available charging ports |

#### `Slot.java` → Table: `slots`
| Field | Type | Description |
|---|---|---|
| `id` | Long (PK) | Auto-increment primary key |
| `station_id` | Long (FK) | References `stations.id` |
| `slotTime` | String | Time range, e.g. `"10:00-12:00"` |
| `status` | String | `"AVAILABLE"`, `"BOOKED"`, or `"RESERVED"` |

#### `Booking.java` → Table: `bookings`
| Field | Type | Description |
|---|---|---|
| `id` | Long (PK) | Auto-increment primary key |
| `user_id` | Long (FK) | References `users.id` |
| `station_id` | Long (FK) | References `stations.id` |
| `slot_id` | Long (FK) | References `slots.id` |
| `bookingDate` | String | Format: `"YYYY-MM-DD"` |
| `timeSlot` | String | e.g. `"10:00-12:00"` |
| `otp` | String | 6-digit OTP (cleared after admin verification) |
| `otpExpiry` | LocalDateTime | OTP expires 24 hours after booking |
| `createdAt` | LocalDateTime | Timestamp when booking was made |

> **Unique Constraint:** `(station_id, booking_date, time_slot)` — No two bookings can share the same station, date, and time.

#### `Payment.java` → Table: `payments`
| Field | Type | Description |
|---|---|---|
| `id` | Long (PK) | Auto-increment primary key |
| `booking_id` | Long (FK, UNIQUE) | References `bookings.id` — one payment per booking |
| `amount` | Double | Amount paid in ₹ |
| `status` | String | `"PENDING"` (after booking) or `"SUCCESS"` (after OTP verification) |
| `paymentMethod` | String | `"SIMULATED_CARD"` or `"ADMIN_VERIFIED"` |
| `transactionId` | String | Unique reference, e.g. `EV-AB12CD34` |

---

### 🗃️ Repositories

These are **interfaces** — Spring Data JPA auto-generates all SQL queries at runtime.

**Built-in methods provided automatically:**
- `findAll()` → `SELECT * FROM table`
- `findById(id)` → `SELECT * FROM table WHERE id = ?`
- `save(entity)` → `INSERT` or `UPDATE`
- `deleteById(id)` → `DELETE WHERE id = ?`

**Custom queries in this project:**
| Repository | Custom Method | SQL Equivalent |
|---|---|---|
| `BookingRepository` | `findByUserId(userId)` | `SELECT * FROM bookings WHERE user_id = ?` |
| `BookingRepository` | `findByStationIdAndBookingDate(...)` | Bookings for a station on a date |
| `BookingRepository` | `existsByStationIdAndBookingDateAndTimeSlot(...)` | Duplicate booking check |
| `PaymentRepository` | `findByBookingId(bookingId)` | Look up payment linked to a booking |

---

### 📦 DTOs — Data Transfer Objects

DTOs define the **shape of JSON the frontend sends** to the backend. They are simple plain Java classes (no DB mapping).

| DTO | Fields |
|---|---|
| `LoginRequest` | `email`, `password` |
| `BookingRequest` | `userId`, `stationId`, `slotId`, `slotTime`, `bookingDate` |
| `PaymentRequest` | `bookingId`, `amount` |
| `ChangePasswordRequest` | `userId`, `oldPassword`, `newPassword` |

---

## 5. Frontend Files — What Each File Does

### `main.js` — App Entry Point
Loaded last on every page. On `DOMContentLoaded`, it detects which page is active (by checking for specific element IDs in the DOM) and calls the right initialization functions:

```javascript
if (document.getElementById('heroCanvas'))   initFrameAnimation();  // index.html
if (document.getElementById('map'))          { initMap(); initBookingFlow(); } // map.html
if (document.getElementById('bookingListContainer')) loadUserBookings(); // history.html
checkAuth(); // Always runs — updates navbar state
```

---

### Core JS (`js/core/`)

#### `api.js`
Defines a single constant used across the entire app:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```
Every `fetch()` call references this — so changing the backend URL only requires editing this one file.

#### `utils.js`
- **`getCurrentUser()`** — Reads `evUser` key from `localStorage`. Returns the logged-in user object, or `null`.
- **`saveCurrentUser(user)`** — Writes the user object to `localStorage`.
- **`formatDate(isoDate)`** — Converts an ISO date string to a readable format like `"21 Mar 2026, 02:30 PM"`.

#### `data.js`
Contains `STATIC_STATIONS` — a hardcoded array of 10 stations used as a **fallback** when the backend API is offline. Ensures the map never shows empty.

---

### Module JS (`js/modules/`)

#### `auth.js`
- **`checkAuth()`** — Reads `localStorage`; if logged in, shows a profile avatar with a dropdown. If not, shows Login / Sign Up buttons. Hides the Admin Portal link for non-admin users.
- **`handleLogout()`** — Clears `evUser` from `localStorage`, redirects to home page.
- **`openChangePasswordModal()` / `submitChangePassword()`** — Opens a modal, collects old + new passwords, calls `POST /api/auth/change-password`.

#### `map.js` ← *Largest frontend file*
- **`initMap()`** — Creates the Leaflet map centered on India. Fetches all stations from the backend and places a marker for each. Falls back to `STATIC_STATIONS` if backend fails.
- **`selectStation(id, name, price, lat, lng)`** — Called when user clicks "Select Station" on a map popup. Guards against unauthenticated access. Sets up route drawing from user's GPS to the station.
- **`loadSlots()`** — Fetches bookings for the selected station + date. Renders 5 fixed time slot buttons: **green** = available, **red** = already booked.
- **`initBookingFlow()`** — Wires all button clicks for the payment modal flow: Proceed → Confirm → OTP → Book + Pay.
- **`updatePrice()`** — Calculates estimated cost: `battery_capacity × charge_percent% × price_per_kWh`.
- **`initFrameAnimation()`** — Scroll-triggered EV car animation on the home page using 191 pre-loaded frames drawn on a `<canvas>`.

#### `history.js`
- **`loadUserBookings()`** — Fetches all bookings for the logged-in user. Merges with any offline `localStorage` bookings. Splits into **"Upcoming"** and **"Past"** tabs. Renders booking cards.
- **`startPollingStatus(bookingId)`** — Every **3 seconds**, calls `GET /api/bookings/{id}/payment-status`. When status becomes `"SUCCESS"`, polling stops and the badge updates to **"Charging Started ⚡"** (green).

#### `admin.js`
- Fetches and renders all stations, bookings, and users.
- Provides forms to add/edit/delete stations.
- Contains the **OTP verification form** — admin manually types the OTP shown by the user at the station, submits to `POST /api/bookings/admin/{id}/verify-otp`.

---

## 6. All API Endpoints

### 🔐 Auth — `/api/auth`
| Method | Endpoint | Body / Params | What it does |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{name, email, password, role}` | Create a new user account |
| `POST` | `/api/auth/login` | `{email, password}` | Login — returns full user object |
| `POST` | `/api/auth/change-password` | `{userId, oldPassword, newPassword}` | Change a user's password |
| `GET` | `/api/auth/users` | — | Admin: Get all users |
| `DELETE` | `/api/auth/users/{id}` | — | Admin: Delete a user by ID |

### 📍 Stations — `/api/stations`
| Method | Endpoint | Body / Params | What it does |
|---|---|---|---|
| `GET` | `/api/stations` | — | Get all stations — used by map to place markers |
| `GET` | `/api/stations/{id}` | — | Get a single station by ID |
| `POST` | `/api/stations/admin` | `{name, latitude, longitude, address, pricePerKwh, totalSlots}` | Admin: Add a new station |
| `PUT` | `/api/stations/admin/{id}` | Station fields | Admin: Update station details |
| `DELETE` | `/api/stations/admin/{id}` | — | Admin: Delete a station |

### 🕐 Slots — `/api/stations/{stationId}/slots`
| Method | Endpoint | Body / Params | What it does |
|---|---|---|---|
| `GET` | `/api/stations/{stationId}/slots` | — | Get all slots for a station |
| `POST` | `/api/stations/{stationId}/slots/admin` | `{slotTime, status}` | Admin: Add a new slot |
| `DELETE` | `/api/stations/{stationId}/slots/admin/{slotId}` | — | Admin: Delete a slot |
| `PUT` | `/api/stations/{stationId}/slots/admin/{slotId}/status` | `?status=AVAILABLE` | Admin: Update slot status |

### 📅 Bookings — `/api/bookings`
| Method | Endpoint | Body / Params | What it does |
|---|---|---|---|
| `POST` | `/api/bookings/bookSlot` | `{userId, stationId, slotId, slotTime, bookingDate}` | **Create booking** — generates OTP & saves to DB |
| `GET` | `/api/bookings/user/{userId}` | — | Get all bookings for a user (history page) |
| `GET` | `/api/bookings/station/{stationId}/date/{date}` | — | Get bookings for a station on a date (slot availability check) |
| `GET` | `/api/bookings/admin` | — | Admin: Get ALL bookings |
| `DELETE` | `/api/bookings/admin/{id}` | — | Admin: Cancel / delete a booking |
| `POST` | `/api/bookings/admin/{id}/verify-otp` | `{otp}` | Admin: Verify OTP → sets payment to `SUCCESS` |
| `GET` | `/api/bookings/{id}/payment-status` | — | Poll payment status (`PENDING` or `SUCCESS`) |

### 💳 Payments — `/api/payments`
| Method | Endpoint | Body / Params | What it does |
|---|---|---|---|
| `POST` | `/api/payments/fakePayment` | `{bookingId, amount}` | Simulate payment — creates `PENDING` record + triggers OTP email |

---

## 7. Database Tables & Relationships

```
┌─────────────┐          ┌───────────────┐
│   USERS     │          │   STATIONS    │
│─────────────│          │───────────────│
│ id (PK)     │          │ id (PK)       │
│ name        │          │ name          │
│ email       │          │ latitude      │
│ password    │          │ longitude     │
│ role        │          │ address       │
└──────┬──────┘          │ pricePerKwh   │
       │                 │ totalSlots    │
       │                 └───────┬───────┘
       │                         │ 1
       │                         │ has many
       │                       ┌─┴──────────┐
       │                       │   SLOTS    │
       │                       │────────────│
       │                       │ id (PK)    │
       │                       │ station_id │◄── FK → stations.id
       │                       │ slotTime   │
       │                       │ status     │
       │                       └─────┬──────┘
       │                             │
       │          ┌──────────────────┘
       │          │
       ▼          ▼
┌──────────────────────────────────────────┐
│               BOOKINGS                   │
│──────────────────────────────────────────│
│ id (PK)                                  │
│ user_id    ◄── FK → users.id             │
│ station_id ◄── FK → stations.id          │
│ slot_id    ◄── FK → slots.id             │
│ bookingDate                              │
│ timeSlot                                 │
│ otp                                      │
│ otpExpiry                                │
│ createdAt                                │
│                                          │
│ UNIQUE: (station_id, bookingDate, timeSlot) │
└──────────────────┬───────────────────────┘
                   │ 1-to-1
                   ▼
         ┌─────────────────────┐
         │      PAYMENTS       │
         │─────────────────────│
         │ id (PK)             │
         │ booking_id ◄── FK   │ → bookings.id (UNIQUE)
         │ amount              │
         │ status              │ → "PENDING" or "SUCCESS"
         │ paymentMethod       │
         │ transactionId       │
         └─────────────────────┘
```

**Relationship Summary:**

| Relationship | Type | Description |
|---|---|---|
| `stations` → `slots` | 1-to-Many | One station has many time slots |
| `users` → `bookings` | 1-to-Many | One user can make many bookings |
| `stations` → `bookings` | 1-to-Many | One station can have many bookings |
| `slots` → `bookings` | 1-to-Many | One slot can be booked across different dates |
| `bookings` → `payments` | 1-to-1 | Each booking has exactly one payment record |

---

## 8. Complete Data Flow — Frontend → Backend → Database

### 🔑 Registration Flow
```
1. User fills register.html form
2. auth.js calls:
     POST /api/auth/register
     Body: { name, email, password, role: "USER" }
3. AuthController → AuthService.register(user)
4. AuthService:
   - Checks if email already exists in DB
   - If not → saves user to `users` table
   - Returns saved user object
5. AuthController returns HTTP 200 with user JSON
6. Frontend: saves user to localStorage → redirects to map
```

### 🗺️ Loading Stations on Map
```
1. map.html loads → main.js calls initMap()
2. fetch(`/api/stations`)
   └── StationController.getAllStations()
   └── StationService.getAllStations()
   └── StationRepository.findAll()  ← SQL: SELECT * FROM stations
   └── Returns List<Station> as JSON array
3. Frontend: Leaflet places one clickable marker per station using lat/lng
   └── If fetch fails: falls back to STATIC_STATIONS from data.js
```

### 🕐 Loading Available Slots for a Date
```
1. User selects a station + picks a date
2. loadSlots() runs
3. fetch(`/api/bookings/station/{stationId}/date/{date}`)
   └── BookingController.getBookingsForStationAndDate()
   └── BookingService.getBookingsByStationAndDate()
   └── BookingRepository.findByStationIdAndBookingDate()
      SQL: SELECT * FROM bookings WHERE station_id=? AND booking_date=?
   └── Returns array of booked time slots for that date
4. Frontend: Shows 5 fixed time slot buttons
   - Slots matching returned bookings → marked RED (taken)
   - All others → marked GREEN (available)
```

### 💳 Booking + Payment Flow
```
1. User selects a green slot → clicks "Proceed to Pay"
2. Payment modal opens (simulated card / UPI screen)
3. User clicks "Pay Now Simulation" → spinner → bank OTP screen
4. User clicks "Verify & Complete":

   STEP A — Create Booking:
   POST /api/bookings/bookSlot
   Body: { userId, stationId, slotId, slotTime, bookingDate }
   └── BookingService.bookSlot()
       - Validates user exists in DB
       - Checks for duplicate → throws error if slot already taken
       - Auto-creates slot record if needed
       - Generates random 6-digit OTP
       - Sets OTP expiry = NOW + 24 hours
       - Inserts row into bookings table
   └── Returns booking JSON { id, otp, ... }

   STEP B — Process Payment:
   POST /api/payments/fakePayment
   Body: { bookingId, amount }
   └── PaymentService.processFakePayment()
       - Creates Payment: status="PENDING", transactionId="EV-XXXXXXXX"
       - Inserts row into payments table
       - Calls emailService.sendBookingConfirmation(booking)  ← @Async!
   └── Returns payment JSON

5. Frontend shows "Success" modal with transaction ID
   OTP display shows: "Sent to your Email 📧"
```

---

## 9. How Data is Fetched Back (Database → Frontend)

### 📋 Booking History Page
```
1. history.html loads → main.js calls loadUserBookings()
2. getCurrentUser() reads localStorage → gets userId
3. fetch(`/api/bookings/user/{userId}`)
   └── BookingController → BookingService.getUserBookings()
   └── BookingRepository.findByUserId()
      SQL: SELECT * FROM bookings WHERE user_id = ?
      (JPA auto-fetches joined user, station, slot via @ManyToOne)
   └── Returns booking array with full nested objects
4. Frontend renders booking cards:
   - "Upcoming" tab: bookingDate >= today
   - "Past" tab: bookingDate < today
5. For each UPCOMING booking → startPollingStatus(bookingId):
   └── Every 3 seconds: fetch(`/api/bookings/{id}/payment-status`)
       └── BookingService.getPaymentStatus()
       └── PaymentRepository.findByBookingId()
          SQL: SELECT * FROM payments WHERE booking_id = ?
       └── Returns { status: "PENDING" } or { status: "SUCCESS" }
6. When status = "SUCCESS":
   └── Polling stops
   └── Badge updates: "Charging Started ⚡" (green)
```

**Offline fallback:** If the backend is unreachable, `loadUserBookings()` catches the error and displays any bookings stored in `localStorage`.

---

## 10. Map API & Distance Calculation

### 🗺️ Map Rendering — Leaflet.js + OpenStreetMap
- **Library:** [Leaflet.js](https://leafletjs.com/) — Free, open-source, no API key required.
- **Tile source:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` — Free OpenStreetMap tiles.
- **How it works:** Station `latitude` and `longitude` from the database are used to place interactive markers on the map.

### 📐 Route Drawing — Leaflet Routing Machine + OSRM
```javascript
routingControl = L.Routing.control({
    waypoints: [userLocation, L.latLng(stationLat, stationLng)],
    ...
}).addTo(map);
```
- **Plugin:** [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/)
- **Engine:** OSRM (Open Source Routing Machine) — free public routing API, no key needed
- **What happens:**
  1. Gets the user's GPS position via `navigator.geolocation.getCurrentPosition()`
  2. Draws a **highlighted route line** from the user's dot to the selected station marker
  3. OSRM automatically calculates actual road distance and estimated drive time

### 🚗 "Open in Google Maps" Button
```javascript
const url = `https://www.google.com/maps/dir/?api=1
  &origin=${userLat},${userLng}
  &destination=${stationLat},${stationLng}
  &travelmode=driving`;
window.open(url, '_blank');
```
Uses the **Google Maps Directions URL scheme** (no API key needed for link-based navigation). Opens Google Maps in a new tab with full turn-by-turn directions.

---

## 11. How Emails Are Sent to Users

### Step-by-Step Email Flow
```
Payment record created (PENDING)
      ↓
PaymentService.processFakePayment() calls:
      ↓
emailService.sendBookingConfirmation(booking)   ← @Async (separate background thread)
      ↓
EmailService builds styled HTML email:
  ✅ User's name
  ✅ 6-digit OTP (large, bold, highlighted)
  ✅ Station name
  ✅ Booking date
  ✅ Time slot
      ↓
JavaMailSender sends via Gmail SMTP:
  Host:  smtp.gmail.com
  Port:  587 (STARTTLS)
  Auth:  Gmail App Password
      ↓
User receives email in inbox:
  Subject: "⚡ EV Connect — Your Booking OTP & Confirmation"
```

### Gmail SMTP Configuration (`application.properties`)
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

> **Note:** Gmail requires an **App Password** (not your regular password) when two-factor authentication (2FA) is enabled on the account.

### Why `@Async` Matters
| Without `@Async` | With `@Async` |
|---|---|
| API waits 2–5 seconds for email to send | API responds **immediately** — email sends in background |
| User sees a spinner/delay | User sees instant success confirmation |
| Email failure could error the whole request | Email failure only logs a warning — booking is unaffected |

> `@EnableAsync` must be added to `BackendApplication.java` for `@Async` to work.

---

## 12. What Happens When the Database Goes Offline

EV Connect is designed to **never crash** — it degrades gracefully.

### Map Page (Station Markers)
- `map.js` catches the fetch error from `/api/stations`.
- Immediately falls back to `STATIC_STATIONS` array in `data.js`.
- Map still shows all 10 stations. **The user doesn't notice anything is wrong.**

### Booking (DB Goes Offline Mid-Booking)
If `POST /api/bookings/bookSlot` or `POST /api/payments/fakePayment` fails:
```javascript
catch (error) {
    // Save booking locally in browser storage
    const localBookings = JSON.parse(localStorage.getItem('evBookings') || '[]');
    localBookings.push({
        id: Date.now(), userId, stationId, slotId,
        bookingDate, timeSlot, otp, txId
    });
    localStorage.setItem('evBookings', JSON.stringify(localBookings));

    // Still show success modal — user experience is preserved
    document.getElementById('successModal').classList.remove('hidden');
}
```
- Booking is saved in `localStorage` under key `evBookings`.
- User still sees the success confirmation screen.

### History Page (DB Offline)
- `history.js` wraps the fetch in a `try/catch`.
- If the backend is unreachable, it renders bookings from `localStorage` instead.
- A warning is logged to the browser console but the page still works.

### Recovery (DB Comes Back Online)
- `loadUserBookings()` fetches fresh data from the DB.
- Merges API bookings with any local `localStorage` bookings (deduplicating by OTP).
- Bookings that exist only locally are labeled with `*Offline*`.

---

## 13. Full Booking Lifecycle — Step by Step

```
[1]  User registers → account saved to DB
[2]  User logs in → user object saved to localStorage
[3]  User opens map.html → stations loaded from DB → markers placed on map
[4]  User allows geolocation → user's location dot appears on map
[5]  User clicks a marker → selects a station → route drawn to station
[6]  User picks a date → available/booked slots loaded from DB → shown as green/red buttons
[7]  User clicks a green (available) slot — selects it
[8]  User selects car model + charge % → estimated cost calculated
[9]  User clicks "Proceed to Pay" → payment modal opens
[10] User clicks "Pay Now Simulation" → loading spinner → simulated bank OTP screen
[11] User clicks "Verify & Complete":
     ├─[11a] POST /api/bookings/bookSlot → booking saved to DB, 6-digit OTP generated
     ├─[11b] POST /api/payments/fakePayment → payment record (PENDING) saved to DB
     └─[11c] emailService.sendBookingConfirmation() → OTP email sent async in background
[12] User sees success modal: "OTP sent to your Email 📧"
[13] User checks email → sees their 6-digit OTP and booking details
[14] User arrives at charging station → shows OTP to admin
[15] Admin opens admin.html → navigates to Bookings tab
[16] Admin finds the booking → types in the OTP → clicks "Verify OTP":
     POST /api/bookings/admin/{id}/verify-otp
     → OTP matched → payment status set to SUCCESS
     → OTP cleared from DB (single-use)
[17] User's history.html (polling every 3s) detects payment status = "SUCCESS"
[18] Booking badge updates: "Charging Started ⚡" (green)
[19] User plugs in and begins charging their vehicle

✅ Booking complete!
```

---

## 14. Admin Panel Flow

The admin panel (`admin.html` + `admin.js`) provides a complete management interface:

| Feature | API Called | Notes |
|---|---|---|
| View all stations | `GET /api/stations` | Same endpoint used by the map |
| Add station | `POST /api/stations/admin` | Requires all station fields |
| Edit station | `PUT /api/stations/admin/{id}` | Partial or full update |
| Delete station | `DELETE /api/stations/admin/{id}` | Permanent deletion |
| View all bookings | `GET /api/bookings/admin` | All users' bookings |
| Cancel a booking | `DELETE /api/bookings/admin/{id}` | Frees the slot |
| Verify user OTP | `POST /api/bookings/admin/{id}/verify-otp` | Triggers `SUCCESS` status |
| View all users | `GET /api/auth/users` | Full user list |
| Delete a user | `DELETE /api/auth/users/{id}` | Permanent user deletion |

### Access Control
The Admin Portal link in the navbar is **only visible** when the logged-in user's `role === "ADMIN"` in `localStorage`.
Regular users cannot see or navigate to the admin portal — it is hidden at the UI level.

---

*Documentation last updated: 19 April 2026 — EV Connect v1.0*

---

## 15. How to Set Up & Run Locally

### ✅ Prerequisites

Make sure the following are installed on your machine:

| Tool | Version | Purpose |
|---|---|---|
| **Java JDK** | 17 or higher | Runs the Spring Boot backend |
| **Maven** | 3.8+ | Builds the backend |
| **MySQL** | 8.0+ | Database server |
| **Git** | Any | Clone the repository |
| **A browser** | Chrome / Firefox | Open the frontend pages |

> No Node.js or npm is needed — the frontend is pure HTML + JS.

---

### 🗄️ Step 1 — Set Up the MySQL Database

1. Open MySQL Workbench or your terminal MySQL client.
2. Create a new database:
   ```sql
   CREATE DATABASE evconnect;
   ```
3. You do **not** need to create any tables manually — Hibernate/JPA will auto-create all tables on first startup (`spring.jpa.hibernate.ddl-auto=update`).

---

### ⚙️ Step 2 — Configure the Backend

Open the file:
```
ev-connect-backend/src/main/resources/application.properties
```

Update the following values to match your local setup:

```properties
# ── Database ──────────────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/evconnect
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# ── JPA / Hibernate ───────────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# ── Email (Gmail SMTP) ────────────────────────────────────────────
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_GMAIL_ADDRESS@gmail.com
spring.mail.password=YOUR_GMAIL_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# ── Server ────────────────────────────────────────────────────────
server.port=8080
```

> **Gmail App Password:** Go to your Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail / Windows".

---

### 🚀 Step 3 — Run the Backend

Open a terminal in the `ev-connect-backend/` folder and run:

```bash
mvn spring-boot:run
```

You should see output ending with:
```
Started BackendApplication in X.XXX seconds
```

The backend is now live at: **`http://localhost:8080`**

On first startup, `DatabaseSeeder.java` will automatically insert 10 charging stations if the table is empty.

---

### 🌐 Step 4 — Open the Frontend

The frontend is plain HTML — no build step needed.

Simply open any page directly in your browser:

```
ev-connect-frontend/pages/index.html    ← Home page
ev-connect-frontend/pages/map.html      ← Map + Booking
ev-connect-frontend/pages/login.html    ← Login
ev-connect-frontend/pages/admin.html    ← Admin panel
```

> **Tip:** Use **VS Code Live Server** extension for the best experience — it auto-refreshes on file save and avoids some `file://` CORS edge cases.

---

### 👤 Step 5 — Create an Admin Account

1. Open `register.html` in your browser.
2. Fill in any name, email, password.
3. Before clicking Register — open your browser **DevTools → Console** and run:

   ```javascript
   // This sets your registration role to ADMIN
   ```

   **OR** — the easier way: after registering, go to MySQL Workbench and run:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```
4. Log in again — the Admin Portal link will appear in the navbar.

---

## 16. Common Errors & Troubleshooting

### ❌ Backend fails to start — `Communications link failure`
**Cause:** MySQL is not running, or `application.properties` has the wrong password.

**Fix:**
1. Make sure MySQL server is running.
2. Double-check `spring.datasource.password` in `application.properties`.
3. Verify the database `evconnect` exists: `SHOW DATABASES;`

---

### ❌ Map shows no stations — blank map
**Cause 1:** Backend is not running.
**Fix:** Start the backend with `mvn spring-boot:run`.

**Cause 2:** Backend started but DB is empty — `DatabaseSeeder` didn't seed.
**Fix:** Check backend console for errors. Manually verify with:
```sql
SELECT COUNT(*) FROM stations;
```

**Cause 3:** CORS error in the browser console.
**Fix:** Make sure `CorsConfig.java` is present and the backend restarted after any config changes.

---

### ❌ Booking fails — "Slot already booked" error
**Cause:** Another booking with the same `station_id + bookingDate + timeSlot` already exists.

**Fix:** Pick a different date or time slot. This is expected behavior — the unique constraint is working correctly.

---

### ❌ Email is not received after booking
**Cause 1:** Gmail App Password is wrong or not set in `application.properties`.

**Fix:** Generate a new App Password from your Google Account settings.

**Cause 2:** You used your normal Gmail password instead of an App Password.

**Fix:** Gmail requires an App Password when 2FA is enabled. Use that instead.

**Note:** Email is `@Async` — if the backend console shows no email error, the email was sent. Check your spam folder.

---

### ❌ "Charging Started ⚡" never appears on history page
**Cause:** The admin hasn't verified the OTP yet, or polling failed.

**Fix:**
1. Open `admin.html` and log in as an admin.
2. Go to Bookings tab → find the booking → enter the OTP → click Verify.
3. The history page polls every 3 seconds — the badge should update within 3 seconds of verification.

---

### ❌ Geolocation not working on map
**Cause:** The browser requires HTTPS (or `localhost`) to access `navigator.geolocation`.

**Fix:** Run the frontend via VS Code Live Server on `localhost`, not directly from a `file://` path.

---

## 17. Project Architecture — Quick Visual Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Frontend)                        │
│                                                                   │
│  index.html  map.html  history.html  admin.html  login.html      │
│       │           │          │            │           │           │
│       └───────────┴──────────┴────────────┴───────────┘           │
│                              │                                     │
│                         main.js  ← wires functions to pages       │
│                              │                                     │
│         ┌────────────────────┼────────────────────┐               │
│     api.js              utils.js              data.js             │
│  (base URL)           (localStorage)       (fallback stations)    │
│         │                                                          │
│    modules/                                                        │
│  auth.js  map.js  history.js  admin.js                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │  HTTP (fetch / REST API calls)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SPRING BOOT BACKEND (Port 8080)                  │
│                                                                   │
│  Controllers  →  Services  →  Repositories  →  JPA / Hibernate   │
│                                                     │             │
└─────────────────────────────────────────────────────┼────────────┘
                                                      │  JDBC / SQL
                                                      ▼
                                          ┌──────────────────┐
                                          │   MySQL Database  │
                                          │  (evconnect DB)   │
                                          │                   │
                                          │ users             │
                                          │ stations          │
                                          │ slots             │
                                          │ bookings          │
                                          │ payments          │
                                          └──────────────────┘

                     Email path (async):
                     PaymentService → EmailService → Gmail SMTP → User Inbox
```

---

## 18. Glossary of Key Terms

| Term | Meaning in this project |
|---|---|
| **OTP** | One-Time Password — a 6-digit code sent by email to verify the user at the station |
| **Slot** | A 2-hour time window at a charging station (e.g. `10:00–12:00`) |
| **Booking** | A confirmed reservation of a slot by a user on a specific date |
| **Payment** | A simulated transaction record linked 1-to-1 with a booking |
| **CORS** | Cross-Origin Resource Sharing — browser security policy that blocks requests between different origins |
| **JPA / Hibernate** | Java persistence framework that maps Java classes to database tables |
| **DTO** | Data Transfer Object — a plain class that defines the shape of incoming JSON from the frontend |
| **`@Async`** | Spring annotation that runs a method on a background thread (used for email sending) |
| **`@Entity`** | Spring annotation that marks a Java class as a database table model |
| **Leaflet.js** | Open-source JavaScript library for interactive maps (alternative to Google Maps) |
| **OSRM** | Open Source Routing Machine — free routing engine used to draw road routes on the map |
| **DatabaseSeeder** | A component that inserts initial test data (10 stations) on first backend startup |
| **localStorage** | Browser-side key-value storage used to persist the logged-in user session and offline bookings |
| **Polling** | Repeatedly calling an API endpoint on a timer (every 3s) to check for status updates |
| **`PENDING`** | Payment status right after booking — means OTP has not yet been verified by admin |
| **`SUCCESS`** | Payment status after admin verifies the OTP — triggers "Charging Started ⚡" on the history page |

---

*Documentation last updated: 19 April 2026 — EV Connect v1.0*
