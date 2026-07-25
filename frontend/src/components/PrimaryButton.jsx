import React from 'react';
import Button from './Button';

export default function PrimaryButton({ children, isLoading = false, loadingText, variant = 'primary', className = '', ...props }) {
  return (
    <Button
      {...props}
      variant={variant}
      isLoading={isLoading}
      loadingText={loadingText}
      className={className}
    >
      {children}
    </Button>
  );
}
