import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <AppRouter />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Ошибка при рендеринге приложения:', error);
    root.render(
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>Произошла ошибка</h1>
        <p>Приложение не может быть загружено. Попробуйте обновить страницу.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Обновить страницу
        </button>
      </div>
    );
  }
};

renderApp();
