import React, { useState, useEffect, useCallback } from 'react';
import { AdminUser } from '../types/menu';
import { AuthService } from '../services/auth';
import AdminPanel from '../components/AdminPanel';
import { MenuData } from '../types/menu';
import { DatabaseService } from '../services/database';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser) {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (err) {
        setError('Ошибка аутентификации');
        setLoading(false);
      }
    };

    const loadData = async () => {
      try {
        const menuData = await DatabaseService.getMenuData();
        setData(menuData);
      } catch (err) {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    loadData();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await AuthService.logout();
      window.location.href = '/';
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    }
  }, []);

  const handleUpdateData = useCallback(async (newData: MenuData, action?: string, itemName?: string) => {
    try {
      setData(newData);
    } catch (err) {
      alert('Ошибка при сохранении данных. Попробуйте еще раз.');
    }
  }, []);

  const handleLogoClick = useCallback(() => {
    if (data?.categories.length) {
      // Можно добавить логику для сброса к первой категории
    }
  }, [data]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка админ-панели...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/'}>
          Вернуться на главную
        </button>
      </div>
    );
  }

  if (!user || !data) {
    return (
      <div className="admin-error">
        <h2>Доступ запрещен</h2>
        <p>Необходима авторизация</p>
        <button onClick={() => window.location.href = '/'}>
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminPanel
        data={data}
        onUpdateData={handleUpdateData}
        onLogout={handleLogout}
        onLogoClick={handleLogoClick}
        currentUser={user}
      />
    </div>
  );
};

export default AdminPage;
