# Deployment Notes

## Frontend

1. Run `npm run build`.
2. Deploy the root project to Vercel or Netlify.
3. Add frontend variables from `.env.example`.
4. Keep `vercel.json`; it prevents reload errors on client-side routes.

## Backend

1. Deploy the `server` folder to Render, Railway, Cyclic or another Node host.
2. Add variables from `server/.env.example`.
3. Set `CLIENT_URL` to the deployed frontend URL.
4. Set `MONGODB_URI` to MongoDB Atlas.
5. Run `npm run seed` once on the server environment or seed locally against Atlas.

## Production Checks

- Never commit real MongoDB, JWT, Stripe, Google or imgbb credentials.
- Confirm backend health: `/api/health`.
- Confirm BetterAuth by starting Google OAuth from the login page.
- Confirm Stripe by creating an accepted booking and completing the Payment Element flow.
- Confirm imgbb by uploading an image from the vendor Add Ticket form.
- Confirm CORS allows only the deployed frontend URL.
- Confirm frontend reloads from nested routes without 404.
- Confirm logged-in users keep their JWT in storage and do not get redirected on refresh.
