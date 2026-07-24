import React from 'react';
import { CustomerHeader } from './CustomerHeader';
import { Footer } from './Footer';
import './assets/styles.css';

export function CustomerLayout({ children, cartCount = 0, username = 'Guest' }) {
  return (
    <div className="customer-shell">
      <CustomerHeader cartCount={cartCount} username={username} />
      <main className="customer-page-content">{children}</main>
      <Footer />
    </div>
  );
}
