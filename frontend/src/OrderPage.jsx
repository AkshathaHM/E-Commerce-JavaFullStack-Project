import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CustomerLayout } from './CustomerLayout';
import { OrderCardSkeleton } from './components/Skeleton';
import { getDerivedOrderStatus, getStatusLabel } from './utils/orderStatus';
import './assets/styles.css';

const NO_IMAGE = '/images/no-image.png';

const formatCurrency = (value) => {
  const numericValue = Number(value ?? 0);
  if (Number.isNaN(numericValue)) return '₹0.00';
  return `₹${numericValue.toFixed(2)}`;
};

const readSafeValue = (value, fallback = 'N/A') => {
  if (value === null || value === undefined || value === '') return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const normalizeOrderPayload = (order) => ({
  orderId: order?.order_id || order?.orderId || order?.id || 'N/A',
  customerName: readSafeValue(order?.customerName || order?.customer_name, 'Customer'),
  email: readSafeValue(order?.email || order?.customerEmail),
  phone: readSafeValue(order?.phone || order?.mobile),
  orderDate: order?.createdAt || order?.created_at || order?.orderDate || new Date().toISOString(),
  paymentMethod: readSafeValue(order?.paymentMethod || order?.payment_method, 'Razorpay'),
  paymentStatus: readSafeValue(order?.paymentStatus || order?.payment_status, 'Paid'),
  status: readSafeValue(order?.status || order?.orderStatus, 'Order Placed'),
  name: readSafeValue(order?.name || order?.productName, 'Product'),
  description: readSafeValue(order?.description, 'No description available'),
  quantity: Number(order?.quantity ?? order?.qty ?? 1),
  price: Number(order?.price_per_unit ?? order?.price ?? 0),
  totalPrice: Number(order?.total_price ?? order?.totalAmount ?? order?.amount ?? 0),
  deliveryCharges: Number(order?.deliveryCharges || order?.delivery_charge || 0),
  tax: Number(order?.tax || order?.totalTax || 0),
  address: readSafeValue(order?.address || order?.deliveryAddress, 'Delivery address on file'),
  imageUrl: order?.image_url || order?.imageUrl || order?.image || NO_IMAGE,
  productId: order?.product_id || order?.productId || 'N/A',
  category: order?.category || order?.productCategory || 'N/A',
});

const OrderCard = memo(function OrderCard({ order, onTrackOrder, onCancelOrder, onContinueShopping }) {
  const fallbackImage = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = NO_IMAGE;
  };

  const derivedStatus = getDerivedOrderStatus(order.orderDate, order.status);
  const statusLabel = getStatusLabel(derivedStatus);
  const showCancel = ['placed', 'confirmed', 'packed', 'shipped'].includes(derivedStatus);
  const isCancelled = derivedStatus === 'cancelled';
  const isDelivered = derivedStatus === 'delivered';

  return (
    <article className="order-card">
      <div className="order-card-header">
        <p className="section-eyebrow">Order ID</p>
        <h3>{order.orderId}</h3>
      </div>
      <div className="order-card-body">
        <img
          src={order.imageUrl?.startsWith('http') || order.imageUrl?.startsWith('data:image/') ? order.imageUrl : NO_IMAGE}
          alt={order.name}
          className="order-product-image"
          loading="lazy"
          onError={fallbackImage}
        />
        <div className="order-details">
          <div className="order-detail-row"><span>Product</span><strong>{order.name}</strong></div>
          <div className="order-detail-row"><span>Order Number</span><strong>{order.orderId}</strong></div>
          <div className="order-detail-row"><span>Quantity</span><strong>{order.quantity}</strong></div>
          <div className="order-detail-row"><span>Total</span><strong>{formatCurrency(order.totalPrice)}</strong></div>
          <div className="order-detail-row"><span>Payment</span><strong>{order.paymentStatus || 'Paid'}</strong></div>
          <div className="order-detail-row"><span>Order Date</span><strong>{new Date(order.orderDate).toLocaleString('en-IN')}</strong></div>
          <div className="order-detail-row"><span>Backend Status</span><strong>{statusLabel}</strong></div>
        </div>
      </div>
      <div className="order-card-footer">
        <div className={`order-status-badge ${isCancelled ? 'order-status-badge--cancelled' : isDelivered ? 'order-status-badge--delivered' : 'order-status-badge--default'}`}>
          {statusLabel}
        </div>
        <div className="order-card-actions">
          {!isCancelled && <button className="order-card-action" type="button" onClick={() => onTrackOrder(order)}>Track Order</button>}
          {showCancel && <button className="order-card-action order-card-action--danger" type="button" onClick={() => onCancelOrder(order)}>Cancel Order</button>}
          <button className="order-card-action order-card-action--ghost" type="button" onClick={onContinueShopping}>Continue Shopping</button>
        </div>
      </div>
    </article>
  );
});

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('');
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelMessage, setCancelMessage] = useState('');
  const [pendingCancelOrder, setPendingCancelOrder] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchOrders = useCallback(async () => {
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
        const fallback = await response.text();
        throw new Error(fallback || 'Unable to load orders.');
      }

      const data = await response.json();
      const productList = Array.isArray(data?.orders) ? data.orders : (Array.isArray(data?.products) ? data.products : []);
      const nextOrders = productList.map(normalizeOrderPayload);
      setOrders(nextOrders);
      setUsername(data?.username || 'Guest');
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchCartCount = useCallback(async () => {
    setIsCartLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cart/items/count?username=${username}`,
        { credentials: 'include' }
      );
      const count = await response.json();
      setCartCount(count);
      setCartError(false);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartError(true);
    } finally {
      setIsCartLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (username) {
      fetchCartCount();
    }
  }, [fetchCartCount, username]);

  useEffect(() => {
    if (location.state?.order) {
      setSelectedOrder({
        ...location.state.order,
        customerName: location.state.order.customerName || username || 'Customer',
      });
    }
  }, [location.state, username]);

  const orderCards = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      customerName: order.customerName || username || 'Customer',
      paymentStatus: order.paymentStatus || 'Paid',
    }));
  }, [orders, username]);

  const handleTrackOrder = (order) => {
    setSelectedOrder({
      ...order,
      customerName: username || order.customerName || 'Customer',
    });
  };

  const handleCancelOrder = (order) => {
    setPendingCancelOrder(order);
  };

  const confirmCancelOrder = async () => {
    if (!pendingCancelOrder) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${encodeURIComponent(pendingCancelOrder.orderId)}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Unable to cancel this order right now.');
      }

      setOrders((currentOrders) => currentOrders.map((entry) => entry.orderId === pendingCancelOrder.orderId ? { ...entry, status: 'Cancelled' } : entry));
      setCancelMessage('Your order has been cancelled successfully.');
      setPendingCancelOrder(null);
    } catch (err) {
      setCancelMessage(err.message || 'Unable to cancel this order right now.');
      setPendingCancelOrder(null);
    }
  };

  return (
    <CustomerLayout
      cartCount={isCartLoading ? '...' : cartError ? 'Error' : cartCount}
      username={username}
    >
      <div className="main-content">
        <section className="orders-hero">
            <div>
              <p className="section-eyebrow">Your account</p>
              <h1 className="form-title">Your Orders</h1>
            </div>
          </section>

          {cancelMessage && (
            <div className="order-success-banner">{cancelMessage}</div>
          )}

          {selectedOrder && (
            <div className="confirmation-dialog-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>
                <h3>Order tracking</h3>
                <p>Tracking details for {selectedOrder.orderId}</p>
                <div className="order-detail-row">
                  <span>Status</span>
                  <strong>{selectedOrder.status}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Delivery address</span>
                  <strong>{selectedOrder.address}</strong>
                </div>
                <div className="confirmation-dialog-actions">
                  <button className="order-card-action" type="button" onClick={() => setSelectedOrder(null)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="orders-list" aria-label="Loading orders">
              {Array.from({ length: 2 }).map((_, index) => (
                <OrderCardSkeleton key={index} />
              ))}
            </div>
          )}

          {error && (
            <div className="product-empty-state">
              <h3 className="section-title">Unable to load orders.</h3>
              <p>{error}</p>
              <button className="order-card-action" type="button" onClick={fetchOrders}>Retry</button>
            </div>
          )}

          {!loading && !error && orderCards.length === 0 && (
            <div className="product-empty-state">
              <div className="empty-order-illustration">📦</div>
              <h3 className="section-title">No Orders Found</h3>
              <p>Your recent purchases will appear here once you place an order.</p>
            </div>
          )}

          {!loading && !error && orderCards.length > 0 && (
            <div className="orders-list">
              {orderCards.map((order) => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  onTrackOrder={handleTrackOrder}
                  onCancelOrder={handleCancelOrder}
                  onContinueShopping={() => navigate('/customerhome')}
                />
              ))}
            </div>
          )}

          {pendingCancelOrder && (
            <div className="confirmation-dialog-overlay" onClick={() => setPendingCancelOrder(null)}>
              <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>
                <h3>Cancel Order?</h3>
                <p>Are you sure you want to cancel this order?</p>
                <div className="confirmation-dialog-actions">
                  <button className="order-card-action order-card-action--danger" type="button" onClick={confirmCancelOrder}>Yes Cancel</button>
                  <button className="order-card-action order-card-action--ghost" type="button" onClick={() => setPendingCancelOrder(null)}>No</button>
                </div>
              </div>
            </div>
          )}
      </div>
    </CustomerLayout>
  );
}