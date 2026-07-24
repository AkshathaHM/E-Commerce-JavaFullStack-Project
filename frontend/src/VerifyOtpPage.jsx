import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./assets/styles.css";
import { Toast } from "./Toast";
import OtpInput from "./components/OtpInput";
import LoadingButton from "./components/LoadingButton";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [role] = useState(location.state?.role || "CUSTOMER");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
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

  // Auto-verify OTP when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && !isVerifying && !hasAutoVerified && !isExpired) {
      setHasAutoVerified(true);
      setError(null);
      setMessage(null);
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      setIsSuccess(true);
      setShowToast(true);
      setMessage("Email verified successfully.");
      window.setTimeout(() => {
        navigate(role === "ADMIN" ? "/admin" : "/", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || "Unable to verify the OTP.");
      setHasAutoVerified(false);
      setOtp("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    verifyOtpRequest(otp);
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email to resend OTP.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsResending(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not resend OTP");
      }

      setCountdown(180);
      setIsExpired(false);
      setOtp("");
      setHasAutoVerified(false);
      setShowToast(true);
      setMessage(data.message || "New OTP sent successfully.");
    } catch (err) {
      setError(err.message || "Unable to resend the OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="page-container">
      <Toast message={message || "Registration successful"} show={showToast} />
      <div className="otp-verification-card">
        <div className="otp-card-header">
          <h1 className="form-title">Verify Your Email</h1>
          <p className="otp-helper-text">We’ve sent a 6-digit verification code to</p>
          <div className="otp-email-pill">{email || "your email address"}</div>
          <p className="otp-helper-text">Please check your inbox and spam folder if you do not see it. The code is valid for 3 minutes.</p>
        </div>

        {error && <p className="error-message">{error}</p>}
        {message && !error && <p className="success-message">{message}</p>}

        {!isSuccess ? (
          <form onSubmit={handleVerifyOtp} className="form-content otp-form-content">
            <div className="otp-countdown-box">
              <span className={`otp-countdown-label ${isExpired ? 'expired' : ''}`}>OTP expires in</span>
              <span className="otp-countdown-value">{isExpired ? '00:00' : formattedCountdown}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <OtpInput value={otp} onChange={setOtp} length={6} disabled={isVerifying} />
            </div>

            {isVerifying && otp.length === 6 && (
              <div className="otp-auto-verify-state">
                <div className="otp-spinner"></div>
                <p className="otp-verifying-text">Verifying...</p>
              </div>
            )}

            <div className="otp-actions">
              <LoadingButton type="submit" isLoading={isVerifying} loadingText="Verifying..." className="form-button">
                Verify OTP
              </LoadingButton>
              <LoadingButton type="button" isLoading={isResending} loadingText="Sending OTP..." className="form-button secondary" onClick={handleResendOtp}>
                Resend OTP
              </LoadingButton>
            </div>

            {isExpired && (
              <p className="otp-expired-message">OTP has expired. Please resend a new code.</p>
            )}
          </form>
        ) : (
          <div className="otp-success-state">
            <div className="otp-success-icon">✓</div>
            <h2>Email Verified Successfully</h2>
            <p>Your account has been verified successfully.</p>
            <p className="otp-success-subtext">Redirecting to Login...</p>
          </div>
        )}

        <p className="form-footer">
          <Link to="/" className="form-link">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
