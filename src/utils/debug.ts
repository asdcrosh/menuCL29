// Утилита для отладки переменных окружения
export const debugEnvironment = () => {
  const envVars = {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
  };

  console.log('🔍 Проверка переменных окружения:');
  console.log('REACT_APP_SUPABASE_URL:', envVars.REACT_APP_SUPABASE_URL ? '✅ Настроен' : '❌ Не настроен');
  console.log('REACT_APP_SUPABASE_ANON_KEY:', envVars.REACT_APP_SUPABASE_ANON_KEY ? '✅ Настроен' : '❌ Не настроен');
  
  // Проверяем, откуда загружаются переменные
  if (envVars.REACT_APP_SUPABASE_URL && envVars.REACT_APP_SUPABASE_ANON_KEY) {
    console.log('🎉 Все переменные окружения настроены!');
    console.log('📍 Источник: GitHub Secrets (если на GitHub Pages) или .env.local (локально)');
  } else {
    console.log('⚠️ Переменные окружения не настроены');
    console.log('📍 Используются fallback данные');
  }

  return envVars;
};
