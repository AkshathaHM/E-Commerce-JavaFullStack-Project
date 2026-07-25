import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './assets/styles.css';
import { Toast } from './Toast';
import AuthLayout from './components/AuthLayout';
import InputField from './components/InputField';
import PasswordField from './components/PasswordField';
import PrimaryButton from './components/PrimaryButton';
import { setAuthSession } from './auth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (isSigningIn) return;

    setError('');
    setIsSigningIn(true);

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
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

      if (data.role !== "ADMIN") {
        throw new Error("Only admin can log in from this page.");
      }

      setAuthSession(data.token || null, { username: data.username || username, role: 'ADMIN' });
      setShowToast(true);
      navigate("/admindashboard", { state: { username: data.username || username }, replace: true });
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <AuthLayout
      title="Admin sign in"
      subtitle="Secure access to the SalesSavvy admin console."
      notice="Only registered admin users may continue from this page."
      footer={
        <p className="auth-footer-copy">
          Not an admin? <Link to="/" className="form-link">Login as customer</Link>
        </p>
      }
    >
      <Toast message="✅ Login Successful" show={showToast} />
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <form onSubmit={handleSignIn} className="auth-form">
        <InputField
          id="adminUsername"
          label="Username"
          icon="👤"
          placeholder="Enter your admin username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordField
          id="adminPassword"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="auth-footer-row">
          <Link to="/forgot-password" state={{ returnTo: '/admin' }} className="form-link">
            Forgot Password?
          </Link>
        </div>
        <PrimaryButton type="submit" isLoading={isSigningIn} loadingText="Signing In...">
          Sign In
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}