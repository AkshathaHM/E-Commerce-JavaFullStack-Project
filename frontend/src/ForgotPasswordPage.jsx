import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './assets/styles.css';
import { Toast } from './Toast';
import AuthLayout from './components/AuthLayout';
import InputField from './components/InputField';
import PasswordField from './components/PasswordField';
import PrimaryButton from './components/PrimaryButton';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const isSubmitDisabled = !username.trim() || !newPassword.trim() || !confirmPassword.trim() || isSubmitting;
  const navigate = useNavigate();
  const returnTo = location.state?.returnTo || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Password is required.';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length) {
      setFieldErrors(newErrors);
      setError('Please fix the highlighted fields.');
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
        setSuccess(true);
        setSuccessMessage('Your password has been reset successfully. You may now sign in with your new password.');
        // keep on this page and present a success state instead of immediate redirect
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
      title="Reset Password"
      subtitle="Enter your username to reset password"
      variant="customer"
      showClose={false}
      footer={
        <p className="auth-footer-copy">
          Remembered your password? <Link to={returnTo} className="form-link">Back to login</Link>
        </p>
      }
    >
      <Toast message="✅ Password reset successful" show={showToast} />
      {error && <div className="auth-alert auth-alert--error">{error}</div>}

      {success ? (
        <div className="forgot-success-card">
          <h3 className="auth-success-message">{successMessage}</h3>
          <p className="auth-success-sub">You can now return to the login screen to sign in.</p>
          <div className="auth-success-actions">
            <Link to={returnTo} className="form-link">Back to login</Link>
            <button type="button" className="form-button" onClick={() => { setSuccess(false); setUsername(''); setNewPassword(''); setConfirmPassword(''); }}>Reset another account</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
        <InputField
          id="forgotUsername"
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
          }}
          error={fieldErrors.username}
        />
        <PasswordField
          id="newPassword"
          label="New Password"
          placeholder="Create a new password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
          }}
          error={fieldErrors.newPassword}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
          }}
          error={fieldErrors.confirmPassword}
        />

        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Resetting..." disabled={isSubmitDisabled}>
          Reset Password
        </PrimaryButton>
      </form>
      )}
    </AuthLayout>
  );
}
