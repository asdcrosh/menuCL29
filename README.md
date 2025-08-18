# COFFEE LIKE - Цифровое меню

Цифровое меню кофейни с возможностью управления через админ-панель и сохранением в Supabase базе данных.

## 🚀 Быстрый старт

### Настройка базы данных Supabase

1. Создайте аккаунт на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. В SQL Editor выполните скрипт из `database/schema.sql`
4. Скопируйте URL и ключ из Settings → API
5. Создайте файл `.env.local` с переменными:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### Запуск приложения:

```bash
# Установка зависимостей
npm install

# Запуск приложения
npm start
```

## 📁 Структура проекта

```
menuCL29/
├── src/
│   ├── components/        # React компоненты
│   ├── services/
│   │   └── database.ts   # Сервис для работы с Supabase
│   ├── config/
│   │   └── supabase.ts   # Конфигурация Supabase
│   ├── data/
│   │   └── menu.json     # Файл с данными меню (fallback)
│   └── types/
│       └── menu.ts       # TypeScript типы
├── database/
│   └── schema.sql        # SQL скрипт для создания таблиц
└── public/               # Статические файлы
```

## 🔧 База данных

### Таблицы:
- **restaurant** - информация о ресторане
- **categories** - категории меню
- **sub_categories** - подкатегории
- **items** - блюда/напитки

### Безопасность:
- RLS (Row Level Security) включен
- Чтение доступно всем
- Запись только авторизованным пользователям

## 💾 Сохранение данных

- Все изменения сохраняются в Supabase PostgreSQL базе данных
- Данные синхронизируются в реальном времени
- Fallback на локальный JSON файл при недоступности базы
- Автоматическое резервное копирование Supabase

## 🚀 Деплой

```bash
npm run deploy
```

Сайт будет доступен по адресу: https://asdcrosh.github.io/menuCL29

## 🛠️ Технологии

- **Frontend:** React + TypeScript
- **База данных:** Supabase (PostgreSQL)
- **Аутентификация:** Supabase Auth
- **Деплой:** GitHub Pages + GitHub Actions
