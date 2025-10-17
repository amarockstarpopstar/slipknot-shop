# TASK_final_summary

## Изменения в проекте
- Проведены финальные проверки запуска бэкенда и фронтенда согласно требованиям этапа 2.6.
- Подготовлена среда: установлены npm-зависимости, развёрнут PostgreSQL 16, применён актуальный скрипт базы данных (`backend/database/schema.sql`).
- Зафиксировано успешное подключение бэкенда к базе данных `slipknot_shop` и готовность всех ключевых модулей приложения.

## Проверки и тесты
- Backend: `DB_NAME=slipknot_shop DB_USER=postgres DB_PASSWORD=postgres node node_modules/@nestjs/cli/bin/nest.js start --watch --no-color`
  - Успешное подключение к БД и запуск NestJS приложения со всеми маршрутами. Лог подтверждает работу API на `http://[::1]:3000`.
- Frontend: `npm run dev -- --host 0.0.0.0 --port 5173`
  - Vite dev-сервер отдаёт страницу (проверено `curl -I http://localhost:5173`).

## Примечания
- Для локального запуска требуется задать переменные окружения `DB_NAME=slipknot_shop`, `DB_USER=postgres`, `DB_PASSWORD=postgres`, `DB_HOST=127.0.0.1` (или аналогичные значения) либо обновить `.env`.
- Пользователю postgres установлен пароль `postgres`, кластер PostgreSQL запущен командой `sudo pg_ctlcluster 16 main start`.
