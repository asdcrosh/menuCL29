const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'menu-db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Создаем папку data если её нет
async function ensureDataDirectory() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
  } catch (error) {
    console.log('Папка data уже существует');
  }
}

// Загружаем данные из файла
async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Если файл не существует, создаем с начальными данными
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
    
    await saveData(initialData);
    return initialData;
  }
}

// Сохраняем данные в файл
async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API Routes

// GET /api/menu - получить все данные меню
app.get('/api/menu', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/menu - обновить все данные меню
app.put('/api/menu', async (req, res) => {
  try {
    const newData = req.body;
    await saveData(newData);
    res.json({ success: true, message: 'Данные успешно сохранены' });
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
    
    await saveData(initialData);
    res.json({ success: true, message: 'Данные сброшены к исходному состоянию' });
  } catch (error) {
    console.error('Ошибка при сбросе данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Запуск сервера
async function startServer() {
  await ensureDataDirectory();
  
  app.listen(PORT, () => {
    console.log(`🚀 API сервер запущен на порту ${PORT}`);
    console.log(`📁 Данные сохраняются в: ${DATA_FILE}`);
    console.log(`🌐 API доступен по адресу: http://localhost:${PORT}/api/menu`);
  });
}

startServer().catch(console.error);
