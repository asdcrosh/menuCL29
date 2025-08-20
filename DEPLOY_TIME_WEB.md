# Деплой на Time.web

## 0. Настройка облачного сервера в Time.web

### 0.1 Создание облачного сервера
1. **Войдите в аккаунт Time.web**: https://timeweb.com/
2. **Перейдите в раздел "Облачные серверы"** (Cloud VPS)
3. **Нажмите "Создать сервер"**
4. **Выберите конфигурацию**:
   - **ОС**: Ubuntu 22.04 LTS (рекомендуется)
   - **RAM**: минимум 1 GB
   - **CPU**: 1 ядро
   - **Диск**: 20 GB SSD
   - **Тариф**: выберите подходящий (обычно самый дешевый для начала)

### 0.2 Настройка сервера
1. **Дождитесь создания сервера** (обычно 5-10 минут)
2. **Запишите IP адрес сервера**
3. **Найдите данные для входа**:
   - Логин: обычно `root`
   - Пароль: будет отправлен на email или показан в панели

### 0.3 Подключение к серверу
1. **Через SSH** (рекомендуется):
   ```bash
   ssh root@ваш_ip_адрес
   ```
2. **Или через веб-консоль** в панели Time.web

### 0.4 Установка веб-сервера
После подключения к серверу выполните:
```bash
# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Nginx
apt install nginx -y

# Устанавливаем Node.js (для сборки проекта)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install nodejs -y

# Устанавливаем Git
apt install git -y

# Проверяем установку
nginx -v
node -v
npm -v
```

### 0.5 Настройка Nginx
```bash
# Создаем конфигурацию для вашего сайта
nano /etc/nginx/sites-available/menu

# Добавляем конфигурацию:
server {
    listen 80;
    server_name ваш_домен.com www.ваш_домен.com;
    root /var/www/menu;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Активируем сайт
ln -s /etc/nginx/sites-available/menu /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl restart nginx
```

### 0.6 Создание директории для сайта
```bash
# Создаем директорию
mkdir -p /var/www/menu

# Устанавливаем права
chown -R www-data:www-data /var/www/menu
chmod -R 755 /var/www/menu
```

## 1. Подготовка проекта

### 1.1 Обновляем package.json
Удалите или измените поле "homepage" в package.json:
```json
{
  "name": "menu-cl29",
  "version": "1.0.0",
  // Удалите или закомментируйте эту строку:
  // "homepage": "https://asdcrosh.github.io/menuCL29",
  "private": true,
  ...
}
```

### 1.2 Создаем .htaccess файл
Создайте файл `public/.htaccess`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### 1.3 Создаем переменные окружения
Создайте файл `.env.production` (НЕ добавляйте в Git):
```
REACT_APP_SUPABASE_URL=ваш_supabase_url
REACT_APP_SUPABASE_ANON_KEY=ваш_supabase_anon_key
```

## 2. Сборка проекта

```bash
# Установка зависимостей
npm install

# Сборка для продакшена
npm run build
```

## 3. Загрузка на сервер

### 3.1 Через SCP (рекомендуется)
```bash
# С вашего локального компьютера
scp -r build/* root@ваш_ip_адрес:/var/www/menu/
```

### 3.2 Через Git на сервере
```bash
# Подключитесь к серверу
ssh root@ваш_ip_адрес

# Перейдите в директорию сайта
cd /var/www/menu

# Клонируйте репозиторий
git clone https://github.com/asdcrosh/menuCL29.git .

# Установите зависимости и соберите проект
npm install
npm run build

# Скопируйте файлы из build в корень
cp -r build/* .
rm -rf build node_modules
```

### 3.3 Через SFTP клиент
1. Используйте FileZilla, WinSCP или другой SFTP клиент
2. Подключитесь к серверу:
   - Хост: ваш_ip_адрес
   - Пользователь: root
   - Пароль: ваш_пароль
3. Перейдите в `/var/www/menu`
4. Загрузите ВСЕ файлы из папки `build/`

## 4. Настройка домена

### 4.1 Подключение домена к серверу
1. **В панели Time.web**:
   - Перейдите в раздел "Домены"
   - Добавьте ваш домен
   - Укажите IP адрес вашего сервера в DNS записях

2. **Или у другого регистратора**:
   - Создайте A-запись, указывающую на IP вашего сервера
   - Например: `@ A ваш_ip_адрес`

### 4.2 Обновление конфигурации Nginx
```bash
# Отредактируйте конфигурацию
nano /etc/nginx/sites-available/menu

# Замените server_name на ваш домен:
server_name ваш_домен.com www.ваш_домен.com;

# Перезапустите Nginx
systemctl restart nginx
```

### 4.3 Настройка SSL (HTTPS)
```bash
# Установите Certbot
apt install certbot python3-certbot-nginx -y

# Получите SSL сертификат
certbot --nginx -d ваш_домен.com -d www.ваш_домен.com

# Настройте автоматическое обновление
crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 5. Проверка работы

1. Откройте ваш сайт в браузере
2. Проверьте, что меню загружается
3. Попробуйте зарегистрироваться/войти в админку
4. Проверьте консоль браузера на ошибки

## 6. Возможные проблемы

### 6.1 Ошибка 404 при переходе на /admin
Создайте файл `public_html/.htaccess`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### 6.2 Не работают переменные окружения
- Убедитесь, что файл `.env.production` создан
- Проверьте, что переменные начинаются с `REACT_APP_`
- Пересоберите проект после изменения переменных

### 6.3 Проблемы с Supabase
- Проверьте, что URL и ключи правильные
- Убедитесь, что RLS политики настроены
- Проверьте консоль браузера на ошибки CORS

## 7. Автоматизация деплоя

### 7.1 Создайте скрипт деплоя
Создайте файл `deploy.sh`:
```bash
#!/bin/bash
echo "Сборка проекта..."
npm run build

echo "Загрузка на сервер..."
# Здесь команды для загрузки через FTP/SFTP
# Например: scp -r build/* user@server:/path/to/public_html/

echo "Деплой завершен!"
```

### 7.2 Добавьте в package.json
```json
{
  "scripts": {
    "deploy": "npm run build && ./deploy.sh"
  }
}
```

## 8. SSL сертификат

1. В панели Time.web включите SSL
2. Убедитесь, что сайт работает по HTTPS
3. Обновите Supabase настройки, если нужно

## 9. Мониторинг

1. Настройте логирование ошибок
2. Регулярно проверяйте консоль браузера
3. Мониторьте производительность сайта
