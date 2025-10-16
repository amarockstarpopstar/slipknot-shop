# TASK 3 — Reviews Module

## Краткое описание
- Добавлены проверки права на отзыв и эндпоинты модерации (список, одобрение, удаление) на бэкенде, включая DTO для ответов и проверки совершённых покупок.
- Реализованы клиентские API/Pinia-стор для отзывов, интерфейс отправки отзывов на карточке товара и новая админ-страница модерации.
- Обновлена навигация и роутинг, подготовлены стили для витрины и панели администратора.

## Изменённые пути
- `backend/src/modules/reviews/*`
- `frontend/src/api/reviews.ts`
- `frontend/src/store/reviewsStore.ts`
- `frontend/src/pages/ProductPage.vue`
- `frontend/src/pages/AdminReviewsPage.vue`
- `frontend/src/components/AppNavbar.vue`
- `frontend/src/router/index.ts`
- `Tasks/TASK_3_reviews-module.MD`

## Команды проверки
- `npx eslint src/modules/reviews`
- `npm run build`

## Результаты
- Lint без ошибок для обновлённого модуля отзывов.
- Успешная сборка фронтенда (Vite + vue-tsc) после внедрённых изменений.
