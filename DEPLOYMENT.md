# Deployment Guide - ReborDev Hub

Инструкция по развертыванию проекта ReborDev Hub на различных платформах.

---

## Вариант 1: GitHub + Vercel (Демо)

### 1. Подготовка репозитория

```bash
cd d:\2\newhub

# Инициализация Git
git init
git add .
git commit -m "Initial commit - ReborDev Hub MVP"

# Создать репозиторий на GitHub
# Перейдите на github.com и создайте новый репозиторий: rebordev-hub

# Добавить remote и запушить
git remote add origin https://github.com/YOUR_USERNAME/rebordev-hub.git
git branch -M main
git push -u origin main
```

### 2. Деплой фронтенда на Vercel

1. **Зайдите на vercel.com** и авторизуйтесь через GitHub

2. **Import Project**:
   - Выберите репозиторий `rebordev-hub`
   - Framework Preset: **Next.js**
   - Root Directory: **apps/web**

3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```

4. **Deploy**

5. **Получите URL**: `https://rebordev-hub.vercel.app`

### 3. Деплой бэкенда (Railway)

1. **Зайдите на railway.app** и авторизуйтесь через GitHub

2. **New Project → Deploy from GitHub Repo**:
   - Выберите `rebordev-hub`

3. **Add Services**:
   - PostgreSQL (Provision Database)
   - Redis (Provision Redis)
   - API Service (из репозитория)

4. **API Service Settings**:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

5. **Environment Variables**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=your-production-secret-key-here
   DEEPSEEK_API_KEY=sk-your-deepseek-api-key
   OPENAI_API_KEY=sk-your-openai-api-key
   FRONTEND_URL=https://rebordev-hub.vercel.app
   PORT=4000
   NODE_ENV=production
   ```

6. **Deploy**

7. **Получите API URL**: `https://your-api.railway.app`

8. **Обновите Vercel Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
   ```

### 4. Применение миграций БД

После деплоя бэкенда на Railway:

```bash
# Подключитесь к Railway CLI
npm i -g @railway/cli
railway login
railway link

# Примените миграции
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

---

## Вариант 2: rebordev.ru (Production)

### Требования

- VPS/Dedicated сервер (Ubuntu 22.04+)
- Docker и Docker Compose установлены
- Nginx для reverse proxy
- SSL сертификат (Let's Encrypt)

### 1. Подготовка сервера

```bash
# SSH на сервер
ssh root@rebordev.ru

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установить Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Установить Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установить pnpm
npm install -g pnpm
```

### 2. Клонировать репозиторий

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/rebordev-hub.git
cd rebordev-hub
```

### 3. Настроить переменные окружения

```bash
# API .env
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

```env
DATABASE_URL="postgresql://postgres:your_secure_password@localhost:5432/rebordev_hub"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secure-production-jwt-secret"
DEEPSEEK_API_KEY="sk-your-actual-deepseek-key"
OPENAI_API_KEY="sk-your-actual-openai-key"
FRONTEND_URL="https://rebordev.ru"
PORT="4000"
NODE_ENV="production"
```

```bash
# Frontend .env
cp apps/web/.env.example apps/web/.env.local
nano apps/web/.env.local
```

```env
NEXT_PUBLIC_API_URL="https://api.rebordev.ru/api"
```

### 4. Запустить Docker Compose

```bash
cd docker
nano docker-compose.yml
# Измените пароли PostgreSQL на безопасные

docker-compose up -d
```

### 5. Собрать и запустить приложения

```bash
cd /var/www/rebordev-hub

# Установить зависимости
pnpm install

# Применить миграции
cd apps/api
npx prisma migrate deploy
npx prisma db seed
cd ../..

# Собрать проекты
pnpm build

# Установить PM2 для управления процессами
npm install -g pm2

# Запустить API
cd apps/api
pm2 start dist/index.js --name rebordev-api

# Запустить Frontend
cd ../web
pm2 start npm --name rebordev-web -- start

# Сохранить PM2 конфигурацию
pm2 save
pm2 startup
```

### 6. Настроить Nginx

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/rebordev
```

```nginx
# Frontend
server {
    listen 80;
    server_name rebordev.ru www.rebordev.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API
server {
    listen 80;
    server_name api.rebordev.ru;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/rebordev /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Установить SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d rebordev.ru -d www.rebordev.ru -d api.rebordev.ru
```

### 8. Проверка

- Frontend: https://rebordev.ru
- API: https://api.rebordev.ru/health

---

## Вариант 3: Docker-only деплой

### docker-compose.production.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: rebordev_hub
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  meilisearch:
    image: getmeili/meilisearch:v1.6
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
    volumes:
      - meilisearch_data:/meili_data
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/rebordev_hub
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis
      - meilisearch
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: https://api.rebordev.ru/api
    ports:
      - "3000:3000"
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

### Dockerfiles

**apps/api/Dockerfile:**

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ai-core/package.json ./packages/ai-core/
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

**apps/web/Dockerfile:**

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Мониторинг и обслуживание

### PM2 команды

```bash
pm2 list                 # Список процессов
pm2 logs rebordev-api    # Логи API
pm2 logs rebordev-web    # Логи Frontend
pm2 restart all          # Перезапуск всех
pm2 stop all             # Остановка всех
pm2 delete all           # Удаление всех
```

### Обновление проекта

```bash
cd /var/www/rebordev-hub
git pull origin main
pnpm install
pnpm build
pm2 restart all
```

### Бэкапы БД

```bash
# Создать бэкап
docker exec rebordev-postgres pg_dump -U postgres rebordev_hub > backup_$(date +%Y%m%d).sql

# Восстановить бэкап
docker exec -i rebordev-postgres psql -U postgres rebordev_hub < backup_20260127.sql
```

---

## Troubleshooting

### API не подключается к БД

```bash
# Проверить доступность PostgreSQL
docker ps | grep postgres
docker logs rebordev-postgres

# Проверить переменные окружения
pm2 env rebordev-api
```

### Frontend не может подключиться к API

```bash
# Проверить CORS настройки в apps/api/src/server.ts
# Проверить NEXT_PUBLIC_API_URL в apps/web/.env.local
```

### Ошибки миграций Prisma

```bash
cd apps/api
npx prisma migrate reset
npx prisma migrate deploy
npx prisma db seed
```

---

## Рекомендации по безопасности

1. **Измените все дефолтные пароли** (PostgreSQL, Redis, Meilisearch)
2. **Используйте сильный JWT_SECRET** (минимум 32 символа)
3. **Настройте Firewall** (UFW на Ubuntu):
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Регулярно обновляйте зависимости**:
   ```bash
   pnpm update
   ```
5. **Настройте автоматические бэкапы БД** (cron job)

---

## Контакты для поддержки

- Email: support@rebordev.ru
- GitHub Issues: https://github.com/YOUR_USERNAME/rebordev-hub/issues

---

*Создано с помощью Claude Code - © 2026 ReborDev*
