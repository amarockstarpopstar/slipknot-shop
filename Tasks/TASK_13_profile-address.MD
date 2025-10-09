# TASK_13_profile-address

## Что было сделано
Реализовано редактирование профиля с адресом доставки и проверкой страны на фронтенде и бекенде. Добавлены поля country, city, address в таблицу users и обработчики сохранения данных.

## Изменения
- backend/src/modules/users/**/* — новые поля и эндпоинт обновления профиля.
- backend/src/modules/carts/carts.service.ts — проверка страны и адреса при оформлении заказа.
- backend/database/schema.sql — обновлённая схема с полями адреса.
- frontend/src/pages/ProfilePage.vue, CheckoutPaymentPage.vue, store и API — формы редактирования и проверки адреса.

## Проверка
- Backend: `npm run start:dev` (успешно после настройки PostgreSQL).
- Frontend: `npm run dev -- --host`.
