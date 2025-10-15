import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import { apiFetch } from '../utils/api';

const MyBookingsPage = ({ user, onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [paying, setPaying] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/customer/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    };
    load();
  }, []);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (booking) => {
    setPaying(booking._id);
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setPaying(null);
        return;
      }

      // Get Razorpay key
      const keyRes = await apiFetch('/payments/key');
      if (!keyRes.ok) {
        alert('Failed to initialize payment');
        setPaying(null);
        return;
      }
      const { key } = await keyRes.json();

      // Create order
      const orderRes = await apiFetch('/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking._id }),
      });

      if (!orderRes.ok) {
        const error = await orderRes.json();
        alert(error.message || 'Failed to create order');
        setPaying(null);
        return;
      }

      const orderData = await orderRes.json();

      // Configure Razorpay checkout
      const options = {
        key: key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Homigo',
        description: `Booking for ${booking.listing?.title || 'Property'}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          // Verify payment
          const verifyRes = await apiFetch('/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            }),
          });

          if (verifyRes.ok) {
            alert('Payment successful! Your booking is confirmed.');
            
            // Update booking in state
            setBookings((prev) =>
              prev.map((b) =>
                b._id === booking._id
                  ? { ...b, status: 'paid', paymentStatus: 'paid' }
                  : b
              )
            );
          } else {
            const error = await verifyRes.json();
            alert(error.message || 'Payment verification failed');
          }
          setPaying(null);
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
        },
        theme: {
          color: '#fe424d',
        },
        modal: {
          ondismiss: function () {
            setPaying(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred during payment. Please try again.');
      setPaying(null);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    
    try {
      const res = await apiFetch(`/customer/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) => prev.map(b => b._id === id ? data.booking : b));
      } else {
        alert(data.message || 'Failed to cancel');
      }
    } catch (error) {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container py-4">
        <h1>My Bookings</h1>
        {bookings.length === 0 && <p>No bookings yet.</p>}
        <div className="list-group">
          {bookings.map((b) => (
            <div key={b._id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div><strong>{b.listing?.title || 'Listing'}</strong></div>
                  <div className="text-muted small">{b.listing?.location || ''}</div>
                  <div className="mt-2">
                    <span className="me-3">
                      <i className="bi bi-calendar-event"></i> {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                    </span>
                    <span className="me-3">
                      <i className="bi bi-people"></i> {b.guests} {b.guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`badge ${
                      b.status === 'paid' ? 'bg-success' :
                      b.status === 'pending' ? 'bg-warning text-dark' :
                      b.status === 'canceled' ? 'bg-secondary' :
                      'bg-info'
                    } me-2`}>
                      {b.status.toUpperCase()}
                    </span>
                    <strong>₹{b.price?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
                <div className="d-flex flex-column gap-2">
                  {b.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => handlePayment(b)}
                        disabled={paying === b._id}
                      >
                        {paying === b._id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-credit-card me-2"></i>
                            Pay Now
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => cancelBooking(b._id)}
                        disabled={paying === b._id || cancelling === b._id}
                      >
                        {cancelling === b._id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            Cancelling...
                          </>
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    </>
                  )}
                  {b.status === 'paid' && (
                    <span className="text-success">
                      <i className="bi bi-check-circle-fill"></i> Payment Confirmed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default MyBookingsPage;
