import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const loadData = async () => {
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
    };

    loadData();
  }, []);

  useEffect(() => {
    if (data.categories.length > 0 && !activeCategory) {
      setActiveCategory(data.categories[0].id);
    }
    if (data.categories.length > 0 && activeCategory && !data.categories.find(cat => cat.id === activeCategory)) {
      setActiveCategory(data.categories[0].id);
    }
  }, [data.categories, activeCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const getCurrentCategory = (): Category | null => {
    return data.categories.find(cat => cat.id === activeCategory) || null;
  };

  const handleLogin = (username: string, password: string) => {
    if (username === 'admin' && password === 'password') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      setShowLogin(false);
      setLoginError('');
    } else {
      setLoginError('Неверное имя пользователя или пароль');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setLoginError('');
  };

  const handleUpdateData = async (newData: MenuData, action?: string, itemName?: string) => {
    try {
      setData(newData);
    } catch (err) {
      alert('Ошибка при сохранении данных. Попробуйте еще раз.');
    }
  };



  const handleLogoClick = () => {
    if (data.categories.length > 0) {
      setActiveCategory(data.categories[0].id);
    }
  };

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
        onCancel={() => setShowLogin(false)}
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
        <button onClick={() => window.location.reload()}>Обновить страницу</button>
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
            {getCurrentCategory() && (
              <SubCategorySection 
                subCategories={getCurrentCategory()!.subCategories}
                categoryName={getCurrentCategory()!.name}
              />
            )}
            {getCurrentCategory()?.subCategories.length === 0 && (
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

export default App;
