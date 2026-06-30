import express from 'express';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { publicUser } from '../utils/token.js';

const router = express.Router();
router.use(protect, allowRoles('admin'));

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map(publicUser) });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'vendor', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const update = { role };
    if (role === 'vendor') update.fraud = false;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/fraud', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { fraud: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Ticket.updateMany({ vendor: user._id }, { advertised: false });
    res.json({ user: publicUser(user), message: 'Vendor marked as fraud and tickets hidden' });
  } catch (error) {
    next(error);
  }
});

router.get('/tickets', async (req, res, next) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
});

router.patch('/tickets/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be approved or rejected' });
    const update = { status };
    if (status === 'rejected') update.advertised = false;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ ticket });
  } catch (error) {
    next(error);
  }
});

router.patch('/tickets/:id/advertise', async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.status !== 'approved') return res.status(404).json({ message: 'Approved ticket not found' });
    if (!ticket.advertised) {
      const count = await Ticket.countDocuments({ advertised: true, status: 'approved' });
      if (count >= 6) return res.status(400).json({ message: 'You cannot advertise more than 6 tickets' });
    }
    ticket.advertised = !ticket.advertised;
    await ticket.save();
    res.json({ ticket });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [users, tickets, bookings, paid] = await Promise.all([
      User.countDocuments(),
      Ticket.countDocuments(),
      Booking.countDocuments(),
      Booking.find({ status: 'paid' }),
    ]);
    res.json({
      users,
      tickets,
      bookings,
      revenue: paid.reduce((sum, booking) => sum + booking.totalPrice, 0),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
