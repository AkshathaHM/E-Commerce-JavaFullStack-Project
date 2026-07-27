import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AuthCard from './AuthCard';
function AuthLayout({ title, subtitle, notice, children, footer, onClose, variant }) {
  const navigate = useNavigate();
  const handleClose = onClose || (() => navigate(variant === 'admin' ? '/admin' : '/'));
  const brandTarget = variant === 'admin' ? '/admin' : '/';
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!dialogRef.current) return undefined;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    const container = dialogRef.current;
    const focusableElements = Array.from(container.querySelectorAll(focusableSelectors.join(',')));
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }

      if (event.key !== 'Tab' || focusableElements.length === 0) {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  return (
    <div className="auth-page" role="dialog" aria-modal="true">
      <div className="auth-page__overlay" onClick={handleClose} aria-hidden="true" />
      <div className="auth-page__container" ref={dialogRef}>
        <div className="auth-page__content">
          <AuthCard className="auth-card--auth-layout auth-card--popup">
            <button type="button" className="auth-modal-close" onClick={handleClose} aria-label="Close auth modal">
              ×
            </button>
            <div className="auth-card__brand">
              <button
                type="button"
                className="brand-shell auth-brand-shell"
                onClick={() => navigate(brandTarget)}
                aria-label="Go to SalesSavvy homepage"
              >
                <img
                  src="/logo.png"
                  alt="SalesSavvy"
                  className="brand-logo"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = '/images/no-image.png';
                  }}
                />
                <div className="auth-brand-name-group">
                  <span className="brand-name">SalesSavvy</span>
                  {variant === 'admin' && <span className="admin-badge auth-admin-badge">Admin</span>}
                </div>
              </button>
            </div>

            <div className="auth-card__intro">
              <h1 className="auth-card__title">{title}</h1>
              <p className="auth-card__subtitle">{subtitle}</p>
              {notice && <div className="auth-card__notice">{notice}</div>}
            </div>

            {children}
            {footer && <div className="auth-card__footer">{footer}</div>}
          </AuthCard>
        </div>
      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  notice: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['customer', 'admin']),
};

AuthLayout.defaultProps = {
  subtitle: '',
  notice: '',
  footer: null,
  onClose: null,
  variant: 'customer',
};

export default React.memo(AuthLayout);
