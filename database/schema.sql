-- Создание таблиц для меню кофейни

-- Таблица ресторана
CREATE TABLE restaurant (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица категорий
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица подкатегорий
CREATE TABLE sub_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица блюд
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE CASCADE,
  available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX idx_categories_order ON categories(order_index);
CREATE INDEX idx_sub_categories_category ON sub_categories(category_id);
CREATE INDEX idx_sub_categories_order ON sub_categories(order_index);
CREATE INDEX idx_items_sub_category ON items(sub_category_id);
CREATE INDEX idx_items_available ON items(available);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_restaurant_updated_at BEFORE UPDATE ON restaurant
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_categories_updated_at BEFORE UPDATE ON sub_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка начальных данных
INSERT INTO restaurant (name, description) VALUES (
  'COFFEE LIKE',
  'Добро пожаловать в нашу уютную кофейню! Мы предлагаем свежий кофе, вкусные блюда и приятную атмосферу.'
);

INSERT INTO categories (name, icon, order_index) VALUES 
  ('Напитки', '☕', 1),
  ('Супы и салаты', '🥗', 2),
  ('Брускетты и сэндвичи', '🥪', 3),
  ('Десерты', '🍰', 4);

INSERT INTO sub_categories (name, category_id, order_index) VALUES 
  ('Классические напитки', 1, 1),
  ('Фирменные напитки', 1, 2),
  ('Супы', 2, 1),
  ('Салаты', 2, 2),
  ('Брускетты', 3, 1),
  ('Сэндвичи', 3, 2),
  ('Торты', 4, 1),
  ('Выпечка', 4, 2);

INSERT INTO items (name, description, price, sub_category_id, available) VALUES 
  ('Американо', 'Классический эспрессо с горячей водой', 150.00, 1, true),
  ('Капучино', 'Эспрессо с молочной пенкой', 180.00, 1, true),
  ('Латте', 'Эспрессо с молоком и молочной пенкой', 200.00, 1, true),
  ('Карамельный маккиато', 'Эспрессо с карамельным сиропом и молоком', 220.00, 2, true),
  ('Мокко', 'Эспрессо с шоколадом и молоком', 240.00, 2, true),
  ('Томатный суп', 'Классический томатный суп с базиликом', 280.00, 3, true),
  ('Салат Цезарь', 'Салат с курицей, сыром и соусом Цезарь', 320.00, 4, true),
  ('Брускетта с томатами', 'Поджаренный хлеб с томатами, базиликом и моцареллой', 220.00, 5, true),
  ('Куриный сэндвич', 'Сэндвич с куриной грудкой, овощами и соусом', 280.00, 6, true),
  ('Шоколадный торт', 'Нежный шоколадный торт с шоколадным кремом', 180.00, 7, true),
  ('Круассан', 'Классический французский круассан', 120.00, 8, true);

-- Настройка RLS (Row Level Security) - разрешаем чтение всем, запись только авторизованным
ALTER TABLE restaurant ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Политики для чтения (всем)
CREATE POLICY "Allow public read access" ON restaurant FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON sub_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON items FOR SELECT USING (true);

-- Политики для записи (только авторизованным пользователям)
CREATE POLICY "Allow authenticated insert" ON restaurant FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON sub_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON restaurant FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON sub_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON items FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON restaurant FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON categories FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON sub_categories FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON items FOR DELETE USING (auth.role() = 'authenticated');
