import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Booking from './models/Booking.js';
import Ticket from './models/Ticket.js';
import Transaction from './models/Transaction.js';
import User from './models/User.js';

dotenv.config();

const photos = [
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=900&q=80',
];
const days = n => new Date(Date.now() + n * 86400000);

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany(), Ticket.deleteMany(), Booking.deleteMany(), Transaction.deleteMany()]);

  const admin = await User.create({ name: 'Afsana Rahman', email: 'admin@ticketbari.com', password: 'Admin@123', role: 'admin', avatar: 'AR' });
  const vendor = await User.create({ name: 'Nabil Transport', email: 'vendor@ticketbari.com', password: 'Vendor@123', role: 'vendor', avatar: 'NT' });
  const user = await User.create({ name: 'Sami Hasan', email: 'user@ticketbari.com', password: 'User@123', role: 'user', avatar: 'SH' });

  const source = [
    ['GreenLine Dhaka to Coxs Bazar', 'Dhaka', 'Coxs Bazar', 'Bus', 1450, 36, 9, ['AC', 'WiFi', 'Recliner'], 0, true],
    ['Subarna Express Business Seat', 'Dhaka', 'Chattogram', 'Train', 950, 42, 5, ['Window seat', 'Snack'], 1, true],
    ['SkyLink Saver Flight', 'Dhaka', 'Sylhet', 'Plane', 4200, 18, 7, ['Cabin bag', 'Priority'], 2, true],
    ['Padma Night Launch Cabin', 'Dhaka', 'Barishal', 'Launch', 1800, 24, 11, ['Cabin', 'Dinner'], 3, true],
    ['North Bengal Comfort Coach', 'Dhaka', 'Rangpur', 'Bus', 1250, 31, 13, ['AC', 'Blanket'], 4, true],
    ['Metro Rail Tourist Pass', 'Uttara', 'Motijheel', 'Train', 220, 80, 3, ['Fast boarding'], 5, true],
    ['Coastal Air Express', 'Chattogram', 'Coxs Bazar', 'Plane', 3600, 14, 16, ['Cabin bag', 'Lounge'], 2, false],
    ['Royal Launch Premium Deck', 'Dhaka', 'Bhola', 'Launch', 1350, 40, 19, ['Upper deck', 'Breakfast'], 3, false],
    ['SilkCity Train Chair', 'Rajshahi', 'Dhaka', 'Train', 780, 50, 21, ['Tea', 'Window seat'], 1, false],
    ['Express AC Coach', 'Sylhet', 'Dhaka', 'Bus', 1150, 27, 23, ['AC', 'USB charging'], 0, false],
  ];
  const tickets = await Ticket.insertMany(source.map((item, index) => ({
    title: item[0],
    from: item[1],
    to: item[2],
    type: item[3],
    price: item[4],
    quantity: item[5],
    departure: days(item[6]),
    perks: item[7],
    image: photos[item[8]],
    advertised: item[9],
    status: index === 9 ? 'pending' : 'approved',
    vendor: vendor._id,
    vendorName: vendor.name,
    vendorEmail: vendor.email,
  })));

  await Booking.create({
    user: user._id,
    userName: user.name,
    userEmail: user.email,
    ticket: tickets[0]._id,
    vendor: vendor._id,
    quantity: 2,
    totalPrice: tickets[0].price * 2,
    status: 'accepted',
  });
  await Booking.create({
    user: user._id,
    userName: user.name,
    userEmail: user.email,
    ticket: tickets[1]._id,
    vendor: vendor._id,
    quantity: 1,
    totalPrice: tickets[1].price,
    status: 'pending',
  });

  console.log('Seed complete');
  console.log('Admin: admin@ticketbari.com / Admin@123');
  console.log('Vendor: vendor@ticketbari.com / Vendor@123');
  console.log('User: user@ticketbari.com / User@123');
  await mongoose.disconnect();
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
