import React from 'react';

export default function InputField({
  id,
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  info,
  valid,
  children,
  ...props
}) {
  const stateClass = error ? 'is-invalid' : valid ? 'is-valid' : '';

  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">
        {label}
        {info && <span className="auth-field-info">{info}</span>}
      </label>
      <div className="auth-input-wrap">
        {icon && <span className="auth-input-icon">{icon}</span>}
        {type === 'select' ? (
          <select
            id={id}
            value={value}
            onChange={onChange}
            className={`auth-input auth-select ${stateClass}`}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {children}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`auth-input ${stateClass}`}
            {...props}
          />
        )}
        {children && type !== 'select' && children}
      </div>
      {error && <p className="auth-feedback">{error}</p>}
    </div>
  );
}
