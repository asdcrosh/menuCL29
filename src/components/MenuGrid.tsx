import React from 'react';
import { MenuItem as MenuItemType } from '../types/menu';
import MenuItem from './MenuItem';
import './MenuGrid.css';

interface MenuGridProps {
  items: MenuItemType[];
  title?: string;
}

const MenuGrid: React.FC<MenuGridProps> = React.memo(({ items, title }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="menu-grid-section">
      {title && <h3 className="grid-title">{title}</h3>}
      <div className="menu-grid">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
});

export default MenuGrid;
