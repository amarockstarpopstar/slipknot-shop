# TASK_22_router-stability

## Что было сделано
- Починена клиентская маршрутизация: добавлены глобальные проверки доступа, логирование переходов и обработка ошибок загрузки товаров.
- Обновлены компоненты каталога и навигации: сообщения после выхода отображаются на главной, переходы выполняются без перезагрузки.
- Исправлено поведение после аутентификации и выхода, чтобы автоматически возвращаться на нужные страницы.

## Изменения
- `frontend/src/router/index.ts`
- `frontend/src/components/AppNavbar.vue`
- `frontend/src/pages/HomePage.vue`
- `frontend/src/pages/AuthPage.vue`
- `frontend/src/pages/ProductPage.vue`
- `frontend/src/store/productStore.ts`
- `frontend/src/store/cartStore.ts`

## Проверка
- Установить зависимости: `cd frontend && npm install`.
- Собрать проект: `npm run build`.
- Запустить dev-сервер: `npm run dev -- --host 0.0.0.0 --port 4173` и проверить переходы между страницами.
