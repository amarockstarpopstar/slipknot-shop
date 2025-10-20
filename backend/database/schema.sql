-- Slipknot Shop database schema with audit logging and server-side business logic
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

SET search_path TO public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Core reference tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    passport_number_encrypted BYTEA,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_email_format CHECK (position('@' IN email) > 1)
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses (user_id) WHERE (is_default);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
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
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    sku VARCHAR(100) NOT NULL UNIQUE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS product_tags (
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS product_sizes (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (product_id, size)
);

CREATE TABLE IF NOT EXISTS size_stock (
    id SERIAL PRIMARY KEY,
    size_id INTEGER NOT NULL REFERENCES product_sizes(id) ON DELETE CASCADE,
    stock INTEGER NOT NULL CHECK (stock >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (size_id)
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
    product_size_id INTEGER REFERENCES product_sizes(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (cart_id, product_id, product_size_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_product_null_size
ON cart_items (cart_id, product_id)
WHERE product_size_id IS NULL;

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
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
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
    product_size_id INTEGER REFERENCES product_sizes(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'paid', 'refunded')),
    transaction_reference VARCHAR(150) UNIQUE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (wishlist_id, product_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, product_id)
);

-- ============================================================================
-- Audit log
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id BIGINT,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE OR REPLACE FUNCTION fn_extract_audit_user_id()
RETURNS INTEGER AS $$
DECLARE
    v_user TEXT;
BEGIN
    BEGIN
        v_user := current_setting('app.current_user_id', true);
    EXCEPTION WHEN others THEN
        v_user := NULL;
    END;

    IF v_user IS NULL OR v_user = '' THEN
        RETURN NULL;
    END IF;

    IF v_user = '0' THEN
        RETURN NULL;
    END IF;

    RETURN v_user::INTEGER;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS trg_log_changes();

CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    v_user_id := fn_extract_audit_user_id();

    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), NULL, v_user_id);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), v_user_id);
        RETURN NEW;
    ELSE
        INSERT INTO audit_log (table_name, record_id, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, NULL, row_to_json(NEW), v_user_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_users ON users;
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_products ON products;
CREATE TRIGGER trg_audit_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_product_sizes ON product_sizes;
CREATE TRIGGER trg_audit_product_sizes
AFTER INSERT OR UPDATE OR DELETE ON product_sizes
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_size_stock ON size_stock;
CREATE TRIGGER trg_audit_size_stock
AFTER INSERT OR UPDATE OR DELETE ON size_stock
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_orders ON orders;
CREATE TRIGGER trg_audit_orders
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_order_items ON order_items;
CREATE TRIGGER trg_audit_order_items
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_reviews ON reviews;
CREATE TRIGGER trg_audit_reviews
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ============================================================================
-- Views for reporting
-- ============================================================================
CREATE OR REPLACE VIEW vw_order_summary AS
SELECT
    o.id AS order_id,
    u.name AS customer_name,
    u.email AS customer_email,
    os.name AS status_name,
    o.total_amount,
    o.payment_method,
    o.shipping_status,
    COALESCE(p.status, 'pending') AS payment_status,
    o.placed_at,
    o.updated_at
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN order_statuses os ON os.id = o.status_id
LEFT JOIN payments p ON p.order_id = o.id;

CREATE OR REPLACE VIEW vw_sales_by_day AS
SELECT
    DATE(o.placed_at) AS sale_date,
    SUM(oi.quantity) AS total_items,
    SUM(oi.quantity * oi.unit_price) AS total_amount
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY DATE(o.placed_at)
ORDER BY sale_date;

CREATE OR REPLACE VIEW vw_audit_log_detailed AS
SELECT
    a.id,
    a.table_name,
    a.record_id,
    a.operation,
    a.old_data,
    a.new_data,
    a.user_id,
    COALESCE(u.name, 'Системный пользователь') AS actor_name,
    a.created_at
FROM audit_log a
LEFT JOIN users u ON u.id = a.user_id
ORDER BY a.created_at DESC;

-- ============================================================================
-- Stored procedures and business logic
-- ============================================================================
CREATE OR REPLACE FUNCTION sp_recalculate_order_total(p_order_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC(10, 2);
BEGIN
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO v_total
    FROM order_items
    WHERE order_id = p_order_id;

    UPDATE orders
    SET total_amount = v_total,
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_update_order_status_bulk(p_order_ids INTEGER[], p_status_name TEXT, p_comment TEXT DEFAULT NULL)
RETURNS TABLE(updated_order_id INTEGER) AS $$
DECLARE
    v_status_id INTEGER;
BEGIN
    SELECT id INTO v_status_id FROM order_statuses WHERE name = p_status_name;
    IF v_status_id IS NULL THEN
        RAISE EXCEPTION 'Неизвестный статус заказа: %', p_status_name USING ERRCODE = '22023';
    END IF;

    BEGIN
        PERFORM set_config('app.current_operation', 'sp_update_order_status_bulk', true);
        FOR updated_order_id IN SELECT unnest(p_order_ids)
        LOOP
            UPDATE orders
            SET status_id = v_status_id,
                comment = COALESCE(p_comment, comment),
                updated_at = NOW()
            WHERE id = updated_order_id;
        END LOOP;
        RETURN;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Ошибка обновления статусов заказов: %', SQLERRM;
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_checkout_cart(p_user_id INTEGER, p_address_id INTEGER, p_payment_method TEXT)
RETURNS INTEGER AS $$
DECLARE
    v_cart_id INTEGER;
    v_order_id INTEGER;
    v_total NUMERIC(10, 2);
BEGIN
    SELECT id INTO v_cart_id FROM carts WHERE user_id = p_user_id;
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Корзина пользователя % не найдена', p_user_id USING ERRCODE = 'P0002';
    END IF;

    PERFORM 1 FROM cart_items WHERE cart_id = v_cart_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Корзина пользователя % пуста', p_user_id USING ERRCODE = 'P0002';
    END IF;

    BEGIN
        PERFORM set_config('app.current_operation', 'sp_checkout_cart', true);
        WITH inserted_order AS (
            INSERT INTO orders (user_id, status_id, address_id, total_amount, payment_method)
            VALUES (
                p_user_id,
                (SELECT id FROM order_statuses WHERE name = 'Новый'),
                p_address_id,
                0,
                p_payment_method
            )
            RETURNING id
        )
        SELECT id INTO v_order_id FROM inserted_order;

        INSERT INTO order_items (order_id, product_id, product_size_id, quantity, unit_price)
        SELECT
            v_order_id,
            ci.product_id,
            ci.product_size_id,
            ci.quantity,
            ci.unit_price
        FROM cart_items ci
        WHERE ci.cart_id = v_cart_id;

        v_total := sp_recalculate_order_total(v_order_id);

        DELETE FROM cart_items WHERE cart_id = v_cart_id;

        RETURN v_order_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Ошибка оформления заказа: %', SQLERRM;
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

-- Helper function to set audit user from application code
CREATE OR REPLACE FUNCTION set_current_app_user(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', COALESCE(p_user_id::TEXT, ''), true);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Seed data
-- ============================================================================
INSERT INTO roles (name, description)
VALUES
    ('Администратор', 'Полные права управления системой'),
    ('Менеджер', 'Управление заказами и каталогом'),
    ('Покупатель', 'Покупка мерча и управление заказами')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO permissions (code, description)
VALUES
    ('manage_users', 'Управление пользователями'),
    ('manage_catalog', 'Управление товарами'),
    ('manage_orders', 'Управление заказами'),
    ('view_audit', 'Просмотр журнала аудита')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
    (r.name = 'Администратор' AND p.code IN ('manage_users', 'manage_catalog', 'manage_orders', 'view_audit')) OR
    (r.name = 'Менеджер' AND p.code IN ('manage_catalog', 'manage_orders')) OR
    (r.name = 'Покупатель' AND p.code = 'manage_orders')
)
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, description) VALUES
    ('Одежда', 'Футболки, худи и другая одежда с символикой Slipknot'),
    ('Аксессуары', 'Бейсболки, браслеты, значки и другие аксессуары'),
    ('Музыка', 'Винил, CD и кассеты'),
    ('Коллекционные предметы', 'Эксклюзивные предметы и лимитированные издания')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO tags (name)
VALUES ('Лимитированное издание'), ('Новая коллекция'), ('Распродажа')
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

INSERT INTO users (name, email, password_hash, phone, country, city, address, passport_number_encrypted, role_id)
VALUES
    (
        'Тестовый Администратор',
        'admin@shop.local',
        '$2b$10$JXUrjbeNvqRz6ppnu3GS1uJ.KsRyyh7YtZ4hg6bNJPpgGG4FNm52y',
        '+7 (900) 100-00-01',
        'Россия',
        'Москва',
        'ул. Арбат, д. 1',
        pgp_sym_encrypt('ADMIN0001', 'slipknot_secret_key'),
        (SELECT id FROM roles WHERE name = 'Администратор')
    ),
    (
        'Тестовый Менеджер',
        'manager@shop.local',
        '$2b$10$5uhYy/ErOnXW5DsuaNIhkOp7R/5e88FJQRn3WbtQZuIy/b5b0.FRS',
        '+7 (901) 200-00-02',
        'Россия',
        'Санкт-Петербург',
        'Невский проспект, д. 10',
        pgp_sym_encrypt('MANAGER02', 'slipknot_secret_key'),
        (SELECT id FROM roles WHERE name = 'Менеджер')
    ),
    (
        'Тестовый Покупатель',
        'user@shop.local',
        '$2b$10$8PmvoO7KL0aDA8udMSuAjOJQs0rw0WA18hr/q2HIvfq2vdoVcqdgi',
        '+7 (902) 300-00-03',
        'Россия',
        'Екатеринбург',
        'ул. Ленина, д. 25',
        pgp_sym_encrypt('USER00003', 'slipknot_secret_key'),
        (SELECT id FROM roles WHERE name = 'Покупатель')
    )
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    passport_number_encrypted = EXCLUDED.passport_number_encrypted,
    role_id = EXCLUDED.role_id;

WITH product_data AS (
    SELECT
        'SKU-TSHIRT-001'::text AS sku,
        'Футболка Slipknot «We Are Not Your Kind»'::text AS title,
        'Плотная хлопковая футболка с обложкой альбома We Are Not Your Kind.'::text AS description,
        'https://static.slipknot-shop.ru/images/catalog/tshirt-wanyk.jpg'::text AS image_url,
        2990.00::numeric(10, 2) AS price,
        'Одежда'::text AS category_name
    UNION ALL
    SELECT
        'SKU-HOODIE-002',
        'Худи Slipknot с культовым логотипом',
        'Тёплое чёрное худи с вышитым логотипом группы и подкладкой из флиса.',
        'https://static.slipknot-shop.ru/images/catalog/hoodie-classic.jpg',
        5490.00,
        'Одежда'
    UNION ALL
    SELECT
        'SKU-CAP-003',
        'Бейсболка Slipknot «S»',
        'Регулируемая бейсболка с металлическим логотипом Slipknot на фронте.',
        'https://static.slipknot-shop.ru/images/catalog/cap-s-logo.jpg',
        1990.00,
        'Аксессуары'
    UNION ALL
    SELECT
        'SKU-VINYL-004',
        'Винил Slipknot «Iowa» (2LP)',
        'Переиздание легендарного альбома на двойном виниле с буклетом.',
        'https://static.slipknot-shop.ru/images/catalog/vinyl-iowa.jpg',
        4290.00,
        'Музыка'
    UNION ALL
    SELECT
        'SKU-MASK-005',
        'Маска Кори Тейлора — коллекционная серия',
        'Ручная роспись, лимитированное издание официальной маски фронтмена.',
        'https://static.slipknot-shop.ru/images/catalog/mask-corey.jpg',
        12990.00,
        'Коллекционные предметы'
),
upserted_products AS (
    INSERT INTO products (title, description, image_url, price, sku, category_id)
    SELECT
        pd.title,
        pd.description,
        pd.image_url,
        pd.price,
        pd.sku,
        c.id
    FROM product_data pd
    JOIN categories c ON c.name = pd.category_name
    ON CONFLICT (sku) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        price = EXCLUDED.price,
        category_id = EXCLUDED.category_id,
        updated_at = NOW()
    RETURNING id, sku
)
SELECT 1;

WITH size_data AS (
    SELECT 'SKU-TSHIRT-001'::text AS sku, 'S'::text AS size, 12::integer AS stock, 2990.00::numeric(10, 2) AS price UNION ALL
    SELECT 'SKU-TSHIRT-001', 'M', 18, 3090.00 UNION ALL
    SELECT 'SKU-TSHIRT-001', 'L', 15, 3190.00 UNION ALL
    SELECT 'SKU-HOODIE-002', 'M', 14, 5490.00 UNION ALL
    SELECT 'SKU-HOODIE-002', 'L', 10, 5690.00 UNION ALL
    SELECT 'SKU-HOODIE-002', 'XL', 8, 5890.00
)
INSERT INTO product_sizes (product_id, size, price)
SELECT DISTINCT
    p.id,
    sd.size,
    sd.price
FROM size_data sd
JOIN products p ON p.sku = sd.sku
ON CONFLICT (product_id, size) DO UPDATE SET price = EXCLUDED.price, updated_at = NOW();

WITH size_data AS (
    SELECT 'SKU-TSHIRT-001'::text AS sku, 'S'::text AS size, 12::integer AS stock UNION ALL
    SELECT 'SKU-TSHIRT-001', 'M', 18 UNION ALL
    SELECT 'SKU-TSHIRT-001', 'L', 15 UNION ALL
    SELECT 'SKU-HOODIE-002', 'M', 14 UNION ALL
    SELECT 'SKU-HOODIE-002', 'L', 10 UNION ALL
    SELECT 'SKU-HOODIE-002', 'XL', 8
)
INSERT INTO size_stock (size_id, stock, updated_at)
SELECT
    ps.id,
    sd.stock,
    NOW()
FROM size_data sd
JOIN products p ON p.sku = sd.sku
JOIN product_sizes ps ON ps.product_id = p.id AND ps.size = sd.size
ON CONFLICT (size_id) DO UPDATE SET stock = EXCLUDED.stock, updated_at = NOW();

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM products p
JOIN tags t ON t.name = 'Новая коллекция'
WHERE p.sku IN ('SKU-TSHIRT-001', 'SKU-HOODIE-002')
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, product_id, rating, comment, status)
SELECT
    u.id,
    p.id,
    review_data.rating,
    review_data.comment,
    review_data.status
FROM (
    VALUES
        ('user@shop.local', 'SKU-TSHIRT-001', 5, 'Отличное качество и яркий принт!', 'approved'),
        ('user@shop.local', 'SKU-HOODIE-002', 4, 'Худи очень тёплое, но хотелось бы больше цветов.', 'pending')
) AS review_data(email, sku, rating, comment, status)
JOIN users u ON u.email = review_data.email
JOIN products p ON p.sku = review_data.sku
ON CONFLICT (user_id, product_id) DO UPDATE SET
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Ensure audit log view has at least one entry for history by writing a seed update
DO $$
DECLARE
    v_admin_id INTEGER;
BEGIN
    SELECT id INTO v_admin_id FROM users WHERE email = 'admin@shop.local';
    PERFORM set_current_app_user(v_admin_id);
    UPDATE size_stock
    SET stock = stock
    WHERE size_id = (
        SELECT ps.id
        FROM product_sizes ps
        JOIN products p ON p.id = ps.product_id
        WHERE p.sku = 'SKU-TSHIRT-001' AND ps.size = 'M'
        LIMIT 1
    );
END;
$$;
