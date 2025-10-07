# TASK_4_auth-module

## Что было сделано
Реализованы модули аутентификации и пользователей в NestJS с регистрацией, авторизацией через JWT (access/refresh) и защитой маршрутов с проверкой роли администратора.

## Изменения
- backend/src/main.ts — включена глобальная валидация DTO.
- backend/src/app.module.ts — подключены модули пользователей и авторизации.
- backend/src/modules/auth/** — добавлены контроллер, сервис, стратегии, DTO и guard'ы для JWT и ролей.
- backend/src/modules/users/** — добавлены DTO, сервис и контроллер с проверкой ролей и управлением пользователями.
- backend/package.json — установлены зависимости для bcrypt, JWT и валидации.

## Проверка
- Backend: `cd backend && npm run start:dev` — **успешно** (NestJS запускается, подключение к БД установлено).
- Frontend: `cd frontend && npm run dev` — **успешно** (Vite стартует без ошибок).
- API: `curl` запросы к `/auth/register`, `/auth/login`, `/auth/refresh`, `/users/me` — **успешно** (регистрация создаёт пользователя, авторизация выдаёт access/refresh токены, защищённый профиль доступен по access токену).
