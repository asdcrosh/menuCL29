import React from 'react';
import { MenuData } from '../types/menu';
import ThemeToggle from './ThemeToggle';
import './Header.css';

interface HeaderProps {
  restaurant: MenuData['restaurant'];
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ restaurant, onLogoClick }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="restaurant-info">
            <h1 className="restaurant-name">{restaurant.name}</h1>
            <p className="restaurant-description">{restaurant.description}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
