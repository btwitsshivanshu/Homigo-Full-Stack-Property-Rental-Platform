import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  useEffect(() => {
    document.getElementById('year').innerText = new Date().getFullYear();
  }, []);

  return (
    <footer className="bg-light border-top mt-4 py-3">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 text-center text-md-start mb-2 mb-md-0">
            <span className="fw-bold text-dark">Homigo Private Limited</span>
          </div>
          <div className="col-md-4 text-center mb-2 mb-md-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="mx-2 text-secondary"><i className="fa-brands fa-facebook"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="mx-2 text-secondary"><i className="fa-brands fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="mx-2 text-secondary"><i className="fa-brands fa-linkedin"></i></a>
          </div>
          <div className="col-md-4 text-center text-md-end">
            <Link to="/privacy" className="text-decoration-none text-secondary mx-2 small">Privacy</Link>
            <Link to="/terms" className="text-decoration-none text-secondary mx-2 small">Terms</Link>
            <span className="text-muted small ms-2">&copy; <span id="year"></span> Homigo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
