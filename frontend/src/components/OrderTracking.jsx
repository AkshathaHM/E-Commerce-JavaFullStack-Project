import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../auth';
import OrderDetailsModal from './OrderDetailsModal';
import OrderActionButtons from './OrderActionButtons';
import StatusBadge from './StatusBadge';
import TrackingTimeline from './TrackingTimeline';

const getStatusFromTimestamp = (createdAt) => {
  if (!createdAt) return 'placed';

  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsed = Math.max(0, now - created);
  const minutes = elapsed / (60 * 1000);

  if (minutes >= 60) return 'delivered';
  if (minutes >= 40) return 'transit';
  if (minutes >= 20) return 'shipped';
  return 'placed';
};

export default function OrderTracking({ order }) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [status, setStatus] = useState('placed');
  const [isAdminView, setIsAdminView] = useState(false);

  const createdAt = order?.createdAt || order?.created_at || order?.orderDate || new Date().toISOString();

  useEffect(() => {
    setStatus(getStatusFromTimestamp(createdAt));
  }, [createdAt]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setIsAdminView(role === 'ADMIN');
  }, []);

  useEffect(() => {
    const syncStatus = () => {
      const persistedOrder = JSON.parse(localStorage.getItem('lastOrder') || '{}');
      const nextStatus = persistedOrder?.status || localStorage.getItem('currentOrderStatus') || getStatusFromTimestamp(createdAt);
      setStatus(nextStatus);
    };

    const handleStatusEvent = () => syncStatus();
    window.addEventListener('order-status-updated', handleStatusEvent);
    window.addEventListener('storage', handleStatusEvent);
    syncStatus();

    return () => {
      window.removeEventListener('order-status-updated', handleStatusEvent);
      window.removeEventListener('storage', handleStatusEvent);
    };
  }, [createdAt]);

  const displayOrder = useMemo(() => ({
    orderId: order?.orderId || order?.order_id || 'N/A',
    name: order?.name || order?.productName || 'Product',
    customerName: order?.customerName || localStorage.getItem('username') || 'Customer',
    address: order?.deliveryAddress || order?.address || 'Delivery address on file',
    phone: order?.phone || 'N/A',
    paymentMethod: order?.paymentMethod || 'Razorpay',
    createdAt,
    totalAmount: order?.totalAmount || order?.total_price || order?.amount || 0,
    deliveryCharges: order?.deliveryCharges || 0,
    tax: order?.tax || 0,
    imageUrl: order?.imageUrl || order?.image_url || 'https://via.placeholder.com/120',
    quantity: order?.quantity || 1,
    price: order?.price || order?.price_per_unit || 0,
  }), [createdAt, order]);

  const estimatedDelivery = useMemo(() => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 4);
    return date.toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  }, [createdAt]);

  const updateStatus = async (nextStatus) => {
    if (!isAdminView) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ orderId: displayOrder.orderId, status: nextStatus }),
      });
      localStorage.setItem('currentOrderStatus', nextStatus);
      window.dispatchEvent(new Event('order-status-updated'));
      setStatus(nextStatus);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div className="order-tracking-shell">
      <div className="order-tracking-card">
        <div className="order-tracking-card__top">
          <div>
            <p className="order-tracking-card__eyebrow">Live order tracking</p>
            <h2>Track your delivery</h2>
          </div>
          <StatusBadge status={status === 'delivered' ? 'Delivered' : status === 'transit' ? 'In Transit' : status === 'shipped' ? 'Shipped' : 'Order Placed'} />
        </div>

        <TrackingTimeline currentStatus={status} />

        {isAdminView && (
          <div className="order-tracking-admin-actions">
            <button onClick={() => updateStatus('shipped')}>Mark Shipped</button>
            <button onClick={() => updateStatus('transit')}>Mark In Transit</button>
            <button onClick={() => updateStatus('delivered')}>Mark Delivered</button>
          </div>
        )}

        <div className="order-tracking-details-grid">
          <div><span>Order Number</span><strong>{displayOrder.orderId}</strong></div>
          <div><span>Customer Name</span><strong>{displayOrder.customerName}</strong></div>
          <div><span>Delivery Address</span><strong>{displayOrder.address}</strong></div>
          <div><span>Phone Number</span><strong>{displayOrder.phone}</strong></div>
          <div><span>Payment Method</span><strong>{displayOrder.paymentMethod}</strong></div>
          <div><span>Estimated Delivery</span><strong>{estimatedDelivery}</strong></div>
          <div><span>Current Status</span><strong>{status === 'delivered' ? 'Delivered' : status === 'transit' ? 'In Transit' : status === 'shipped' ? 'Shipped' : 'Order Placed'}</strong></div>
          <div><span>Last Updated</span><strong>{new Date().toLocaleString('en-IN')}</strong></div>
        </div>

        <OrderActionButtons
          onTrack={() => navigate('/order-tracking', { state: { order: displayOrder }, replace: true })}
          onViewDetails={() => setShowDetails(true)}
          onContinueShopping={() => navigate('/customerhome')}
        />
      </div>

      <OrderDetailsModal order={displayOrder} onClose={() => setShowDetails(false)} />
    </div>
  );
}
