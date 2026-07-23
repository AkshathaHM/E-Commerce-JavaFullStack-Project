// CategoryNavigation.jsx
import React, { useState } from 'react';
import './assets/styles.css';

export function CategoryNavigation({ selectedCategory, onCategoryClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = ['All', 'Shirts', 'Pants', 'Accessories', 'Mobiles', 'Mobile Accessories'];

  const handleCategoryClick = (category) => {
    onCategoryClick(category);
    setMenuOpen(false);
  };

  return (
    <nav className={`category-navigation ${menuOpen ? 'open' : ''}`}>
      <button type="button" className="category-toggle" onClick={() => setMenuOpen((prev) => !prev)}>
        <span>{menuOpen ? 'Hide categories' : 'Browse categories'}</span>
        <span className="hamburger-icon">{menuOpen ? '✕' : '☰'}</span>
      </button>
      <ul className={`category-list ${menuOpen ? 'open' : ''}`}>
        {categories.map((category) => (
          <li
            key={category}
            className={`category-item ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </li>
        ))}
      </ul>
    </nav>
  );
}
