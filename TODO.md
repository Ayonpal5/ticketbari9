# TicketBari - - - Completion Notes

## Main Requirements
- Main layout, sticky navbar, responsive content area, and footer are implemented.
- Navbar includes Home, All Tickets, Dashboard, Login/Register, and logged-in user dropdown.
- Login and registration use the backend JWT flow with local demo fallback.
- Homepage includes a hero slider, advertised tickets, latest tickets, Popular Routes, and Why Choose Us.
- Public ticket views show only admin-approved tickets and hide fraud-marked vendor tickets.
- Ticket cards include image, title, from-to, transport type, price, quantity, perks, departure date/time, and details link.
- Ticket details are protected and include countdown, full ticket information, and booking rules.
- Booking requests save as pending, appear in My Booked Tickets, and validate quantity/departure.
- User, vendor, and admin dashboard sections are implemented with role-specific profile views.
- Stripe/demo payment marks accepted bookings as paid and reduces available quantity after payment.
- Rejected bookings show rejected status and do not show countdown/payment controls.
- Vendor ticket creation, update/delete, requested bookings, and revenue overview are implemented.
- Admin ticket approval, user role management, fraud marking, and advertised ticket toggle are implemented.
- Loading and invalid-route states are implemented.

## Challenge Requirements
- All Tickets supports From/To search, transport filtering, price sorting, and pagination.
- APIs are protected with JWT middleware where required.
- Dark/light mode toggle is implemented.

## Verification
- Frontend production build passes with `npm.cmd run build`.
- Server syntax check passes with `npm.cmd run build:server`.
