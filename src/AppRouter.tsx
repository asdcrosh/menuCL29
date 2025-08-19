import React from 'react';
import App from './App';
import AdminPage from './pages/AdminPage';

const AppRouter: React.FC = () => {
  const path = window.location.pathname;

  if (path === '/admin') {
    return <AdminPage />;
  }

  return <App />;
};

export default AppRouter;
