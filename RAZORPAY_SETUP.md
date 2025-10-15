# Razorpay Payment Integration

This project uses Razorpay for processing booking payments. Follow the steps below to set up Razorpay integration.

## Setup Instructions

### 1. Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Sign up for a free account
3. Verify your email and complete KYC (for production)

### 2. Get API Keys

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys**
3. Generate API keys:
   - **Test Mode Keys**: Use these for development (start with `rzp_test_`)
   - **Live Mode Keys**: Use these for production after KYC approval (start with `rzp_live_`)

### 3. Configure Environment Variables

Add the following to your `server/.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Important Notes:**
- Never commit your actual keys to version control
- Use test mode keys during development
- Keep your secret key secure and never expose it in client-side code
- Only the `RAZORPAY_KEY_ID` is exposed to the frontend

### 4. Test Payment Flow

#### Test Mode Credentials

In test mode, use these card details for testing:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Cardholder Name: Any name

**Failed Payment:**
- Card Number: `4111 1111 1111 1112`
- CVV: Any 3 digits
- Expiry: Any future date

**For more test cards**, see [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

### 5. Webhooks (Optional - Production)

Webhooks allow Razorpay to notify your server about payment events.

1. Go to **Settings** → **Webhooks** in Razorpay Dashboard
2. Add a new webhook URL: `https://yourdomain.com/payments/webhook`
3. Select events to listen to:
   - `payment.captured`
   - `payment.failed`
4. Copy the webhook secret and add it to `.env` as `RAZORPAY_WEBHOOK_SECRET`

**Note**: For local development, you can use [ngrok](https://ngrok.com/) to create a public URL for testing webhooks.

## Payment Flow

1. **Customer creates booking** → Booking status: `pending`, Payment status: `not_paid`
2. **Customer clicks "Pay Now"** → Creates Razorpay order
3. **Razorpay checkout opens** → Customer enters payment details
4. **Payment successful** → 
   - Booking status: `paid`
   - Payment status: `paid`
   - Confirmation emails sent to customer and owner
5. **Payment failed** → Payment status: `failed`, booking remains `pending`

## Email Notifications

After successful payment:
- **Customer** receives a confirmation email with booking details and payment ID
- **Owner** receives a notification about the new paid booking

Make sure your SMTP settings are configured in `.env` for emails to work.

## Security Features

- Payment signature verification using SHA256 HMAC
- JWT authentication for all payment endpoints
- Role-based access (only customers can make payments)
- Booking ownership validation
- Webhook signature verification (production)

## Troubleshooting

### "Failed to load Razorpay SDK"
- Check your internet connection
- Ensure the Razorpay script URL is not blocked by firewall/ad-blocker

### "Payment verification failed"
- Check that `RAZORPAY_KEY_SECRET` is correct in `.env`
- Ensure you're not mixing test and live mode keys

### Emails not sending
- Verify SMTP configuration in `.env`
- Check spam folder
- In development, emails are also logged to console

### Payment successful but booking not updated
- Check server logs for errors
- Verify webhook configuration (if using webhooks)
- Ensure MongoDB connection is stable

## Production Checklist

Before going live:

- [ ] Complete Razorpay KYC verification
- [ ] Switch from test mode to live mode keys
- [ ] Configure webhook URL with production domain
- [ ] Enable HTTPS on your server
- [ ] Set up proper error logging and monitoring
- [ ] Test payment flow thoroughly with real test payments
- [ ] Verify email notifications are working
- [ ] Add payment refund handling (if needed)
- [ ] Configure proper CORS settings in production

## API Endpoints

### GET `/payments/key`
Returns the Razorpay key ID for frontend integration.

**Auth**: Required (Customer)

**Response**:
```json
{
  "key": "rzp_test_xxxxxx"
}
```

### POST `/payments/create-order`
Creates a Razorpay order for a booking.

**Auth**: Required (Customer)

**Body**:
```json
{
  "bookingId": "booking_id_here"
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "order_xxxxx",
    "amount": 100000,
    "currency": "INR"
  },
  "bookingId": "booking_id_here"
}
```

### POST `/payments/verify`
Verifies payment signature and updates booking.

**Auth**: Required (Customer)

**Body**:
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_here",
  "bookingId": "booking_id_here"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "booking": {
    "id": "booking_id",
    "status": "paid",
    "paymentStatus": "paid"
  }
}
```

### POST `/payments/webhook` (Optional)
Handles Razorpay webhook events.

**Auth**: Webhook signature verification

**Note**: Configure this in production for automatic payment status updates.

## Support

For Razorpay-specific issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For integration issues, check server logs and ensure all environment variables are correctly configured.
