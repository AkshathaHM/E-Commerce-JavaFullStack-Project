import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/styles.css';
import { LandingHeader } from './LandingHeader';
import { Footer } from './Footer';
import AuthLayout from './components/AuthLayout';
import InputField from './components/InputField';
import PasswordField from './components/PasswordField';
import PrimaryButton from './components/PrimaryButton';
import { Toast } from './Toast';
import { getDashboardPath, setAuthSession } from './auth';

const HERO_IMAGES = [
  '/landing-images/shirts.jpg',
  '/landing-images/pants.jpg',
  '/landing-images/phone.jpg',
  '/landing-images/phones.avif',
  '/landing-images/tvs.webp',
  '/landing-images/laps.jpg',
  '/landing-images/Gemini_Generated_Image_9xwq8q9xwq8q9xwq.png',
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [authError, setAuthError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  const [signin, setSignin] = useState({ identifier: '', password: '' });
  const [signup, setSignup] = useState({ username: '', email: '', mobileNumber: '', address: '', role: 'CUSTOMER', password: '', confirmPassword: '', agreement: false });
  const [adminLogin, setAdminLogin] = useState({ username: '', password: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentImageIndex((index) => (index + 1) % HERO_IMAGES.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toastVisible) return undefined;
    const timeout = window.setTimeout(() => setToastVisible(false), 2800);
    return () => window.clearTimeout(timeout);
  }, [toastVisible]);

  const openModal = (type) => {
    setActiveModal(type);
    setAuthError('');
    setFieldErrors({});
  };

  const closeModal = () => {
    setActiveModal(null);
    setAuthError('');
    setFieldErrors({});
    setIsSubmitting(false);
    setIsAdminSubmitting(false);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setAuthError('');
    setFieldErrors({});

    if (!signin.identifier.trim()) {
      setFieldErrors({ identifier: 'Username is required.' });
      return;
    }
    if (!signin.password.trim()) {
      setFieldErrors({ password: 'Password is required.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: signin.identifier, password: signin.password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.message || 'Invalid credentials.');

      const role = String(data.role || 'CUSTOMER').toUpperCase();
      if (role === 'ADMIN') throw new Error('Admin accounts must use Admin Sign In.');

      setAuthSession(data.token || null, { username: data.username || signin.identifier, role });
      showToast('✅ Login Successful');
      window.setTimeout(() => {
        closeModal();
        navigate(getDashboardPath(role), { replace: true });
      }, 900);
    } catch (err) {
      setAuthError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setAuthError('');
    const errors = {};

    if (!signup.username.trim()) errors.username = 'Username is required.';
    if (!signup.email.trim()) errors.email = 'Email is required.';
    else if (!emailRegex.test(signup.email)) errors.email = 'Enter a valid email.';
    if (!signup.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required.';
    else if (!phoneRegex.test(signup.mobileNumber)) errors.mobileNumber = 'Enter a valid 10-digit mobile number.';
    if (!signup.address.trim()) errors.address = 'Address is required.';
    if (!signup.password.trim()) errors.password = 'Password is required.';
    else if (signup.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (!signup.confirmPassword.trim()) errors.confirmPassword = 'Confirm password is required.';
    else if (signup.password !== signup.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (!signup.agreement) errors.agreement = 'You must agree to the Terms & Conditions.';

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setAuthError('Please fix the highlighted fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: signup.username,
          email: signup.email,
          password: signup.password,
          role: signup.role,
          address: signup.address,
          mobileNumber: signup.mobileNumber,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.message || 'Registration failed.');

      showToast('✅ Registration successful');
      window.setTimeout(() => {
        closeModal();
        navigate('/verify-otp', {
          state: { email: signup.email, role: signup.role, message: 'A verification code has been sent to your email.' },
          replace: true,
        });
      }, 900);
    } catch (err) {
      setAuthError(err.message || 'Unable to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    if (isAdminSubmitting) return;

    setAuthError('');
    setFieldErrors({});

    if (!adminLogin.username.trim()) {
      setFieldErrors({ username: 'Username is required.' });
      return;
    }
    if (!adminLogin.password.trim()) {
      setFieldErrors({ password: 'Password is required.' });
      return;
    }

    setIsAdminSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: adminLogin.username, password: adminLogin.password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.message || 'Login failed.');
      if (String(data.role || '').toUpperCase() !== 'ADMIN') throw new Error('Only admin accounts can sign in here.');

      setAuthSession(data.token || null, { username: data.username || adminLogin.username, role: 'ADMIN' });
      showToast('✅ Admin login successful');
      window.setTimeout(() => {
        closeModal();
        navigate(getDashboardPath('ADMIN'), { replace: true });
      }, 900);
    } catch (err) {
      setAuthError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const isSignupSubmitDisabled = !signup.username.trim() || !signup.email.trim() || !signup.mobileNumber.trim() || !signup.address.trim() || !signup.password.trim() || !signup.confirmPassword.trim() || !signup.agreement || isSubmitting;
  const isSigninSubmitDisabled = !signin.identifier.trim() || !signin.password.trim() || isSubmitting;
  const isAdminSubmitDisabled = !adminLogin.username.trim() || !adminLogin.password.trim() || isAdminSubmitting;

  const authSidePanel = (
    <div className="auth-hero-panel">
      <div>
        <p className="section-eyebrow">SalesSavvy access</p>
        <h2 className="panel-title">
          {activeModal === 'signup' ? 'Join the smartest shopping experience' : activeModal === 'signin' ? 'Welcome back to SalesSavvy' : 'Admin portal access'}
        </h2>
        <p className="panel-copy">
          Secure your account instantly and enjoy curated fashion, fast checkout, and exclusive offers.
        </p>
        <ul className="panel-feature-list">
          <li>Real-time orders and status updates</li>
          <li>Access curated collections and latest deals</li>
          <li>Secure login with modern styling</li>
        </ul>
      </div>
      <img
        src="/landing-images/phones.avif"
        alt="SalesSavvy premium shopping experience"
        className="auth-hero-panel__illustration"
      />
    </div>
  );

  return (
    <div className="landing-page">
      <LandingHeader onOpenModal={openModal} />

      <main className="landing-hero">
        {HERO_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`landing-hero__bg${index === currentImageIndex ? ' landing-hero__bg--active' : ''}`}
            style={{ backgroundImage: `url('${src}')` }}
            aria-hidden="true"
          />
        ))}

        <div className="landing-hero__overlay" />
        <div className="landing-hero__content">
          <p className="landing-hero__eyebrow">ABOUT SALESSVVY</p>
          <h1 className="landing-hero__title">Discover curated collections of boy&apos;s shirts, pants, and mobile accessories.</h1>
          <p className="landing-hero__text">
            Experience premium, savvy shopping with the latest styles and must-have tech essentials.
          </p>
        </div>
        <div className="landing-hero__pager" aria-label="Landing slideshow navigation">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`landing-hero__pager-dot${index === currentImageIndex ? ' landing-hero__pager-dot--active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </main>

      <Footer />

      {activeModal && (
        <AuthLayout
          title={activeModal === 'signup' ? 'Create your account' : activeModal === 'signin' ? 'Sign In' : 'Admin Sign In'}
          subtitle={
            activeModal === 'signup'
              ? 'Register for SalesSavvy'
              : activeModal === 'signin'
              ? 'Sign in to your account'
              : 'Sign in with admin credentials'
          }
          variant={activeModal === 'admin' ? 'admin' : 'customer'}
          onClose={closeModal}
          sidePanel={authSidePanel}
          footer={
            activeModal === 'signup' ? (
              <p className="auth-footer-copy">
                Already have an account? <button type="button" className="form-link button-link" onClick={() => openModal('signin')}>Sign In</button>
              </p>
            ) : activeModal === 'signin' ? (
              <p className="auth-footer-copy">
                Don’t have an account? <button type="button" className="form-link button-link" onClick={() => openModal('signup')}>Create account</button>
              </p>
            ) : (
              <p className="auth-footer-copy">
                Need a customer account? <button type="button" className="form-link button-link" onClick={() => openModal('signin')}>User Sign In</button>
              </p>
            )
          }
        >
          <Toast message={toastMessage} show={toastVisible} />
          {authError && <div className="auth-alert auth-alert--error">{authError}</div>}
          {activeModal === 'signup' && (
            <form onSubmit={handleSignUp} className="auth-form">
              <InputField
                id="landingUsername"
                label="Username"
                placeholder="Enter username"
                value={signup.username}
                onChange={(e) => {
                  setSignup((prev) => ({ ...prev, username: e.target.value }));
                  if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
                }}
                error={fieldErrors.username}
              />
              <InputField
                id="landingEmail"
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={signup.email}
                onChange={(e) => {
                  setSignup((prev) => ({ ...prev, email: e.target.value }));
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={fieldErrors.email}
              />
              <InputField
                id="landingMobileNumber"
                label="Mobile Number"
                type="tel"
                placeholder="1234567890"
                value={signup.mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setSignup((prev) => ({ ...prev, mobileNumber: value }));
                  if (fieldErrors.mobileNumber) setFieldErrors((prev) => ({ ...prev, mobileNumber: '' }));
                }}
                error={fieldErrors.mobileNumber}
              />
              <InputField
                id="landingAddress"
                label="Address"
                placeholder="123 Main Street"
                value={signup.address}
                onChange={(e) => {
                  setSignup((prev) => ({ ...prev, address: e.target.value }));
                  if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: '' }));
                }}
                error={fieldErrors.address}
              />
              <InputField
                id="landingRole"
                label="Role"
                type="select"
                value={signup.role}
                onChange={(e) => setSignup((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
              </InputField>
              <PasswordField
                id="landingPassword"
                label="Password"
                placeholder="Create password"
                value={signup.password}
                onChange={(e) => {
                  setSignup((prev) => ({ ...prev, password: e.target.value }));
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={fieldErrors.password}
              />
              <PasswordField
                id="landingConfirmPassword"
                label="Confirm Password"
                placeholder="Confirm password"
                value={signup.confirmPassword}
                onChange={(e) => {
                  setSignup((prev) => ({ ...prev, confirmPassword: e.target.value }));
                  if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                error={fieldErrors.confirmPassword}
              />
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={signup.agreement}
                  onChange={(e) => setSignup((prev) => ({ ...prev, agreement: e.target.checked }))}
                />
                I agree to the Terms & Conditions.
              </label>
              {fieldErrors.agreement && <p className="auth-feedback">{fieldErrors.agreement}</p>}
              <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Creating account..." disabled={isSignupSubmitDisabled}>
                Sign Up
              </PrimaryButton>
            </form>
          )}

          {activeModal === 'signin' && (
            <form onSubmit={handleSignIn} className="auth-form">
              <InputField
                id="landingLoginUsername"
                label="Username"
                placeholder="Enter username"
                value={signin.identifier}
                onChange={(e) => {
                  setSignin((prev) => ({ ...prev, identifier: e.target.value }));
                  if (fieldErrors.identifier) setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                }}
                error={fieldErrors.identifier}
              />
              <PasswordField
                id="landingLoginPassword"
                label="Password"
                placeholder="Enter password"
                value={signin.password}
                onChange={(e) => {
                  setSignin((prev) => ({ ...prev, password: e.target.value }));
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={fieldErrors.password}
              />
              <div className="auth-footer-row">
                <button type="button" className="form-link button-link" onClick={() => { closeModal(); navigate('/forgot-password'); }}>
                  Forgot password?
                </button>
              </div>
              <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Signing in..." disabled={isSigninSubmitDisabled}>
                Sign In
              </PrimaryButton>
            </form>
          )}

          {activeModal === 'admin' && (
            <form onSubmit={handleAdminSignIn} className="auth-form">
              <InputField
                id="landingAdminUsername"
                label="Username"
                placeholder="Enter your admin username"
                value={adminLogin.username}
                onChange={(e) => {
                  setAdminLogin((prev) => ({ ...prev, username: e.target.value }));
                  if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
                }}
                error={fieldErrors.username}
              />
              <PasswordField
                id="landingAdminPassword"
                label="Password"
                placeholder="Enter your password"
                value={adminLogin.password}
                onChange={(e) => {
                  setAdminLogin((prev) => ({ ...prev, password: e.target.value }));
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={fieldErrors.password}
              />
              <div className="auth-footer-row">
                <button type="button" className="form-link button-link" onClick={() => { closeModal(); navigate('/forgot-password'); }}>
                  Forgot password?
                </button>
              </div>
              <PrimaryButton type="submit" isLoading={isAdminSubmitting} loadingText="Signing in..." disabled={isAdminSubmitDisabled}>
                Admin Sign In
              </PrimaryButton>
            </form>
          )}
        </AuthLayout>
      )}
    </div>
  );
}
