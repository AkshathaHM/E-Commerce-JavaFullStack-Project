import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CustomerLayout } from './CustomerLayout';
import { OrderCardSkeleton } from './components/Skeleton';
import { getDerivedOrderStatus, getExpectedDelivery, getOrderHistoryEntries, getStatusLabel, ORDER_STATUS_SEQUENCE } from './utils/orderStatus';
import StatusBadge from './components/StatusBadge';
import TrackingTimeline from './components/TrackingTimeline';
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

const formatDisplayDate = (value, fallback = 'Not available') => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const DEMO_SEQUENCE = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

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
        <div>
          <p className="section-eyebrow">Order ID</p>
          <h3>{order.orderId}</h3>
        </div>
        <div className="order-card-meta">
          <span>{formatDisplayDate(order.orderDate, 'Date unavailable')}</span>
          <div className={`order-status-badge ${isCancelled ? 'order-status-badge--cancelled' : isDelivered ? 'order-status-badge--delivered' : 'order-status-badge--default'}`}>
            {statusLabel}
          </div>
        </div>
      </div>

      <div className="order-card-body">
        <div className="order-product-visual">
          <img
            src={order.imageUrl?.startsWith('http') || order.imageUrl?.startsWith('data:image/') ? order.imageUrl : NO_IMAGE}
            alt={order.name}
            className="order-product-image"
            loading="lazy"
            onError={fallbackImage}
          />
          <div className="order-product-caption">
            <span>{order.category}</span>
            <strong>{order.quantity} item{order.quantity === 1 ? '' : 's'}</strong>
          </div>
        </div>

        <div className="order-details">
          <div className="order-detail-row"><span>Product</span><strong>{order.name}</strong></div>
          <div className="order-detail-row"><span>Description</span><strong>{order.description}</strong></div>
          <div className="order-detail-row"><span>Category</span><strong>{order.category}</strong></div>
          <div className="order-detail-row"><span>Quantity</span><strong>{order.quantity}</strong></div>
          <div className="order-detail-row"><span>Item total</span><strong>{formatCurrency(order.price)}</strong></div>
          <div className="order-detail-row"><span>Order total</span><strong>{formatCurrency(order.totalPrice)}</strong></div>
          <div className="order-detail-row"><span>Payment</span><strong>{order.paymentStatus || 'Paid'}</strong></div>
          <div className="order-detail-row"><span>Method</span><strong>{order.paymentMethod}</strong></div>
        </div>
      </div>

      <div className="order-card-footer order-card-footer--actions">
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
  const [trackingStatus, setTrackingStatus] = useState('placed');
  const [cancelMessage, setCancelMessage] = useState('');
  const [pendingCancelOrder, setPendingCancelOrder] = useState(null);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchOrders = useCallback(async (nextPage = 0, append = false) => {
    if (!append) {
      setLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders?page=${nextPage}&size=5`, {
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
      setOrders((currentOrders) => append ? [...currentOrders, ...nextOrders] : nextOrders);
      setHasNextPage(Boolean(data?.hasNext));
      setPage(nextPage);
      setUsername(data?.username || 'Guest');
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
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
    fetchOrders(0, false);
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

  useEffect(() => {
    if (!selectedOrder) return undefined;

    const initialStatus = getDerivedOrderStatus(selectedOrder.orderDate, selectedOrder.status);
    setTrackingStatus(initialStatus);

    if (initialStatus === 'delivered' || initialStatus === 'cancelled') {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTrackingStatus((currentStatus) => {
        const currentIndex = DEMO_SEQUENCE.indexOf(currentStatus);
        if (currentIndex < 0) return currentStatus;
        const nextIndex = Math.min(currentIndex + 1, DEMO_SEQUENCE.length - 1);
        return DEMO_SEQUENCE[nextIndex];
      });
    }, 60000);

    return () => window.clearTimeout(timer);
  }, [selectedOrder?.orderId, selectedOrder?.orderDate, selectedOrder?.status]);

  const orderCards = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      customerName: order.customerName || username || 'Customer',
      paymentStatus: order.paymentStatus || 'Paid',
    }));
  }, [orders, username]);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    fetchOrders(page + 1, true);
  }, [fetchOrders, hasNextPage, isLoadingMore, page]);

  const handleTrackOrder = (order) => {
    setSelectedOrder({
      ...order,
      customerName: username || order.customerName || 'Customer',
    });
  };

  const activeTrackingLabel = useMemo(() => getStatusLabel(trackingStatus), [trackingStatus]);
  const expectedDelivery = useMemo(() => getExpectedDelivery(selectedOrder?.orderDate || new Date().toISOString()), [selectedOrder?.orderDate]);
  const orderHistory = useMemo(() => getOrderHistoryEntries(selectedOrder?.orderId || 'N/A'), [selectedOrder?.orderId]);

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
            <div className="tracking-modal-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="tracking-modal-card" onClick={(event) => event.stopPropagation()}>
                <button className="tracking-modal-close" type="button" onClick={() => setSelectedOrder(null)} aria-label="Close tracking panel">×</button>

                <div className="tracking-hero">
                  <div className="tracking-hero__content">
                    <p className="order-tracking-card__eyebrow">Order tracking</p>
                    <h2>{activeTrackingLabel}</h2>
                    <p className="tracking-hero__copy">Your order is moving through the delivery pipeline and the latest milestone is {activeTrackingLabel.toLowerCase()}.</p>
                  </div>
                  <div className="tracking-hero__metrics">
                    <div className="tracking-pill">
                      <span>Order ID</span>
                      <strong>{selectedOrder.orderId}</strong>
                    </div>
                    <div className="tracking-pill">
                      <span>Expected delivery</span>
                      <strong>{expectedDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </div>
                  </div>
                </div>

                <div className="tracking-layout">
                  <div className="tracking-panel">
                    <div className="tracking-panel__header">
                      <h3>Delivery timeline</h3>
                      <span className="tracking-demo-banner">● Demo progress</span>
                    </div>
                    <StatusBadge status={activeTrackingLabel} />
                    <div className="tracking-status-banner">
                      <div>
                        <span>Status</span>
                        <strong>{activeTrackingLabel}</strong>
                      </div>
                      <div>
                        <span>Placed on</span>
                        <strong>{formatDisplayDate(selectedOrder.orderDate)}</strong>
                      </div>
                    </div>
                    <TrackingTimeline currentStatus={trackingStatus} />
                  </div>

                  <div className="tracking-panel">
                    <div className="tracking-panel__header">
                      <h3>Order details</h3>
                    </div>
                    <div className="order-tracking-details-grid">
                      <div><span>Order number</span><strong>{selectedOrder.orderId}</strong></div>
                      <div><span>Status</span><strong>{activeTrackingLabel}</strong></div>
                      <div><span>Created at</span><strong>{formatDisplayDate(selectedOrder.orderDate)}</strong></div>
                      <div><span>Customer name</span><strong>{selectedOrder.customerName}</strong></div>
                      <div><span>Delivery address</span><strong>{selectedOrder.address}</strong></div>
                      <div><span>Phone</span><strong>{selectedOrder.phone || 'Not provided'}</strong></div>
                      <div><span>Payment method</span><strong>{selectedOrder.paymentMethod || 'Razorpay'}</strong></div>
                      <div><span>Payment status</span><strong>{selectedOrder.paymentStatus || 'Paid'}</strong></div>
                    </div>

                    <div className="tracking-history-card">
                      <h3>Order history</h3>
                      <ul className="tracking-history-list">
                        {orderHistory.map((entry) => (
                          <li key={entry.label}>
                            <span>{entry.label}</span>
                            <strong>{entry.detail}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="order-tracking-actions">
                  <button className="order-card-action order-card-action--ghost" type="button" onClick={() => setSelectedOrder(null)}>Close</button>
                  <button className="order-card-action" type="button" onClick={() => navigate('/orders')}>Back to Orders</button>
                  <button className="order-card-action order-card-action--ghost" type="button" onClick={() => navigate('/customerhome')}>Continue Shopping</button>
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
            <>
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
              {hasNextPage && (
                <div className="orders-load-more">
                  <button className="order-card-action" type="button" onClick={handleLoadMore} disabled={isLoadingMore}>
                    {isLoadingMore ? 'Loading...' : 'Load more orders'}
                  </button>
                </div>
              )}
            </>
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