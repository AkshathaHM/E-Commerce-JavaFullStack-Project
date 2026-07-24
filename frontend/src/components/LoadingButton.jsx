import React, { memo } from 'react';

const LoadingButton = ({
  children,
  isLoading = false,
  loadingText,
  className = 'form-button',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button {...props} className={`${className}${isLoading ? ' is-loading' : ''}`} disabled={isDisabled}>
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
