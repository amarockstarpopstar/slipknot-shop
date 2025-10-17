# TASK 4 — Product Card Update

## Краткое описание
- Перенастроил карточку товара: выбор размера с отображением остатка, блокировка покупки при нуле и подтверждение выбора в модальном окне.
- Усилил бэкенд: валидация остатков при добавлении в корзину/оформлении заказа, транзакционное списание, эндпоинт обновления stock по размеру.
- Переработал интерфейсы магазина: таблица менеджера с динамическими размерами, формы редактирования/создания товара и обновлённый API-контракт.
- Обновил корзину и API DTO: вывод выбранного размера, ограничения по складу и новые типы данных для размеров.

## Изменённые пути
- `backend/src/modules/carts/*`
- `backend/src/modules/products/*`
- `frontend/src/api/*`
- `frontend/src/pages/CartView.vue`
- `frontend/src/pages/ManagerPage.vue`
- `frontend/src/pages/ProductPage.vue`
- `frontend/src/store/cartStore.ts`
- `Tasks/TASK_4_product-card-update.MD`

## Команды проверки
- `sudo -u postgres psql -d slipknot_shop -f backend/database/schema.sql`
- `cd backend && npx eslint src/modules/products src/modules/carts`
- `cd frontend && npm run build`

## Результаты
- Схема БД успешно применена к базе `slipknot_shop` (созданы таблицы размеров, остатков и сиды).
- ESLint прошёл без замечаний для модулей товаров и корзины.
- Продакшн-сборка фронтенда выполнена успешно (Vite + vue-tsc).
