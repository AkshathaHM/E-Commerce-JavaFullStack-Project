import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './assets/styles.css';
import { Toast } from './Toast';
import AuthLayout from './components/AuthLayout';
import InputField from './components/InputField';
import PasswordField from './components/PasswordField';
import PrimaryButton from './components/PrimaryButton';
import { getDashboardPath, setAuthSession } from './auth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();
  const isSubmitDisabled = !username.trim() || !password.trim() || isSigningIn;

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (isSigningIn) return;

    setError('');
    setFieldErrors({});
    setIsSigningIn(true);

    if (!username.trim()) {
      setFieldErrors({ username: 'Username is required.' });
      setIsSigningIn(false);
      return;
    }

    if (!password.trim()) {
      setFieldErrors({ password: 'Password is required.' });
      setIsSigningIn(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || "Login failed");
      }

      if (String(data.role || '').toUpperCase() !== "ADMIN") {
        throw new Error("Only admin accounts can sign in here. Please use the User Login page for customer accounts.");
      }

      setAuthSession(data.token || null, { username: data.username || username, role: 'ADMIN' });
      try { const { setCache } = await import('./utils/cache'); setCache('profile_me', { username: data.username || username, role: 'ADMIN' }, 60000); } catch (e) {}
      setShowToast(true);
      navigate(getDashboardPath('ADMIN'), { state: { username: data.username || username }, replace: true });
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Login"
      subtitle="Sign in with admin credentials"
      footer={
        <p className="auth-footer-copy">
          Need a customer account? <Link to="/" className="form-link">User login</Link>
        </p>
      }
    >
      <Toast message="✅ Login Successful" show={showToast} />
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <form onSubmit={handleSignIn} className="auth-form">
        <InputField
          id="adminUsername"
          label="Username"
          placeholder="Enter your admin username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
          }}
          error={fieldErrors.username}
        />
        <PasswordField
          id="adminPassword"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
          }}
          error={fieldErrors.password}
        />
        <div className="auth-footer-row">
          <Link to="/forgot-password" state={{ returnTo: '/admin' }} className="form-link">Forgot password?</Link>
        </div>
        <PrimaryButton type="submit" isLoading={isSigningIn} loadingText="Admin Login..." disabled={isSubmitDisabled}>
          Admin Login
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}