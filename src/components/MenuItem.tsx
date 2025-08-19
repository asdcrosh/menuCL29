import React from 'react';
import { MenuItem as MenuItemType } from '../types/menu';
import ImageWithFallback from './ImageWithFallback';
import './MenuItem.css';

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = React.memo(({ item }) => {
  return (
    <div className={`menu-item ${!item.available ? 'unavailable' : ''}`}>
      <div className="menu-item-image">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="menu-item-img"
        />
        {!item.available && (
          <div className="unavailable-overlay">
            Недоступно
          </div>
        )}
      </div>
      <div className="menu-item-content">
        <div className="menu-item-header">
          <h3 className="menu-item-name">{item.name}</h3>
          <span className="menu-item-price">{item.price} ₽</span>
        </div>
        <p className="menu-item-description">{item.description}</p>
      </div>
    </div>
  );
});

export default MenuItem;
