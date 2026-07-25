import React, { useState } from 'react';
import InputField from './InputField';

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  info,
  valid,
  ...props
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <InputField
      id={id}
      label={label}
      type={revealed ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      info={info}
      valid={valid}
      {...props}
    >
      <button
        type="button"
        className="password-toggle"
        onClick={() => setRevealed((current) => !current)}
      >
        {revealed ? 'Hide' : 'Show'}
      </button>
    </InputField>
  );
}
