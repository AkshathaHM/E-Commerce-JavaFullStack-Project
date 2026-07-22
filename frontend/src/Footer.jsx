import React from 'react';
import './Footer.css';

export function Footer() {
  const links = ["About Us", "Contact", "Services", "Privacy Policy", "Terms"];

  return (
    <footer className="footer">
      <div className="footer-links">
        {links.map((text, i) => (
          <a key={i} href="#" className="footer-link">
            {text.split('').map((char, j) => (
              <span key={j}>{char}</span>
            ))}
          </a>
        ))}
      </div>
      <p>© 2026 SalesSavvy. All rights reserved.</p>
    </footer>
  );
}