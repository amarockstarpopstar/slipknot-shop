# TASK 5 — Reporting & Analytics

## Краткое описание
- Добавил модуль `reports` в NestJS: агрегаты по продажам, экспорт Excel (ExcelJS), защита ролями, возврат данных для графиков.
- Расширил `schema.sql`: доработанная вьюха `vw_sales_by_day` с количеством заказов и сид заказов/позиций для демонстрации аналитики.
- Создал API/стор для отчётности на фронте, компонент `SalesChart` на Chart.js и новый блок аналитики в панели менеджера.

## Изменённые пути
- `backend/package.json`
- `backend/database/schema.sql`
- `backend/src/app.module.ts`
- `backend/src/modules/reports/*`
- `frontend/package.json`
- `frontend/src/api/reports.ts`
- `frontend/src/components/SalesChart.vue`
- `frontend/src/pages/ManagerPage.vue`
- `frontend/src/store/reportsStore.ts`
- `Tasks/TASK_5_reporting-analytics.MD`

## Команды проверки
- `sudo service postgresql status`
- `sudo -u postgres psql -d slipknot_shop -f backend/database/schema.sql`
- `sudo -u postgres psql -d slipknot_shop -c "SELECT * FROM vw_sales_by_day ORDER BY sale_date;"`
- `cd backend && npm run build`
- `cd frontend && npm run build`

## Результаты
- PostgreSQL установлен и кластер 16/main запущен (`status` → online).
- Скрипт базы повторно применён: созданы сидовые заказы, обновлённые представления и триггеры.
- Вьюха `vw_sales_by_day` возвращает 3 дня продаж с суммами/количеством (данные используются графиком и Excel).
- Бэкенд успешно собирается (`nest build`), фронтенд проходит `vue-tsc`+`vite build` без ошибок.
