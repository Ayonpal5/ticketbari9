import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  ticketTitle: { type: String, required: true },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  provider: { type: String, default: 'stripe' },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
