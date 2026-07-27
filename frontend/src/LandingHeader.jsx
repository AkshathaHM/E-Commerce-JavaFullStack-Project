import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggleButton from './ThemeToggleButton';

export function LandingHeader() {
  const navigate = useNavigate();

  return (
    <header className="landing-header">
      <div className="landing-header__inner">
        <button type="button" className="brand-shell landing-brand" onClick={() => navigate('/')}
          aria-label="Go to SalesSavvy homepage">
          <img
            src="/logo.png"
            alt="SalesSavvy"
            className="brand-logo"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/images/no-image.png';
            }}
          />
          <span className="brand-name">SalesSavvy</span>
        </button>

        <div className="landing-header__actions">
          <button type="button" className="landing-header__button" onClick={() => navigate('/register')}>
            <span className="landing-header__button-icon">📝</span>
            Sign Up
          </button>
          <button type="button" className="landing-header__button landing-header__button--solid" onClick={() => navigate('/login')}>
            <span className="landing-header__button-icon">🔐</span>
            Sign In
          </button>
          <button type="button" className="landing-header__button" onClick={() => navigate('/admin')}>
            <span className="landing-header__button-icon">👤</span>
            Admin Sign In
          </button>
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
