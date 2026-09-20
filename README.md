# Testimonial & Social Proof Collector (MERN Stack)

A complete, production-ready MERN stack technical assessment application for creating testimonial collection spaces, gathering verified social proof from clients without requiring account login, moderating reviews with detailed metrics, and generating responsive embed widgets for websites.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Coss UI / Radix primitives (`@radix-ui/react-dialog`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`), Lucide Icons, Axios, Canvas-Confetti
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: Pair-token JWT (15-min access token + 7-day refresh token) stored in secure `httpOnly` cookies with token rotation and reuse detection
- **Image Pipeline**: Multer multipart upload with Cloudinary support and automatic local disk fallback (`/uploads/`)

---

## Assessment Requirements Implemented

1. **Authentication**
   - Owner Signup with `bcryptjs` password hashing (salt rounds = 10)
   - Simulated email verification (crypto verification token with 24-hour expiry, logged to server console and testable via `/verify-email`)
   - Owner Login issuing pair tokens
   - Access token: 15 minutes, Refresh token: 7 days
   - Stored in secure `httpOnly`, `sameSite: 'lax'` cookies
   - Refresh token rotation on `/api/auth/refresh` with reuse detection
   - Logout revoking stored refresh tokens and clearing cookies
   - Forgot password & Reset password simulation with 1-hour expiration crypto tokens
   - Protected owner routes via `authenticateOwner` middleware

2. **Space Management**
   - Create, edit, configure, and delete Spaces
   - Unique URL slugs (`/collect/:spaceSlug`)
   - Brand logo upload
   - Custom welcome messages and prompt questions
   - Mandatory client avatar toggle (`Switch`)
   - 1–5 star rating toggle (`Switch`)

3. **Public Testimonial Collection (`/collect/:spaceSlug`)**
   - Public clients do **NOT** need an account
   - Client name, email, company/role
   - 1–5 star rating selector
   - Review text
   - Avatar image upload (mandatory if space configured)
   - Client-side and server-side validation
   - Confetti celebration and success card on submission

4. **Review Moderation**
   - Tabbed filtering: `All`, `Pending`, `Approved`, `Archived`
   - Owner actions: `Approve`, `Reject`, `Archive`, `Mark Featured`, `Mark Liked`, `Delete`
   - Keyword search filter (searches name, email, company, and review text)
   - Star rating dropdown filter (All, 5★, 4★, 3★, 2★, 1★)

5. **Wall of Love (`/wall/:spaceSlug`)**
   - Public standalone view
   - Responsive masonry-style multi-column layout
   - Displays approved testimonials with avatars, verified client badges, and featured badges
   - "Leave a Testimonial" CTA button

6. **Embed Generator**
   - Accessible modal in space dashboard
   - Theme customization: Light mode and Dark mode
   - Layout switcher: `Grid`, `Carousel`, and `Badge`
   - Live interactive preview
   - One-click copyable `<iframe>` HTML snippet for embedding on any website

7. **Rating Metrics**
   - Average star score calculation
   - Total reviews count
   - Star distribution breakdown (5★ down to 1★ counts, percentages, and visual progress bars)
   - Status counters (pending reviews awaiting moderation)

---

## Quick Start

### 1. Prerequisites
- Node.js v18+ or v20+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Run Dev Servers (Client + Server Concurrently)
```bash
npm run dev
```
- Frontend will be live at: `http://localhost:5173`
- Backend API will be live at: `http://localhost:5000`

### 4. Run Automated Assessment Test Suites
```bash
# Auth and Security Verification Test
node server/test-auth.js

# Complete End-to-End System Test (All 18 requirements)
node server/test-full-e2e.js
```

---

## Project Structure

```
testimonial-social-proof-collector/
├── package.json                   # Root orchestrator
├── README.md
├── server/                        # Backend Node.js / Express
│   ├── server.js                  # Entry point
│   ├── test-auth.js               # Automated auth test suite
│   ├── test-full-e2e.js           # Automated end-to-end test suite
│   └── src/
│       ├── config/                # DB, constants, cloudinary
│       ├── controllers/           # Auth, Space, Testimonial, Public
│       ├── middleware/            # Auth, Upload, Error
│       ├── models/                # User, Space, Testimonial
│       ├── routes/                # Auth, Space, Testimonial, Public
│       └── utils/                 # Token, EmailSimulator, Slugify
└── client/                        # Frontend React / Vite
    ├── src/
    │   ├── api/                   # Axios client + API modules
    │   ├── components/            # Coss UI primitives, Layout, Modals
    │   ├── context/               # AuthContext, ToastContext
    │   └── pages/
    │       ├── auth/              # Login, Signup, Verify, Forgot, Reset
    │       ├── dashboard/         # DashboardHome, SpaceDashboard
    │       └── public/            # PublicCollect, PublicWall, EmbedWidget
```
