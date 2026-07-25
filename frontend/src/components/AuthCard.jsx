import React from 'react';

export default function AuthCard({ className = '', children }) {
  return <div className={`auth-card ${className}`.trim()}>{children}</div>;
}
