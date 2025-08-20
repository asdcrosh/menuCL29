import { createClient } from '@supabase/supabase-js';

// Функция для загрузки конфигурации с сервера
async function loadSupabaseConfig() {
  try {
    const response = await fetch('/api/config.php');
    if (response.ok) {
      const config = await response.json();
      
      if (config.url && config.anonKey && 
          config.url !== 'YOUR_SUPABASE_URL_HERE' && 
          config.anonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
        return createClient(config.url, config.anonKey);
      }
    }
  } catch (error) {
    console.warn('Failed to load Supabase config from server:', error);
  }
  
  // Fallback на переменные окружения
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  const isValidUrl = supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && supabaseUrl.startsWith('https://');
  const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE';

  if (isValidUrl && isValidKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return null;
}

export { loadSupabaseConfig };
