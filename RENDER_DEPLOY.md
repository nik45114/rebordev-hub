# 🎨 Деплой на Render.com (БЕСПЛАТНО)

## Почему Render?
- ✅ Полностью бесплатный
- ✅ Автоматический деплой из GitHub
- ✅ Бесплатная PostgreSQL база (500 МБ)
- ✅ Проще чем Railway

---

## Шаг 1: Создать аккаунт

1. Открой: https://dashboard.render.com/register
2. Войди через GitHub

---

## Шаг 2: Создать PostgreSQL базу

1. Нажми **"New +"** → **"PostgreSQL"**
2. Name: `rebordev-postgres`
3. Database: `rebordev_hub`
4. User: `rebordev`
5. Region: **Frankfurt** (ближе к нам)
6. Plan: **Free**
7. Нажми **"Create Database"**

**Скопируй Internal Database URL** - он понадобится!

---

## Шаг 3: Создать Web Service (API)

1. Нажми **"New +"** → **"Web Service"**
2. Connect GitHub → выбери **nik45114/rebordev-hub**
3. Настройки:

```
Name: rebordev-api
Region: Frankfurt
Branch: master
Root Directory: apps/api
Runtime: Node
Build Command: npm install -g pnpm && pnpm install && pnpm build
Start Command: pnpm start
Plan: Free
```

4. **Advanced** → Environment Variables:

```
DATABASE_URL = <вставь Internal Database URL из шага 2>
JWT_SECRET = any-random-secret-key-change-me
NODE_ENV = production
FRONTEND_URL = https://web-eta-two-88.vercel.app
PORT = 10000
```

5. Нажми **"Create Web Service"**

---

## Шаг 4: Подождать деплоя

Render будет деплоить 5-10 минут (бесплатный план медленный).

После деплоя получишь URL типа:
`https://rebordev-api.onrender.com`

---

## Шаг 5: Создать пользователя в БД

1. В Render Dashboard → твоя база данных
2. Нажми **"Connect"** → **"PSQL Command"**
3. Скопируй команду и выполни в терминале:

```bash
psql -h <host> -U rebordev rebordev_hub
```

4. Выполни SQL:

```sql
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT,
  name TEXT NOT NULL,
  "avatarUrl" TEXT,
  "telegramId" TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'DEVELOPER',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "User" (id, email, "passwordHash", name, role)
VALUES (
  'admin123456789',
  'admin@rebordev.ru',
  '$2a$10$w5RV3gUt0rwRireC9zGkROimky/Xy5REMFU29yCiZy/ExYZeMg0B.',
  'Admin',
  'OWNER'
);
```

---

## Шаг 6: Обновить Vercel

1. Открой: https://vercel.com/nik45114s-projects/web/settings/environment-variables
2. Добавь переменную:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://rebordev-api.onrender.com/api`
3. **Redeploy** проект

---

## Готово! 🎉

Открой: **https://web-eta-two-88.vercel.app**

Войди:
- Email: `admin@rebordev.ru`
- Password: `admin123`

---

## 🆚 Render vs Railway

| Фича | Render | Railway |
|------|--------|---------|
| Цена | **100% бесплатно** | $5/мес после триала |
| Скорость деплоя | 5-10 мин | 2-3 мин |
| PostgreSQL | ✅ 500 МБ бесплатно | ✅ Лимитировано триалом |
| Простота | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Аптайм | 99%+ | 99.9%+ |

**Рекомендация**: Render для старта (бесплатный), Railway для продакшена.
