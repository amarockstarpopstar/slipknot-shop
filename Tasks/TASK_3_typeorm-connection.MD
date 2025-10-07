# TASK_3_typeorm-connection

## Что было сделано
Настроен глобальный модуль конфигурации и подключение TypeORM к PostgreSQL через переменные окружения с автоматическим созданием таблиц из сущностей.

## Изменения
- backend/src/app.module.ts
- backend/src/config/typeorm.config.ts
- backend/package.json
- backend/package-lock.json

## Проверка
1. cd backend
2. npm install
3. npm run start:dev
