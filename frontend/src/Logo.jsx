import React from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/styles.css';

export default function Logo({ showBrandText = true }) {
  const navigate = useNavigate();

  const brand = 'SalesSavvy';

  return (
    <div className="logo-container" onClick={() => navigate('/customerhome')} role="button" tabIndex={0} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigate('/customerhome');
      }
    }}>
      <img
        src="/logo.png"
        alt="SalesSavvy Logo"
        className="logo-image"
        onError={(e) => {
          e.target.src = 'https://picsum.photos/id/237/60/60';
        }}
      />
      {showBrandText && (
        <span className="logo-text">
          {brand.split('').map((letter, index) => (
            <span key={index} className="logo-letter" style={{ animationDelay: `${index * 75}ms` }}>
              {letter}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}