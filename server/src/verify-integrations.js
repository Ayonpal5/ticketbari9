import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Stripe from 'stripe';

dotenv.config();

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'BETTER_AUTH_SECRET',
  'STRIPE_SECRET_KEY',
  'IMGBB_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

const report = [];
const mark = (name, ok, detail = '') => report.push({ name, ok, detail });

for (const key of required) {
  mark(`env:${key}`, Boolean(process.env[key] && !process.env[key].includes('replace_with')), process.env[key] ? 'configured' : 'missing');
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 12000 });
  await mongoose.connection.db.admin().ping();
  mark('mongodb', true, `connected:${mongoose.connection.name}`);
  await mongoose.disconnect();
} catch (error) {
  mark('mongodb', false, error.message);
}

try {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const intent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: 'bdt',
    metadata: { verification: 'ticketbari' },
  });
  mark('stripe', Boolean(intent.client_secret), `payment_intent:${intent.id}`);
} catch (error) {
  mark('stripe', false, error.message);
}

try {
  const onePixelPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
  const form = new FormData();
  form.set('key', process.env.IMGBB_API_KEY);
  form.set('image', onePixelPng);
  form.set('name', `ticketbari-verify-${Date.now()}`);
  const response = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  const body = await response.json();
  mark('imgbb', response.ok && body.success, response.ok ? 'upload_ok' : body?.error?.message || 'upload_failed');
} catch (error) {
  mark('imgbb', false, error.message);
}

mark('google_oauth_config', Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), 'credentials_present');

for (const item of report) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name} ${item.detail}`);
}

if (report.some(item => !item.ok)) process.exit(1);
