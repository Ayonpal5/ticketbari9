import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  from: { type: String, required: true, trim: true },
  to: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Bus', 'Train', 'Launch', 'Plane'], required: true },
  price: { type: Number, required: true, min: 1 },
  quantity: { type: Number, required: true, min: 0 },
  departure: { type: Date, required: true },
  perks: [{ type: String }],
  image: { type: String, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorName: { type: String, required: true },
  vendorEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  advertised: { type: Boolean, default: false },
}, { timestamps: true });

ticketSchema.index({ from: 'text', to: 'text', title: 'text' });

export default mongoose.model('Ticket', ticketSchema);
