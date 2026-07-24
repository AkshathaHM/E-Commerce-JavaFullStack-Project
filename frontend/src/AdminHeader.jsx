import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';

export const AdminHeader = memo(function AdminHeader({ username = 'Admin' }) {
  const navigate = useNavigate();

  return (
    <header className="app-header app-header--admin">
      <div className="app-header__inner">
        <button type="button" className="brand-shell" onClick={() => navigate('/admin')}>
          <div className="brand-badge">A</div>
          <span className="brand-name">Admin Console</span>
        </button>

        <div className="app-header__actions">
          <ProfileDropdown
            username={username}
            variant="admin"
            menuItems={[
              { id: 'dashboard', label: 'Dashboard', icon: '📊', to: '/admin' },
              { id: 'orders', label: 'Orders', icon: '📦', to: '/admin/orders' },
              { id: 'products', label: 'Products', icon: '🧺', to: '/admin/products' },
              { id: 'customers', label: 'Customers', icon: '👥', to: '/admin/users' },
              { id: 'logout', label: 'Logout', icon: '🚪', action: 'logout' },
            ]}
          />
        </div>
      </div>
    </header>
  );
});
