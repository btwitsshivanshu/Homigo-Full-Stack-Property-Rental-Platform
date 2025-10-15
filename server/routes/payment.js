const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/booking');
const { verifyJWT, requireRole } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

// Validate Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in .env file!');
  console.error('Please add your Razorpay keys to server/.env');
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID?.trim(),
  key_secret: process.env.RAZORPAY_KEY_SECRET?.trim(),
});

console.log('✅ Razorpay initialized with key:', process.env.RAZORPAY_KEY_ID?.substring(0, 15) + '...');

// GET Razorpay key for client
router.get('/key', verifyJWT, requireRole('customer'), (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({ success: false, message: 'Razorpay not configured' });
  }
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// POST Create Razorpay order
router.post('/create-order', verifyJWT, requireRole('customer'), async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Fetch booking
    const booking = await Booking.findById(bookingId)
      .populate('listing', 'title')
      .populate('customer', 'username email')
      .populate('owner', 'username email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if booking belongs to the customer
    if (booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Check if booking is in pending state
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is not in pending state' });
    }

    // Check if payment already initiated
    if (booking.razorpayOrderId) {
      return res.status(400).json({ success: false, message: 'Payment already initiated for this booking' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(booking.price * 100), // Amount in paise
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        customerId: booking.customer._id.toString(),
        listingTitle: booking.listing.title,
      },
    };

    const order = await razorpay.orders.create(options);

    // Update booking with order ID
    booking.razorpayOrderId = order.id;
    booking.paymentStatus = 'processing';
    await booking.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      bookingId: booking._id,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    // Provide specific error message for authentication failure
    if (error.statusCode === 401) {
      return res.status(500).json({ 
        success: false, 
        message: 'Razorpay authentication failed. Please check your API keys in .env file.',
        hint: 'Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct and from the same mode (test/live)'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order', 
      error: error.message || error.description || 'Unknown error'
    });
  }
});

// POST Verify payment
router.post('/verify', verifyJWT, requireRole('customer'), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Fetch booking
    const booking = await Booking.findById(bookingId)
      .populate('listing', 'title location')
      .populate('customer', 'username email')
      .populate('owner', 'username email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if booking belongs to the customer
    if (booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      booking.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update booking with payment details
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paymentStatus = 'paid';
    booking.status = 'paid';
    await booking.save();

    // Send confirmation emails
    try {
      // Email to customer
      const customerEmailHtml = `
        <h2>Booking Confirmed! 🎉</h2>
        <p>Dear ${booking.customer.username},</p>
        <p>Your payment has been received successfully. Your booking is now confirmed!</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Property:</strong> ${booking.listing.title}</li>
          <li><strong>Location:</strong> ${booking.listing.location}</li>
          <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
          <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
          <li><strong>Guests:</strong> ${booking.guests}</li>
          <li><strong>Total Amount:</strong> ₹${booking.price}</li>
          <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
        </ul>
        <p>Thank you for booking with Homigo!</p>
        <p>If you have any questions, feel free to contact the property owner.</p>
      `;

      await sendMail(
        booking.customer.email,
        'Booking Confirmation - Payment Successful',
        customerEmailHtml
      );

      // Email to owner
      const ownerEmailHtml = `
        <h2>New Booking Received! 💰</h2>
        <p>Dear ${booking.owner.username},</p>
        <p>You have received a new booking for your property. Payment has been confirmed.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Property:</strong> ${booking.listing.title}</li>
          <li><strong>Customer:</strong> ${booking.customer.username} (${booking.customer.email})</li>
          <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
          <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
          <li><strong>Guests:</strong> ${booking.guests}</li>
          <li><strong>Amount Received:</strong> ₹${booking.price}</li>
        </ul>
        <p>Please ensure the property is ready for the guest's arrival.</p>
        <p>Thank you for listing with Homigo!</p>
      `;

      await sendMail(
        booking.owner.email,
        'New Booking - Payment Confirmed',
        ownerEmailHtml
      );
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError);
      // Don't fail the request if email sending fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message });
  }
});

// POST Webhook endpoint (for production - optional)
router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET not configured');
      return res.status(500).json({ success: false, message: 'Webhook not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    console.log('Webhook event received:', event);

    // Handle payment success
    if (event === 'payment.captured') {
      const orderId = payload.order_id;
      const paymentId = payload.id;

      // Find booking by order ID
      const booking = await Booking.findOne({ razorpayOrderId: orderId });
      
      if (booking && booking.paymentStatus !== 'paid') {
        booking.razorpayPaymentId = paymentId;
        booking.paymentStatus = 'paid';
        booking.status = 'paid';
        await booking.save();
        
        console.log(`Booking ${booking._id} marked as paid via webhook`);
      }
    }

    // Handle payment failure
    if (event === 'payment.failed') {
      const orderId = payload.order_id;
      
      const booking = await Booking.findOne({ razorpayOrderId: orderId });
      
      if (booking && booking.paymentStatus === 'processing') {
        booking.paymentStatus = 'failed';
        await booking.save();
        
        console.log(`Booking ${booking._id} marked as failed via webhook`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

module.exports = router;
