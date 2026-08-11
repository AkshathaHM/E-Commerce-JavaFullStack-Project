import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';
import ThemeToggleButton from './ThemeToggleButton';
import SharedCartInviteFloating from './SharedCartInviteFloating';

export const AdminHeader = memo(function AdminHeader({ username = 'Admin' }) {
  const navigate = useNavigate();

  return (
    <header className="app-header app-header--admin">
      <div className="app-header__inner">
        <button type="button" className="brand-shell" onClick={() => navigate('/admindashboard')}>
          <img
            src="/logo.png"
            alt="SalesSavvy"
            className="brand-logo"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/images/no-image.png';
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="brand-name">SalesSavvy</span>
              <span className="admin-badge">Admin</span>
            </div>
          </div>
        </button>

        <div className="app-header__actions header-actions">
          <ProfileDropdown
            username={username}
            variant="admin"
            showOrders={false}
            showCart={false}
            menuItems={[
              { id: 'dashboard', label: 'Dashboard', icon: '📊', to: '/admindashboard' },
              { id: 'products', label: 'Products', icon: '🧺', to: '/admin/products' },
              { id: 'customers', label: 'Customers', icon: '👥', to: '/admin/users' },
              { id: 'logout', label: 'Logout', icon: '🚪', action: 'logout' },
            ]}
          />
          <ThemeToggleButton />
          <SharedCartInviteFloating />
        </div>
      </div>
    </header>
  );
});
