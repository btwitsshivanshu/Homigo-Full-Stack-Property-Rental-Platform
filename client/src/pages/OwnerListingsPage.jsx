import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { apiFetch } from '../utils/api';
import './OwnerListingsPage.css';

const OwnerListingsPage = ({ user, onLogout }) => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/listings/owner/listings');
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    };
    load();
  }, []);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container py-4 owner-listings-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-gradient mb-0">My Listings</h2>
          <Link to="/listings/new" className="btn btn-primary">
            <i className="fa-solid fa-plus me-1"></i> New Listing
          </Link>
        </div>
        {listings.length === 0 && (
          <div className="text-center py-5">
            <i className="fa-solid fa-home fa-3x text-muted mb-3"></i>
            <p className="text-muted">You haven't added any listings yet.</p>
            <Link to="/listings/new" className="btn btn-primary">
              <i className="fa-solid fa-plus me-1"></i> Create Your First Listing
            </Link>
          </div>
        )}
        <div className="row g-4">
          {listings.map((l) => (
            <div className="col-12 col-md-6 col-lg-4" key={l._id}>
              <div className="card h-100">
                {l.image?.url && (
                  <img src={l.image.url} className="card-img-top" alt={l.title} />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{l.title}</h5>
                  <p className="card-text">{l.location}, {l.country}</p>
                  <div className="mt-auto d-flex gap-2">
                    <Link to={`/listings/${l._id}`} className="btn btn-outline-secondary btn-sm flex-fill">
                      <i className="fa-solid fa-eye me-1"></i>View
                    </Link>
                    <Link to={`/listings/${l._id}/edit`} className="btn btn-outline-primary btn-sm flex-fill">
                      <i className="fa-solid fa-edit me-1"></i>Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OwnerListingsPage;
