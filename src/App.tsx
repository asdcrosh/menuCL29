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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Загружаем данные из базы данных при загрузке приложения
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getMenuData();
        setData(data);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке данных из базы:', err);
        // Fallback к локальным данным
        setData(menuData);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const handleUpdateData = async (newData: MenuData, action?: string, itemName?: string) => {
    try {
      // Обновляем локальное состояние
      setData(newData);
      
      // Здесь можно добавить логику для сохранения в базу данных
      // Пока что просто обновляем локальное состояние
      console.log('Данные обновлены:', action, itemName);
    } catch (err) {
      console.error('Ошибка при сохранении данных:', err);
      alert('Ошибка при сохранении данных. Попробуйте еще раз.');
    }
  };

  const handleResetData = async () => {
    try {
      await DatabaseService.resetToInitialData();
      const resetData = await DatabaseService.getMenuData();
      setData(resetData);
    } catch (err) {
      console.error('Ошибка при сбросе данных:', err);
      alert('Ошибка при сбросе данных. Попробуйте еще раз.');
    }
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

  // Показываем загрузку
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка меню...</p>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="error-screen">
        <h2>Ошибка загрузки</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
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
