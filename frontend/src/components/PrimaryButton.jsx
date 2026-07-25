import React from 'react';
import LoadingButton from './LoadingButton';

export default function PrimaryButton({ children, isLoading = false, loadingText, variant = 'primary', className = '', ...props }) {
  const baseClass = variant === 'secondary' ? 'form-button secondary-button' : 'form-button';
  return (
    <LoadingButton
      {...props}
      disabled={props.disabled || isLoading}
      isLoading={isLoading}
      loadingText={loadingText}
      className={`${baseClass} ${className}`.trim()}
    >
      {children}
    </LoadingButton>
  );
}
