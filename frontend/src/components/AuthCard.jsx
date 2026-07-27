import React from 'react';

function AuthCard({ className = '', children }) {
  return (
    <div className={`auth-card ${className}`.trim()}>
      <div className="auth-card__scroll">{children}</div>
    </div>
  );
}

export default React.memo(AuthCard);
