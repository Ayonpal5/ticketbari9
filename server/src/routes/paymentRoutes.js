import express from 'express';
import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

router.post('/create-intent', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.body.bookingId).populate('ticket');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.user) !== String(req.user._id)) return res.status(403).json({ message: 'You can pay only your own booking' });
    if (booking.status !== 'accepted') return res.status(400).json({ message: 'Only accepted bookings can be paid' });
    if (!stripe) {
      return res.json({
        clientSecret: `demo_secret_${booking._id}`,
        transactionId: `stripe_demo_${Date.now()}`,
        demo: true,
      });
    }
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: 'bdt',
      metadata: {
        bookingId: String(booking._id),
        ticketId: String(booking.ticket._id),
        userId: String(req.user._id),
      },
    });
    res.json({ clientSecret: intent.client_secret, transactionId: intent.id, demo: false });
  } catch (error) {
    next(error);
  }
});

export default router;
