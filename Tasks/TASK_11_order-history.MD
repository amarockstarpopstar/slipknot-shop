# TASK_11_order-history

## Что было сделано
Добавлена история заказов и отображение статуса отправки: реализованы DTO и контроллер на бэкенде, расширен checkout, а на фронтенде создана страница "Мои заказы", макет оплаты и блок статуса отправки.

## Изменения
- backend/src/modules/orders/*, backend/src/modules/carts/*, backend/database/schema.sql
- frontend/src/pages/CartView.vue, CheckoutPaymentPage.vue, OrdersHistoryPage.vue, ManagerPage.vue, router и API-модули

## Проверка
- Backend: cd backend && npm run start:dev
- Frontend: cd frontend && npm run dev -- --host 0.0.0.0 --port 4173
