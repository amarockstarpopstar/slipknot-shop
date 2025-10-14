# TASK_18_auth-catalog-fixes

## Что было сделано
- Настроено подключение к PostgreSQL и обновлён скрипт schema.sql с тестовыми пользователями и товарами.
- Добавлено подробное логирование на NestJS: глобальные HTTP-запросы, подключение к БД и ошибки аутентификации/каталога.
- Исправлены проблемы входа/регистрации и загрузки каталога, проверена работа фронтенда.

## Изменения
- backend/.env — параметры подключения к локальной БД и JWT-секреты.
- backend/src/main.ts, backend/src/common/interceptors/request-logging.interceptor.ts — глобальное логирование и проверка подключения к БД.
- backend/src/modules/auth/auth.service.ts — логирование сценариев регистрации/авторизации.
- backend/src/modules/products/products.service.ts — логирование загрузки каталога.
- backend/database/schema.sql — тестовые записи ролей, пользователей и товаров.

## Проверка
- Backend: `cd backend && npm run start:dev`
- Frontend: `cd frontend && npm run dev -- --host 0.0.0.0 --port 5174`
- Ручные проверки: регистрация, авторизация и загрузка каталога через UI и curl.
