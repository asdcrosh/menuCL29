#!/bin/bash

echo "🚀 Начинаем деплой на Time.web Cloud Server..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Убедитесь, что вы в корне проекта."
    exit 1
fi

# Создаем резервную копию текущего package.json
echo "📋 Создаем резервную копию package.json..."
cp package.json package.json.backup

# Заменяем package.json на версию для Time.web
echo "🔄 Заменяем package.json на версию для Time.web..."
cp package-timeweb.json package.json

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Собираем проект
echo "🔨 Собираем проект..."
npm run build

# Проверяем, что сборка прошла успешно
if [ ! -d "build" ]; then
    echo "❌ Ошибка: папка build не создана. Проверьте ошибки сборки."
    # Восстанавливаем оригинальный package.json
    cp package.json.backup package.json
    exit 1
fi

echo "✅ Сборка завершена успешно!"

# Восстанавливаем оригинальный package.json
echo "🔄 Восстанавливаем оригинальный package.json..."
cp package.json.backup package.json

echo ""
echo "📁 Файлы готовы для загрузки в папке 'build/'"
echo ""
echo "📋 Следующие шаги для облачного сервера:"
echo ""
echo "1️⃣ Создание облачного сервера:"
echo "   - Войдите в аккаунт Time.web"
echo "   - Перейдите в 'Облачные серверы'"
echo "   - Создайте сервер с Ubuntu 22.04"
echo ""
echo "2️⃣ Настройка сервера:"
echo "   - Подключитесь по SSH: ssh root@ваш_ip"
echo "   - Установите Nginx: apt install nginx -y"
echo "   - Установите Node.js: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && apt install nodejs -y"
echo ""
echo "3️⃣ Загрузка файлов:"
echo "   - Через SCP: scp -r build/* root@ваш_ip:/var/www/menu/"
echo "   - Или через SFTP клиент (FileZilla, WinSCP)"
echo ""
echo "4️⃣ Настройка домена:"
echo "   - Добавьте домен в панели Time.web"
echo "   - Укажите IP сервера в DNS"
echo "   - Настройте SSL: certbot --nginx -d ваш_домен.com"
echo ""
echo "🌐 После загрузки проверьте:"
echo "- Открывается ли главная страница"
echo "- Работает ли переход на /admin"
echo "- Работает ли регистрация/авторизация"
echo ""
echo "🎉 Деплой завершен!"
