# ⚡ Быстрый деплой - 5 минут

GitHub репозиторий уже создан: **https://github.com/nik45114/rebordev-hub**

---

## Вариант 1: Через командную строку (быстрее)

### 1. Vercel

```bash
# Авторизация (откроется браузер)
vercel login

# Деплой (выберите apps/web как root directory)
cd d:\2\newhub
vercel --prod
```

### 2. Railway

```bash
# Установка и авторизация
npm install -g @railway/cli
railway login

# Инициализация проекта
cd d:\2\newhub\apps\api
railway init

# Добавить PostgreSQL и Redis
railway add --database postgres
railway add --database redis

# Настроить переменные
railway variables set JWT_SECRET="your-random-32-char-secret-key"
railway variables set NODE_ENV="production"
railway variables set PORT="4000"

# Деплой
railway up

# Миграции
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

---

## Вариант 2: Через веб-интерфейс (проще)

### Frontend - Vercel

1. **Откройте**: https://vercel.com
2. **Login** with GitHub
3. **Import** → найдите `nik45114/rebordev-hub`
4. **Root Directory**: `apps/web` ⚠️
5. **Deploy**

### Backend - Railway

1. **Откройте**: https://railway.app
2. **Login** with GitHub
3. **New Project** → **Deploy from GitHub** → `nik45114/rebordev-hub`
4. **+ New** → **Database** → **Add PostgreSQL**
5. **+ New** → **Database** → **Add Redis**
6. **API Service Settings**:
   - Root Directory: `apps/api`
   - Variables: добавьте переменные из `.env.example`
7. **Deploy**
8. **Railway CLI**:
   ```bash
   railway login
   railway link
   railway run npx prisma migrate deploy
   railway run npx prisma db seed
   ```

---

## После деплоя

1. **Получите URLs**:
   - Vercel: автоматически (`https://rebordev-hub-xxx.vercel.app`)
   - Railway: Settings → Networking → Generate Domain

2. **Обновите переменные**:
   - Vercel → Settings → Environment Variables → `NEXT_PUBLIC_API_URL` = Railway URL
   - Railway → Variables → `FRONTEND_URL` = Vercel URL

3. **Redeploy**:
   - Vercel: Deployments → Redeploy
   - Railway: автоматически

4. **Тест**:
   - Откройте Vercel URL
   - Login: `vladimir@rebordev.ru` / `password123`

---

**Всё!** 🚀

*P.S. Подробная документация: [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)*
