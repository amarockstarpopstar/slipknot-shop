# TASK_24_checkout-routing

## Что было сделано
- Переработано оформление оплаты: модальные окна вынесены в Teleport, добавлены плавные анимации, строгая проверка страны и адреса, переходы выполняются через Vue Router.
- Страница профиля теперь автоматически загружает данные пользователя при открытии, форма очищается при выходе, убрана ручная кнопка обновления.

## Изменения
- `frontend/src/pages/CheckoutPaymentPage.vue`
- `frontend/src/pages/ProfilePage.vue`

## Проверка
- Установка зависимостей: `cd backend && npm install`, `cd ../frontend && npm install`.
- Запуск backend: `cd backend && npm run start:dev` (процесс завис без ответа в текущем окружении, остановлен вручную).
- Запуск frontend: `cd frontend && npm run dev -- --host` (сервер успешно стартует на `http://localhost:5173`).
