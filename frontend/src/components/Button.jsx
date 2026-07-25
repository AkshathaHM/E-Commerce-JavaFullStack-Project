import React from 'react';
import LoadingButton from './LoadingButton';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <LoadingButton
      {...props}
      type={type}
      className={classes}
      isLoading={isLoading}
      loadingText={loadingText}
      disabled={props.disabled || isLoading}
    >
      {children}
    </LoadingButton>
  );
}
