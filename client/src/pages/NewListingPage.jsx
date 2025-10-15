import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import './Form.css';
import { apiFetch } from '../utils/api';

const NewListingPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    country: '',
    location: '',
  });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role === 'owner' && user.kycStatus !== 'verified') {
      // Ensure unverified owners are redirected even if route guard failed
      navigate('/owner/verify');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // prevent double-clicks
    setSubmitting(true);
    const postData = new FormData();
    Object.keys(formData).forEach(key => {
      postData.append(`listing[${key}]`, formData[key]);
    });
    if (image) {
      postData.append('listing[image]', image);
    }

    try {
      const response = await apiFetch('/listings', {
        method: 'POST',
        body: postData,
      });

      if (response.ok) {
        const newListing = await response.json();
        navigate(`/listings/${newListing._id}`);
      } else {
        if (response.status === 403) {
          // Try to parse message and redirect to KYC page
          try {
            const data = await response.json();
            alert(data.message || 'Owner KYC required. Redirecting to verification.');
          } catch { /* ignore */ }
          navigate('/owner/verify');
        } else {
          console.error('Failed to create listing');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="form-container">
        <h1>Create a New Listing</h1>
        {!user && <div className="alert alert-warning">You must be logged in to create listings.</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input type="text" className="form-control" id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea className="form-control" id="description" name="description" value={formData.description} onChange={handleChange} required></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="image" className="form-label">Upload Image</label>
            <input type="file" className="form-control" id="image" name="image" onChange={handleImageChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="price" className="form-label">Price</label>
            <input type="number" className="form-control" id="price" name="price" value={formData.price} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <input type="text" className="form-control" id="location" name="location" value={formData.location} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="country" className="form-label">Country</label>
            <input type="text" className="form-control" id="country" name="country" value={formData.country} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={!user || submitting} aria-busy={submitting}>
            {submitting ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating...</>) : 'Add Listing'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default NewListingPage;
