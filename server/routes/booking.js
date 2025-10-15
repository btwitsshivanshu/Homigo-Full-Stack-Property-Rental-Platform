const express = require('express');
const router = express.Router();
const { verifyJWT, requireRole } = require('../middleware/auth');
const wrapAsync = require('../utils/wrapAsync');
const Booking = require('../models/booking');
const Listing = require('../models/listing');

function nightsBetween(a, b) {
  const ms = Math.max(0, new Date(b).setHours(0,0,0,0) - new Date(a).setHours(0,0,0,0));
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// Create booking (customer)
router.post('/', verifyJWT, requireRole('customer'), wrapAsync(async (req, res) => {
  const { listingId, checkIn, checkOut, guests = 1 } = req.body;
  if (!listingId || !checkIn || !checkOut) return res.status(400).json({ message: 'listingId, checkIn, checkOut required' });
  const listing = await Listing.findById(listingId).populate('owner');
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  const ci = new Date(checkIn), co = new Date(checkOut);
  if (!(ci < co)) return res.status(400).json({ message: 'checkIn must be before checkOut' });
  // Overlap check: any booking for this listing that overlaps and not canceled/expired
  const overlap = await Booking.findOne({
    listing: listing._id,
    status: { $in: ['pending','paid','confirmed'] },
    $or: [
      { checkIn: { $lt: co }, checkOut: { $gt: ci } }
    ]
  });
  if (overlap) return res.status(409).json({ message: 'Dates not available' });

  const nights = nightsBetween(ci, co);
  const nightly = listing.price || 0;
  const price = nightly * nights;
  const booking = await Booking.create({
    listing: listing._id,
    owner: listing.owner._id || listing.owner,
    customer: req.user.id,
    checkIn: ci,
    checkOut: co,
    guests,
    price,
    status: 'pending'
  });
  res.status(201).json({ booking });
}));

// Get my bookings (customer)
router.get('/', verifyJWT, requireRole('customer'), wrapAsync(async (req, res) => {
  const bookings = await Booking.find({ customer: req.user.id }).populate('listing');
  res.json({ bookings });
}));

// Cancel my booking if pending (not paid)
router.delete('/:id', verifyJWT, requireRole('customer'), wrapAsync(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findOne({ _id: id, customer: req.user.id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(400).json({ message: 'Only pending (unpaid) bookings can be canceled' });
  if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'processing') {
    return res.status(400).json({ message: 'Cannot cancel paid or processing bookings' });
  }
  booking.status = 'canceled';
  await booking.save();
  res.json({ message: 'Booking canceled', booking });
}));

module.exports = router;
