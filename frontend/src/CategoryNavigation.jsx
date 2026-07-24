// CategoryNavigation.jsx
import React from 'react';
import './assets/styles.css';

const CategoryButton = React.memo(({ category, isActive, onClick }) => (
  <li key={category}>
    <button
      type="button"
      className={`category-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(category)}
      aria-pressed={isActive}
    >
      {category}
    </button>
  </li>
));

CategoryButton.displayName = 'CategoryButton';

export const CategoryNavigation = React.memo(({ selectedCategory, onCategoryClick }) => {
  const categories = ['All', 'Shirts', 'Pants', 'Accessories', 'Mobiles', 'Mobile Accessories'];

  return (
    <nav className="category-navigation" aria-label="Category navigation">
      <ul className="category-list">
        {categories.map((category) => (
          <CategoryButton
            key={category}
            category={category}
            isActive={selectedCategory === category}
            onClick={onCategoryClick}
          />
        ))}
      </ul>
    </nav>
  );
});

CategoryNavigation.displayName = 'CategoryNavigation';
