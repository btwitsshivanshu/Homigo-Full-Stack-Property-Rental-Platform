import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ListingsPage from './pages/ListingsPage';
import ListingShowPage from './pages/ListingShowPage';
import NewListingPage from './pages/NewListingPage';
import EditListingPage from './pages/EditListingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ErrorPage from './pages/ErrorPage';
import MyBookingsPage from './pages/MyBookingsPage';
import OwnerListingsPage from './pages/OwnerListingsPage';
import OwnerVerifyPage from './pages/OwnerVerifyPage';
import AdminKycReviewPage from './pages/AdminKycReviewPage';
import './App.css';
import { apiFetch } from './utils/api';
import { clearToken } from './utils/auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await apiFetch('/user/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    bootstrap();
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/user/logout', { method: 'POST' });
      if (response.ok) {
        setUser(null);
        clearToken();
        // After state is cleared, navigate to the listings page
        // We use window.location to ensure a full refresh, clearing any residual state.
        window.location.href = '/listings';
      } else {
        console.error("Logout failed on the server.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Routes>
  <Route path="/" element={<ListingsPage user={user} onLogout={handleLogout} />} />
  <Route path="/listings" element={<ListingsPage user={user} onLogout={handleLogout} />} />
  <Route path="/listings/new" element={
    user
      ? (user.role === 'owner'
          ? (user.kycStatus === 'verified' ? <NewListingPage user={user} onLogout={handleLogout} /> : <Navigate to="/owner/verify" />)
          : <Navigate to="/user/login" />)
      : <Navigate to="/user/login" />
  } />
  <Route path="/listings/:id" element={<ListingShowPage user={user} onLogout={handleLogout} />} />
  <Route path="/listings/:id/edit" element={
    user
      ? (user.role === 'owner'
          ? (user.kycStatus === 'verified' ? <EditListingPage user={user} onLogout={handleLogout} /> : <Navigate to="/owner/verify" />)
          : <Navigate to="/user/login" />)
      : <Navigate to="/user/login" />
  } />
  <Route path="/owner/listings" element={user && user.role === 'owner' ? <OwnerListingsPage user={user} onLogout={handleLogout} /> : <Navigate to="/user/login" />} />
  <Route path="/owner/verify" element={user && user.role === 'owner' ? <OwnerVerifyPage user={user} onLogout={handleLogout} /> : <Navigate to="/user/login" />} />
  <Route path="/admin/kyc" element={user && user.role === 'admin' ? <AdminKycReviewPage user={user} onLogout={handleLogout} /> : <Navigate to="/user/login" />} />
  <Route path="/bookings" element={user && user.role === 'customer' ? <MyBookingsPage user={user} onLogout={handleLogout} /> : <Navigate to="/user/login" />} />
      <Route path="/user/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/user/signup" element={<SignupPage onLogin={handleLogin} />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;

