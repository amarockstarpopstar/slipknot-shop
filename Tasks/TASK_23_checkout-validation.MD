# TASK_23_checkout-validation

## Что было сделано
Обновил валидацию оформления заказа, добавил единый навигационный хелпер и поправил SPA-переходы для кнопок. Добавлены модальные проверки для страны и адреса, а также унифицированные списки стран/городов.

## Изменения
- frontend/src/pages/CheckoutPaymentPage.vue
- frontend/src/pages/ProfilePage.vue
- frontend/src/pages/CartView.vue
- frontend/src/pages/ProductPage.vue
- frontend/src/pages/HomePage.vue
- frontend/src/pages/AuthPage.vue
- frontend/src/composables/useNavigation.ts
- frontend/src/utils/location.ts

## Проверка
- Backend: `cd backend && npm run start:dev` (ошибка подключения к PostgreSQL на локальной машине).
- Frontend: `cd frontend && npm run dev -- --host 0.0.0.0 --port 5173 --clearScreen false` (сервер запустился на 5174).
