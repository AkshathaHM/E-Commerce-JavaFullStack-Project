// RegistrationPage.jsx
import React, { useState } from 'react';
import './assets/styles.css';
import { useNavigate, Link } from 'react-router-dom';
import { Toast } from './Toast';
import Logo from './Logo';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password, role, address }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setShowToast(true);
        navigate('/verify-otp', { state: { email, role }, replace: true });
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <Toast message="Registration Successful!" show={showToast} />
      <div className="form-container">
        <div className="auth-brand-header">
          <Logo />
          <div className="auth-copy-block">
            <h1 className="form-title">Join the SalesSavvy Family</h1>
            <p className="form-subtitle">Create your free SalesSavvy account and unlock a smarter way to shop.</p>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignUp} className="form-content">
          <div className="form-group">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
            >
              <option value="CUSTOMER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
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
            <label htmlFor="address" className="form-label">Address</label>
            <input
              id="address"
              type="text"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
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
          <button type="submit" className="form-button">Sign Up</button>
        </form>
        <p className="form-footer">
          Already a user?{' '}
          <Link to="/" className="form-link">Log in here</Link>
        </p>
        <p className="form-footer">
          Need admin access?{' '}
          <Link to="/admin" className="form-link">Go to Admin Login</Link>
        </p>
      </div>
    </div>
  );
}
