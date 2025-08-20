-- Создание таблицы restaurant
CREATE TABLE restaurant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(10),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы sub_categories
CREATE TABLE sub_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы items
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE CASCADE,
    available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для улучшения производительности
CREATE INDEX idx_categories_order ON categories(order_index);
CREATE INDEX idx_sub_categories_category_id ON sub_categories(category_id);
CREATE INDEX idx_sub_categories_order ON sub_categories(order_index);
CREATE INDEX idx_items_sub_category_id ON items(sub_category_id);
CREATE INDEX idx_items_available ON items(available);

-- Вставка начальных данных
INSERT INTO restaurant (name, description) VALUES 
('COFFEE LIKE', 'Цифровое меню кофейни COFFEE LIKE');

INSERT INTO categories (name, icon, order_index) VALUES 
('Кофе', '☕', 1),
('Чай', '🫖', 2),
('Десерты', '🍰', 3),
('Закуски', '🥪', 4);

INSERT INTO sub_categories (name, category_id, order_index) VALUES 
('Эспрессо', 1, 1),
('Капучино', 1, 2),
('Латте', 1, 3),
('Черный чай', 2, 1),
('Зеленый чай', 2, 2),
('Пирожные', 3, 1),
('Печенье', 3, 2),
('Сэндвичи', 4, 1),
('Салаты', 4, 2);

INSERT INTO items (name, description, price, sub_category_id, available) VALUES 
('Эспрессо', 'Классический итальянский эспрессо', 120.00, 1, TRUE),
('Капучино', 'Эспрессо с молочной пенкой', 180.00, 2, TRUE),
('Латте', 'Эспрессо с молоком', 200.00, 3, TRUE),
('Английский завтрак', 'Крепкий черный чай', 150.00, 4, TRUE),
('Зеленый чай', 'Свежий зеленый чай', 140.00, 5, TRUE),
('Тирамису', 'Итальянский десерт', 350.00, 6, TRUE),
('Шоколадное печенье', 'Домашнее печенье', 80.00, 7, TRUE),
('Клубничный сэндвич', 'Свежий сэндвич с клубникой', 250.00, 8, TRUE),
('Цезарь', 'Классический салат Цезарь', 320.00, 9, TRUE);
