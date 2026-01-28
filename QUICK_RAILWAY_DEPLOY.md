# 🚂 Быстрый деплой API на Railway

## Шаг 1: Создать проект

1. Открой: **https://railway.app/new**
2. Нажми: **"Deploy from GitHub repo"**
3. Выбери: **nik45114/rebordev-hub**
4. Railway создаст проект автоматически

## Шаг 2: Настроить Root Directory

1. В настройках проекта найди **Settings**
2. **Root Directory**: `apps/api`
3. **Build Command**: `pnpm install && pnpm build`
4. **Start Command**: `pnpm start`

## Шаг 3: Добавить PostgreSQL

1. В проекте нажми **"+ New"**
2. Выбери **"Database"** → **"Add PostgreSQL"**
3. Railway автоматически создаст переменную `DATABASE_URL`

## Шаг 4: Добавить переменные окружения

В разделе **Variables** добавь:

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
JWT_SECRET = any-random-string-here-change-in-production
NODE_ENV = production
FRONTEND_URL = https://web-eta-two-88.vercel.app
PORT = ${{PORT}}
```

## Шаг 5: Deploy!

Нажми **"Deploy"** и подожди 2-3 минуты.

## Шаг 6: Получить URL

После деплоя Railway выдаст URL типа:
`https://rebordev-api-production.up.railway.app`

**Скопируй этот URL!**

## Шаг 7: Обновить Vercel

1. Открой: https://vercel.com/nik45114s-projects/web/settings/environment-variables
2. Добавь переменную:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://твой-railway-url.up.railway.app/api`
3. Redeploy Vercel

## Готово! 🎉

Открой https://web-eta-two-88.vercel.app и войди:
- Email: `admin@rebordev.ru`
- Password: `admin123`

---

# ⚡ Или через CLI (если не получится вручную)

```bash
# Установить Railway CLI
npm install -g @railway/cli

# Залогиниться
railway login

# Создать проект
cd d:/2/newhub/apps/api
railway init

# Добавить PostgreSQL
railway add

# Установить переменные
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://web-eta-two-88.vercel.app

# Deploy
railway up
```

После деплоя получишь URL - пришли мне его!
