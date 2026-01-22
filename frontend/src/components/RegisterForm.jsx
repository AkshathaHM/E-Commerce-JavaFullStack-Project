import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import '../styles/RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
  });
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
    if (!formData.username || formData.username.length < 3) newErrors.username = 'Username must be 3+ characters';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.password || formData.password.length < 3) newErrors.password = 'Password must be 3+ characters'; // Updated to 3+ chars only
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await userApi.register(formData);
      showNotification('success', 'Registration successful! Please login.'); // Green success
      setTimeout(() => navigate('/login'), 1500); // Delay redirect after notification
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      showNotification('error', errorMsg); // Red failure
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          {notification.type === 'error' && <button className="dismiss-btn" onClick={() => setNotification(prev => ({ ...prev, show: false }))}>×</button>}
        </div>
      )}
      <div className="form-container">
        <div className="form-card">
          <h1 className="welcome-title">Register</h1>
          <form onSubmit={handleSubmit} className="register-form">
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
              <label htmlFor="email" className="field-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
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
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="role" className="field-label">Role</label>
              <select
                id="role"
                name="role"
                className={`form-select ${errors.role ? 'error' : ''}`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            <div className="register-link-container">
              <a href="/login" className="register-link">Already a user? Log in here</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;