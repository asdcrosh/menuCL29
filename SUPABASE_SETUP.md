# Настройка Supabase для меню кофейни

## Шаг 1: Создание аккаунта на Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Войдите через GitHub или создайте аккаунт
4. Создайте новый проект

## Шаг 2: Настройка базы данных

1. В панели Supabase перейдите в раздел "SQL Editor"
2. Скопируйте содержимое файла `database/schema.sql`
3. Вставьте и выполните SQL скрипт

## Шаг 3: Получение ключей API

1. В панели Supabase перейдите в "Settings" → "API"
2. Скопируйте:
   - **Project URL** (например: `https://your-project.supabase.co`)
   - **anon public** ключ

## Шаг 4: Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Шаг 5: Настройка аутентификации (опционально)

Для полной функциональности админ-панели:

1. В Supabase перейдите в "Authentication" → "Settings"
2. Включите "Enable email confirmations" если нужно
3. Создайте пользователя в "Authentication" → "Users"

## Шаг 6: Тестирование

1. Запустите приложение: `npm start`
2. Проверьте, что данные загружаются из базы
3. Попробуйте добавить/редактировать элементы через админ-панель

## Структура базы данных

### Таблицы:
- **restaurant** - информация о ресторане
- **categories** - категории меню
- **sub_categories** - подкатегории
- **items** - блюда/напитки

### Безопасность:
- RLS (Row Level Security) включен
- Чтение доступно всем
- Запись только авторизованным пользователям

## Возможные проблемы

### Ошибка CORS:
- В Supabase перейдите в "Settings" → "API"
- Добавьте ваш домен в "Additional Allowed Origins"

### Ошибка аутентификации:
- Проверьте правильность ключей API
- Убедитесь, что RLS политики настроены правильно

## Дополнительные настройки

### Реальное время:
Supabase поддерживает обновления в реальном времени. Для включения:

```typescript
// В компоненте
useEffect(() => {
  const subscription = supabase
    .channel('menu_changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      // Перезагрузить данные
      loadData();
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### Загрузка изображений:
Для загрузки изображений используйте Supabase Storage:

```typescript
// Загрузка файла
const { data, error } = await supabase.storage
  .from('menu-images')
  .upload('filename.jpg', file);

// Получение URL
const { data: { publicUrl } } = supabase.storage
  .from('menu-images')
  .getPublicUrl('filename.jpg');
```
