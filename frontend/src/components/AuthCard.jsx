import React from 'react';

function AuthCard({ className = '', children }) {
  return <div className={`auth-card ${className}`.trim()}>{children}</div>;
}

export default React.memo(AuthCard);
