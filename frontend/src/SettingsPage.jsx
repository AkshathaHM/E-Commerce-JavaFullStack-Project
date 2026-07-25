import React from 'react';
import { CustomerLayout } from './CustomerLayout';

export default function SettingsPage() {
  return (
    <CustomerLayout>
      <section className="orders-hero">
        <div>
          <p className="section-eyebrow">Settings</p>
          <h1 className="form-title">Account Settings</h1>
          <p className="section-copy">Manage your preferences, notification settings, and app experience.</p>
        </div>
      </section>
      <div className="product-empty-state">
        <h3 className="section-title">Settings page coming soon</h3>
        <p>Customize your shopping experience here soon. For now, continue browsing products.</p>
      </div>
    </CustomerLayout>
  );
}
