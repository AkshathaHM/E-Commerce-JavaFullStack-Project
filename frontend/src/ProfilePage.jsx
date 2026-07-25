import React from 'react';
import { CustomerLayout } from './CustomerLayout';

export default function ProfilePage() {
  return (
    <CustomerLayout>
      <section className="orders-hero">
        <div>
          <p className="section-eyebrow">Profile</p>
          <h1 className="form-title">Your Account</h1>
          <p className="section-copy">View your personal details, update your preferences, and manage your account settings.</p>
        </div>
      </section>
      <div className="product-empty-state">
        <h3 className="section-title">Profile page coming soon</h3>
        <p>We’re setting up your profile details. Check back later or continue shopping.</p>
      </div>
    </CustomerLayout>
  );
}
