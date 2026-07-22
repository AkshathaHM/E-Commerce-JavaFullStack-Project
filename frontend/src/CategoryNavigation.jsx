// CategoryNavigation.jsx
import React from 'react';
import './assets/styles.css';

export function CategoryNavigation({ selectedCategory, onCategoryClick }) {
  const categories = ['All', 'Shirts', 'Pants', 'Accessories', 'Mobiles', 'Mobile Accessories'];

  return (
    <nav className="category-navigation">
      <ul className="category-list">
        {categories.map((category) => (
          <li
            key={category}
            className={`category-item ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryClick(category)}
          >
            {category}
          </li>
        ))}
      </ul>
    </nav>
  );
}
