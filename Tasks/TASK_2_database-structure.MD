# TASK_2_database-structure

## Что было сделано
- Подготовлена схема PostgreSQL с таблицами для ролей, пользователей, каталога, корзины, заказов и списков желаний.
- Созданы TypeORM-сущности для NestJS с нужными связями и временными полями.
- Добавлены инструкции по применению SQL-скрипта и описания таблиц.

## Таблицы
- `roles` — роли пользователей ("Администратор", "Менеджер", "Покупатель").
- `users` — учетные записи с контактами и связью с ролью.
- `user_addresses` — адреса доставки и комментарии к ним.
- `categories` — дерево категорий каталога.
- `products` — карточки товаров с ценой, остатками и основной фотографией.
- `product_images` — дополнительные изображения товара.
- `carts` — активные корзины пользователей.
- `cart_items` — позиции товаров в корзине.
- `order_statuses` — статусы обработки заказа ("Новый", "В обработке" и др.).
- `orders` — оформленные заказы с суммой, оплатой и адресом.
- `order_items` — позиции товаров в заказах.
- `wishlists` — списки желаний пользователей.
- `wishlist_items` — товары, добавленные в список желаний.

## Связи
- `roles 1—N users`
- `users 1—N user_addresses`
- `categories` самоссылка `parent_id` (иерархия)
- `categories 1—N products`
- `products 1—N product_images`
- `users 1—1 carts` и `carts 1—N cart_items`
- `users 1—1 wishlists` и `wishlists 1—N wishlist_items`
- `order_statuses 1—N orders`
- `users 1—N orders`
- `user_addresses 1—N orders`
- `orders 1—N order_items`
- `products 1—N cart_items` и `products 1—N order_items` и `products 1—N wishlist_items`

## Сущности TypeORM
- `backend/src/modules/roles/entities/role.entity.ts`
- `backend/src/modules/users/entities/user.entity.ts`
- `backend/src/modules/user-addresses/entities/user-address.entity.ts`
- `backend/src/modules/categories/entities/category.entity.ts`
- `backend/src/modules/products/entities/product.entity.ts`
- `backend/src/modules/product-images/entities/product-image.entity.ts`
- `backend/src/modules/carts/entities/cart.entity.ts`
- `backend/src/modules/cart-items/entities/cart-item.entity.ts`
- `backend/src/modules/order-statuses/entities/order-status.entity.ts`
- `backend/src/modules/orders/entities/order.entity.ts`
- `backend/src/modules/order-items/entities/order-item.entity.ts`
- `backend/src/modules/wishlists/entities/wishlist.entity.ts`
- `backend/src/modules/wishlist-items/entities/wishlist-item.entity.ts`

## Применение SQL-скрипта
Через psql:
```bash
psql -h <host> -U <user> -d <database> -f backend/database/schema.sql
```
Через любой GUI-клиент (DataGrip, DBeaver и т.д.) — открыть файл `backend/database/schema.sql` и выполнить его в подключении к нужной базе данных.

## Локальная проверка
Тестирование проводилось в окружении агента:
```bash
pg_ctlcluster 16 main start
sudo -u postgres createdb slipknot_shop
sudo -u postgres psql -d slipknot_shop -f backend/database/schema.sql
sudo -u postgres psql -d slipknot_shop -c "SELECT COUNT(*) FROM roles;"
```
Команды выполнились успешно, таблицы созданы, сидовые данные на местах.
