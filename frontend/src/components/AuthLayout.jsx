import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AuthCard from './AuthCard';
function AuthLayout({ title, subtitle, notice, children, footer, onClose, variant }) {
  const navigate = useNavigate();
  const handleClose = onClose || (() => navigate(variant === 'admin' ? '/admin' : '/'));
  // keep a ref to the latest handleClose so our mount-only effect can call the current function
  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;
  const brandTarget = variant === 'admin' ? '/admin' : '/';
  const dialogRef = useRef(null);

  // Run focus-trap & body-scroll lock only on mount to avoid stealing focus on every re-render.
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
        // call the latest handleClose from ref
        handleCloseRef.current && handleCloseRef.current();
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow || 'auto';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-page" role="dialog" aria-modal="true">
      <div className="auth-page__overlay" onClick={handleClose} aria-hidden="true" />
      <div className="auth-page__container" ref={dialogRef}>
        <div className="auth-page__content">
          <AuthCard className="auth-card--auth-layout auth-card--popup">
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
