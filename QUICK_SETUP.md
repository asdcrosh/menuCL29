# 🚀 Быстрая настройка GitHub Secrets

## ⚡ Пошаговая инструкция (5 минут)

### 1. Получите данные из Supabase
1. Откройте ваш проект в Supabase: https://supabase.com/dashboard
2. Перейдите в **Settings** → **API**
3. Скопируйте:
   - **Project URL** (например: `https://your-project.supabase.co`)
   - **anon public** ключ (начинается с `eyJ...`)

### 2. Добавьте секреты в GitHub
1. Откройте: https://github.com/asdcrosh/menuCL29/settings/secrets/actions
2. Нажмите **New repository secret**
3. Добавьте первый секрет:
   - **Name:** `REACT_APP_SUPABASE_URL`
   - **Value:** Ваш Project URL из Supabase
4. Нажмите **Add secret**
5. Нажмите **New repository secret** снова
6. Добавьте второй секрет:
   - **Name:** `REACT_APP_SUPABASE_ANON_KEY`
   - **Value:** Ваш anon public ключ из Supabase
7. Нажмите **Add secret**

### 3. Запустите пересборку
1. Сделайте любой push в main ветку:
   ```bash
   git add .
   git commit -m "trigger rebuild"
   git push origin main
   ```
2. Или вручную запустите Actions:
   - Перейдите в https://github.com/asdcrosh/menuCL29/actions
   - Нажмите **Run workflow** → **Run workflow**

### 4. Проверьте результат
1. Подождите 2-3 минуты (сборка)
2. Откройте: https://asdcrosh.github.io/menuCL29
3. Нажмите кнопку 🔍 **Статус ENV**
4. Должно показать: "✅ Все переменные окружения настроены!"

## 🔧 Проверка настройки

### В консоли браузера должно быть:
```
🔍 Проверка переменных окружения:
REACT_APP_SUPABASE_URL: ✅ Настроен
REACT_APP_SUPABASE_ANON_KEY: ✅ Настроен
🎉 Все переменные окружения настроены!
📍 Источник: GitHub Secrets
```

### Функциональная проверка:
- ✅ Админ-панель доступна
- ✅ Можно добавлять категории
- ✅ Можно добавлять подкатегории
- ✅ Можно добавлять блюда

## 🆘 Если не работает

### Проверьте:
1. **Правильность URL и ключа** в Supabase
2. **Названия секретов** (точно `REACT_APP_SUPABASE_URL` и `REACT_APP_SUPABASE_ANON_KEY`)
3. **Логи GitHub Actions** - есть ли ошибки при сборке
4. **RLS политики** в Supabase (должны быть отключены для демо)

### Отключите RLS в Supabase:
1. Откройте SQL Editor в Supabase
2. Выполните команды:
   ```sql
   ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
   ALTER TABLE sub_categories DISABLE ROW LEVEL SECURITY;
   ALTER TABLE items DISABLE ROW LEVEL SECURITY;
   ALTER TABLE restaurant DISABLE ROW LEVEL SECURITY;
   ```

## 📞 Поддержка

Если проблема остается:
1. Проверьте логи GitHub Actions
2. Убедитесь, что Supabase проект активен
3. Проверьте, что база данных создана (выполнен schema.sql)
