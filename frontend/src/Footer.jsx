// Footer.jsx
import React from 'react';
import './assets/styles.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3 className="footer-title">SalesSavvy</h3>
          <p className="footer-tagline">Your one-stop shop for all your needs</p>
        </div>
        <div className="footer-links">
          <button type="button" className="footer-link" onClick={(e) => e.preventDefault()}>About Us</button>
          <button type="button" className="footer-link" onClick={(e) => e.preventDefault()}>Contact</button>
          <button type="button" className="footer-link" onClick={(e) => e.preventDefault()}>Terms of Service</button>
          <button type="button" className="footer-link" onClick={(e) => e.preventDefault()}>Privacy Policy</button>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 SalesSavvy. All rights reserved.</p>
      </div>
    </footer>
  );
}
