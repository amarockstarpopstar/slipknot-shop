# TASK_19_auth-routing-fix

## Что было сделано
- Исправлена реактивность авторизации и синхронизация токенов, добавлены логи навигации и состояния.
- Обновлена логика редиректов после входа/регистрации/выхода и перерисовка страниц без перезагрузки.
- Устранены ошибки типизации в API корзины и пользователей, обновлена логика оплаты заказа во фронтенде.

## Изменения
- frontend/src/store/authStore.ts
- frontend/src/store/cartStore.ts
- frontend/src/router/index.ts
- frontend/src/components/AppNavbar.vue
- frontend/src/pages/AuthPage.vue
- frontend/src/api/users.ts
- frontend/src/api/cart.ts
- frontend/src/App.vue
- frontend/src/pages/CheckoutPaymentPage.vue

## Проверка
- Установить зависимости и собрать фронтенд: `cd frontend && npm install && npm run build`.
