import express from 'express';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { allowRoles, protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const {
      search = '',
      from,
      to,
      type = 'All',
      sort = 'recent',
      page = 1,
      limit = 6,
      advertised,
    } = req.query;

    const fraudVendors = await User.find({ fraud: true }).distinct('_id');
    const query = { status: 'approved', vendor: { $nin: fraudVendors } };

    if (type !== 'All') query.type = type;
    if (advertised === 'true') query.advertised = true;

    // Backward compatible:
    // - If `search` is provided (old behavior), search from/to/title.
    // - If `from`/`to` are provided (new behavior), filter by those fields.
    if (from || to) {
      if (from) query.from = new RegExp(String(from), 'i');
      if (to) query.to = new RegExp(String(to), 'i');
    } else if (search) {
      query.$or = [
        { from: new RegExp(search, 'i') },
        { to: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') },
      ];
    }

    const sortMap = { low: { price: 1 }, high: { price: -1 }, recent: { createdAt: -1 } };
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 9);

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .sort(sortMap[sort] || sortMap.recent)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Ticket.countDocuments(query),
    ]);

    res.json({ tickets, total, page: pageNumber, pages: Math.ceil(total / pageSize) || 1 });
  } catch (error) {
    next(error);
  }
});

router.get('/latest', async (req, res, next) => {
  try {
    const fraudVendors = await User.find({ fraud: true }).distinct('_id');
    const tickets = await Ticket.find({ status: 'approved', vendor: { $nin: fraudVendors } }).sort({ createdAt: -1 }).limit(8);
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
});

router.get('/vendor/mine', protect, allowRoles('vendor', 'admin'), async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, allowRoles('vendor', 'admin'), async (req, res, next) => {
  try {
    if (req.user.fraud) return res.status(403).json({ message: 'Fraud-marked vendors cannot add tickets' });
    const ticket = await Ticket.create({
      ...req.body,
      vendor: req.user._id,
      vendorName: req.user.name,
      vendorEmail: req.user.email,
      status: 'pending',
      advertised: false,
    });
    res.status(201).json({ ticket });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const ownsTicket = String(ticket.vendor) === String(req.user._id);
    if (ticket.status !== 'approved' && req.user.role !== 'admin' && !ownsTicket) {
      return res.status(404).json({ message: 'Approved ticket not found' });
    }
    res.json({ ticket });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, allowRoles('vendor', 'admin'), async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role !== 'admin' && String(ticket.vendor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can update only your own tickets' });
    }
    if (ticket.status === 'rejected' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Rejected tickets cannot be changed by vendors' });
    }
    Object.assign(ticket, req.body, req.user.role === 'admin' ? {} : { status: ticket.status });
    await ticket.save();
    res.json({ ticket });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, allowRoles('vendor', 'admin'), async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role !== 'admin' && String(ticket.vendor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can delete only your own tickets' });
    }
    if (ticket.status === 'rejected' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Rejected tickets cannot be deleted by vendors' });
    }
    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
