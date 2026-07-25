import React, { memo } from 'react';

const LoadingButton = ({
  children,
  isLoading = false,
  loadingText,
  className = 'button',
  disabled,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button {...props} type={type} className={`${className}${isLoading ? ' is-loading' : ''}`} disabled={isDisabled}>
      {isLoading ? (
        <span className="btn-content">
          <span className="button-spinner" aria-hidden="true" />
          <span>{loadingText || children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default memo(LoadingButton);
