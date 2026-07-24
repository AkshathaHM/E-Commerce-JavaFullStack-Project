import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderActionButtons({ onTrack, onViewDetails, onContinueShopping }) {
  const navigate = useNavigate();

  return (
    <div className="order-success-actions">
      <button className="order-success-btn order-success-btn--primary" onClick={onTrack}>
        Track Delivery
      </button>
      <button className="order-success-btn order-success-btn--secondary" onClick={onViewDetails}>
        View Order Details
      </button>
      <button className="order-success-btn order-success-btn--ghost" onClick={onContinueShopping || (() => navigate('/customerhome'))}>
        Continue Shopping
      </button>
    </div>
  );
}
