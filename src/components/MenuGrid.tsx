import React from 'react';
import { MenuItem as MenuItemType } from '../types/menu';
import MenuItem from './MenuItem';
import './MenuGrid.css';

interface MenuGridProps {
  items: MenuItemType[];
}

const MenuGrid: React.FC<MenuGridProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>В этой категории пока нет блюд</p>
      </div>
    );
  }

  return (
    <div className="menu-grid">
      <div className="grid-container">
        {items.map(item => (
          <div key={item.id} className="grid-item">
            <MenuItem item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuGrid;
