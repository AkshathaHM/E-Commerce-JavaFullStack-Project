import React from 'react';
import { AdminHeader } from './AdminHeader';
import SidebarNavigation from './SidebarNavigation';
import './assets/styles.css';

export function AdminLayout({ children, username = 'Admin' }) {
  return (
    <div className="admin-shell">
      <AdminHeader username={username} />
      <div className="admin-shell__body">
        <SidebarNavigation variant="admin" username={username} />
        <div className="admin-page-content">{children}</div>
      </div>
    </div>
  );
}
