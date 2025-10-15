import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, locationQuery: initialLocationQuery, onLogout }) => {
  const [locationQuery, setLocationQuery] = useState(initialLocationQuery || '');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/listings?location=${locationQuery}`);
  };

  const handleLogout = onLogout;

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-light border-bottom sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/listings">
          <i className="fa-solid fa-house-chimney"></i> <span>Homigo</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <NavLink className="nav-link" to="/listings">Explore</NavLink>
          </div>

          <div className="search-bar mx-auto">
            <form className="d-flex" role="search" onSubmit={handleSearch}>
              <input 
                className="form-control me-2" 
                type="search" 
                placeholder="Search destinations" 
                aria-label="Search"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
              <button className="btn btn-outline-danger" type="submit"><i className="fa-solid fa-search"></i></button>
            </form>
          </div>

          <div className="navbar-nav ms-auto">
            {user?.role === 'owner' && (
              user?.kycStatus === 'verified' ? (
                <NavLink className="nav-link" to="/listings/new">Add New Listing</NavLink>
              ) : (
                <NavLink className="nav-link text-warning" to="/owner/verify">
                  <i className="fa-solid fa-id-card-clip me-1"></i> Complete Owner Verification
                </NavLink>
              )
            )}
            {user ? (
              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#account" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="fas fa-user-circle me-1"></i>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><span className="dropdown-item-text">Hi, {user.username}</span></li>
                  {user?.role === 'owner' && (
                    <>
                      <li><NavLink className="dropdown-item" to="/owner/listings">My Listings</NavLink></li>
                      <li><NavLink className="dropdown-item" to="/owner/verify">Owner Verification</NavLink></li>
                    </>
                  )}
                  {user?.role === 'customer' && (
                    <li><NavLink className="dropdown-item" to="/bookings">My Bookings</NavLink></li>
                  )}
                  {user?.role === 'admin' && (
                    <li><NavLink className="dropdown-item" to="/admin/kyc">Admin: KYC Reviews</NavLink></li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button onClick={handleLogout} className="dropdown-item">Logout</button></li>
                </ul>
              </div>
            ) : (
              <>
                <NavLink className="nav-link" to="/user/signup"><b>Sign up</b></NavLink>
                <NavLink className="nav-link" to="/user/login"><b>Login</b></NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
