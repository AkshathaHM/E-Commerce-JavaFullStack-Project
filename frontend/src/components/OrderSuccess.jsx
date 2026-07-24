import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderActionButtons from './OrderActionButtons';
import StatusBadge from './StatusBadge';
import { getAuthHeaders } from '../auth';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const order = location.state?.order || JSON.parse(localStorage.getItem('lastOrder') || '{}');

  const summary = useMemo(() => ({
    orderId: order.orderId || order.order_id || 'N/A',
    paymentStatus: order.paymentStatus || 'Paid',
    amount: order.amount || order.totalAmount || order.total_price || 0,
    orderDate: order.orderDate || new Date().toLocaleString('en-IN'),
    estimatedDelivery: order.estimatedDelivery || '4 business days',
    trackingCode: order.trackingCode || 'SS-TRACK',
  }), [order]);

  const handleTrack = async () => {
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
    } catch (error) {
      console.error('Unable to load tracking state', error);
    } finally {
      setLoading(false);
      navigate('/orders', { state: { order }, replace: true });
    }
  };

  return (
    <div className="order-success-shell">
      <div className="order-success-card">
        <div className="order-success-icon">✓</div>
        <h1>Order placed successfully</h1>
        <p className="order-success-copy">Your order has been placed successfully and is being prepared for shipment.</p>

        <div className="order-success-grid">
          <div><span>Order ID</span><strong>{summary.orderId}</strong></div>
          <div><span>Payment Status</span><strong>{summary.paymentStatus}</strong></div>
          <div><span>Order Date & Time</span><strong>{summary.orderDate}</strong></div>
          <div><span>Estimated Delivery</span><strong>{summary.estimatedDelivery}</strong></div>
          <div><span>Total Amount</span><strong>₹{Number(summary.amount).toFixed(2)}</strong></div>
          <div><span>Tracking Code</span><strong>{summary.trackingCode}</strong></div>
        </div>

        <div className="order-success-badge-row">
          <StatusBadge status="Order Placed" />
          <div className="order-success-loading">{loading ? 'Preparing tracking preview...' : 'All set'}</div>
        </div>

        <OrderActionButtons
          onTrack={() => navigate('/order-tracking', { state: { order }, replace: true })}
          onViewDetails={() => navigate('/orders', { state: { order, modal: true }, replace: true })}
          onContinueShopping={() => navigate('/customerhome')}
        />
      </div>
    </div>
  );
}
