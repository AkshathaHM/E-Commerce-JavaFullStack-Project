import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useravatar from './useravatar.png';

export function ProfileDropdown({ username, showOrders = true, showCart = true, showProfile = true, showLogout = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (logoutError) {
      console.error('Logout failed', logoutError);
    }
    localStorage.clear();
    navigate('/');
  };

  const loadProfile = async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error('Unable to load profile information');
      }
      const data = await response.json();
      setProfileData(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError('Unable to load profile information.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error('Unable to load orders');
      }
      const data = await response.json();
      setOrders(data.orders || data.products || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError('Unable to load orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleViewProfile = async () => {
    setActivePanel('profile');
    await loadProfile();
  };

  const handleViewOrders = async () => {
    setActivePanel('orders');
    await loadOrders();
  };

  return (
    <div className={`profile-dropdown ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      <button
        className="profile-button"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <img src={useravatar} alt="User" className="user-avatar" />
        <span className="username">{username || 'Guest'}</span>
      </button>

      <div className={`dropdown-menu ${isOpen ? 'visible' : ''}`}>
        <div className="dropdown-top">
            {showProfile && (
            <button type="button" className="dropdown-link" onClick={handleViewProfile}>
              View Profile
            </button>
          )}
          {showOrders && (
            <button type="button" className="dropdown-link" onClick={handleViewOrders}>
              Orders
            </button>
          )}
          {showCart && (
            <button type="button" className="dropdown-link" onClick={() => navigate('/UserCartPage')}>
              Cart
            </button>
          )}
          {showLogout && (
            <button type="button" className="dropdown-link dropdown-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        {error && <div className="dropdown-error">{error}</div>}

        {activePanel === 'profile' && (
          <div className="profile-card">
            <button type="button" className="card-close" onClick={closePanel}>
              ×
            </button>
            {loadingProfile ? (
              <p>Loading profile...</p>
            ) : profileData ? (
              <div>
                <h3>Profile Details</h3>
                <div className="card-centered">
                  <p><strong>Name:</strong> {profileData.name || profileData.username || 'N/A'}</p>
                  <p><strong>Email:</strong> {profileData.email || 'N/A'}</p>
                  <p><strong>Username:</strong> {profileData.username || 'Guest'}</p>
                  <p><strong>Role:</strong> {profileData.role || 'Customer'}</p>
                  {profileData.phone && <p><strong>Phone:</strong> {profileData.phone}</p>}
                  {profileData.address && <p><strong>Address:</strong> {profileData.address}</p>}
                </div>
              </div>
            ) : (
              <p>No profile data available.</p>
            )}
          </div>
        )}

        {activePanel === 'orders' && (
          <div className="profile-card orders-panel">
            <button type="button" className="card-close" onClick={closePanel}>
              ×
            </button>
            <h3>Order History</h3>
            {loadingOrders ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map((order, index) => (
                <div key={index} className="order-item">
                  <img
                    src={
                      order.image_url?.startsWith('http')
                        ? order.image_url
                        : order.images?.[0]?.startsWith('http')
                        ? order.images[0]
                        : 'https://via.placeholder.com/70'
                    }
                    alt={order.name || 'Order item'}
                    onError={(event) => {
                      event.target.onerror = null;
                      event.target.src = 'https://via.placeholder.com/70';
                    }}
                  />
                  <div className="order-details">
                    <h4>Order ID: {order.order_id || order.id || index + 1}</h4>
                    <p><strong>Product:</strong> {order.name || order.product_name || 'N/A'}</p>
                    {order.quantity !== undefined && <p><strong>Qty:</strong> {order.quantity}</p>}
                    {order.price_per_unit !== undefined && <p><strong>Price:</strong> ₹{Number(order.price_per_unit).toFixed(2)}</p>}
                    {order.total_price !== undefined && <p><strong>Total:</strong> ₹{Number(order.total_price).toFixed(2)}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
