import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAuthHeaders } from '../auth';
import OrderDetailsModal from './OrderDetailsModal';
import OrderActionButtons from './OrderActionButtons';
import StatusBadge from './StatusBadge';
import TrackingTimeline from './TrackingTimeline';

const FALLBACK_IMAGE = '/images/no-image.png';
const TRACKING_STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out For Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const normalizeStatus = (status) => {
  const text = typeof status === 'string' ? status.trim().toLowerCase() : 'placed';
  if (text.includes('delivered')) return 'delivered';
  if (text.includes('out for delivery') || text.includes('out_for_delivery') || text.includes('delivery')) return 'out_for_delivery';
  if (text.includes('packed')) return 'packed';
  if (text.includes('confirmed')) return 'confirmed';
  if (text.includes('shipped')) return 'shipped';
  return 'placed';
};

const getStatusLabel = (status) => {
  if (status === 'out_for_delivery') return 'Out For Delivery';
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'packed') return 'Packed';
  if (status === 'shipped') return 'Shipped';
  if (status === 'delivered') return 'Delivered';
  return 'Order Placed';
};

const getEstimatedDelivery = (createdAt) => {
  const date = new Date(createdAt || new Date().toISOString());
  date.setDate(date.getDate() + 4);
  return date.toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
};

const readSafeValue = (value, fallback = 'N/A') => {
  if (value === null || value === undefined || value === '') return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const buildDisplayOrder = (order, fallbackOrderId) => ({
  orderId: readSafeValue(order?.orderId || order?.order_id || order?.id || fallbackOrderId),
  customerName: readSafeValue(order?.customerName || order?.customer_name || order?.name || 'Customer'),
  email: readSafeValue(order?.email || order?.customerEmail),
  phone: readSafeValue(order?.phone || order?.mobile),
  address: readSafeValue(order?.address || order?.deliveryAddress, 'Delivery address on file'),
  paymentMethod: readSafeValue(order?.paymentMethod || order?.payment_method, 'Razorpay'),
  paymentStatus: readSafeValue(order?.paymentStatus || order?.payment_status, 'Paid'),
  status: readSafeValue(order?.status || order?.orderStatus || 'Order Placed'),
  name: readSafeValue(order?.name || order?.productName || 'Product'),
  createdAt: order?.createdAt || order?.created_at || order?.orderDate || new Date().toISOString(),
  totalAmount: Number(order?.totalAmount || order?.total_price || order?.amount || order?.totalPrice || 0),
  deliveryCharges: Number(order?.deliveryCharges || order?.delivery_charge || 0),
  tax: Number(order?.tax || order?.totalTax || 0),
  imageUrl: order?.imageUrl || order?.image_url || order?.image || FALLBACK_IMAGE,
  quantity: Number(order?.quantity ?? order?.qty ?? 1),
  price: Number(order?.price || order?.price_per_unit || 0),
  productId: readSafeValue(order?.productId || order?.product_id),
  category: readSafeValue(order?.category || order?.productCategory),
});

export default function OrderTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayOrder, setDisplayOrder] = useState(buildDisplayOrder(location.state?.order, orderId));
  const [status, setStatus] = useState(normalizeStatus(location.state?.order?.status || location.state?.order?.orderStatus));

  useEffect(() => {
    const initialOrder = location.state?.order;
    if (initialOrder) {
      const nextOrder = buildDisplayOrder(initialOrder, orderId);
      setDisplayOrder(nextOrder);
      setStatus(normalizeStatus(initialOrder.status || initialOrder.orderStatus));
      setLoading(false);
      setError(null);
      return;
    }

    const fetchTrackingDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          credentials: 'include',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load tracking details.');
        }

        const data = await response.json();
        const matchedOrder = Array.isArray(data?.products)
          ? data.products.find((item) => String(item.order_id || item.orderId || item.id) === String(orderId))
          : null;

        if (!matchedOrder) {
          throw new Error('Tracking information is unavailable for this order.');
        }

        const nextOrder = buildDisplayOrder(matchedOrder, orderId);
        setDisplayOrder(nextOrder);
        setStatus(normalizeStatus(matchedOrder.status || matchedOrder.orderStatus));
      } catch (caughtError) {
        setError(caughtError.message || 'Unable to load tracking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingDetails();
  }, [location.state?.order, orderId]);

  const orderHistory = useMemo(() => [
    { label: 'Order Placed', detail: `Order ${displayOrder.orderId} received` },
    { label: 'Confirmed', detail: 'Seller confirmed the order' },
    { label: 'Packed', detail: 'Items packed and ready to ship' },
    { label: 'Shipped', detail: 'Courier has picked up the package' },
    { label: 'Out For Delivery', detail: 'Courier is on the way to you' },
    { label: 'Delivered', detail: 'Package delivered successfully' },
  ], [displayOrder.orderId]);

  const statusIndex = TRACKING_STEPS.findIndex((step) => step.key === status);
  const currentStepLabel = getStatusLabel(status);
  const estimatedDelivery = getEstimatedDelivery(displayOrder.createdAt);

  if (loading) {
    return (
      <div className="order-tracking-shell">
        <div className="order-tracking-card loading-card">
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-shell">
        <div className="order-tracking-card">
          <h2>Unable to load order tracking</h2>
          <p>{error}</p>
          <button className="order-card-action" type="button" onClick={() => navigate('/orders')}>Back to Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-shell">
      <div className="order-tracking-card">
        <div className="order-tracking-card__top">
          <div>
            <p className="order-tracking-card__eyebrow">Order tracking</p>
            <h2>{currentStepLabel}</h2>
          </div>
          <StatusBadge status={currentStepLabel} />
        </div>

        <div className="tracking-status-banner">
          <div>
            <span>Expected Delivery</span>
            <strong>{estimatedDelivery}</strong>
          </div>
          <div>
            <span>Tracking Status</span>
            <strong>{currentStepLabel}</strong>
          </div>
        </div>

        <TrackingTimeline currentStatus={status} steps={TRACKING_STEPS} />

        <div className="order-tracking-details-grid">
          <div><span>Order Number</span><strong>{displayOrder.orderId}</strong></div>
          <div><span>Customer Name</span><strong>{displayOrder.customerName}</strong></div>
          <div><span>Address</span><strong>{displayOrder.address}</strong></div>
          <div><span>Phone</span><strong>{displayOrder.phone}</strong></div>
          <div><span>Payment Method</span><strong>{displayOrder.paymentMethod}</strong></div>
          <div><span>Payment Status</span><strong>{displayOrder.paymentStatus}</strong></div>
          <div><span>Expected Delivery</span><strong>{estimatedDelivery}</strong></div>
          <div><span>Tracking Status</span><strong>{currentStepLabel}</strong></div>
        </div>

        <div className="tracking-history-card">
          <h3>Order History</h3>
          <ul className="tracking-history-list">
            {orderHistory.map((entry) => (
              <li key={entry.label}>
                <span>{entry.label}</span>
                <strong>{entry.detail}</strong>
              </li>
            ))}
          </ul>
        </div>

        <OrderActionButtons
          onTrack={() => navigate(`/orders/${displayOrder.orderId}/tracking`, { state: { order: displayOrder }, replace: true })}
          onViewDetails={() => setShowDetails(true)}
          onContinueShopping={() => navigate('/customerhome')}
        />
      </div>

      {showDetails && <OrderDetailsModal order={displayOrder} onClose={() => setShowDetails(false)} />}
    </div>
  );
}
