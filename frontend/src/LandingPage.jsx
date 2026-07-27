import React from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/styles.css';
import { LandingHeader } from './LandingHeader';
import { Footer } from './Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <LandingHeader />

      <main className="landing-hero">
        <div className="landing-hero__overlay" />
        <div className="landing-hero__content">
          <p className="landing-hero__eyebrow">About SalesSavvy</p>
          <h1 className="landing-hero__title">Discover curated collections of boy&apos;s shirts, pants, and mobile accessories.</h1>
          <p className="landing-hero__text">
            Experience premium, savvy shopping with the latest styles and must-have tech essentials.
          </p>
          <div className="landing-hero__actions">
            <button type="button" className="landing-hero__cta landing-hero__cta--primary" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button type="button" className="landing-hero__cta" onClick={() => navigate('/register')}>
              Create Account
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
