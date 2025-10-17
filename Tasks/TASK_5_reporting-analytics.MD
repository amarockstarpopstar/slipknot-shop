# TASK 5 — Reporting & Analytics

## 1. Что сделано
- Реализован модуль `reports` в NestJS с JSON-эндпоинтом `GET /reports/sales/daily` и выгрузкой Excel через `GET /reports/sales/excel`.
- Добавлен сервис генерации отчёта на основе представления `vw_sales_by_day` с построением файла в ExcelJS и условным форматированием.
- Подключена страница аналитики `ReportsPage.vue` с графиком продаж на Chart.js, карточками показателей и возможностью выгрузки Excel.
- Созданы Pinia-стор и API-клиенты для загрузки продаж и скачивания отчётов, добавлена навигация к разделу отчётности.

## 2. Пути изменённых файлов
- `backend/package.json`
- `backend/src/app.module.ts`
- `backend/src/modules/reports/*`
- `frontend/package.json`
- `frontend/src/api/reports.ts`
- `frontend/src/components/AppNavbar.vue`
- `frontend/src/pages/ReportsPage.vue`
- `frontend/src/router/index.ts`
- `frontend/src/store/reportsStore.ts`

## 3. Команды для проверки
```bash
# Установка зависимостей
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Применение схемы БД
sudo -u postgres psql -d slipknot_shop -f backend/database/schema.sql

# Запуск тестов/сборок
cd backend && npx eslint src/modules/reports && cd ..
cd frontend && npm run build && cd ..
```

## 4. Результаты тестирования и логов
- Линтер для нового backend-модуля выполнен без ошибок.
- Сборка фронтенда прошла успешно.
- Представление `vw_sales_by_day` отдает данные, что подтверждается отрисовкой графика и созданием Excel-файла при ручном тестировании.
