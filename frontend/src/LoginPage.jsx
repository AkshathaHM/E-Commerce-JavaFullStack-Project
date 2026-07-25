import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./assets/styles.css";
import { Toast } from "./Toast";
import AuthLayout from "./components/AuthLayout";
import InputField from "./components/InputField";
import PasswordField from "./components/PasswordField";
import PrimaryButton from "./components/PrimaryButton";
import { getDashboardPath, setAuthSession } from "./auth";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (isSigningIn) return;

    setError("");
    setIsSigningIn(true);

    if (!identifier.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: identifier, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || "Invalid credentials.");
      }

      const role = data.role || "CUSTOMER";
      setAuthSession(data.token || null, { username: data.username || identifier, role });
      setShowToast(true);
      navigate(getDashboardPath(role), { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <AuthLayout
      title="User login"
      subtitle="Sign in with your SalesSavvy username and password."
      footer={
        <p className="auth-footer-copy">
          Need admin access? <Link to="/admin" className="form-link">Admin login</Link>
          <br />
          Don’t have an account? <Link to="/register" className="form-link">Create account</Link>
        </p>
      }
    >
      <Toast message="✅ Login Successful" show={showToast} />
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <form onSubmit={handleSignIn} className="auth-form">
        <InputField
          id="username"
          label="Username"
          placeholder="Enter username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="auth-footer-row">
          <Link to="/forgot-password" className="form-link">Forgot password?</Link>
        </div>
        <PrimaryButton type="submit" isLoading={isSigningIn} loadingText="Logging in...">
          Login
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
