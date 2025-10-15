import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../layouts/Layout';
import './ListingsPage.css';

const ListingsPage = ({ user, onLogout }) => {
  const [listings, setListings] = useState([]);
  const [notFoundMsg, setNotFoundMsg] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchListings = async () => {
      const query = new URLSearchParams(location.search).get('location');
      const response = await fetch(`/listings${query ? `?location=${query}` : ''}`);
      const data = await response.json();
      if (response.ok) {
        setListings(data.allListings);
        if (data.allListings.length === 0 && query) {
          setNotFoundMsg(`No stays found for "${query}".`);
        } else {
          setNotFoundMsg(null);
        }
      } else {
        setNotFoundMsg(data.message);
        setListings([]);
      }
    };
    fetchListings();
  }, [location.search]);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container listings-page py-4 px-3 px-md-5">
        {/* Hero Section */}
        <div className="text-center mb-4">
          <h2 className="display-5 fw-bold text-dark mb-2">Explore All Properties</h2>
          <p className="text-muted mb-0">Find your perfect stay from our curated collection</p>
        </div>
        
        {notFoundMsg && (
          <div className="alert alert-warning text-center" role="alert">
            {notFoundMsg}
          </div>
        )}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {listings.map((listing) => (
            <div className="col" key={listing._id}>
              <Link to={`/listings/${listing._id}`} className="card listing-card h-100">
                <img src={listing.image.url} className="card-img listing-card-img" alt={listing.title} />
                <div className="card-img-overlay">
                  <h5 className="card-title">{listing.title}</h5>
                  <p className="card-text">&#8377; {listing.price.toLocaleString('en-IN')} / night</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ListingsPage;
