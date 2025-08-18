const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'src', 'data', 'menu.json');
const git = simpleGit();

// Middleware
app.use(cors());
app.use(express.json());

// Функция для сохранения данных и коммита в Git
async function saveDataAndCommit(data, commitMessage) {
  try {
    // Сохраняем данные в файл
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    
    // Добавляем файл в Git
    await git.add(DATA_FILE);
    
    // Коммитим изменения
    await git.commit(commitMessage);
    
    // Пушим в GitHub
    await git.push('origin', 'main');
    
    console.log(`✅ Изменения сохранены и отправлены в GitHub: ${commitMessage}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка при сохранении в Git:', error);
    return false;
  }
}

// Загружаем данные из файла
async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    throw error;
  }
}

// API Routes

// GET /api/menu - получить данные меню
app.get('/api/menu', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/menu - обновить данные меню
app.put('/api/menu', async (req, res) => {
  try {
    const newData = req.body;
    const { action, itemName } = req.query; // Получаем информацию о действии
    
    // Формируем сообщение коммита
    let commitMessage = 'Обновление меню';
    if (action && itemName) {
      switch (action) {
        case 'add':
          commitMessage = `Добавлено: ${itemName}`;
          break;
        case 'update':
          commitMessage = `Обновлено: ${itemName}`;
          break;
        case 'delete':
          commitMessage = `Удалено: ${itemName}`;
          break;
        case 'reset':
          commitMessage = 'Сброс меню к исходному состоянию';
          break;
      }
    }
    
    // Сохраняем данные и коммитим в Git
    const success = await saveDataAndCommit(newData, commitMessage);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Данные успешно сохранены и отправлены в GitHub',
        commitMessage 
      });
    } else {
      res.status(500).json({ error: 'Ошибка при сохранении в Git' });
    }
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/menu/reset - сбросить к исходным данным
app.get('/api/menu/reset', async (req, res) => {
  try {
    const initialData = {
      restaurant: {
        name: "COFFEE LIKE",
        description: "Добро пожаловать в нашу уютную кофейню! Мы предлагаем свежий кофе, вкусные блюда и приятную атмосферу."
      },
      categories: [
        {
          id: "drinks",
          name: "Напитки",
          icon: "☕",
          subCategories: [
            {
              id: "classic-drinks",
              name: "Классические напитки",
              categoryId: "drinks",
              items: [
                {
                  id: "americano",
                  name: "Американо",
                  description: "Классический эспрессо с горячей водой",
                  price: 150,
                  category: "drinks",
                  subCategory: "classic-drinks",
                  available: true
                },
                {
                  id: "cappuccino",
                  name: "Капучино",
                  description: "Эспрессо с молочной пенкой",
                  price: 180,
                  category: "drinks",
                  subCategory: "classic-drinks",
                  available: true
                }
              ]
            }
          ]
        }
      ]
    };
    
    const success = await saveDataAndCommit(initialData, 'Сброс меню к исходному состоянию');
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Меню сброшено к исходному состоянию и сохранено в GitHub' 
      });
    } else {
      res.status(500).json({ error: 'Ошибка при сбросе данных' });
    }
  } catch (error) {
    console.error('Ошибка при сбросе данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 API сервер запущен на порту ${PORT}`);
  console.log(`📁 Данные сохраняются в: ${DATA_FILE}`);
  console.log(`🌐 API доступен по адресу: http://localhost:${PORT}/api/menu`);
  console.log(`💾 Изменения автоматически сохраняются в GitHub`);
});
