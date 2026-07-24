import React from 'react';
import { CustomerHeader } from './CustomerHeader';
import { Footer } from './Footer';
import { Navigation } from './Navigation';
import './assets/styles.css';

export function CustomerLayout({ children, cartCount = 0, username = 'Guest', showNavigation = true }) {
  return (
    <div className="customer-shell">
      <CustomerHeader cartCount={cartCount} username={username} />
      {showNavigation && <Navigation />}
      <main className="customer-page-content">{children}</main>
      <Footer />
    </div>
  );
}
