import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./assets/styles.css";
import { Toast } from "./Toast";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const savedEmail = location.state?.email || window.localStorage.getItem("registrationEmail") || "";
  const savedRole = location.state?.role || "CUSTOMER";
  const [email, setEmail] = useState(savedEmail);
  const [role] = useState(savedRole);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.successMessage || null);
  const [showToast, setShowToast] = useState(!!location.state?.successMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (email && email.trim()) {
      window.localStorage.setItem("registrationEmail", email.trim());
    }
  }, [email]);

  useEffect(() => {
    if (!showToast) {
      return;
    }
    const timer = window.setTimeout(() => setShowToast(false), 4000);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      window.localStorage.removeItem("registrationEmail");
      setShowToast(true);
      setMessage("Registration successful. Redirecting to login...");
      navigate(role === "ADMIN" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not resend OTP");
      }

      const successMessage = data.message || "OTP resent successfully. Check your email.";
      setMessage(successMessage);
      setShowToast(true);
    } catch (err) {
      setError(err.message);
      setShowToast(false);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="page-container">
      <Toast message={message || "Registration successful"} show={showToast} />
      <div className="form-container">
        <h1 className="form-title">Verify Your Email</h1>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <form onSubmit={handleVerifyOtp} className="form-content">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="otp" className="form-label">OTP Code</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              className="form-input"
            />
          </div>
          <div className="otp-actions">
            <button type="submit" className="form-button" disabled={isSubmitting}>
              {isSubmitting ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending || isSubmitting}
              className="form-button secondary"
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </form>
        <p className="form-footer">
          <Link to="/" className="form-link">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
