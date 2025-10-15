import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Flash from '../components/Flash';
import './Layout.css';

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="layout-container">
      <Navbar user={user} onLogout={onLogout} />
      <Flash />
      <main className="content-wrap">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
