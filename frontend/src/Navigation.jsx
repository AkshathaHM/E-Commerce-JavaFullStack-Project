import React from 'react';
import { NavLink } from 'react-router-dom';
import './assets/styles.css';

const links = [
  { to: '/customerhome', label: 'Home' },
  { to: '/orders', label: 'Orders' },
  { to: '/UserCartPage', label: 'Cart' },
];

export function Navigation() {
  return (
    <nav className="customer-navigation" aria-label="Customer navigation">
      <div className="customer-navigation__inner">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `customer-nav-link${isActive ? ' active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
