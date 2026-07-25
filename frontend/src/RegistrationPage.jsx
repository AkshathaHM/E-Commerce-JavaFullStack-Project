import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './assets/styles.css';
import { Toast } from './Toast';
import AuthLayout from './components/AuthLayout';
import InputField from './components/InputField';
import PasswordField from './components/PasswordField';
import PrimaryButton from './components/PrimaryButton';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [agreement, setAgreement] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!phoneRegex.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!role) {
      setError('Please select a role.');
      return;
    }

    if (!agreement) {
      setError('You must agree to the Terms & Conditions.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          address,
          mobileNumber,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setShowToast(true);
        navigate('/verify-otp', { state: { email, role }, replace: true });
      } else {
        throw new Error(data.error || data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register a user or admin account for SalesSavvy."
      footer={
        <p className="auth-footer-copy">
          Already have an account? <Link to="/" className="form-link">User login</Link>
          <br />
          Need admin access? <Link to="/admin" className="form-link">Admin login</Link>
        </p>
      }
    >
      <Toast message="✅ Registration Successful" show={showToast} />
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <form onSubmit={handleSignUp} className="auth-form">
        <InputField
          id="username"
          label="Username"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <InputField
          id="email"
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          id="mobileNumber"
          label="Mobile Number"
          type="tel"
          placeholder="9876543210"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
        />
        <InputField
          id="address"
          label="Address"
          placeholder="123 Main Street"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <InputField
          id="role"
          label="Role"
          type="select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Select role"
        >
          <option value="">Select role</option>
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </InputField>
        <PasswordField
          id="password"
          label="Password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) => setAgreement(e.target.checked)}
          />
          I agree to the Terms & Conditions
        </label>

        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Registering...">
          Register
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
