# TASK_fix_products-loading

## Что было сделано
- Проверил подключение фронтенда к API и обнаружил отсутствие данных из таблицы `products`.
- Добавил наполнение каталога в `backend/database/schema.sql`, чтобы при инициализации БД создавались тестовые товары, и сделал поле `name` в размерах уникальным на уровне TypeORM.
- Создал файл `frontend/.env` с `VITE_API_URL=http://localhost:3000`, чтобы фронтенд явно обращался к локальному бэкенду.

## Изменения
- `backend/database/schema.sql` — добавлено заполнение таблицы `products` и безопасные вставки для размеров.
- `backend/src/modules/sizes/entities/size.entity.ts` — включено ограничение `unique` для поля `name`.
- `.gitignore` и `frontend/.env` — разрешил коммит файла окружения фронтенда и задал целевой URL API.

## Проверка
1. Запустить бэкенд: `cd backend && npm run start:dev`.
2. Запустить фронтенд: `cd frontend && npm run dev -- --host 0.0.0.0 --port 5173`.
3. Открыть `http://localhost:5173/` и убедиться, что раздел «Популярные товары» выводит позиции из базы данных.

## Скриншот
![Главная страница с товарами](browser:/invocations/cgorkgjs/artifacts/artifacts/catalog.png)
