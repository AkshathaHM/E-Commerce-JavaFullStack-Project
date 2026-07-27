import React from 'react';
import './Footer.css';

const footerSections = [
  {
    title: 'Shop',
    links: ['Products', 'Deals', 'Categories', 'Gift Cards'],
  },
  {
    title: 'Sell',
    links: ['Sell on SalesSavvy', 'Seller Center', 'Advertise', 'Pricing'],
  },
  {
    title: 'Customer Service',
    links: ['Help Center', 'Track Order', 'Returns', 'Payment Options'],
  },
  {
    title: 'About',
    links: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'],
  },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-panel">
          <div className="footer-brand-logo">S</div>
          <div>
            <p className="footer-brand-title">SalesSavvy</p>
            <p className="footer-brand-subtitle">
              Premium shopping for today’s modern buyer.
            </p>
          </div>
        </div>

        <p className="footer-intro">
          Shop smarter with curated collections, personalized offers, and secure checkout.
          Discover a premium experience designed for speed, confidence, and delight.
        </p>

        <div className="newsletter-block">
          <label htmlFor="footer-newsletter" className="newsletter-label">
            Get insider updates and exclusive offers
          </label>
          <div className="newsletter-form">
            <input
              id="footer-newsletter"
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address"
            />
            <button type="button" className="newsletter-button">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="footer-grid">
        {footerSections.map((section) => (
          <div key={section.title} className="footer-section">
            <h3>{section.title}</h3>
            <ul>
              {section.links.map((link) => (
                <li key={link}>
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer-section footer-connect">
          <h3>Stay Connected</h3>
          <p>
            Follow SalesSavvy for launch alerts, shopping inspiration, and member-only perks.
          </p>
          <div className="social-links">
            <button type="button">Instagram</button>
            <button type="button">Twitter</button>
            <button type="button">Facebook</button>
            <button type="button">LinkedIn</button>
          </div>
          <button type="button" className="back-to-top" onClick={scrollToTop}>
            Back to top
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© 2026 SalesSavvy</p>
        <div className="footer-center-brand">
          <div className="footer-brand-logo-text" role="img" aria-label="SalesSavvy brand">
            <span className="footer-brand-word footer-brand-word--sales" aria-hidden="true">
              <span>S</span><span>a</span><span>l</span><span>e</span><span>s</span>
            </span>
            <span className="footer-brand-word footer-brand-word--savvy" aria-hidden="true">
              <span>S</span><span>a</span><span>v</span><span>v</span><span>y</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
