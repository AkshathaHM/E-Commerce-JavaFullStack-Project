import React, { useEffect, useRef, useState } from 'react';
import { FaInstagram, FaTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import './Footer.css';

const shopLinks = ['Products', 'Deals', 'Categories', 'Gift Cards', 'Sell on SalesSavvy'];
const serviceLinks = ['Help Center', 'Track Order', 'Returns', 'Payment Options', 'Shipping Info'];
const aboutLinks = ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'];

const socialLinks = [
  { label: 'Instagram', icon: FaInstagram, href: '#' },
  { label: 'Twitter', icon: FaTwitter, href: '#' },
  { label: 'Facebook', icon: FaFacebookF, href: '#' },
  { label: 'LinkedIn', icon: FaLinkedinIn, href: '#' },
];

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`footer${isVisible ? ' footer--visible' : ''}`} ref={footerRef}>
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-column footer-brand-col">
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

            <div className="social-block">
              <p className="footer-section-title">Connect with us</p>
              <div className="social-links">
                {socialLinks.map(({ label, icon: Icon, href }) => (
                  <a key={label} href={href} className="social-button" aria-label={label}>
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-section-title">Shop</h3>
            <ul className="footer-list">
              {shopLinks.map((link) => (
                <li key={link}>
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-section-title">Customer Service</h3>
            <ul className="footer-list">
              {serviceLinks.map((link) => (
                <li key={link}>
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column footer-about-col">
            <h3 className="footer-section-title">About</h3>
            <ul className="footer-list">
              {aboutLinks.map((link) => (
                <li key={link}>
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>

            <div className="newsletter-block">
              <p className="footer-section-title">Newsletter</p>
              <p className="footer-intro footer-newsletter-copy">
                Receive exclusive offers, early access, and curated updates every week.
              </p>
              <div className="newsletter-row">
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
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 SalesSavvy. All rights reserved.</p>
        </div>
      </div>

      <button type="button" className="back-to-top" onClick={scrollToTop}>
        Back to top
      </button>
    </footer>
  );
}
