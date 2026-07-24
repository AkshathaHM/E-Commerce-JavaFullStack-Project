import React, { memo, useRef, useState } from 'react';

const OtpInput = ({ value, onChange, length = 6, disabled = false }) => {
  const [otp, setOtp] = useState(value?.split('') || []);
  const inputRefs = useRef([]);

  const updateOtp = (nextOtp) => {
    const normalized = nextOtp.slice(0, length).join('');
    setOtp(nextOtp);
    onChange(normalized);
  };

  const handleChange = (index, event) => {
    const digit = event.target.value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    onChange(nextOtp.join(''));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      const nextOtp = [...otp];
      nextOtp[index - 1] = '';
      setOtp(nextOtp);
      onChange(nextOtp.join(''));
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const nextOtp = Array.from({ length }, (_, idx) => pasted[idx] || '');
    setOtp(nextOtp);
    onChange(nextOtp.join(''));
    const lastFilledIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  return (
    <div className="otp-input-row" aria-label="OTP verification input">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={otp[index] || ''}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          disabled={disabled}
          className="otp-input-box"
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default memo(OtpInput);
