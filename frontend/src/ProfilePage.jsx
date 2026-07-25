import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from './CustomerLayout';
import { getAuthHeaders } from './auth';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load your profile right now.');
        }

        const payload = await response.json();
        if (active) {
          setProfile(payload);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load your profile.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const profileItems = useMemo(() => [
    { label: 'Username', value: profile?.username || '—' },
    { label: 'Name', value: profile?.name || '—' },
    { label: 'Email', value: profile?.email || '—' },
    { label: 'Phone', value: profile?.mobileNumber || '—' },
    { label: 'Address', value: profile?.address || '—' },
    { label: 'Role', value: profile?.role || 'CUSTOMER' },
  ], [profile]);

  return (
    <CustomerLayout>
      <div className="main-content">
        <section className="orders-hero">
          <div>
            <p className="section-eyebrow">Profile</p>
            <h1 className="form-title">Your Account</h1>
            <p className="section-copy">Review your profile details, account status, and quick access to your recent activities.</p>
          </div>
        </section>

        {loading ? (
          <div className="profile-panel">
            <p className="section-copy">Loading your profile details…</p>
          </div>
        ) : error ? (
          <div className="profile-panel profile-panel--error">
            <h3 className="section-title">We could not load your profile</h3>
            <p>{error}</p>
            <button className="order-card-action" type="button" onClick={() => navigate('/customerhome')}>Return home</button>
          </div>
        ) : (
          <div className="profile-page-shell">
            <div className="profile-panel profile-panel--hero">
              <div>
                <p className="section-eyebrow">Account overview</p>
                <h2 className="section-title">{profile?.name || profile?.username || 'Welcome back'}</h2>
                <p className="section-copy">Your account is active and ready for smarter shopping.</p>
              </div>
              <div className="profile-badges">
                <span className="profile-badge">{profile?.role || 'CUSTOMER'}</span>
                <span className="profile-badge profile-badge--success">{profile?.verified ? 'Verified' : 'Verification pending'}</span>
              </div>
            </div>

            <div className="profile-grid">
              {profileItems.map((item) => (
                <div key={item.label} className="profile-panel profile-panel--info">
                  <span className="profile-label">{item.label}</span>
                  <strong className="profile-value">{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="profile-actions">
              <button className="order-card-action" type="button" onClick={() => navigate('/orders')}>View Orders</button>
              <button className="order-card-action order-card-action--ghost" type="button" onClick={() => navigate('/settings')}>Open Settings</button>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
