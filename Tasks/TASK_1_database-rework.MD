# TASK 1 — Database Rework

## Что сделано
- Переписан `backend/database/schema.sql` под новую модель данных с таблицами `product_sizes`, `size_stock`, `reviews`, обновлёнными связями и триггерами аудита.
- Добавлены обновлённые `VIEW` для аналитики, включая `vw_sales_by_day`.
- Пересобраны сиды товаров, размеров, остатков и отзывов.

## Пути изменений
- `backend/database/schema.sql`

## Команды для проверки
```bash
sudo -u postgres dropdb slipknot_shop
sudo -u postgres createdb slipknot_shop
sudo -u postgres psql -d slipknot_shop -f backend/database/schema.sql
sudo -u postgres psql -d slipknot_shop -c "SELECT p.sku, ps.size, ss.stock FROM products p JOIN product_sizes ps ON ps.product_id = p.id JOIN size_stock ss ON ss.size_id = ps.id ORDER BY p.sku, ps.size;"
sudo -u postgres psql -d slipknot_shop -c "SELECT u.email, p.sku, r.rating, r.status FROM reviews r JOIN users u ON u.id=r.user_id JOIN products p ON p.id=r.product_id;"
```

## Результаты
- Скрипт инициализации выполняется без ошибок; выводы проверочных запросов подтверждают корректную загрузку размеров, остатков и отзывов.
- Скриншоты не приложены из-за ограничений терминального окружения.
