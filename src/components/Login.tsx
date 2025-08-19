import React, { useState, useEffect, useCallback } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  onCancel?: () => void;
  error?: string;
}

const Login: React.FC<LoginProps> = React.memo(({ onLogin, onCancel, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    if (usernameInput) {
      usernameInput.focus();
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      onLogin(username, password);
      setIsLoading(false);
    }, 500);
  }, [username, password, onLogin]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  }, [handleSubmit, isLoading]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handlePasswordToggle = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

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
              value={username}
              onChange={handleUsernameChange}
              onKeyPress={handleKeyPress}
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
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={handleKeyPress}
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
              disabled={isLoading || !username.trim() || !password.trim()}
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
        
        <div className="login-hint">
          <p>
            <strong>Подсказка:</strong> Используйте стандартные данные для входа
          </p>
        </div>
      </div>
    </div>
  );
});

export default Login;
