# Testimonial & Social Proof Collector

## Project Description

This MERN stack technical assessment application allows business owners to create testimonial collection spaces, collect customer feedback, moderate submissions, display approved testimonials, and generate embeddable social-proof widgets.

Implemented workflows include owner authentication, space management, public testimonial collection, moderation, rating metrics, a public Wall of Love, and iframe embed options.

## Technology Stack Used

- **Frontend:** React 18, React Router, Vite, Tailwind CSS, Axios, Lucide React, Canvas Confetti, and Radix UI primitives
- **Backend:** Node.js, Express, CORS, cookie-parser, dotenv, Multer, and Validator
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT access and refresh tokens in HTTP-only cookies with bcryptjs password hashing
- **Image storage:** Local disk storage with optional Cloudinary integration
- **Build tooling:** PostCSS, Autoprefixer, and Tailwind CSS

## How to Install Dependencies

Prerequisites:

- Node.js 18 or newer
- npm
- MongoDB running locally, or another reachable MongoDB deployment

From the repository root, run the root install script:

```bash
npm run install:all
```

This runs `npm install` in the root, `server`, and `client` directories.

## How to Configure Environment Variables

Copy the example files to `.env` files. In PowerShell, from the repository root:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Configure the following variables from the example templates.

### Server variables

- `PORT` - Backend port. The example uses `5000`.
- `NODE_ENV` - Runtime environment.
- `CLIENT_URL` - Frontend origin used for CORS and simulated email links.
- `MONGODB_URI` - MongoDB connection URI.
- `ACCESS_TOKEN_SECRET` - JWT access-token signing secret.
- `REFRESH_TOKEN_SECRET` - JWT refresh-token signing secret.
- `CLOUDINARY_CLOUD_NAME` - Optional Cloudinary cloud name.
- `CLOUDINARY_API_KEY` - Optional Cloudinary API key.
- `CLOUDINARY_API_SECRET` - Optional Cloudinary API secret.

### Client variables

- `VITE_API_URL` - Backend API base URL.

Fill in secret values locally and never commit `.env` files, credentials, or API keys to GitHub. The Cloudinary variables may be left empty; the server then uses local disk storage for uploads.

## How to Run the Project Locally

Start MongoDB, configure both `.env` files, and then run both development servers from the repository root:

```bash
npm run dev
```

The root `dev` script runs the server and client concurrently. With the example configuration, the URLs are:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

To run the applications separately, use the existing root scripts:

```bash
npm run server
npm run client
```

The server package also provides `npm start`. The client package provides `npm run build` and `npm run preview`.

## Database Setup

Start a local MongoDB service before starting the backend. The server reads `MONGODB_URI` and the example configuration points to MongoDB on `127.0.0.1:27017` using the `testimonial_collector` database.

No migration or seed command is included. Mongoose creates the application collections as data is written. A hosted MongoDB deployment can also be used by setting `MONGODB_URI` to its reachable connection URI.

## Assumptions / Limitations

- Email verification and password reset are simulated. The application returns or logs the generated links instead of sending email through an external provider.
- New public testimonials are stored with `pending` status and require owner moderation before appearing on the public wall or embed widget.
- Uploaded images use local disk storage unless Cloudinary is fully configured; the server falls back to local storage if a Cloudinary upload fails.
- The included test programs use port `5000` and require MongoDB. Run them from the repository root with `node server/test-auth.js` and `node server/test-full-e2e.js`.
