export const getErrorMessage = (error: unknown, operation: string): string => {
  let baseMessage = `Ошибка при ${operation}. `;
  
  if (error instanceof Error) {
    if (error.message.includes('Supabase не настроен')) {
      return baseMessage + 'GitHub Secrets не настроены. Следуйте инструкции в QUICK_SETUP.md';
    } else if (error.message.includes('RLS')) {
      return baseMessage + 'Ошибка RLS. Отключите Row Level Security в Supabase.';
    } else if (error.message.includes('fetch')) {
      return baseMessage + 'Ошибка сети. Проверьте подключение к интернету.';
    } else if (error.message.includes('42501')) {
      return baseMessage + 'Ошибка доступа. Отключите RLS политики в Supabase.';
    } else if (error.message.includes('42P01')) {
      return baseMessage + 'Таблица не найдена. Проверьте, что schema.sql выполнен.';
    } else {
      return baseMessage + 'Проверьте подключение к базе данных.';
    }
  }
  
  return baseMessage + 'Неизвестная ошибка.';
};
