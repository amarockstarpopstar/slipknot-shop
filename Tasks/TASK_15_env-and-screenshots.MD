# TASK_15_env-and-screenshots

## Что было сделано
- Установлен и запущен PostgreSQL 16, создана база `slipknot_shop` и применён скрипт `backend/database/schema.sql` для заполнения справочными данными.
- Настроено окружение проектов (npm install для backend/frontend), запущены оба приложения и проверено подключение фронтенда к API.
- Сняты скриншоты всех основных страниц во тьёмной и светлой темах с помощью Playwright (артефакты приложены в ответе ассистента).

## Изменения
- Tasks/TASK_15_env-and-screenshots.MD — описание настроек окружения и получения скриншотов.

## Проверка
- `service postgresql start`
- `sudo -u postgres psql -d slipknot_shop -f backend/database/schema.sql`
- `cd backend && npm install && npm run start:dev`
- `cd frontend && npm install && npm run dev -- --host 0.0.0.0 --port 5173`
