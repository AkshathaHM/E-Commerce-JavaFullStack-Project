import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import '../styles/LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '', show: false }); // Notification state
  const navigate = useNavigate();

  // Clear notification on unmount
  useEffect(() => {
    return () => setNotification({ type: '', message: '', show: false });
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message, show: true });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), type === 'success' ? 3000 : 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await userApi.login(formData);
      const { role } = response.data;
      showNotification('success', 'Login successful!'); // Green success
      setTimeout(() => {
        if (role === 'CUSTOMER') navigate('/customerhome');
        else navigate('/adminhome');
      }, 1500); // Delay redirect after notification
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid credentials';
      showNotification('error', errorMsg); // Red failure
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          {notification.type === 'error' && <button className="dismiss-btn" onClick={() => setNotification(prev => ({ ...prev, show: false }))}>×</button>}
        </div>
      )}
      <div className="form-container">
        <div className="form-card">
          <h1 className="welcome-title">Login</h1>
          <form onSubmit={handleSubmit} className="login-form">
            {errors.general && <p className="error-general">{errors.general}</p>}
            <div className="form-group">
              <label htmlFor="username" className="field-label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <p className="error-message">{errors.username}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="password" className="field-label">Password</label>
              <div className="password-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" className="eye-toggle" onClick={togglePassword}>
                  {showPassword ? 'Hide' : 'Show'} {/* Text-only toggle – no icon */}
                </button>
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            <a href="#" className="forgot-link">Forgot Password?</a>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Signing In...' : 'Log In'}
            </button>
            <div className="login-link-container">
              <a href="/register" className="login-link">New User? Sign up here</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;