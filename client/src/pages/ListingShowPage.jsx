import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Fix for Leaflet marker icon issue with webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './ListingShowPage.css';
import Loader from '../components/Loader';
import { apiFetch } from '../utils/api';

const Toast = ({ type = 'success', message, onClose }) => (
  <div className={`toast-container position-fixed top-0 start-50 translate-middle-x p-3`} style={{ zIndex: 1080 }}>
    <div className={`toast show align-items-center text-white ${type === 'success' ? 'bg-success' : 'bg-danger'} border-0`} role="alert">
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={onClose}></button>
      </div>
    </div>
  </div>
);

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ListingShowPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [coords, setCoords] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: '', comment: '' });
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [bookingData, setBookingData] = useState({ checkIn: '', checkOut: '', guests: 1 });
  const [toast, setToast] = useState(null); // {type, message}
  const [isBooking, setIsBooking] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDeletingListing, setIsDeletingListing] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextDay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchListing = async () => {
      const response = await fetch(`/listings/${id}`);
      const data = await response.json();
      if (response.ok) {
        setListing(data.listing);
        setCoords(data.coords);
      }
    };
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (coords && listing && mapContainerRef.current) {
      // If map doesn't exist, create it
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([coords.lat, coords.lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current);
      }
      
      // Update map view and clear existing markers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });
      
      // Set new view and add new marker
      mapRef.current.setView([coords.lat, coords.lon], 13);
      const marker = L.marker([coords.lat, coords.lon]).addTo(mapRef.current);
      marker.bindPopup(`<b>${listing.location}</b><br>${listing.country}`).openPopup();

      // Invalidate map size after a short delay to ensure container is sized correctly
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coords, listing]);

  const handleReviewChange = (e) => {
    setReviewData({ ...reviewData, [e.target.name]: e.target.value });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    
    try {
      const response = await apiFetch(`/listings/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: reviewData }),
      });
      if (response.ok) {
        const newReview = await response.json();
        setListing(prev => ({ ...prev, reviews: [...prev.reviews, newReview] }));
        setReviewData({ rating: '', comment: '' });
        setToast({ type: 'success', message: 'Review submitted successfully!' });
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.message || 'Failed to submit review' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteListing = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      setIsDeletingListing(true);
      try {
        const response = await apiFetch(`/listings/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setToast({ type: 'success', message: 'Listing deleted successfully!' });
          setTimeout(() => navigate('/listings'), 1000);
        } else {
          const error = await response.json();
          setToast({ type: 'error', message: error.message || 'Failed to delete listing' });
        }
      } catch (error) {
        setToast({ type: 'error', message: 'Failed to delete listing. Please try again.' });
      } finally {
        setIsDeletingListing(false);
      }
    }
  };

  const bookNow = async (e) => {
    e.preventDefault();
    if (!user) { return navigate('/user/login'); }
    // Simple client-side guard for dates
    if (!bookingData.checkIn || !bookingData.checkOut || bookingData.checkOut <= bookingData.checkIn) {
      setToast({ type: 'error', message: 'Please select valid dates. Checkout must be after check-in.' });
      return;
    }
    
    setIsBooking(true);
    try {
      const res = await apiFetch('/customer/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id, ...bookingData })
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ type: 'success', message: 'Booking created! Redirecting to My Bookings...' });
        setTimeout(() => navigate('/bookings'), 1000);
      } else {
        setToast({ type: 'error', message: data.message || 'Booking failed' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Booking failed. Please try again.' });
    } finally {
      setIsBooking(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
  const response = await apiFetch(`/listings/${id}/reviews/${reviewId}`, { method: 'DELETE' });
      if (response.ok) {
        setListing(prev => ({ ...prev, reviews: prev.reviews.filter(r => r._id !== reviewId) }));
      }
    }
  };

  if (!listing) return <Layout user={user} onLogout={onLogout}><Loader message="Fetching listing..." /></Layout>;

  return (
  <Layout user={user} onLogout={onLogout}>
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
      <div className="listing-show-container">
        <div className="listing-main-content">
          <div className="listing-header">
            <h1>{listing.title}</h1>
            <div className="listing-meta">
              <span><i className="fa-solid fa-location-dot"></i> {listing.location}, {listing.country}</span>
            </div>
            {user && user._id === listing.owner._id && (
              <div className="listing-actions">
                <Link to={`/listings/${listing._id}/edit`} className="btn btn-light">
                  <i className="fa-solid fa-pen-to-square"></i> Edit
                </Link>
                <button onClick={handleDeleteListing} className="btn btn-dark" disabled={isDeletingListing}>
                  {isDeletingListing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash"></i> Delete
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="listing-gallery">
            <img src={listing.image.url} alt={listing.title} />
          </div>

          <div className="listing-info">
            <h2>Hosted by {listing.owner.username}</h2>
            <p>{listing.description}</p>
          </div>

          <hr />

          <div className="listing-reviews-section">
            <h2><i className="fa-solid fa-star"></i> {listing.reviews.length} Reviews</h2>
            <div className="reviews-list">
              {listing.reviews.length > 0 ? (
                listing.reviews.map(review => (
                  <div className="review-card" key={review._id}>
                    <div className="review-author">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${review.author.username.charAt(0)}&background=random`} 
                        alt={review.author.username} 
                        className="avatar"
                      />
                      <div>
                        <strong>{review.author.username}</strong>
                        <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                    <div className="review-rating">
                      {[...Array(review.rating)].map((_, i) => <i key={i} className="fa-solid fa-star filled"></i>)}
                      {[...Array(5 - review.rating)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    {user && review.author && user._id === review.author._id && (
                      <button onClick={() => handleDeleteReview(review._id)} className="btn btn-sm btn-outline-danger delete-review-btn">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="listing-sidebar">
          <div className="sidebar-card">
            <div className="price">
              &#8377; {listing.price.toLocaleString("en-IN")}
              <span> / night</span>
            </div>
            <hr/>
            {user && user.role === 'customer' && (
              <form onSubmit={bookNow} className="mb-3">
                <div className="mb-2">
                  <label className="form-label">Check-in</label>
                  <input type="date" className="form-control" min={todayStr} value={bookingData.checkIn} onChange={(e)=>{
                    const checkIn = e.target.value;
                    let checkOut = bookingData.checkOut;
                    if (!checkOut || checkOut <= checkIn) {
                      checkOut = nextDay(checkIn);
                    }
                    setBookingData({ ...bookingData, checkIn, checkOut });
                  }} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Check-out</label>
                  <input type="date" className="form-control" min={nextDay(bookingData.checkIn) || nextDay(todayStr)} value={bookingData.checkOut} onChange={(e)=>setBookingData({...bookingData, checkOut: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Guests</label>
                  <input type="number" min={1} className="form-control" value={bookingData.guests} onChange={(e)=>setBookingData({...bookingData, guests: Number(e.target.value)})} />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={isBooking}>
                  {isBooking ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    'Book now'
                  )}
                </button>
              </form>
            )}
            {user && user._id !== listing.owner._id && (
              <div className="review-form-container">
                <h4>Leave a Review</h4>
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <div className="form-group rating-group">
                    <label>Your Rating</label>
                    <div className="star-rating">
                      {[5, 4, 3, 2, 1].map(star => (
                        <React.Fragment key={star}>
                          <input 
                            type="radio" 
                            id={`${star}-stars`} 
                            name="rating" 
                            value={star} 
                            checked={reviewData.rating === star.toString()}
                            onChange={handleReviewChange}
                          />
                          <label htmlFor={`${star}-stars`}><i className="fa-solid fa-star"></i></label>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="comment">Your Comment</label>
                    <textarea
                      id="comment"
                      name="comment"
                      rows="4"
                      className="form-control"
                      value={reviewData.comment}
                      onChange={handleReviewChange}
                      placeholder="Share your experience..."
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={isSubmittingReview}>
                    {isSubmittingReview ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </form>
              </div>
            )}
            {!user && (
                <div className="login-prompt">
                    <h4>Log in to leave a review</h4>
                    <Link to="/user/login" className="btn btn-primary w-100">Login</Link>
                </div>
            )}
             <div className="listing-map-container">
               <h3>Where you'll be</h3>
               <div ref={mapContainerRef} className="listing-map"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingShowPage;
