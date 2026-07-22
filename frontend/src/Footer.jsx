import React from 'react';
import './Footer.css';

export function Footer() {
  const links = ["About Us", "Contact", "Services", "Privacy Policy", "Terms"];

  return (
    <footer className="footer">
      <div className="footer-links">
        {links.map((text, i) => (
          <button
            key={i}
            type="button"
            className="footer-link"
            onClick={(event) => event.preventDefault()}
          >
            {text}
          </button>
        ))}
      </div>
      <p>© 2026 SalesSavvy. All rights reserved.</p>
    </footer>
  );
}