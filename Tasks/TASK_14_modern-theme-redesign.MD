# TASK_14_modern-theme-redesign

## Что было сделано
Полностью переработан фронтенд: введён ThemeProvider с сохранением темы, современная светлая/тёмная цветовые схемы и обновлённые анимации. Все страницы получили единый прозрачный стиль с плавными эффектами и обновлёнными карточками и таблицами.

## Изменения
- frontend/src/style.css
- frontend/src/App.vue
- frontend/src/components/AppNavbar.vue
- frontend/src/components/LogoutConfirmModal.vue
- frontend/src/components/LoadingSpinner.vue
- frontend/src/components/ProductCard.vue
- frontend/src/components/ThemeProvider.vue
- frontend/src/components/ThemeToggle.vue
- frontend/src/pages/AuthPage.vue
- frontend/src/pages/HomePage.vue
- frontend/src/pages/ProductPage.vue
- frontend/src/pages/CartView.vue
- frontend/src/pages/CheckoutPaymentPage.vue
- frontend/src/pages/OrdersHistoryPage.vue
- frontend/src/pages/ProfilePage.vue
- frontend/src/pages/ManagerPage.vue
- frontend/src/pages/AdminUsersPage.vue
- frontend/src/store/themeStore.ts

## Проверка
- npm run start:dev (backend) — запуск без ошибок, остановлен после проверки.
- npm run dev (frontend) — запуск без ошибок, остановлен после проверки.
