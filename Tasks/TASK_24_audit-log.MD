# TASK_24_audit-log

## Что было сделано
- Перепроектирована схема БД: добавлены роли и права, аудит, представления, хранимые процедуры, резервное копирование.
- Реализован серверный журнал аудита в NestJS с перехватчиком контекста, триггерами и новым API `/audit-log`.
- Обновлён фронтенд: добавлены API-клиент и страница `/admin/audit` с таблицей изменений, настроены ссылки в меню.

## Изменения
- `backend/database/schema.sql`, `backup.sql`, `restore.sql`.
- Новые файлы в `backend/src/common/audit/` и модуль `backend/src/modules/audit-log/`.
- Обновления конфигурации в `backend/src/app.module.ts`, `backend/src/config/typeorm.config.ts`, `backend/src/main.ts`.
- `frontend/src/api/audit.ts`, `frontend/src/pages/AdminAuditPage.vue`, `frontend/src/components/AppNavbar.vue`, `frontend/src/router/index.ts`.

## Проверка
1. Установлены зависимости (`npm install` в `backend` и `frontend`).
2. Развёрнут PostgreSQL, создана база `slipknot_merch`, применён скрипт `backend/database/schema.sql`.
3. Запущены серверы: `npm run start:dev` (backend) и `npm run dev -- --host --clearScreen false --logLevel info` (frontend).
4. Выполнен вход под администратором, проверен раздел `/admin/audit`, подтверждена запись операций в `audit_log`.
