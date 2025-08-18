import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
      title={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          {theme === 'light' ? (
            <span className="toggle-icon">🌙</span>
          ) : (
            <span className="toggle-icon">☀️</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
