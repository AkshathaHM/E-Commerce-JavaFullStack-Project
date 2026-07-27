import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import AuthCard from './AuthCard';
import ThemeToggleButton from '../ThemeToggleButton';
function AuthLayout({ title, subtitle, notice, children, footer, sidePanel, onClose }) {
  const navigate = useNavigate();
  const handleClose = onClose || (() => navigate('/'));

  return (
    <div className="auth-page" role="dialog" aria-modal="true">
      <div className="auth-page__overlay" onClick={handleClose} aria-hidden="true" />
      <ThemeToggleButton className="auth-theme-toggle" />
      <div className="auth-page__container">
        <div className={`auth-page__content${sidePanel ? ' auth-page__content--with-side' : ''}`}>
          <AuthCard className="auth-card--auth-layout auth-card--popup">
            <button type="button" className="auth-modal-close" onClick={handleClose} aria-label="Close auth modal">
              ×
            </button>
            <div className="auth-card__brand">
              <Logo showBrandText={false} />
              <div className="auth-brand-stack">
                <h2 className="auth-brand-label">SalesSavvy</h2>
                <p className="auth-brand-tagline">Secure shopping and admin access</p>
              </div>
            </div>

            <div className="auth-card__intro">
              <h1 className="auth-card__title">{title}</h1>
              <p className="auth-card__subtitle">{subtitle}</p>
              {notice && <div className="auth-card__notice">{notice}</div>}
            </div>

            {children}
            {footer && <div className="auth-card__footer">{footer}</div>}
          </AuthCard>
          {sidePanel && <div className="auth-hero-panel">{sidePanel}</div>}
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
  sidePanel: PropTypes.node,
  onClose: PropTypes.func,
};

AuthLayout.defaultProps = {
  subtitle: '',
  notice: '',
  footer: null,
  sidePanel: null,
  onClose: null,
};

export default React.memo(AuthLayout);
