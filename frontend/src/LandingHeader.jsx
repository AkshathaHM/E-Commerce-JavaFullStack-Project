import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaSignInAlt, FaUserShield } from 'react-icons/fa';
import ThemeToggleButton from './ThemeToggleButton';

export function LandingHeader({ onOpenModal }) {
  const navigate = useNavigate();
  const openModal = (type, fallbackPath) => {
    if (typeof onOpenModal === 'function') {
      onOpenModal(type);
      return;
    }

    navigate(fallbackPath);
  };

  return (
    <header className="landing-header">
      <div className="landing-header__inner">
        <button type="button" className="brand-shell landing-brand" onClick={() => navigate('/')} aria-label="Go to SalesSavvy homepage">
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

        <div className="header-actions landing-header__actions">
          <button type="button" className="landing-header__button" onClick={() => openModal('signup', '/register')}>
            <FaUserPlus className="landing-header__button-icon" />
            Sign Up
          </button>
          <button type="button" className="landing-header__button" onClick={() => openModal('signin', '/login')}>
            <FaSignInAlt className="landing-header__button-icon" />
            Sign In
          </button>
          <button type="button" className="landing-header__button" onClick={() => openModal('admin', '/admin')}>
            <FaUserShield className="landing-header__button-icon" />
            Admin Sign In
          </button>
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
