-- Slipknot Shop database schema
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city VARCHAR(120) NOT NULL,
    street VARCHAR(200) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    comment TEXT,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS sizes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC(10, 2) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    stock_count INTEGER DEFAULT 0 NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    size_id INTEGER REFERENCES sizes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS order_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status_id INTEGER NOT NULL REFERENCES order_statuses(id),
    address_id INTEGER REFERENCES user_addresses(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(100),
    shipping_status VARCHAR(120) DEFAULT 'Готовится к отправке' NOT NULL,
    shipping_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    comment TEXT,
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (wishlist_id, product_id)
);

-- Seed data in Russian
INSERT INTO roles (name) VALUES
    ('Администратор'),
    ('Менеджер'),
    ('Покупатель')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description) VALUES
    ('Одежда', 'Футболки, худи и другая одежда с символикой Slipknot'),
    ('Аксессуары', 'Бейсболки, браслеты, значки и другие аксессуары'),
    ('Музыка', 'Винил, CD и кассеты'),
    ('Коллекционные предметы', 'Эксклюзивные предметы и лимитированные издания')
ON CONFLICT (name) DO NOTHING;

INSERT INTO sizes (name)
SELECT size_name
FROM (VALUES ('XS'), ('S'), ('M'), ('L'), ('XL')) AS predefined(size_name)
WHERE NOT EXISTS (
    SELECT 1 FROM sizes s WHERE s.name = predefined.size_name
);

INSERT INTO order_statuses (name) VALUES
    ('Новый'),
    ('В обработке'),
    ('Отправлен'),
    ('Доставлен'),
    ('Отменен')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (name, email, password_hash, phone, country, city, address, role_id)
VALUES
    (
        'Алексей Админ',
        'admin@slipknot-shop.ru',
        '$2b$10$W7sSfO96GfWMYdBTtJR70Oy7/ayMYbg7K4Y3QxcJ2DsbSxhVhoGQi',
        '+7 (900) 100-00-01',
        'Россия',
        'Москва',
        'ул. Арбат, д. 1',
        (SELECT id FROM roles WHERE name = 'Администратор')
    ),
    (
        'Мария Менеджер',
        'manager@slipknot-shop.ru',
        '$2b$10$XHwr1ItKuGuYL7D/zHROMOc4bYpNbv/yaIP6JNVtkuDqfWuN9/47O',
        '+7 (901) 200-00-02',
        'Россия',
        'Санкт-Петербург',
        'Невский проспект, д. 10',
        (SELECT id FROM roles WHERE name = 'Менеджер')
    ),
    (
        'Иван Покупатель',
        'customer@slipknot-shop.ru',
        '$2b$10$EbCqo2VQSRRy0npX/JelO./ShlsIuXIDY5cihK0fnbjeQuUJp8hsm',
        '+7 (902) 300-00-03',
        'Россия',
        'Екатеринбург',
        'ул. Ленина, д. 25',
        (SELECT id FROM roles WHERE name = 'Покупатель')
    )
ON CONFLICT (email) DO NOTHING;

WITH product_data AS (
    SELECT
        'SKU-TSHIRT-001'::text AS sku,
        'Футболка Slipknot «We Are Not Your Kind»'::text AS title,
        'Плотная хлопковая футболка с обложкой альбома We Are Not Your Kind.'::text AS description,
        'https://static.slipknot-shop.ru/images/catalog/tshirt-wanyk.jpg'::text AS image_url,
        2990.00::numeric(10, 2) AS price,
        45::integer AS stock_count,
        'Одежда'::text AS category_name,
        'M'::text AS size_name
    UNION ALL
    SELECT
        'SKU-HOODIE-002',
        'Худи Slipknot с культовым логотипом',
        'Тёплое чёрное худи с вышитым логотипом группы и подкладкой из флиса.',
        'https://static.slipknot-shop.ru/images/catalog/hoodie-classic.jpg',
        5490.00,
        32,
        'Одежда',
        'L'
    UNION ALL
    SELECT
        'SKU-CAP-003',
        'Бейсболка Slipknot «S»',
        'Регулируемая бейсболка с металлическим логотипом Slipknot на фронте.',
        'https://static.slipknot-shop.ru/images/catalog/cap-s-logo.jpg',
        1990.00,
        60,
        'Аксессуары',
        NULL
    UNION ALL
    SELECT
        'SKU-VINYL-004',
        'Винил Slipknot «Iowa» (2LP)',
        'Переиздание легендарного альбома на двойном виниле с буклетом.',
        'https://static.slipknot-shop.ru/images/catalog/vinyl-iowa.jpg',
        4290.00,
        18,
        'Музыка',
        NULL
    UNION ALL
    SELECT
        'SKU-MASK-005',
        'Маска Кори Тейлора — коллекционная серия',
        'Ручная роспись, лимитированное издание официальной маски фронтмена.',
        'https://static.slipknot-shop.ru/images/catalog/mask-corey.jpg',
        12990.00,
        8,
        'Коллекционные предметы',
        NULL
)
INSERT INTO products (title, description, image_url, price, sku, stock_count, category_id, size_id)
SELECT
    pd.title,
    pd.description,
    pd.image_url,
    pd.price,
    pd.sku,
    pd.stock_count,
    c.id,
    s.id
FROM product_data pd
JOIN categories c ON c.name = pd.category_name
LEFT JOIN sizes s ON pd.size_name IS NOT NULL AND s.name = pd.size_name
WHERE NOT EXISTS (
    SELECT 1 FROM products existing WHERE existing.sku = pd.sku
);
