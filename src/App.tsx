import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import CategoryTabs from './components/CategoryTabs';
import SubCategorySection from './components/SubCategorySection';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import AdminButton from './components/AdminButton';
import { MenuData, Category } from './types/menu';
import menuData from './data/menu.json';
import './App.css';

const App: React.FC = () => {
  // Загружаем данные из localStorage или используем данные по умолчанию
  const getInitialData = (): MenuData => {
    const savedData = localStorage.getItem('menuData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Ошибка при загрузке данных из localStorage:', error);
        return menuData;
      }
    }
    return menuData;
  };

  const [data, setData] = useState<MenuData>(getInitialData);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Сохраняем данные в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('menuData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    // Устанавливаем первую категорию как активную при загрузке
    if (data.categories.length > 0 && !activeCategory) {
      setActiveCategory(data.categories[0].id);
    }
    // Если активная категория больше не существует, переключаемся на первую
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
    // Простая проверка авторизации (в реальном проекте используйте более безопасные методы)
    if (username === 'Skibina' && password === '3059') {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError('');
    } else {
      setLoginError('Неверное имя пользователя или пароль');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setLoginError('');
  };

  const handleUpdateData = (newData: MenuData) => {
    setData(newData);
  };

  const handleResetData = () => {
    setData(menuData);
    localStorage.removeItem('menuData');
  };

  const handleLogoClick = () => {
    // Переход на главную страницу (первая категория)
    if (data.categories.length > 0) {
      setActiveCategory(data.categories[0].id);
    }
  };

  // Если пользователь авторизован как админ, показываем админ-панель
  if (isAdmin) {
    return (
      <AdminPanel
        data={data}
        onUpdateData={handleUpdateData}
        onLogout={handleLogout}
        onLogoClick={handleLogoClick}
        onResetData={handleResetData}
      />
    );
  }

  // Если показывается форма входа
  if (showLogin) {
    return (
      <Login
        onLogin={handleLogin}
        onCancel={() => setShowLogin(false)}
        error={loginError}
      />
    );
  }

  // Основной интерфейс меню
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
