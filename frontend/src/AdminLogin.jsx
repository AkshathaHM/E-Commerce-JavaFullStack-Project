import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./assets/styles.css";
import { Toast } from "./Toast";
import Logo from "./Logo";
import { setAuthSession } from "./auth";
import LoadingButton from "./components/LoadingButton";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (isSigningIn) return;

    setError(null);
    setIsSigningIn(true);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
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
    <div className="page-layout">
      <Toast message="Login Successful!" show={showToast} />
      <div className="page-container">
        <div className="form-container">
          <div className="auth-brand-header">
            <Logo />
            <div className="auth-copy-block">
              <h1 className="form-title">Welcome Back</h1>
              <p className="form-subtitle">Admin sign in to continue your SalesSavvy workspace.</p>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignIn} className="form-content">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
            </div>
            <LoadingButton type="submit" isLoading={isSigningIn} loadingText="Signing In..." className="form-button">
              Enter As Admin
            </LoadingButton>
          </form>
          <div className="form-footer">
            <Link to="/forgot-password" state={{ returnTo: "/admin" }} className="form-link">
              Forgot Password?
            </Link>
            <Link to="/" className="form-link">
              Not Admin? Login as User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}