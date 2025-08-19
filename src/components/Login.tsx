import React, { useState, useEffect, useCallback } from 'react';
import { LoginCredentials } from '../types/menu';
import { AuthService } from '../services/auth';
import './Login.css';

interface LoginProps {
  onLogin: (user: any) => void;
  onCancel?: () => void;
  onShowRegister: () => void;
  error?: string;
}

const Login: React.FC<LoginProps> = React.memo(({ onLogin, onCancel, onShowRegister, error: externalError }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    if (usernameInput) {
      usernameInput.focus();
    }
  }, []);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Заполните все поля');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const user = await AuthService.loginUser(credentials);
      localStorage.setItem('adminUserId', user.id);
      localStorage.setItem('adminLoginTime', Date.now().toString());
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  }, [credentials, onLogin]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  }, []);

  const handlePasswordToggle = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const handleShowRegister = useCallback(() => {
    onShowRegister();
  }, [onShowRegister]);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="login-overlay" onClick={handleCancel}>
      <div className="login-container" onClick={handleContainerClick}>
        <div className="login-header">
          <h2>Вход для администратора</h2>
          <p>Введите данные для доступа к панели управления</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              required
              placeholder="Введите имя пользователя"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              Пароль
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                placeholder="Введите пароль"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={handlePasswordToggle}
                className="password-toggle"
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="login-actions">
            <button
              type="submit"
              className="login-button"
              disabled={isLoading || !credentials.username.trim() || !credentials.password.trim()}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
                disabled={isLoading}
              >
                Отмена
              </button>
            )}
          </div>
        </form>
        
        <div className="login-footer">
          <p>Нет аккаунта?</p>
          <button
            type="button"
            onClick={handleShowRegister}
            className="register-link"
            disabled={isLoading}
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
});

export default Login;
