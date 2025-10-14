# TASK_20_auth-reactivity-fix

## Что было сделано
- Переподключена реактивность авторизации в Pinia и компонентах, добавлен автоматический перезапрос профиля и перенаправления после входа/выхода.
- Обновлены навигационные компоненты и роутер, чтобы состояния и маршруты обновлялись без перезагрузки, добавлены диагностические логи.

## Изменения
- frontend/src/store/authStore.ts
- frontend/src/components/AppNavbar.vue
- frontend/src/router/index.ts
- frontend/src/pages/AuthPage.vue
- frontend/src/store/cartStore.ts

## Проверка
1. Установить зависимости: `cd frontend && npm install`.
2. Запустить бэкенд: `cd ../backend && npm run start:dev`.
3. В другом окне запустить фронтенд: `cd ../frontend && npm run dev -- --host` и открыть http://localhost:5173.
4. Войти/выйти из аккаунта и перейти по основным маршрутам — в консоли должны появляться логи `Auth state changed:` и `Navigated to:` без необходимости обновлять страницу.
