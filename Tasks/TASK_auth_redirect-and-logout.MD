# TASK_auth_redirect-and-logout

## Что было сделано
- Настроен хранитель авторизации: токены сохраняются в `localStorage`, сессия восстанавливается при запуске, после логина и регистрации выполняется переход на главную.
- Кнопки "Вход"/"Выход" теперь отображаются только в навигации, главный экран без дополнительных CTA; компонент профиля сфокусирован на данных пользователя.
- Создан и переиспользован модальный компонент подтверждения выхода, который блокирует прокрутку и очищает авторизацию после подтверждения.

## Изменения
- `frontend/src/store/authStore.ts`
- `frontend/src/main.ts`
- `frontend/src/components/AppNavbar.vue`
- `frontend/src/components/LogoutConfirmModal.vue`
- `frontend/src/pages/HomePage.vue`
- `frontend/src/pages/AuthPage.vue`
- `frontend/src/pages/ProfilePage.vue`

## Проверка
- Регистрация нового пользователя и автоматический переход на `/`.
- После повторной загрузки страницы сохранена авторизация и отображается кнопка "Выход" только в шапке.
- Кнопка "Выход" открывает модальное окно с подтверждением, после подтверждения выполняется выход и возврат на главную.
- Скриншоты состояния интерфейса:
  - До входа: ![До входа](browser:/invocations/muenwygh/artifacts/artifacts/home-before-login.png)
  - После входа: ![После входа](browser:/invocations/muenwygh/artifacts/artifacts/home-after-login.png)
  - После выхода: ![После выхода](browser:/invocations/muenwygh/artifacts/artifacts/home-after-logout.png)
  - Модальное подтверждение выхода: ![Модальное окно](browser:/invocations/muenwygh/artifacts/artifacts/home-logout-modal.png)
  - Страница профиля: ![Профиль](browser:/invocations/muenwygh/artifacts/artifacts/profile-page.png)
