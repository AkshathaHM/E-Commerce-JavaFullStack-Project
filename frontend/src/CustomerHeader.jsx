import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartIcon } from './CartIcon';
import ThemeToggleButton from './ThemeToggleButton';
import { useCart } from './CartContext';
import SharedCartInviteFloating from './SharedCartInviteFloating';

export const CustomerHeader = memo(function CustomerHeader({ cartCount = 0, username = 'Guest' }) {
  const navigate = useNavigate();
  const { cartCount: sharedCartCount } = useCart();
  const effectiveCartCount = typeof sharedCartCount === 'number' ? sharedCartCount : cartCount;
  const effectiveUsername = username || localStorage.getItem('username') || 'Guest';

  return (
    <header className="app-header app-header--customer">
      <div className="app-header__inner">
        <button type="button" className="brand-shell" onClick={() => navigate('/customerhome')}>
          <img
            src="/logo.png"
            alt="SalesSavvy"
            className="brand-logo"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/images/no-image.png';
            }}
          />
          <span className="brand-name">SalesSavvy</span>
        </button>

        <div className="app-header__actions header-actions">
          <SharedCartInviteFloating inline />
          <CartIcon count={effectiveCartCount} />
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
});
