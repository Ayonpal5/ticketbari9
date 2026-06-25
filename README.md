# TicketBari - Online Ticket Booking Platform

TicketBari is a MERN-style online ticket booking platform for bus, train, launch and plane tickets. It includes a responsive React frontend and an Express/MongoDB backend with JWT-protected APIs.

## Purpose

Users can discover approved travel tickets, request bookings, pay accepted bookings and view transactions. Vendors can add and manage tickets and review booking requests. Admins can approve tickets, manage users, mark vendors as fraud and choose up to six advertised tickets for the homepage.

## Live URL

Add your deployed frontend URL after deployment.

## Demo Credentials

- Admin Email: `admin@ticketbari.com`
- Admin Password: `Admin@123`
- Vendor Email: `vendor@ticketbari.com`
- Vendor Password: `Vendor@123`
- User Email: `user@ticketbari.com`
- User Password: `User@123`

## Key Features

- Sticky responsive navbar, footer, avatar dropdown and mobile hamburger menu
- Register/login UI plus JWT auth API on the backend
- BetterAuth server integration mounted at `/api/better-auth/*`
- Google OAuth provider support through BetterAuth environment variables
- Home page with hero, advertised tickets, latest tickets and extra sections
- All Tickets page with From-To search, transport filter, price sort and pagination
- Protected ticket details page with countdown and booking modal
- User dashboard: profile, booked tickets and transaction history
- Vendor dashboard: profile, add ticket, own tickets, requested bookings and revenue chart
- Admin dashboard: profile, manage tickets, manage users and advertise tickets
- Booking status flow: pending, accepted, rejected and paid
- Stripe Payment Element frontend with backend payment-intent endpoint
- Demo Stripe fallback when no Stripe keys are configured
- imgbb upload endpoint for vendor/admin ticket images
- MongoDB models for users, tickets, bookings and transactions
- Dark/light mode toggle and responsive dashboard layout
- Invalid route page and Vercel reload-safe config
- Resource-inspired UI polish using the provided design references for loaders, button states, cards, sections, footer structure and image-resource direction

## Design Inspiration Resources

- Uiverse: open-source UI element patterns for loaders, buttons, cards, forms and dark-mode surfaces.
- DevMeetsDevs: section, footer and product-layout inspiration.
- Bootcamp UX resource collection: image and resource discovery direction.
- ThemeForest and CodeCanyon: marketplace-level layout density and dashboard/product-card inspiration.

## Tech Stack

Frontend:

- React
- Vite
- Lucide React
- CSS

Backend:

- Node.js
- Express
- MongoDB / Mongoose
- JWT
- bcryptjs
- Stripe
- BetterAuth
- MongoDB native driver
- CORS, Helmet, Morgan

## Project Structure

```text
.
├── src/                  # React frontend
├── server/
│   ├── src/config        # MongoDB connection
│   ├── src/middleware    # Auth and error middleware
│   ├── src/models        # User, Ticket, Booking, Transaction
│   ├── src/routes        # Auth, tickets, bookings, payments, admin
│   ├── src/seed.js       # Demo data seeder
│   └── src/server.js     # Express app
├── .env.example          # Frontend env template
├── server/.env.example   # Backend env template
└── vercel.json           # Frontend routing rewrite
```

## Environment Variables

Frontend `.env.local`:

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Backend `server/.env`:

```env
PORT=5000
CLIENT_URL=http://127.0.0.1:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ticketbari
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
BETTER_AUTH_SECRET=replace_with_a_long_random_secret
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_DB=ticketbari
STRIPE_SECRET_KEY=
IMGBB_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Run Locally

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

Seed MongoDB after adding `server/.env`:

```bash
cd server
npm run seed
```

Start backend:

```bash
cd server
npm run dev
```

Start frontend in another terminal:

```bash
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`.
Backend runs at `http://localhost:5000`.

## Build and Check

```bash
npm run build
cd server
npm run check
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/tickets`
- `GET /api/tickets/latest`
- `POST /api/tickets`
- `PATCH /api/tickets/:id`
- `DELETE /api/tickets/:id`
- `POST /api/bookings`
- `GET /api/bookings/mine`
- `GET /api/bookings/vendor`
- `PATCH /api/bookings/:id/status`
- `POST /api/bookings/:id/pay`
- `POST /api/payments/create-intent`
- `POST /api/uploads/imgbb`
- `ALL /api/better-auth/*`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/role`
- `PATCH /api/admin/users/:id/fraud`
- `GET /api/admin/tickets`
- `PATCH /api/admin/tickets/:id/status`
- `PATCH /api/admin/tickets/:id/advertise`

## Submission Placeholders

- Live Site Link: add after deployment
- Github Repository (client): add after pushing
- Github Repository (server): add after pushing or splitting backend into a separate repo

## External Setup Required

These items require your real account credentials or deployed URLs:

- Google OAuth: create Google Cloud OAuth credentials and set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
- Stripe: set `STRIPE_SECRET_KEY` in `server/.env` and `VITE_STRIPE_PUBLISHABLE_KEY` in `.env.local`.
- imgbb: set `IMGBB_API_KEY` in `server/.env`.
- Production CORS verification: deploy frontend/backend, set `CLIENT_URL` to the deployed frontend URL, then test `/api/health`.
- GitHub repository links: push the client and server repositories, then add the URLs above.
