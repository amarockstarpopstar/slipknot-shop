# TASK_10_update-product-model

## Изменения
- Обновлена схема базы данных: добавлены таблица `sizes`, новые поля `image_url`, `price`, `stock_count`, `size_id` в `products`, связь с размерами и заполнение справочника базовыми значениями.
- Расширена модель `Product` и сервисы: добавлены поля `imageUrl`, `price`, `stockCount`, связь с `SizeEntity`, обновлены DTO и модуль для работы с новыми данными.
- Созданы модуль `SizesModule`, контроллер и сервис для CRUD-операций по размерам, а также сущность `SizeEntity`.

## Как протестировать
1. Выполнить SQL-скрипт: `sudo -u postgres psql -d slipknot_shop -f backend/database/schema.sql`.
2. Запустить backend: `cd backend && npm run start:dev`.
3. Запустить frontend: `cd frontend && npm run dev`.
4. Добавить данные через API, например: `curl -X POST http://localhost:3000/sizes -H 'Content-Type: application/json' -d '{"name":"XXL"}'` и создать товар `curl -X POST http://localhost:3000/products -H 'Content-Type: application/json' -d '{"title":"Худи Slipknot Tribal","description":"Тёплое худи с логотипом Slipknot","price":6990.5,"sku":"SK-HOODIE-TRIBAL","stockCount":25,"imageUrl":"https://cdn.example.com/slipknot/hoodie-tribal.jpg","categoryId":1,"sizeId":1}'`.
5. Проверить данные в PostgreSQL: `sudo -u postgres psql -d slipknot_shop -c "SELECT p.id, p.title, p.price, p.stock_count, s.name AS size_name FROM products p LEFT JOIN sizes s ON s.id = p.size_id;"`.

## Результат
Backend и frontend запускаются успешно, ошибки не обнаружены; данные успешно создаются через API и отображаются в БД.
