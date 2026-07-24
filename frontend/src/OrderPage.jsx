import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import OrderTracking from './components/OrderTracking';
import OrderDetailsModal from './components/OrderDetailsModal';
import './assets/styles.css';

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('');
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchOrders();
    if (username) {
      fetchCartCount();
    }
  }, [username]);

  useEffect(() => {
    if (location.state?.order) {
      setSelectedOrder(location.state.order);
      if (location.state?.modal) {
        setSelectedOrder(location.state.order);
      }
    }
  }, [location.state]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.products || []);
      setUsername(data.username || 'Guest');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
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
  };

  return (
    <div className="maindiv">
      <div className="customer-homepage">
        <Header
          cartCount={isCartLoading ? '...' : cartError ? 'Error' : cartCount}
          username={username}
        />
        <main className="main-content">
          <h1 className="form-title">Your Orders</h1>
          {loading && <p>Loading orders...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && orders.length === 0 && (
            <p>No orders found. Start shopping now!</p>
          )}
          {!loading && !error && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order, index) => (
                <div key={index} className="order-card">
                  <div className="order-card-header">
                    <h3>Order Id : {order.order_id}</h3>
                  </div>
                  <div className="order-card-body">
                    <img
                      src={order.image_url}
                      alt={order.name}
                      className="order-product-image"
                    />
                    <div className="order-details">
                      <h3 className="product-name">ProductName : {order.name}</h3>
                      <h3>Description : {order.description}</h3>
                      <h3>Quantity : {order.quantity}</h3>
                      <h3>Price per Unit : ₹{order.price_per_unit.toFixed(2)}</h3>
                      <h3>Total Price : ₹{order.total_price.toFixed(2)}</h3>
                    </div>
                  </div>
                  <div className="order-card-actions">
                    <button className="order-card-action" onClick={() => navigate('/order-tracking', { state: { order: { ...order, orderId: order.order_id, customerName: username || 'Customer', paymentMethod: 'Razorpay' } } })}>Track Delivery</button>
                    <button className="order-card-action order-card-action--secondary" onClick={() => setSelectedOrder({ ...order, orderId: order.order_id, customerName: username || 'Customer', paymentMethod: 'Razorpay' })}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
         {selectedOrder && (
           <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
         )}
         {!loading && !error && orders.length > 0 && <OrderTracking order={selectedOrder || orders[0]} />}
        </main>
        <Footer />
      </div>
    </div>
  );
}