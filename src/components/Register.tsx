import React, { useState, useCallback } from 'react';
import { RegistrationData } from '../types/menu';
import { AuthService } from '../services/auth';
import './Register.css';

interface RegisterProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = React.memo(({ onSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState<RegistrationData>({
    accessCode: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'code' | 'register'>('code');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  }, []);

  const handleValidateCode = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accessCode.trim()) {
      setError('Введите код доступа');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await AuthService.validateAccessCode(formData.accessCode);
      if (isValid) {
        setStep('register');
      } else {
        setError('Неверный или уже использованный код доступа');
      }
    } catch (err) {
      setError('Ошибка при проверке кода доступа');
    } finally {
      setIsLoading(false);
    }
  }, [formData.accessCode]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError('Введите имя пользователя');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await AuthService.registerUser(formData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSuccess]);

  const handleBackToCode = useCallback(() => {
    setStep('code');
    setError('');
  }, []);

  const handleBackToLogin = useCallback(() => {
    onBackToLogin();
  }, [onBackToLogin]);

  if (step === 'code') {
    return (
      <div className="register-overlay">
        <div className="register-container">
          <div className="register-header">
            <h2>Регистрация администратора</h2>
            <p>Введите код доступа для создания аккаунта</p>
          </div>
          
          <form onSubmit={handleValidateCode} className="register-form">
            <div className="form-group">
              <label htmlFor="accessCode">Код доступа</label>
              <input
                type="text"
                id="accessCode"
                name="accessCode"
                value={formData.accessCode}
                onChange={handleInputChange}
                placeholder="Введите код доступа"
                required
                disabled={isLoading}
                className="code-input"
              />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <div className="register-actions">
              <button
                type="submit"
                className="register-button"
                disabled={isLoading || !formData.accessCode.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Проверка...
                  </>
                ) : (
                  'Проверить код'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleBackToLogin}
                className="back-button"
                disabled={isLoading}
              >
                Вернуться к входу
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="register-overlay">
      <div className="register-container">
        <div className="register-header">
          <h2>Создание аккаунта</h2>
          <p>Заполните данные для регистрации</p>
        </div>
        
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Введите имя пользователя"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email (необязательно)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Введите email"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Минимум 6 символов"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Подтверждение пароля</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Повторите пароль"
              required
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="register-actions">
            <button
              type="submit"
              className="register-button"
              disabled={isLoading || !formData.username.trim() || !formData.password || !formData.confirmPassword}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Регистрация...
                </>
              ) : (
                'Создать аккаунт'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleBackToCode}
              className="back-button"
              disabled={isLoading}
            >
              Назад
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default Register;
