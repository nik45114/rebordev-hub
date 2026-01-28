# 🚀 Статус деплоя ReborDev Hub

## ✅ Выполнено

### 1. GitHub Repository
- **URL**: https://github.com/nik45114/rebordev-hub
- **Статус**: ✅ Код загружен (140 файлов, 21,563 строк)
- **Visibility**: Public
- **Branch**: master

### 2. Vercel (Frontend)
- **Статус**: ⏳ Настраивается...
- **Следующий шаг**: Требуется авторизация через `vercel login`

### 3. Railway (Backend)
- **Статус**: ⏳ Ожидает
- **Следующий шаг**: Создание проекта после Vercel

---

## 📝 Инструкции для завершения деплоя

Так как Vercel и Railway требуют авторизации через браузер, вам нужно выполнить следующие шаги:

### Шаг 1: Авторизация в Vercel

```bash
vercel login
```

Откроется браузер для авторизации через GitHub.

### Шаг 2: Деплой фронтенда на Vercel

```bash
cd d:\2\newhub
vercel --prod
```

При первом запуске Vercel спросит:
1. **Set up and deploy?** → `Y`
2. **Which scope?** → Выберите ваш аккаунт
3. **Link to existing project?** → `N`
4. **Project name?** → `rebordev-hub` (Enter)
5. **In which directory is your code located?** → `apps/web` (важно!)
6. **Want to override settings?** → `N`

После деплоя вы получите URL типа: `https://rebordev-hub.vercel.app`

### Шаг 3: Настройка переменных окружения в Vercel

```bash
# Добавить переменную API URL (временно localhost)
vercel env add NEXT_PUBLIC_API_URL production
# Введите: http://localhost:4000/api

# Или через веб-интерфейс:
# 1. Откройте vercel.com → ваш проект
# 2. Settings → Environment Variables
# 3. Добавьте: NEXT_PUBLIC_API_URL = http://localhost:4000/api
```

### Шаг 4: Деплой бэкенда на Railway

```bash
# Установить Railway CLI
npm install -g @railway/cli

# Авторизация
railway login
# Откроется браузер для авторизации

# Создать новый проект
railway init

# Создать PostgreSQL
railway add --database postgres

# Создать Redis
railway add --database redis

# Установить переменные окружения
railway variables set DATABASE_URL="\${{Postgres.DATABASE_URL}}"
railway variables set REDIS_URL="\${{Redis.REDIS_URL}}"
railway variables set JWT_SECRET="your-super-secret-production-jwt-key-min-32-chars"
railway variables set FRONTEND_URL="https://rebordev-hub.vercel.app"
railway variables set PORT="4000"
railway variables set NODE_ENV="production"

# Деплой
railway up
```

### Шаг 5: Применение миграций БД

```bash
cd d:\2\newhub\apps\api
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### Шаг 6: Получить Railway URL и обновить Vercel

```bash
# Получить Railway URL
railway domain

# Обновить переменную в Vercel
vercel env add NEXT_PUBLIC_API_URL production
# Введите: https://your-railway-url.up.railway.app/api

# Redeploy фронтенда с новой переменной
cd d:\2\newhub
vercel --prod
```

---

## 🎯 Альтернативный вариант (упрощённый)

Если вам проще работать через веб-интерфейс:

### Frontend на Vercel

1. Откройте [vercel.com](https://vercel.com)
2. Login with GitHub
3. **Import Project** → выберите `nik45114/rebordev-hub`
4. **Root Directory**: `apps/web`
5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `http://localhost:4000/api`
6. **Deploy**

### Backend на Railway

1. Откройте [railway.app](https://railway.app)
2. Login with GitHub
3. **New Project** → **Deploy from GitHub** → выберите `nik45114/rebordev-hub`
4. **Add PostgreSQL** (нажмите + New → Database → PostgreSQL)
5. **Add Redis** (нажмите + New → Database → Redis)
6. В API сервисе:
   - **Settings** → **Root Directory**: `apps/api`
   - **Variables** → добавьте переменные (см. выше)
7. **Deploy**

---

## 📋 Checklist для завершения

- [ ] Vercel: Авторизация (`vercel login`)
- [ ] Vercel: Деплой фронтенда (`vercel --prod`)
- [ ] Railway: Авторизация (`railway login`)
- [ ] Railway: Создание проекта и БД
- [ ] Railway: Деплой API
- [ ] Railway: Применение миграций Prisma
- [ ] Получение Railway URL
- [ ] Обновление `NEXT_PUBLIC_API_URL` в Vercel
- [ ] Redeploy фронтенда
- [ ] Тестирование (вход в систему)

---

## 🧪 Тестирование после деплоя

1. Откройте Vercel URL
2. Перейдите на страницу логина
3. Войдите с тестовым аккаунтом:
   - Email: `vladimir@rebordev.ru`
   - Password: `password123`

Если вход успешен - проект полностью задеплоен! 🎉

---

## 📞 Если что-то пошло не так

1. **Проверьте логи Vercel**: vercel.com → ваш проект → Deployments → логи
2. **Проверьте логи Railway**: `railway logs`
3. **Проверьте переменные окружения** в обоих сервисах
4. **Документация**: см. [DEPLOYMENT.md](DEPLOYMENT.md) или [GITHUB_DEPLOY_INSTRUCTIONS.md](GITHUB_DEPLOY_INSTRUCTIONS.md)

---

*Обновлено: 2026-01-27*
