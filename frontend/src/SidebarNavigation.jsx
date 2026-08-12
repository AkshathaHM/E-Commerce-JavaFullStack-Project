import React, { useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useravatar from './useravatar.png';
import { clearAuthSession, getAuthHeaders } from './auth';

const adminMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', to: '/admindashboard' },
  { id: 'products', label: 'Products', icon: '🧺', to: '/admin/products' },
  { id: 'customers', label: 'Customers', icon: '👥', to: '/admin/users' },
  { id: 'logout', label: 'Logout', icon: '🚪', action: 'logout' },
];

const customerMenu = [
  { id: 'profile', label: 'Profile', icon: '👤', to: '/profile' },
  { id: 'orders', label: 'My Orders', icon: '📦', to: '/orders' },
  { id: 'cart', label: 'Cart', icon: '🛒', to: '/UserCartPage' },
  { id: 'settings', label: 'Settings', icon: '⚙️', to: '/settings' },
  { id: 'logout', label: 'Logout', icon: '🚪', action: 'logout' },
];

export default function SidebarNavigation({ variant = 'customer', username = 'Guest' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = useMemo(() => (variant === 'admin' ? adminMenu : customerMenu), [variant]);

  const isActiveItem = useCallback((item) => {
    if (!item.to) return false;
    const path = location.pathname;
    if (item.id === 'orders') {
      return path.startsWith('/orders');
    }
    if (item.id === 'cart') {
      return path.startsWith('/UserCartPage') || path.startsWith('/cart');
    }
    return path === item.to;
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      clearAuthSession();
      navigate('/', { replace: true });
    }
  }, [loggingOut, navigate]);

  return (
    <aside className="sidebar-navigation">
      <div className="sidebar-profile">
        <img src={useravatar} alt="User avatar" className="sidebar-avatar" />
        <div>
          <p className="sidebar-username">{username || 'Guest'}</p>
          <p className="sidebar-role">{variant === 'admin' ? 'Admin' : 'Customer'}</p>
        </div>
      </div>

      <nav className="sidebar-menu" aria-label={`${variant} navigation`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-menu-item${isActiveItem(item) ? ' active' : ''}`}
            onClick={() => {
              if (item.action === 'logout') {
                handleLogout();
                return;
              }
              if (item.to) {
                navigate(item.to);
              }
            }}
            disabled={item.action === 'logout' && loggingOut}
          >
            <span className="sidebar-menu-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
