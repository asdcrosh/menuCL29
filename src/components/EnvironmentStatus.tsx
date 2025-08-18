import React, { useState, useEffect } from 'react';
import './EnvironmentStatus.css';

interface EnvironmentStatusProps {
  isVisible?: boolean;
}

const EnvironmentStatus: React.FC<EnvironmentStatusProps> = ({ isVisible = false }) => {
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
    supabaseKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
  });

  useEffect(() => {
    // Обновляем статус при изменении переменных окружения
    setEnvStatus({
      supabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
      supabaseKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
    });
  }, []);

  if (!isVisible) return null;

  const allConfigured = envStatus.supabaseUrl && envStatus.supabaseKey;
  const source = process.env.NODE_ENV === 'production' ? 'GitHub Secrets' : '.env.local';

  return (
    <div className="environment-status">
      <div className="status-header">
        <h4>🔍 Статус переменных окружения</h4>
        <span className={`status-indicator ${allConfigured ? 'success' : 'warning'}`}>
          {allConfigured ? '✅ Настроено' : '⚠️ Не настроено'}
        </span>
      </div>
      
      <div className="status-details">
        <div className="status-item">
          <span>REACT_APP_SUPABASE_URL:</span>
          <span className={envStatus.supabaseUrl ? 'success' : 'error'}>
            {envStatus.supabaseUrl ? '✅ Настроен' : '❌ Не настроен'}
          </span>
        </div>
        
        <div className="status-item">
          <span>REACT_APP_SUPABASE_ANON_KEY:</span>
          <span className={envStatus.supabaseKey ? 'success' : 'error'}>
            {envStatus.supabaseKey ? '✅ Настроен' : '❌ Не настроен'}
          </span>
        </div>
        
        <div className="status-item">
          <span>Источник:</span>
          <span className="info">{source}</span>
        </div>
      </div>

      {allConfigured && (
        <div className="status-message success">
          🎉 Все переменные окружения настроены! Приложение работает с Supabase.
        </div>
      )}
      
      {!allConfigured && (
        <div className="status-message warning">
          ⚠️ Переменные окружения не настроены. Используются локальные данные.
        </div>
      )}
    </div>
  );
};

export default EnvironmentStatus;
