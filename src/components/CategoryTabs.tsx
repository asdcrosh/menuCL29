import React, { useCallback } from 'react';
import { Category } from '../types/menu';
import './CategoryTabs.css';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(({ categories, activeCategory, onCategoryChange }) => {
  const handleCategoryClick = useCallback((categoryId: string) => {
    onCategoryChange(categoryId);
  }, [onCategoryChange]);

  return (
    <div className="category-tabs">
      <div className="container">
        <div className="tabs-container">
          {categories.map(category => (
            <button
              key={category.id}
              className={`tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <span className="tab-icon">{category.icon}</span>
              <span className="tab-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default CategoryTabs;
