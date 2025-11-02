# Backend Dockerfile для Slipknot Shop (Development версия)
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm ci

# Копируем исходный код
COPY src/ ./src/
COPY database/ ./database/
COPY scripts/ ./scripts/

# Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

# Открываем порт
EXPOSE 3000

# Запускаем в development режиме
CMD ["npm", "run", "start:dev"]