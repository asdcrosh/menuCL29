import React, { useState, useEffect } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  onCancel?: () => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel, error }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      onLogin(username, password);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="login-overlay" onClick={handleCancel}>
      <div className="login-container" onClick={(e) => e.stopPropagation()}>
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
              onChange={(e) => setUsername(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                placeholder="Введите пароль"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                <span className="loading-content">
                  <span className="spinner"></span>
                  Вход...
                </span>
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
                Вернуться
              </button>
            )}
          </div>
        </form>
      </div>
      

    </div>
  );
};

export default Login;
