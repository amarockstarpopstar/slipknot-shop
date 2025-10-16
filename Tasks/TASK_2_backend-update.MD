# TASK 2 — Backend Update

## Что сделано
- Добавлена полноценная поддержка размерных остатков: новые сущности `ProductSize` и `SizeStock`, переработанные DTO и сервисы товаров, эндпоинт `GET /products/:id/sizes`.
- Обновлены корзина и заказы для работы с размерами: DTO, сервис корзины, сущности позиций заказа/корзины и ответов, учёт выбранного размера при оформлении.
- Реализован модуль отзывов (`POST /reviews`, `GET /reviews/:productId`) с сущностью, DTO и сервисом модерации по умолчанию.
- Расширены сущности пользователей и товаров связями с отзывами, обновлён `app.module.ts`, аудит-сабскрайбер и guard корзины.

## Задействованные файлы
- `backend/src/modules/products/**/*`
- `backend/src/modules/carts/**/*`
- `backend/src/modules/orders/**/*`
- `backend/src/modules/cart-items/entities/cart-item.entity.ts`
- `backend/src/modules/order-items/entities/order-item.entity.ts`
- `backend/src/modules/users/entities/user.entity.ts`
- `backend/src/modules/reviews/**/*`
- `backend/src/common/audit/audit.subscriber.ts`
- `backend/src/app.module.ts`

## Команды для проверки
```bash
cd backend
npx eslint src/modules/products src/modules/carts src/modules/orders src/modules/reviews src/modules/cart-items/entities/cart-item.entity.ts src/modules/order-items/entities/order-item.entity.ts src/modules/users/entities/user.entity.ts src/common/audit/audit.subscriber.ts src/app.module.ts
```

## Результаты тестов
- `npx eslint …` — без ошибок (проверены обновлённые модули).
