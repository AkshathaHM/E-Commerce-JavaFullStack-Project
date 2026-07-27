import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './assets/styles.css';
import { Toast } from './Toast';
import AuthLayout from './components/AuthLayout';
import OtpInput from './components/OtpInput';
import PrimaryButton from './components/PrimaryButton';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email] = useState(location.state?.email || '');
  const [role] = useState(location.state?.role || 'CUSTOMER');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [showToast, setShowToast] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [isExpired, setIsExpired] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasAutoVerified, setHasAutoVerified] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setIsExpired(true);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (otp.length === 6 && !isVerifying && !hasAutoVerified && !isExpired) {
      setHasAutoVerified(true);
      setError('');
      setMessage('');
      verifyOtpRequest(otp);
    }
  }, [otp, isVerifying, hasAutoVerified, isExpired]);

  const formattedCountdown = useMemo(() => {
    const minutes = String(Math.floor(countdown / 60)).padStart(2, '0');
    const seconds = String(countdown % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [countdown]);

  const verifyOtpRequest = async (otpCode) => {
    setIsVerifying(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed.');
      }

      setIsSuccess(true);
      setShowToast(true);
      setMessage('Your email has been verified.');
      window.setTimeout(() => {
        navigate(role === 'ADMIN' ? '/admin' : '/', { replace: true });
      }, 1800);
    } catch (err) {
      setError(err.message || 'Unable to verify the OTP.');
      setHasAutoVerified(false);
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    verifyOtpRequest(otp);
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setError('Unable to resend OTP without email.');
      return;
    }

    setError('');
    setMessage('');
    setIsResending(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Could not resend OTP.');
      }

      setCountdown(180);
      setIsExpired(false);
      setOtp('');
      setHasAutoVerified(false);
      setShowToast(true);
      setMessage(data.message || 'OTP resent successfully.');
    } catch (err) {
      setError(err.message || 'Unable to resend the OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Email"
      subtitle="Enter the OTP sent to your email"
      footer={
        <p className="auth-footer-copy">
          <Link to="/" className="form-link">Back to login</Link>
        </p>
      }
    >
      <Toast message={message || '✅ Verification successful'} show={showToast} />
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      {message && !error && !isSuccess && <div className="auth-alert auth-alert--success">{message}</div>}

      {!isSuccess ? (
        <div className="otp-verification-card auth-card--secondary">
          <div className="otp-card-header">
            <p className="otp-helper-text">We’ve sent a 6-digit verification code to</p>
            <div className="otp-email-pill">{email || 'your email address'}</div>
            <p className="otp-helper-text">Check your inbox and spam folder. The code expires in 3 minutes.</p>
          </div>
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
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
      ) : (
        <div className="otp-success-state">
          <div className="otp-success-icon">✓</div>
          <h2 className="auth-card__title">Verified successfully</h2>
          <p className="otp-helper-text">Your email is now confirmed. Redirecting to login...</p>
        </div>
      )}
    </AuthLayout>
  );
}
