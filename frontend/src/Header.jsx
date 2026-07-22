import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from './logo.png'; // Make sure logo.png is in src folder

export function Header({ cartCount, username }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container" onClick={() => navigate('/customerhome')}>
          <img src={LogoImage} alt="SalesSavvy" className="logo-image" />
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