# Настройка Supabase Storage для загрузки изображений

## Шаг 1: Создание Storage Bucket

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в раздел **Storage** в левом меню
4. Нажмите **Create a new bucket**
5. Заполните форму:
   - **Name**: `menu-images`
   - **Public bucket**: ✅ Включено (чтобы изображения были доступны публично)
   - **File size limit**: `5MB` (или больше, если нужно)
   - **Allowed MIME types**: `image/*`
6. Нажмите **Create bucket**

## Шаг 2: Настройка RLS (Row Level Security)

После создания bucket нужно настроить политики доступа:

### Политика для загрузки файлов (INSERT)
```sql
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'menu-images');
```

### Политика для чтения файлов (SELECT)
```sql
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-images');
```

### Политика для удаления файлов (DELETE)
```sql
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'menu-images');
```

## Шаг 3: Выполнение SQL команд

1. В Supabase Dashboard перейдите в **SQL Editor**
2. Создайте новый запрос
3. Вставьте все три команды выше
4. Нажмите **Run** для выполнения

## Шаг 4: Проверка настройки

После настройки вы сможете:
- ✅ Загружать изображения через форму блюд
- ✅ Просматривать загруженные изображения
- ✅ Удалять изображения при необходимости

## Альтернативный способ (если RLS не нужен)

Если вы хотите полностью отключить RLS для Storage:

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**⚠️ Внимание**: Это менее безопасно, но проще для тестирования.

## Проверка работы

1. Откройте админ-панель вашего приложения
2. Попробуйте добавить новое блюдо с изображением
3. Выберите файл изображения
4. Должно появиться сообщение "Изображение успешно загружено!"
5. URL изображения автоматически заполнится в форме

## Возможные проблемы

### Ошибка "Supabase не настроен"
- Проверьте, что переменные окружения `REACT_APP_SUPABASE_URL` и `REACT_APP_SUPABASE_ANON_KEY` настроены

### Ошибка "Ошибка загрузки: new row violates row-level security policy"
- Выполните SQL команды для настройки RLS политик (см. Шаг 2)

### Ошибка "bucket not found"
- Убедитесь, что bucket `menu-images` создан в Supabase Storage

### Изображения не отображаются
- Проверьте, что bucket настроен как публичный
- Убедитесь, что RLS политика для SELECT настроена правильно
