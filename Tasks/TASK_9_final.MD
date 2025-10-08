# TASK_9_final

## Что было сделано
- Добавлена Swagger-документация ко всем контроллерам и DTO бэкенда, подключен Swagger UI.
- Обновлены DTO и сущности для описания схем ответов и запросов, создан ответ авторизации.
- Создан общий README с инструкциями по запуску фронтенда и бэкенда.

## Изменения
- backend/src/main.ts
- backend/src/app.controller.ts
- backend/src/modules/** (контроллеры и DTO)
- backend/package.json, backend/package-lock.json
- README.md

## Проверка
- Backend: `cd backend && npm run start:dev` (потребовалось установить пароль пользователя postgres). Результат — успешно запускается. 
- Frontend: `cd frontend && npm run dev -- --host` — успешный запуск дев-сервера.
