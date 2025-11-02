# Docker Compose для Slipknot Shop

## Обзор

Docker Compose конфигурация для запуска проекта Slipknot Shop, состоящего из трех сервисов:
- **PostgreSQL 17** - база данных
- **Backend** - NestJS приложение
- **Frontend** - Vue.js приложение

## Требования

- Docker
- Docker Compose

## Запуск проекта

### 1. Сборка и запуск
```bash
docker-compose up --build
```

### 2. Запуск в фоновом режиме
```bash
docker-compose up -d --build
```

### 3. Остановка сервисов
```bash
docker-compose down
```

### 4. Просмотр логов
```bash
docker-compose logs -f
```

## Сервисы и порты

| Сервис | Порт | Описание |
|--------|------|-----------|
| PostgreSQL | 5432 | База данных |
| Backend | 3000 | API сервер |
| Frontend | 80 | Веб-интерфейс |

## Переменные окружения

### PostgreSQL
- `POSTGRES_DB=slipknot_db`
- `POSTGRES_USER=slipknot_user` 
- `POSTGRES_PASSWORD=slipknot_password`

### Backend
- `DATABASE_HOST=postgres`
- `DATABASE_PORT=5432`
- `DATABASE_USER=slipknot_user`
- `DATABASE_PASSWORD=slipknot_password`
- `DATABASE_NAME=slipknot_db`
- `PORT=3000`
- `HOST=0.0.0.0`

### Frontend
- `VITE_API_URL=http://localhost:3000` (настраивается при сборке)

## Особенности конфигурации

### Health Checks
- **PostgreSQL**: Проверка готовности БД через `pg_isready`
- **Backend**: Проверка доступности через HTTP health endpoint

### Зависимости
- Backend ждет полной готовности PostgreSQL
- Frontend ждет готовности Backend

### Volumes
- Данные PostgreSQL сохраняются в volume `postgres_data`

### Инициализация БД
- При первом запуске автоматически выполняется скрипт `backend/database/schema.sql`

## Разработка

### Development режим
Для разработки можно использовать отдельные команды:

```bash
# Запуск только базы данных
docker-compose up postgres

# Запуск backend в development режиме (в отдельном терминале)
cd backend && npm run start:dev

# Запуск frontend в development режиме (в отдельном терминале)  
cd frontend && npm run dev
```

### Переменные окружения для разработки
Создайте файлы `.env` в соответствующих директориях:

**backend/.env:**
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=slipknot_user
DATABASE_PASSWORD=slipknot_password
DATABASE_NAME=slipknot_db
JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
HOST=0.0.0.0
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:3000
```

## Полезные команды

### Просмотр статуса сервисов
```bash
docker-compose ps
```

### Пересборка сервиса
```bash
docker-compose build backend
docker-compose build frontend
```

### Очистка
```bash
# Остановка и удаление контейнеров, сетей, volumes
docker-compose down -v

# Удаление всех неиспользуемых данных Docker
docker system prune -f
```

## Устранение неполадок

### Проблемы с подключением к БД
Убедитесь, что PostgreSQL полностью запущен перед запуском backend:
```bash
docker-compose logs postgres
```

### Проблемы со сборкой
Очистите кэш Docker и пересоберите:
```bash
docker-compose build --no-cache
```

### Проблемы с портами
Если порты заняты, измените маппинг портов в `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # PostgreSQL на порту 5433
  - "3001:3000"  # Backend на порту 3001
  - "8080:80"    # Frontend на порту 8080