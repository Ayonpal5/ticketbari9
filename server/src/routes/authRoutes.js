import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { publicUser, signToken } from '../utils/token.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, avatar: name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() });
    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/google-demo', async (req, res, next) => {
  try {
    const { name = 'Google User', email } = req.body;
    if (!email) return res.status(400).json({ message: 'Google email is required' });
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password: crypto.randomUUID(), avatar: name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() });
    }
    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
