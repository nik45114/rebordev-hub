# 🚂 Railway Deployment Instructions

## 1. Создать PostgreSQL базу данных

1. Открой свой проект на Railway
2. Нажми **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway автоматически создаст переменную `DATABASE_URL`

## 2. Настроить переменные окружения для API

В настройках Railway проекта добавь:

```env
# Database (автоматически создастся)
DATABASE_URL=postgresql://...

# JWT Secret (придумай случайную строку)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=production

# Frontend URL (временно оставь пустым, заполним после деплоя Vercel)
FRONTEND_URL=https://your-app.vercel.app

# Port (Railway сам назначит, но для локала)
PORT=4000
```

## 3. Подключить GitHub репозиторий

1. В Railway проекте нажми **"+ New"** → **"GitHub Repo"**
2. Выбери **nik45114/rebordev-hub**
3. Root Directory: `apps/api`
4. Build Command: `pnpm install && pnpm build`
5. Start Command: `pnpm start`

## 4. Настроить Prisma миграции

После первого деплоя запусти в Railway Console:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## 5. Получить URL API

После деплоя Railway выдаст URL типа:
`https://rebordev-api-production.up.railway.app`

Скопируй его - он понадобится для Vercel.

---

# 🚀 Vercel Deployment Instructions

## 1. Создать новый проект

1. Открой: https://vercel.com/new
2. Import Git Repository: **nik45114/rebordev-hub**
3. Framework Preset: **Next.js**
4. Root Directory: `apps/web`

## 2. Настроить переменные окружения

```env
# API URL (вставь URL из Railway)
NEXT_PUBLIC_API_URL=https://rebordev-api-production.up.railway.app/api
```

## 3. Deploy

Нажми **"Deploy"** и жди 2-3 минуты.

После деплоя получишь URL типа:
`https://rebordev-hub.vercel.app`

## 4. Обновить FRONTEND_URL в Railway

Вернись в Railway и обнови переменную:
```env
FRONTEND_URL=https://rebordev-hub.vercel.app
```

Перезапусти API сервис.

---

# ✅ Проверка

1. Открой `https://rebordev-hub.vercel.app`
2. Войди с:
   - Email: `admin@rebordev.ru`
   - Password: `admin123`

**Готово!** 🎉

---

# 🔧 Автоматический деплой

Теперь при каждом `git push` в `master`:
- Railway автоматически обновит API
- Vercel автоматически обновит Frontend

---

# 📝 Troubleshooting

## API не запускается

Проверь логи в Railway:
```
View Logs → Build Logs / Deploy Logs
```

Частые проблемы:
- DATABASE_URL не установлен
- Prisma миграции не применились
- JWT_SECRET не установлен

## Frontend показывает ошибку API

1. Проверь что NEXT_PUBLIC_API_URL правильный
2. Проверь что API запущен и доступен
3. Проверь CORS настройки в API (FRONTEND_URL)

---

**После деплоя пришли мне URL'ы и я проверю что всё работает!**
