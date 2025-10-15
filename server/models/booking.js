const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending','paid','confirmed','canceled','expired'], default: 'pending', index: true },
  // Payment fields
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  paymentStatus: { type: String, enum: ['not_paid','processing','paid','failed'], default: 'not_paid' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
