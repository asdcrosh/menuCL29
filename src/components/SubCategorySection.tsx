import React, { useState, useMemo, useCallback } from 'react';
import { SubCategory } from '../types/menu';
import MenuGrid from './MenuGrid';
import MenuCarousel from './MenuCarousel';
import SubCategoryTabs from './SubCategoryTabs';
import './SubCategorySection.css';

interface SubCategorySectionProps {
  subCategories: SubCategory[];
  categoryName: string;
}

const SubCategorySection: React.FC<SubCategorySectionProps> = React.memo(({ subCategories, categoryName }) => {
  const [activeSubCategory, setActiveSubCategory] = useState(subCategories[0]?.id || '');
  
  const currentSubCategory = useMemo(() => {
    return subCategories.find(sub => sub.id === activeSubCategory) || subCategories[0];
  }, [subCategories, activeSubCategory]);
  
  const handleSubCategoryChange = useCallback((subCategoryId: string) => {
    setActiveSubCategory(subCategoryId);
  }, []);
  
  if (!currentSubCategory) {
    return null;
  }

  return (
    <div className="subcategory-section">
      <div className="desktop-view">
        {subCategories.map(subCategory => (
          <div key={subCategory.id} className="desktop-subcategory">
            <h4 className="desktop-subcategory-title">{subCategory.name}</h4>
            <MenuGrid items={subCategory.items} />
          </div>
        ))}
      </div>
      <div className="mobile-view">
        <SubCategoryTabs
          subCategories={subCategories}
          activeSubCategory={activeSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
        />
        <MenuGrid items={currentSubCategory.items} title={currentSubCategory.name} />
      </div>
    </div>
  );
});

export default SubCategorySection;
