import React from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/styles.css';

export default function Logo() {
  const navigate = useNavigate();

  return (
    <div className="logo-container" onClick={() => navigate('/customerhome')}>
      <img
        src="/logo.png"   // Important: leading slash + public folder
        alt="SalesSavvy Logo"
        className="logo-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/60x60/00ABE4/FFFFFF?text=SS';
        }}
      />
      <span className="logo-text">SalesSavvy</span>
    </div>
  );
}