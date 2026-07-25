import React from 'react';
import Logo from '../Logo';
import AuthCard from './AuthCard';

export default function AuthLayout({ title, subtitle, notice, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <AuthCard>
          <div className="auth-card__brand">
            <Logo />
            <div className="auth-card__brand-copy">
              <p className="auth-brand-label">SalesSavvy</p>
              <p className="auth-brand-subtitle">Smart Online Shopping Platform</p>
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
      </div>
    </div>
  );
}
