import React from 'react';
import { CustomerHeader } from './CustomerHeader';
import SidebarNavigation from './SidebarNavigation';
import { Footer } from './Footer';
import { useCart } from './CartContext';
import './assets/styles.css';

export function CustomerLayout({ children, cartCount = 0, username = 'Guest' }) {
  const { cartCount: sharedCartCount } = useCart();
  const effectiveCartCount = typeof sharedCartCount === 'number' ? sharedCartCount : cartCount;

  return (
    <div className="customer-shell">
      <CustomerHeader cartCount={effectiveCartCount} username={username} />
      <div className="customer-shell__body">
        <SidebarNavigation username={username} />
        <main className="customer-page-content">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
