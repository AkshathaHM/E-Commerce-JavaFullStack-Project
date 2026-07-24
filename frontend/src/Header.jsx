import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CartIcon } from './CartIcon';
import { ProfileDropdown } from './ProfileDropdown';

export function Header({ cartCount, username }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container" onClick={() => navigate('/customerhome')}>
          <img
            src="/logo.png"
            alt="SalesSavvy"
            className="logo-image"
            onError={(event) => {
              event.target.onerror = null;
              event.target.src = '/images/no-image.png';
            }}
          />
          <span className="logo-text">SalesSavvy</span>
        </div>

        <div className="header-actions">
          <CartIcon count={cartCount} />
          <ProfileDropdown username={username} />
        </div>
      </div>
    </header>
  );
}