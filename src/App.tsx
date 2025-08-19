import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import CategoryTabs from './components/CategoryTabs';
import SubCategorySection from './components/SubCategorySection';
import Login from './components/Login';
import Register from './components/Register';
import AdminButton from './components/AdminButton';
import { MenuData, Category, AdminUser } from './types/menu';
import { DatabaseService } from './services/database';
import { AuthService } from './services/auth';
import menuData from './data/menu.json';

import './App.css';

const App: React.FC = () => {
  const [data, setData] = useState<MenuData>(menuData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
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

  const checkAuth = useCallback(async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    loadData();
    checkAuth();
  }, [loadData, checkAuth]);

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

  const handleLogin = useCallback((user: AdminUser) => {
    setCurrentUser(user);
    setShowLogin(false);
    setLoginError('');
  }, []);

  const handleRegisterSuccess = useCallback(() => {
    setShowRegister(false);
    setShowLogin(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await AuthService.logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    }
  }, []);

  const handleShowLogin = useCallback(() => {
    setShowLogin(true);
    setShowRegister(false);
    setLoginError('');
  }, []);

  const handleShowRegister = useCallback(() => {
    setShowRegister(true);
    setShowLogin(false);
    setLoginError('');
  }, []);

  const handleCancelAuth = useCallback(() => {
    setShowLogin(false);
    setShowRegister(false);
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

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  // Если пользователь авторизован, перенаправляем на админку
  if (currentUser) {
    window.location.href = '/admin';
    return null;
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

        {showLogin && (
          <Login
            onLogin={handleLogin}
            onCancel={handleCancelAuth}
            onShowRegister={handleShowRegister}
            error={loginError}
          />
        )}

        {showRegister && (
          <Register
            onSuccess={handleRegisterSuccess}
            onBackToLogin={handleShowLogin}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default React.memo(App);
