import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Loader from '../components/Loader';
import './Form.css';
import { apiFetch } from '../utils/api';

const EditListingPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [image, setImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const response = await fetch(`/listings/${id}`);
      const data = await response.json();
      if (response.ok) {
        setFormData(data.listing);
      }
    };
    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const postData = new FormData();
      const allowedKeys = ['title', 'description', 'price', 'country', 'location'];
      allowedKeys.forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          postData.append(`listing[${key}]`, formData[key]);
        }
      });
      if (image) {
        postData.append('listing[image]', image);
      }

      const response = await apiFetch(`/listings/${id}`, {
        method: 'PUT',
        body: postData,
      });

      if (!response.ok) {
        console.error('Failed to update listing');
        return;
      }

      let updatedListing = null;
      try {
        updatedListing = await response.json();
      } catch (_) {
        // no JSON body returned; fallback to id from params
      }
      const targetId = updatedListing && updatedListing._id ? updatedListing._id : id;
      navigate(`/listings/${targetId}`);
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) return <Layout user={user} onLogout={onLogout}><Loader message="Preparing editor..." /></Layout>;

  return (
  <Layout user={user} onLogout={onLogout}>
      <div className="form-container">
        <h1>Edit Your Listing</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input type="text" className="form-control" id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea className="form-control" id="description" name="description" value={formData.description} onChange={handleChange} required></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="imageUpload" className="form-label">Upload New Image</label>
            <input name="image" id="imageUpload" type="file" className="form-control" onChange={handleImageChange} />
            <small className="text-muted">Leave blank to keep current image.</small>
          </div>
          <div className="row">
            <div className="mb-3 col-md-4">
              <label htmlFor="price" className="form-label">Price</label>
              <input type="number" className="form-control" id="price" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="mb-3 col-md-8">
              <label htmlFor="country" className="form-label">Country</label>
              <input type="text" className="form-control" id="country" name="country" value={formData.country} onChange={handleChange} required />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <input type="text" className="form-control" id="location" name="location" value={formData.location} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EditListingPage;
