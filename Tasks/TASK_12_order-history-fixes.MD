# TASK_12_order-history-fixes

## Что было сделано
- Обновил сервис заказов, чтобы история клиента подтягивала связанные статусы и возвращала их в корректном порядке.
- На странице товара добавил модальное подтверждение оформления с переходом на оплату и обработкой ошибок корзины.

## Изменения
- backend/src/modules/orders/orders.service.ts
- frontend/src/pages/ProductPage.vue

## Проверка
1. Запустить backend: `cd backend && npm run start:dev`.
2. Запустить frontend: `cd frontend && npm run dev -- --host 0.0.0.0 --port 4173`.
