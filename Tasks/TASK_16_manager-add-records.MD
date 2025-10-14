# TASK_16_manager-add-records

## Что было сделано
- Установлен PostgreSQL, развернута база `slipknot_shop` из `backend/database/schema.sql`, запущены dev-сервисы backend и frontend.
- Добавлены POST-эндпоинты и DTO для создания заказов и получения покупателей, а также админский эндпоинт создания пользователя.
- Обновлены интерфейсы менеджера и администратора: добавлены кнопки «Добавить…», модальные формы в фирменном стиле и обновления API.
- Усилен стиль модальных окон и навигации: поддержка многострочных пунктов меню, плавные анимации, стеклянный эффект.

## Изменения
- Backend: `src/modules/orders/**`, `src/modules/users/users.controller.ts`.
- Frontend API: `src/api/{orders,products,users}.ts`.
- Страницы: `src/pages/ManagerPage.vue`, `src/pages/AdminUsersPage.vue`.
- Общие стили: `src/style.css`.

## Проверка
1. Запустить PostgreSQL: `service postgresql start` (пароль пользователя `postgres` совпадает с названием).
2. Backend: `cd backend && npm run start:dev`.
3. Frontend: `cd frontend && npm run dev -- --host 0.0.0.0 --port 4173`.
4. В браузере открыть http://localhost:4173, авторизоваться и проверить добавление товаров, заказов и пользователей через новые модальные окна.
