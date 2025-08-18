# 🚀 Инструкция по настройке Supabase

## Шаг 1: Создание проекта на Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Войдите через GitHub или создайте аккаунт
4. Нажмите "New Project"
5. Выберите организацию или создайте новую
6. Введите название проекта: `coffee-menu`
7. Введите пароль для базы данных (запомните его!)
8. Выберите регион (ближайший к вам)
9. Нажмите "Create new project"

## Шаг 2: Создание таблиц

1. В панели Supabase перейдите в раздел **"SQL Editor"**
2. Нажмите **"New query"**
3. Скопируйте содержимое файла `database/schema.sql`
4. Вставьте в редактор и нажмите **"Run"**

Это создаст:
- ✅ Таблицу `restaurant` с информацией о кофейне
- ✅ Таблицу `categories` для категорий меню
- ✅ Таблицу `sub_categories` для подкатегорий
- ✅ Таблицу `items` для блюд и напитков
- ✅ Начальные данные (4 категории, 8 подкатегорий, 11 блюд)
- ✅ Индексы для оптимизации
- ✅ RLS политики безопасности

## Шаг 3: Получение ключей API

1. В панели Supabase перейдите в **"Settings"** → **"API"**
2. Скопируйте:
   - **Project URL** (например: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** ключ (начинается с `eyJ...`)

## Шаг 4: Настройка переменных окружения

1. В корне проекта создайте файл `.env.local`
2. Добавьте следующие строки:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Пример:**
```env
REACT_APP_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.example
```

## Шаг 5: Запуск приложения

```bash
# Установка зависимостей
npm install

# Запуск приложения
npm start
```

## Шаг 6: Тестирование

1. Откройте http://localhost:3000
2. Проверьте, что меню загружается
3. Нажмите кнопку админа (в правом нижнем углу)
4. Войдите с логином: `Skibina`, паролем: `3059`
5. Попробуйте добавить новую категорию или блюдо

## 🔧 Возможные проблемы

### Ошибка "Supabase URL или ключ не настроены"
- Проверьте файл `.env.local`
- Убедитесь, что переменные названы правильно
- Перезапустите приложение после изменения `.env.local`

### Ошибка CORS
- В Supabase перейдите в "Settings" → "API"
- В разделе "Additional Allowed Origins" добавьте:
  - `http://localhost:3000` (для разработки)
  - `https://your-domain.com` (для продакшена)

### Ошибка "relation does not exist"
- Проверьте, что SQL скрипт выполнился успешно
- В "Table Editor" должны быть таблицы: `restaurant`, `categories`, `sub_categories`, `items`

### Ошибка аутентификации
- Проверьте правильность ключей API
- Убедитесь, что RLS политики настроены правильно

## 📊 Проверка данных

В панели Supabase в разделе **"Table Editor"** вы можете:

1. **Просматривать данные** в реальном времени
2. **Редактировать записи** напрямую
3. **Добавлять новые записи** для тестирования
4. **Экспортировать данные** в CSV

## 🔒 Безопасность

- ✅ RLS (Row Level Security) включен
- ✅ Чтение доступно всем посетителям
- ✅ Запись только через админ-панель
- ✅ Автоматическое резервное копирование
- ✅ SSL шифрование всех соединений

## 🚀 Деплой

После настройки базы данных:

```bash
npm run deploy
```

Сайт будет доступен по адресу: https://asdcrosh.github.io/menuCL29

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте консоль браузера (F12)
2. Проверьте логи в панели Supabase
3. Убедитесь, что все шаги выполнены правильно
