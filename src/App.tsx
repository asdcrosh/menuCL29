import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import CategoryTabs from './components/CategoryTabs';
import SubCategorySection from './components/SubCategorySection';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import AdminButton from './components/AdminButton';
import { MenuData, Category } from './types/menu';
import { DatabaseService } from './services/database';
import menuData from './data/menu.json';

import './App.css';

const App: React.FC = () => {
  const [data, setData] = useState<MenuData>(menuData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(() => {
    const savedAdminState = localStorage.getItem('isAdmin');
    const savedLoginTime = localStorage.getItem('adminLoginTime');
    
    if (savedAdminState === 'true' && savedLoginTime) {
      const timeSinceLogin = Date.now() - parseInt(savedLoginTime);
      const sessionTimeout = 8 * 60 * 60 * 1000;
      
      if (timeSinceLogin < sessionTimeout) {
        return true;
      } else {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminLoginTime');
        return false;
      }
    }
    
    return false;
  });
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getMenuData();
      setData(data);
      setError(null);
    } catch (err) {
      setData(menuData);
      setError('База данных недоступна. Используются локальные данные.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (data.categories.length > 0 && !activeCategory) {
      setActiveCategory(data.categories[0].id);
    }
    if (data.categories.length > 0 && activeCategory && !data.categories.find(cat => cat.id === activeCategory)) {
      setActiveCategory(data.categories[0].id);
    }
  }, [data.categories, activeCategory]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  const currentCategory = useMemo((): Category | null => {
    return data.categories.find(cat => cat.id === activeCategory) || null;
  }, [data.categories, activeCategory]);

  const handleLogin = useCallback((username: string, password: string) => {
    if (username === 'admin' && password === 'password') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      setShowLogin(false);
      setLoginError('');
    } else {
      setLoginError('Неверное имя пользователя или пароль');
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
  }, []);

  const handleShowLogin = useCallback(() => {
    setShowLogin(true);
    setLoginError('');
  }, []);

  const handleUpdateData = useCallback(async (newData: MenuData, action?: string, itemName?: string) => {
    try {
      setData(newData);
    } catch (err) {
      alert('Ошибка при сохранении данных. Попробуйте еще раз.');
    }
  }, []);

  const handleLogoClick = useCallback(() => {
    if (data.categories.length > 0) {
      setActiveCategory(data.categories[0].id);
    }
  }, [data.categories]);

  const handleCancelLogin = useCallback(() => {
    setShowLogin(false);
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  if (isAdmin) {
    return (
      <AdminPanel
        data={data}
        onUpdateData={handleUpdateData}
        onLogout={handleLogout}
        onLogoClick={handleLogoClick}
      />
    );
  }

  if (showLogin) {
    return (
      <Login
        onLogin={handleLogin}
        onCancel={handleCancelLogin}
        error={loginError}
      />
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка меню...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Режим только чтение</h2>
        <p>{error}</p>
        <p>Админ-панель недоступна без настройки базы данных.</p>
        <button onClick={handleReload}>Обновить страницу</button>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="app">
        <Header restaurant={data.restaurant} onLogoClick={handleLogoClick} />
        <CategoryTabs
          categories={data.categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="menu-content">
          <div className="container">
            {currentCategory && (
              <SubCategorySection 
                subCategories={currentCategory.subCategories}
                categoryName={currentCategory.name}
              />
            )}
            {currentCategory?.subCategories.length === 0 && (
              <div className="empty-state">
                <p>В этой категории пока нет подкатегорий</p>
              </div>
            )}
          </div>
        </div>
        <AdminButton onLogin={handleShowLogin} />
      </div>
    </ThemeProvider>
  );
};

export default React.memo(App);
