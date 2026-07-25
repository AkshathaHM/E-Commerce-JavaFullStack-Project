import React, { useMemo, useState } from 'react';
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userName = useMemo(() => {
    const combined = `${firstName.trim()} ${lastName.trim()}`.trim();
    return combined || email.split('@')[0] || '';
  }, [firstName, lastName, email]);

  const passwordStrength = useMemo(() => {
    if (password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return 'Strong';
    }
    if (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
      return 'Good';
    }
    if (password.length > 0) {
      return 'Weak';
    }
    return '';
  }, [password]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!phoneRegex.test(mobileNumber)) {
      setError('Please enter a valid 10-digit phone number.');
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
          username: userName,
          email,
          password,
          role: 'CUSTOMER',
          address,
          mobileNumber,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setShowToast(true);
        navigate('/verify-otp', { state: { email, role: 'CUSTOMER' }, replace: true });
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
      subtitle="Start shopping smarter with a SalesSavvy customer account."
      footer={
        <p className="auth-footer-copy">
          Already have an account? <Link to="/" className="form-link">Login</Link>
        </p>
      }
    >
      <Toast message="✅ Registration Successful" show={showToast} />
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <form onSubmit={handleSignUp} className="auth-form">
        <div className="auth-form-row">
          <InputField
            id="firstName"
            label="First Name"
            icon="👤"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <InputField
            id="lastName"
            label="Last Name"
            icon="👤"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <InputField
          id="email"
          label="Email"
          icon="📧"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          id="mobileNumber"
          label="Phone"
          icon="📱"
          type="tel"
          placeholder="9876543210"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="password-strength-row">
          <span className="password-strength-label">Strength:</span>
          <span className={`password-strength-value password-strength-value--${passwordStrength.toLowerCase()}`}> {passwordStrength || 'Enter password'} </span>
        </div>
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <InputField
          id="address"
          label="Address (optional)"
          icon="🏠"
          placeholder="123 Main Street"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <InputField
          id="gender"
          label="Gender (optional)"
          icon="⚧"
          type="select"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          placeholder="Select gender"
        >
          <option value="">Select gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </InputField>

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
