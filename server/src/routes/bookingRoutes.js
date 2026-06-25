import express from 'express';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import Transaction from '../models/Transaction.js';
import { allowRoles, protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { ticketId, quantity } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket || ticket.status !== 'approved') return res.status(404).json({ message: 'Approved ticket not found' });
    if (new Date(ticket.departure) <= new Date()) return res.status(400).json({ message: 'Departure time has passed' });
    if (Number(quantity) > ticket.quantity) return res.status(400).json({ message: 'Booking quantity cannot exceed ticket quantity' });
    const booking = await Booking.create({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      ticket: ticket._id,
      vendor: ticket.vendor,
      quantity,
      totalPrice: ticket.price * quantity,
      status: 'pending',
    });
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
});

router.get('/mine', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('ticket').sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

router.get('/vendor', protect, allowRoles('vendor', 'admin'), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ vendor: req.user._id }).populate('ticket user').sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', protect, allowRoles('vendor', 'admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be accepted or rejected' });
    const booking = await Booking.findById(req.params.id).populate('ticket');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'admin' && String(booking.vendor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can review only your own bookings' });
    }
    booking.status = status;
    await booking.save();
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/pay', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('ticket');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.user) !== String(req.user._id)) return res.status(403).json({ message: 'You can pay only your own booking' });
    if (booking.status !== 'accepted') return res.status(400).json({ message: 'Only accepted bookings can be paid' });
    if (new Date(booking.ticket.departure) <= new Date()) return res.status(400).json({ message: 'Payment is closed for departed tickets' });
    if (booking.quantity > booking.ticket.quantity) return res.status(400).json({ message: 'Not enough tickets left' });

    booking.status = 'paid';
    booking.ticket.quantity -= booking.quantity;
    await booking.ticket.save();
    await booking.save();
    const transaction = await Transaction.create({
      user: req.user._id,
      booking: booking._id,
      ticket: booking.ticket._id,
      ticketTitle: booking.ticket.title,
      transactionId: req.body.transactionId || `stripe_demo_${Date.now()}`,
      amount: booking.totalPrice,
    });
    res.json({ booking, transaction });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions/mine', protect, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

export default router;
