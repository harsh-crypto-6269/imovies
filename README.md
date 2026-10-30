# IMovies – Online Movie Ticket Booking System

A modern, responsive, and full-stack cinema ticket booking web application designed and architected by **Harsh Ranawat**. Built with **React.js, Node.js, Express.js, and MongoDB/Mongoose**.

---

## Features

1. **Design & Brand**:
   - Premium cinema-inspired dark palette (`#08090c` obsidian canvas, `#121520` structural charcoal, and `#dc2626` crimson accents).
   - Prominently showcases **Harsh Ranawat** on the upper side banner, navigation bar, and footer.
   - Adheres to the **Universal Frontend Design Constitution** (3-zone Top Bar contract, unboxed metadata, zero pill discipline, zero broken images).

2. **Movie Catalog & Spotlight**:
   - High-fidelity cinematic posters and hero banner stills generated with IMAX proportions.
   - Now Showing and Coming Soon listings with filters for genre, language, and projection format (IMAX 3D, Dolby Atmos, 4DX, 2D).
   - Search bar for quick filtering by title, director, cast, or genre.

3. **Showtimes & Real-Time Seat Selection**:
   - Interactive auditorium seating layout with curved glowing screen and realistic aisle walkways.
   - Three distinct seat tiers:
     - **Recliner (Row A)** – VIP plush leather comfort
     - **Premium (Rows B, C, D)** – Optimal viewing angles
     - **Standard (Rows E, F, G, H)** – Classic auditorium seating
   - Visual status legend: Available, Selected, Booked, and Temporarily Reserved (held).
   - **Atomic backend seat locks**: Prevents double-booking by temporarily holding seats for 10 minutes with live countdown timer.

4. **User Authentication & Profile**:
   - Registration and Login with JWT authentication in secure HTTP-only cookies and Bearer tokens.
   - Password hashing with `bcryptjs`.
   - Role-Based Access Control (`user` and `admin`).
   - One-click demo credentials for rapid testing (`admin@imovies.com` / `admin123` and `user@imovies.com` / `user123`).

5. **Payment Gateway & Checkout**:
   - Seamless checkout supporting **Razorpay Test Mode** and demo checkout options (UPI, Cards, NetBanking).
   - Dynamic breakdown of ticket subtotal, 18% integrated GST & convenience fee, and total amount.
   - Payment signature verification and duplicate transaction prevention on the backend.
   - Bank decline simulator checkbox for testing failed transaction states.

6. **Digital Ticket & QR Code Voucher**:
   - Instant ticket issuance with unique reference code (e.g. `IMV-2026-X8890K`).
   - Standalone vector QR code and barcode for contactless gate entrance.
   - Native print and receipt download support (`window.print()`).
   - "My Bookings" dashboard tracking active upcoming and past ticket history.

7. **Admin Console**:
   - Executive metrics dashboard (Revenue, Total Bookings, Tickets Issued, User Count).
   - Movie management: Create, update, or remove movies with posters, backdrops, trailers, and certification.
   - Showtime scheduler: Assign movies, cinemas, screens, dates, start times, and custom seat pricing.
   - Real-time customer bookings monitor with searchable ticket reference verification.
   - One-click database reset button to restore default sample catalog at any time.

---

## Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion, Canvas-Confetti.
- **Backend**: Node.js, Express.js REST API with modular controllers, middlewares, and services.
- **Database**: Dual-engine MongoDB support:
  - Supports external **MongoDB** via `mongoose` models (`User`, `Movie`, `Cinema`, `Screen`, `Show`, `Booking`, `Payment`).
  - Automatically activates built-in persistent storage (`data/imovies_store.json`) when external Mongo URI is omitted, guaranteeing 100% reliability out of the box in sandbox and cloud environments.
- **Server**: Integrated full-stack `server.ts` mounting Express API and Vite middlewares on port 3000.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` if custom variables are needed:
```bash
cp .env.example .env
```
Key environment variables:
- `PORT`: Server port (default: `3000`)
- `MONGODB_URI`: (Optional) MongoDB connection string (e.g., `mongodb://localhost:27017/imovies`)
- `JWT_SECRET`: Secret key for JWT signing
- `RAZORPAY_KEY_ID`: Razorpay test key ID
- `RAZORPAY_KEY_SECRET`: Razorpay test secret

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Test Accounts

- **Administrator**:
  - Email: `admin@imovies.com`
  - Password: `admin123`
  - Name: `Harsh Ranawat (Admin)`
- **Regular Patron**:
  - Email: `user@imovies.com`
  - Password: `user123`
  - Name: `Aditya Lodhi`
*(Both available via 1-click buttons in the Sign In modal)*
