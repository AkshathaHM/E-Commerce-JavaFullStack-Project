import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import useravatar from './useravatar.png';

export function ProfileDropdown({ username, showOrders = true, showCart = true, showProfile = true, showLogout = true, logoutRedirect = '/' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const previousFocusedElement = useRef(null);

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

  const trapFocus = (event) => {
    if (!modalRef.current) {
      return;
    }

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const elements = Array.from(focusableElements).filter(
      (element) => !element.hasAttribute('disabled') && element.offsetParent !== null
    );

    if (elements.length === 0) {
      return;
    }

    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const formatLabel = (key) => {
    const labels = {
      username: 'Username',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      state: 'State',
      country: 'Country',
      postalCode: 'Zip / Postal Code',
      createdAt: 'Joined',
      created_at: 'Joined',
      updatedAt: 'Updated',
      updated_at: 'Updated',
      dateOfBirth: 'Date of Birth',
      dob: 'Date of Birth',
    };
    return (
      labels[key] ||
      key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };

  const renderProfileValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    if (Array.isArray(value)) {
      return value.length ? value.join(', ') : 'N/A';
    }

    if (typeof value === 'object') {
      return Object.entries(value)
        .map(([subKey, subValue]) => `${formatLabel(subKey)}: ${renderProfileValue(subValue)}`)
        .join(', ');
    }

    return String(value);
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
    navigate(logoutRedirect);
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
    setIsOpen(false);
    setActivePanel('profile');
    await loadProfile();
  };

  const handleViewOrders = () => {
    setIsOpen(false);
    setActivePanel(null);
    navigate('/orders');
  };

  useEffect(() => {
    if (activePanel !== 'profile') {
      return undefined;
    }

    previousFocusedElement.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closePanel();
      } else if (event.key === 'Tab') {
        trapFocus(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const closeButton = modalRef.current?.querySelector('.profile-modal-close');
    if (closeButton) {
      closeButton.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocusedElement.current) {
        previousFocusedElement.current.focus();
      }
    };
  }, [activePanel]);

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
      </div>

      {activePanel === 'profile' &&
        createPortal(
          <div className="profile-modal" onClick={closePanel}>
            <div
              ref={modalRef}
              className="profile-card profile-card--modal"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-modal-title"
            >
              <div className="profile-modal-header">
                <h3 id="profile-modal-title">Profile Details</h3>
                <button
                  type="button"
                  className="profile-modal-close"
                  aria-label="Close profile details"
                  onClick={closePanel}
                >
                  ×
                </button>
              </div>

              {loadingProfile ? (
                <p className="profile-modal-status">Loading profile...</p>
              ) : profileData ? (
                <div className="profile-details-grid">
                  {Object.entries(profileData)
                    .filter(([key]) => !['password', 'confirmPassword', 'token', 'authToken'].includes(key.toLowerCase()))
                    .map(([key, value]) => (
                      <div key={key} className="profile-detail-row">
                        <span className="profile-detail-label">{formatLabel(key)}</span>
                        <span className="profile-detail-value">{renderProfileValue(value)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="profile-modal-status">No profile data available.</p>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
