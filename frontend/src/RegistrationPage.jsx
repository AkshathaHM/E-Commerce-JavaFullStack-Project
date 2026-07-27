import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './assets/styles.css';
import { Toast } from './Toast';
import AuthLayout from './components/AuthLayout';
import InputField from './components/InputField';
import PasswordField from './components/PasswordField';
import PrimaryButton from './components/PrimaryButton';
import OtpInput from './components/OtpInput';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [agreement, setAgreement] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [isExpired, setIsExpired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredRole, setRegisteredRole] = useState('CUSTOMER');
  const [showOtpPanel, setShowOtpPanel] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const passwordsMatch = password.trim() && confirmPassword.trim() && password === confirmPassword;
  const confirmPasswordError = fieldErrors.confirmPassword || (confirmPassword.trim() && password !== confirmPassword ? 'Passwords do not match.' : '');
  const isSubmitDisabled = !username.trim() || !email.trim() || !mobileNumber.trim() || !address.trim() || !password.trim() || !confirmPassword.trim() || !agreement || isSubmitting;

  const formattedCountdown = useMemo(() => {
    const minutes = String(Math.floor(countdown / 60)).padStart(2, '0');
    const seconds = String(countdown % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [countdown]);

  useEffect(() => {
    if (!showOtpPanel) return undefined;
    if (countdown <= 0) {
      setIsExpired(true);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown, showOtpPanel]);

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, otp }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed.');
      }

      setOtpMessage('Your email is verified. Redirecting to sign in...');
      setTimeout(() => {
        navigate(registeredRole === 'ADMIN' ? '/admin' : '/', { replace: true });
      }, 1400);
    } catch (err) {
      setError(err.message || 'Unable to verify the OTP.');
      setOtp('');
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!registeredEmail) {
      setError('Unable to resend OTP without email address.');
      return;
    }

    setError('');
    setOtpMessage('');
    setIsResending(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Could not resend OTP.');
      }

      setOtp('');
      setCountdown(180);
      setIsExpired(false);
      setOtpMessage(data.message || 'Verification code resent.');
    } catch (err) {
      setError(err.message || 'Unable to resend the OTP.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email.';
    }

    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!phoneRegex.test(mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number.';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required.';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreement) {
      newErrors.agreement = 'You must agree to the Terms & Conditions.';
    }

    if (Object.keys(newErrors).length) {
      setFieldErrors(newErrors);
      setError('Please fix the highlighted fields.');
      return;
    }

    if (!role) {
      setRole('CUSTOMER');
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          address,
          mobileNumber,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setShowToast(true);
        setRegisteredEmail(email);
        setRegisteredRole(role);
        setShowOtpPanel(true);
        setOtp('');
        setCountdown(180);
        setIsExpired(false);
        setOtpMessage('A verification code has been sent to your email.');
      } else {
        throw new Error(data.error || data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register for SalesSavvy"
      footer={
        <p className="auth-footer-copy">
          Already have an account? <Link to="/" className="form-link">User login</Link>
          <br />
          Need admin access? <Link to="/admin" className="form-link">Admin login</Link>
        </p>
      }
    >
      <Toast message="✅ Registration Successful" show={showToast} />
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <form onSubmit={handleSignUp} className="auth-form">
        <InputField
          id="username"
          label="Username"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <InputField
          id="email"
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          id="mobileNumber"
          label="Mobile Number"
          type="tel"
          placeholder="Enter mobile number"
          value={mobileNumber}
          onChange={(e) => {
            setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
            if (fieldErrors.mobileNumber) setFieldErrors((prev) => ({ ...prev, mobileNumber: '' }));
          }}
          error={fieldErrors.mobileNumber}
        />
        <InputField
          id="address"
          label="Address"
          placeholder="123 Main Street"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: '' }));
          }}
          error={fieldErrors.address}
        />
        <InputField
          id="role"
          label="Role"
          type="select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Select role I want"
        >
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </InputField>
        <PasswordField
          id="password"
          label="Password"
          placeholder="Create password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
          }}
          error={fieldErrors.password}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => {
            const value = e.target.value;
            setConfirmPassword(value);
            setFieldErrors((prev) => {
              const next = { ...prev };
              if (next.confirmPassword) delete next.confirmPassword;
              return next;
            });
            if (value.trim() && password.trim() && value !== password) {
              setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
            }
          }}
          error={confirmPasswordError}
          valid={passwordsMatch}
          info={passwordsMatch ? 'Passwords match.' : undefined}
        />
        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) => {
              setAgreement(e.target.checked);
              if (fieldErrors.agreement) setFieldErrors((prev) => ({ ...prev, agreement: '' }));
            }}
          />
          I agree to the Terms & Conditions
        </label>
        {fieldErrors.agreement && <p className="auth-feedback">{fieldErrors.agreement}</p>}

        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Registering..." disabled={isSubmitDisabled}>
          Register
        </PrimaryButton>
      </form>
    ) : (
      <div className="otp-verification-card auth-card--secondary">
        <div className="otp-card-header">
          <p className="otp-helper-text">A verification code was sent to</p>
          <div className="otp-email-pill">{registeredEmail}</div>
          <p className="otp-helper-text">Enter the 6-digit code to complete registration.</p>
        </div>
        {error && <div className="auth-alert auth-alert--error">{error}</div>}
        {otpMessage && <div className="auth-alert auth-alert--success">{otpMessage}</div>}
        <form onSubmit={handleVerifyOtp} className="auth-form">
          <div className="form-group">
            <label className="form-label">Verification code</label>
            <OtpInput value={otp} onChange={setOtp} length={6} disabled={isVerifying} />
          </div>
          <div className="otp-countdown-box">
            <span className={`otp-countdown-label ${isExpired ? 'expired' : ''}`}>Expires in</span>
            <span className="otp-countdown-value">{isExpired ? '00:00' : formattedCountdown}</span>
          </div>
          <div className="otp-actions">
            <PrimaryButton type="submit" isLoading={isVerifying} loadingText="Verifying...">
              Verify OTP
            </PrimaryButton>
            <PrimaryButton type="button" variant="secondary" isLoading={isResending} loadingText="Resending..." onClick={handleResendOtp}>
              Resend OTP
            </PrimaryButton>
          </div>
        </form>
      </div>
    )}
    </AuthLayout>
  );
}
