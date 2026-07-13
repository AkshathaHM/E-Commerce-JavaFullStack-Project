import React from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/styles.css';

export default function Logo() {
  const navigate = useNavigate();

  return (
    <div className="logo-container" onClick={() => navigate('/customerhome')}>
      <img
  src="/logo.png"
  alt="SalesSavvy Logo"
  className="logo-image"
  onError={(e) => {
    e.target.src = 'https://picsum.photos/id/237/60/60'; // Reliable fallback
  }}
/>
      
      <span className="logo-text">SalesSavvy</span>
    </div>
  );
}