## AGENTS.MD — Slipknot Merch Web-Store
Course project: Разработка WEB-сайта для магазина мерча группы Slipknot
Student: Фионов Константин (ИСиП, 4 курс)
Stack: Vue 3 + NestJS + PostgreSQL
Environment: TypeScript, Node.js

### Mission

Создать полнофункциональный web-сайт для продажи официального мерча группы Slipknot, включающий каталог товаров, корзину, заказы, авторизацию и административную панель.
Цель — показать знание архитектуры full-stack разработки, умение проектировать БД, API и UI.

### Development Context

| Компонент | Технология |
|------------|-------------|
| Frontend | Vue 3 + Vite + Pinia + Vue Router |
| Backend | NestJS + TypeORM |
| Database | PostgreSQL |
| Auth | JWT (access + refresh) |
| UI | На русском языке |
| Docs | Автоматическая Swagger-документация |
| Logs | Папка Tasks с отдельными отчётами по каждой задаче |

### Agent Role: Full-Stack Developer & Assistant

Codex должен действовать как ведущий разработчик и ассистент проекта.
Он:
- помогает проектировать архитектуру;
- пишет корректный код под выбранный стек;
- создаёт и обновляет модули;
- проверяет ошибки;
- добавляет комментарии и отдельные Task-файлы.

### Core Responsibilities

#### Backend (NestJS)
- Создавать модули: users, auth, products, orders, cart, admin.
- Использовать TypeORM с PostgreSQL.
- Реализовывать DTO, Guards, Validation, Interceptors.
- Поддерживать JWT-авторизацию.
- Писать чистые REST-эндпоинты (Controller -> Service -> Repository).
- Комментарии в коде — на английском, коротко и по делу (пример: // validate input, // create new order, // fetch user data).

#### Frontend (Vue)
- Разрабатывать SPA на Vue 3 с Vue Router и Pinia.
- Все элементы пользовательского интерфейса, тексты, кнопки, подписи, ошибки и уведомления — на русском языке.
- Код должен быть читаемым и логичным.
- Использовать axios для API-вызовов.
- Создавать компоненты /components/, страницы /pages/, хранилище /store/.

#### Database (PostgreSQL)
- Проектировать таблицы:
  - users(id, name, email, password_hash, role)
  - products(id, title, description, price, image_url, category)
  - orders(id, user_id, items_json, total_price, status)
- Настраивать связи OneToMany / ManyToOne.
- Добавлять миграции и тестовые данные (seed scripts).

### Deployment
- Запуск выполняется локально, без Docker.
- Настроить .env для конфигураций.
- Проверять корректность сборки и запуск через npm scripts.

### Coding Standards

- Язык кода: TypeScript (и для NestJS, и для Vue).
- Комментарии — только на английском, кратко и по делу.
- Интерфейс — только на русском языке.
- Форматирование — ESLint + Prettier.
- Названия файлов и папок — в нижнем регистре с дефисами.
- Все модули должны быть изолированы (products/, users/ и т.д.).

### Task Logging System

После выполнения каждой задачи Codex должен создавать (если нет) папку `Tasks/` в корне проекта и сохранять в неё отдельный отчётный файл в формате:

Tasks/TASK_<номер>_<краткое-название>.MD

Примеры имён:
Tasks/TASK_1_init-projects.MD
Tasks/TASK_2_database-setup.MD
Tasks/TASK_3_products-module.MD

В каждом таком файле Codex должен кратко описывать:

1. Что было сделано (1–3 предложения).
2. Где находятся изменения (пути к файлам или папкам).
3. Как проверить или запустить результат (команды, url, или шаги).

Пример содержимого:
# TASK_1_init-projects

## Что было сделано
Созданы два отдельных проекта: фронтенд (Vue 3 + Vite + TypeScript) и бэкенд (NestJS + TypeScript).

## Изменения
- frontend/ — шаблон Vue 3 проекта.
- backend/ — шаблон NestJS проекта.

## Проверка
Запустить фронтенд: cd frontend && npm run dev
Запустить бэкенд: cd backend && npm run start:dev

### Folder Structure

slipknot-merch/
├─ AGENTS.MD
├─ backend/
│  ├─ src/
│  │  ├─ modules/
│  │  │  ├─ users/
│  │  │  ├─ products/
│  │  │  ├─ orders/
│  │  ├─ main.ts
│  ├─ README.md
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  ├─ store/
│  │  ├─ api/
│  ├─ README.md
├─ Tasks/
└─ README.md

### Verification Checklist

Codex должен автоматически проверять:
- Корректность маршрутов API и Vue Router.
- Наличие DTO и типов.
- Безопасность (bcrypt, JWT, CORS).
- Отсутствие циклических импортов.
- Соответствие интерфейса русскому языку.

### Prompts Examples

Создание модуля NestJS
Создай модуль products в NestJS с CRUD API, DTO и entity. Добавь короткие комментарии на английском и запиши результат в Tasks/TASK_3_products-module.MD.

Создание страницы Vue
Создай Vue страницу CatalogView.vue с карточками товаров на русском языке и кнопкой “Добавить в корзину”. Добавь отчёт в Tasks/TASK_4_catalog-page.MD.

Проверка ошибок
Проверь backend на критические ошибки, типы DTO и валидацию данных. Если найдешь — исправь и опиши изменения в Tasks/TASK_<номер>_fixes.MD.

### Environment Variables

# backend/.env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgress
DB_PASSWORD=postgress
DB_NAME=slipknot_shop

JWT_SECRET=supersecret
JWT_REFRESH_SECRET=refreshsecret

# frontend/.env
VITE_API_URL=http://localhost:3000

### Deliverables
- Рабочий сайт (frontend + backend + db).
- Документация API (Swagger).
- Отчётные файлы в Tasks/ по каждому шагу.
- ER-диаграмма БД и структура проекта.
