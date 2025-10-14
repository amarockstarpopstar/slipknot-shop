# TASK_17_profile-load-fix

## Что было сделано
Исправил обращение к несуществующему методу `fetchProfile` на странице профиля, чтобы профиль корректно подгружался через `loadProfile` из Pinia стора.

## Изменения
- `frontend/src/pages/ProfilePage.vue` — заменил вызовы `authStore.fetchProfile()` на `authStore.loadProfile()` для инициализации и ручного обновления данных профиля.

## Проверка
1. Запустить бэкенд: `cd backend && npm run start:dev` (требуется активная БД PostgreSQL).
2. Запустить фронтенд: `cd frontend && npm run dev -- --host 0.0.0.0 --port 5173`.
3. Открыть `http://localhost:5173/profile` и убедиться, что данные профиля загружаются без ошибок.
