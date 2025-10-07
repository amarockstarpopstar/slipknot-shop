# TASK_6_backend-run

## Что было сделано
Запущен сервер PostgreSQL, применён скрипт инициализации `database/schema.sql`, после чего backend NestJS успешно стартован. Проведено ручное тестирование CRUD-эндпоинтов категорий и товаров, создан тестовый товар.

## Изменения
- Tasks/TASK_6_backend-run.MD — отчёт о запуске инфраструктуры и проверке API.

## Проверка
- `sudo -u postgres psql -d slipknot_shop -f backend/database/schema.sql` — структура БД и тестовые данные успешно применены.
- `npm run start:dev` (backend) — сервер поднят без ошибок после настройки доступа к БД.
- `curl http://localhost:3000/categories` — список категорий возвращается из базы.
- `curl -X POST http://localhost:3000/products` — создаёт новый товар и возвращает его данные.
- `sudo -u postgres psql -d slipknot_shop -c "SELECT * FROM products"` — таблица товаров содержит созданную запись.
