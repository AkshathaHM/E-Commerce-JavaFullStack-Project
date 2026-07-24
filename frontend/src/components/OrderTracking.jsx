import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAuthHeaders } from '../auth';
import { getDerivedOrderStatus, getExpectedDelivery, getOrderHistoryEntries, getStatusLabel, ORDER_STATUS_SEQUENCE } from '../utils/orderStatus';
import StatusBadge from './StatusBadge';
import TrackingTimeline from './TrackingTimeline';

const FALLBACK_IMAGE = '/images/no-image.png';
const DEMO_SEQUENCE = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayOrder, setDisplayOrder] = useState(buildDisplayOrder(location.state?.order, orderId));
  const [status, setStatus] = useState(getDerivedOrderStatus(location.state?.order?.orderDate || location.state?.order?.createdAt || location.state?.order?.created_at, location.state?.order?.status || location.state?.order?.orderStatus));

  const demoMode = new URLSearchParams(location.search).get('demo') === '1' || Boolean(location.state?.demoMode);

  useEffect(() => {
    const initialOrder = location.state?.order;
    if (initialOrder) {
      const nextOrder = buildDisplayOrder(initialOrder, orderId);
      setDisplayOrder(nextOrder);
      setStatus(getDerivedOrderStatus(nextOrder.createdAt, nextOrder.status));
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
        setStatus(getDerivedOrderStatus(nextOrder.createdAt, nextOrder.status));
      } catch (caughtError) {
        setError(caughtError.message || 'Unable to load tracking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingDetails();
  }, [location.state?.order, orderId]);

  useEffect(() => {
    if (!demoMode || loading || error || status === 'cancelled' || status === 'delivered') {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setStatus((current) => {
        const currentIndex = DEMO_SEQUENCE.indexOf(current);
        if (currentIndex < 0) return current;
        const nextIndex = Math.min(currentIndex + 1, DEMO_SEQUENCE.length - 1);
        return DEMO_SEQUENCE[nextIndex];
      });
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [demoMode, loading, error, status]);

  const orderHistory = useMemo(() => getOrderHistoryEntries(displayOrder.orderId), [displayOrder.orderId]);
  const currentStepLabel = getStatusLabel(status);
  const isCancelled = status === 'cancelled';
  const estimatedDelivery = useMemo(() => getExpectedDelivery(displayOrder.createdAt), [displayOrder.createdAt]);

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
          <div className="order-tracking-actions">
            <button className="order-card-action" type="button" onClick={() => navigate('/orders')}>Back to Orders</button>
            <button className="order-card-action order-card-action--ghost" type="button" onClick={() => navigate('/customerhome')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-shell">
      <div className="order-tracking-card">
        <div className="tracking-hero">
          <div className="tracking-hero__content">
            <p className="order-tracking-card__eyebrow">Delivery progress</p>
            <h2>{isCancelled ? 'Cancelled' : currentStepLabel}</h2>
            <p className="tracking-hero__copy">
              {isCancelled
                ? 'The order was cancelled before it reached the courier.'
                : `Your order is moving through the delivery pipeline. ${currentStepLabel} is the latest milestone.`}
            </p>
          </div>
          <div className="tracking-hero__metrics">
            <div className="tracking-pill">
              <span>Order ID</span>
              <strong>{displayOrder.orderId}</strong>
            </div>
            <div className="tracking-pill">
              <span>Est. delivery</span>
              <strong>{estimatedDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>
        </div>

        <div className="tracking-layout">
          <div className="tracking-panel">
            <div className="tracking-panel__header">
              <h3>Delivery timeline</h3>
              {demoMode && <span className="tracking-demo-banner">● Demo progress</span>}
            </div>
            <StatusBadge status={isCancelled ? 'Cancelled' : currentStepLabel} />

            {isCancelled ? (
              <div className="cancelled-banner">
                <strong>Cancelled</strong>
                <p>Your order has been cancelled successfully.</p>
              </div>
            ) : (
              <>
                <div className="tracking-status-banner">
                  <div>
                    <span>Status</span>
                    <strong>{currentStepLabel}</strong>
                  </div>
                  <div>
                    <span>Placed on</span>
                    <strong>{new Date(displayOrder.createdAt).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
                <TrackingTimeline currentStatus={status} steps={ORDER_STATUS_SEQUENCE} />
              </>
            )}
          </div>

          <div className="tracking-panel">
            <div className="tracking-panel__header">
              <h3>Order details</h3>
            </div>
            <div className="order-tracking-details-grid">
              <div><span>Customer</span><strong>{displayOrder.customerName}</strong></div>
              <div><span>Address</span><strong>{displayOrder.address}</strong></div>
              <div><span>Phone</span><strong>{displayOrder.phone}</strong></div>
              <div><span>Payment</span><strong>{displayOrder.paymentStatus}</strong></div>
              <div><span>Method</span><strong>{displayOrder.paymentMethod}</strong></div>
              <div><span>Tracking state</span><strong>{currentStepLabel}</strong></div>
            </div>

            {!isCancelled && (
              <div className="tracking-history-card">
                <h3>Track history</h3>
                <ul className="tracking-history-list">
                  {orderHistory.map((entry) => (
                    <li key={entry.label}>
                      <span>{entry.label}</span>
                      <strong>{entry.detail}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="order-tracking-actions">
          <button className="order-card-action" type="button" onClick={() => navigate('/orders')}>Back to Orders</button>
          {!isCancelled && <button className="order-card-action order-card-action--ghost" type="button" onClick={() => navigate('/customerhome')}>Continue Shopping</button>}
        </div>
      </div>
    </div>
  );
}
