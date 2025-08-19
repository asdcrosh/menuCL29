import React, { useCallback } from 'react';
import { SubCategory } from '../types/menu';
import './SubCategoryTabs.css';

interface SubCategoryTabsProps {
  subCategories: SubCategory[];
  activeSubCategory: string;
  onSubCategoryChange: (subCategoryId: string) => void;
}

const SubCategoryTabs: React.FC<SubCategoryTabsProps> = React.memo(({ 
  subCategories, 
  activeSubCategory, 
  onSubCategoryChange 
}) => {
  const handleSubCategoryClick = useCallback((subCategoryId: string) => {
    onSubCategoryChange(subCategoryId);
  }, [onSubCategoryChange]);

  return (
    <div className="subcategory-tabs">
      <div className="subcategory-tabs-container">
        {subCategories.map(subCategory => (
          <button
            key={subCategory.id}
            className={`subcategory-tab ${activeSubCategory === subCategory.id ? 'active' : ''}`}
            onClick={() => handleSubCategoryClick(subCategory.id)}
          >
            <span className="subcategory-tab-name">{subCategory.name}</span>
            <span className="subcategory-tab-count">{subCategory.items.length}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

export default SubCategoryTabs;
