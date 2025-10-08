# Slipknot Shop

Monorepo учебного проекта интернет-магазина мерча группы Slipknot. Репозиторий содержит backend на NestJS и frontend на Vue 3.

## Требования

- Node.js 18+
- npm 10+
- PostgreSQL 15+

## Подготовка базы данных

1. Создайте базу данных `slipknot_shop` в PostgreSQL.
2. Выполните скрипт инициализации схемы и справочников:
   ```bash
   psql -U <postgres_user> -d slipknot_shop -f backend/database/schema.sql
   ```

## Настройка backend

1. Установите зависимости:
   ```bash
   cd backend
   npm install
   ```
2. Создайте файл `.env` (при отсутствии) и укажите параметры подключения к БД и JWT:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=slipknot_shop

   JWT_ACCESS_SECRET=dev-access-secret
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=dev-refresh-secret
   JWT_REFRESH_EXPIRES_IN=7d
   ```
3. Запустите сервер разработчика:
   ```bash
   npm run start:dev
   ```
4. Swagger-документация доступна после запуска по адресу [http://localhost:3000/docs](http://localhost:3000/docs).

## Настройка frontend

1. Установите зависимости:
   ```bash
   cd frontend
   npm install
   ```
2. Запустите режим разработки:
   ```bash
   npm run dev
   ```
3. По умолчанию приложение доступно на [http://localhost:5173](http://localhost:5173). Убедитесь, что backend запущен на порту 3000 или обновите переменные окружения Vite.

## Полезные команды

| Область   | Команда                    | Описание                         |
|-----------|---------------------------|----------------------------------|
| Backend   | `npm run start:dev`       | Запуск NestJS в watch-режиме     |
| Backend   | `npm run start`           | Запуск NestJS в production-режиме|
| Backend   | `npm run test`            | Юнит-тесты NestJS                |
| Frontend  | `npm run build`           | Сборка production билда Vite     |
| Frontend  | `npm run preview`         | Предпросмотр production билда    |

