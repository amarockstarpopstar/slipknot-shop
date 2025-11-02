# Frontend Dockerfile для Slipknot Shop
FROM node:22-alpine AS builder

WORKDIR /app

# Копируем все конфигурационные файлы
COPY package*.json ./
COPY *.json ./
COPY *.ts ./
COPY index.html ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY src/ ./src/
COPY public/ ./public/

# ARG для переменных окружения во время сборки
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Собираем приложение (только vite build, без vue-tsc)
RUN npx vite build --mode production

# Production образ с nginx
FROM nginx:alpine

# Копируем собранное приложение из builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx (если нужна кастомная)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]