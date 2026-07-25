import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './assets/styles.css';
import { Toast } from './Toast';
import AuthLayout from './components/AuthLayout';
import InputField from './components/InputField';
import PasswordField from './components/PasswordField';
import PrimaryButton from './components/PrimaryButton';

const calculateStrength = (password) => {
  if (!password) return '';
  if (password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) {
    return 'Strong';
  }
  if (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
    return 'Good';
  }
  return 'Weak';
};

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = location.state?.returnTo || '/';

  const strengthLabel = useMemo(() => calculateStrength(newPassword), [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword }),
      });

      if (response.ok) {
        setShowToast(true);
        navigate(returnTo, { replace: true });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your username and set a secure new password."
      footer={
        <p className="auth-footer-copy">
          Remembered your password? <Link to={returnTo} className="form-link">Back to login</Link>
        </p>
      }
    >
      <Toast message="✅ Password reset successful" show={showToast} />
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <InputField
          id="forgotUsername"
          label="Username"
          icon="👤"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordField
          id="newPassword"
          label="New Password"
          placeholder="Create a new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div className="password-strength-row">
          <span className="password-strength-label">Strength:</span>
          <span className={`password-strength-value password-strength-value--${strengthLabel.toLowerCase()}`}>{strengthLabel || 'Enter a password'}</span>
        </div>
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Resetting...">
          Reset Password
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
