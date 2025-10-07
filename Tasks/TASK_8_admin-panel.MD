# TASK_8_admin-panel

## Что было сделано
Настроен административный интерфейс управления товарами и заказами, включая таблицы со списками и формы редактирования. Добавлены API-методы для работы с заказами и статусами на бэкенде, а также новые REST-клиенты на фронтенде.

## Изменения
- backend/src/modules/orders/ — модуль заказов с DTO, сервисом и контроллером.
- backend/src/modules/order-statuses/ — модуль справочника статусов заказов.
- frontend/src/pages/AdminPage.vue и связанные API/компоненты.
- frontend/src/router/index.ts, frontend/src/components/AppNavbar.vue — маршрут и ссылка на админ-панель.

## Проверка
- npm run start:dev (backend)
- npm run dev -- --host 0.0.0.0 --port 5173 (frontend)
