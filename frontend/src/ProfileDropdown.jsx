import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useravatar from './useravatar.png';
import { clearAuthSession, getAuthHeaders } from './auth';

export function ProfileDropdown({ username, showOrders = true, showCart = true, showProfile = true, showSettings = true, showLogout = true, logoutRedirect = '/' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const isLinkActive = (id) => {
    if (id === 'profile') {
      return location.pathname === '/profile';
    }
    if (id === 'orders') {
      return location.pathname.startsWith('/orders');
    }
    if (id === 'cart') {
      return location.pathname.startsWith('/UserCartPage') || location.pathname.startsWith('/cart');
    }
    if (id === 'settings') {
      return location.pathname.startsWith('/settings');
    }
    return false;
  };

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
    return undefined;
  }, [isOpen]);

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    setIsOpen(false);
    setLogoutLoading(true);

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
    } catch (logoutError) {
      console.error('Logout failed', logoutError);
    } finally {
      clearAuthSession();
      navigate(logoutRedirect, { replace: true });
    }
  };

  return (
    <div className={`profile-dropdown ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      <button
        className="profile-button"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open profile menu"
      >
        <img src={useravatar} alt="User avatar" className="user-avatar" />
        <span className="username">{username || 'Guest'}</span>
        <span className="profile-button__chevron" aria-hidden="true">▾</span>
      </button>

      <div className={`dropdown-menu ${isOpen ? 'visible' : ''}`}>
        <div className="dropdown-top">
          {showProfile && (
            <button
              type="button"
              className={`dropdown-link${isLinkActive('profile') ? ' active' : ''}${profileLoading ? ' is-loading' : ''}`}
              onClick={() => {
                  if (profileLoading) return;
                  setIsOpen(false);
                  setProfileLoading(true);
                  try {
                    window.dispatchEvent(new CustomEvent('openProfileModal', {
                      detail: {
                        onComplete: () => setProfileLoading(false),
                      },
                    }));
                  } catch (e) {
                    setProfileLoading(false);
                    navigate('/profile');
                  }
                }}
              disabled={profileLoading}
              aria-busy={profileLoading}
            >
              <span className="dropdown-link__icon">👤</span>
              <span>{profileLoading ? 'View Profile...' : 'View Profile'}</span>
            </button>
          )}
          {showOrders && (
            <button
              type="button"
              className={`dropdown-link${isLinkActive('orders') ? ' active' : ''}`}
              onClick={() => {
                setIsOpen(false);
                navigate('/orders');
              }}
            >
              <span className="dropdown-link__icon">📦</span>
              <span>Orders</span>
            </button>
          )}
          {showCart && (
            <button
              type="button"
              className={`dropdown-link${isLinkActive('cart') ? ' active' : ''}`}
              onClick={() => {
                setIsOpen(false);
                navigate('/UserCartPage');
              }}
            >
              <span className="dropdown-link__icon">🛒</span>
              <span>Cart</span>
            </button>
          )}
          {showLogout && (
            <button
              type="button"
              className={`dropdown-link dropdown-logout${logoutLoading ? ' is-loading' : ''}`}
              onClick={handleLogout}
              disabled={logoutLoading}
              aria-busy={logoutLoading}
            >
              <span className="dropdown-link__icon">🚪</span>
              <span>{logoutLoading ? 'Logging out...' : 'Logout'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
