import PropTypes from 'prop-types';
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
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
        aria-label={revealed ? 'Hide password' : 'Show password'}
      >
        {revealed ? <FiEyeOff size={20} /> : <FiEye size={20} />}
      </button>
    </InputField>
  );
}

PasswordField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  info: PropTypes.string,
  valid: PropTypes.bool,
};
