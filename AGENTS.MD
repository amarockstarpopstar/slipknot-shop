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

### Pre-Task Setup

Перед выполнением каждой новой задачи Codex обязан подготовить окружение для корректной работы проекта.

1. Проверить наличие запущенного PostgreSQL. Если база данных не активна — запустить её. Если в окружении не установлен PostgreSQL - скачать его.
2. Убедиться, что база данных `slipknot_shop` существует.  
   - Если она не создана — создать её (запустить скрипт из backend/database (ПРИ УСЛОВИИ, ЧТО УСТАНОВЛЕН И ЗАПУЩЕН POSTGRESQL!!!)).  
   Пример выполнения:
   ```bash
   psql -U postgress -d slipknot_shop -f backend/database/init.sql
   ```
3. Выполнить установку зависимостей:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```
4. Только после успешной подготовки среды приступать к выполнению задачи.

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
  - users(id, name, email, password_hash, role_id)
  - roles(id, name)
  - products(id, title, description, price, image_url, category_id)
  - orders(id, user_id, total_price, status)
  - order_items(id, order_id, product_id, quantity, price)
  - categories(id, name)
  - cart(id, user_id)
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

### Testing Requirement

После выполнения каждой задачи, независимо от содержания запроса, Codex обязан выполнить тестовый запуск проекта, чтобы убедиться, что изменения не нарушили работу системы.

Обязательно:
1. Запускать backend командой:
   cd backend && npm run start:dev
2. Запускать frontend командой:
   cd frontend && npm run dev
3. Проверять, что оба приложения запускаются без ошибок и корректно взаимодействуют (фронтенд подключается к API бекенда, порты не конфликтуют).
4. В отчёте в Tasks/TASK_<номер>_<название>.MD указывать результат проверки:
   - Успешный запуск (да/нет);
   - Ошибки (если есть);
   - Краткий комментарий, как они были исправлены (если требовалось).
