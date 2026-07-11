// RegistrationPage.jsx
import React, { useState } from 'react';
import './assets/styles.css';
import { useNavigate } from 'react-router-dom';
import { Toast } from './Toast';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`,{
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setShowToast(true);
        setTimeout(() => {
          if (role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1500);
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
        <h1 className="form-title">Register</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignUp} className="form-content">
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
          <div className="form-group">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="form-select"
            >
              <option value="" disabled>Select your role</option>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="form-button">Sign Up</button>
        </form>
        <p className="form-footer">
          Already a user?{' '}
          <a href="/" className="form-link">Log in here</a>
        </p>
      </div>
    </div>
  );
}
