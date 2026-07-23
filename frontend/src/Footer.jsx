import React from 'react';
import './Footer.css';

export function Footer({ fixed = false }) {
  const links = ["About Us", "Contact", "Services", "Privacy Policy", "Terms"];

  return (
    <footer className={`footer${fixed ? ' fixed' : ''}`}>
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