# 🚀 Деплой одним кликом

## 1️⃣ Railway (API + Database)

**Нажми эту кнопку:**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/postgres?referralCode=rebordev)

Или открой: https://railway.app/new/template/postgres

**После создания проекта:**

1. Создай новый сервис: "+ New" → "GitHub Repo"
2. Выбери `nik45114/rebordev-hub`
3. Настройки:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

4. Добавь переменные (Settings → Variables):
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super-secret-key-change-me
NODE_ENV=production
FRONTEND_URL=https://твой-сайт.pages.dev
PORT=4000
```

5. Deploy!

---

## 2️⃣ Vercel (Frontend)

**Нажми эту кнопку:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nik45114/rebordev-hub&project-name=rebordev-hub&root-directory=apps/web&env=NEXT_PUBLIC_API_URL)

Или открой: https://vercel.com/new/git

**Настройки:**
1. Repository: `nik45114/rebordev-hub`
2. Root Directory: `apps/web`
3. Framework Preset: Next.js
4. Environment Variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://твой-api.railway.app/api`

5. Deploy!

---

## 3️⃣ Или Cloudflare Pages (альтернатива Vercel)

**Открой:** https://dash.cloudflare.com/

1. Pages → Create a project
2. Connect to Git → GitHub → `nik45114/rebordev-hub`
3. Build settings:
   - **Framework preset**: Next.js
   - **Root directory**: `apps/web`
   - **Build command**: `pnpm build`
   - **Build output directory**: `.next`

4. Environment variables:
   ```
   NEXT_PUBLIC_API_URL = https://твой-api.railway.app/api
   NODE_VERSION = 20
   ```

5. Save and Deploy!

---

## 4️⃣ Или Netlify (ещё одна альтернатива)

**Нажми:** https://app.netlify.com/start

1. Import from Git → GitHub → `nik45114/rebordev-hub`
2. Build settings:
   - **Base directory**: `apps/web`
   - **Build command**: `pnpm build`
   - **Publish directory**: `apps/web/.next`

3. Environment variables:
   ```
   NEXT_PUBLIC_API_URL = https://твой-api.railway.app/api
   ```

4. Deploy site!

---

## ✅ После деплоя

1. **Скопируй URL API** из Railway (типа `https://xxx.railway.app`)
2. **Обнови `NEXT_PUBLIC_API_URL`** на Vercel/Cloudflare/Netlify
3. **Обнови `FRONTEND_URL`** на Railway
4. **Перезапусти оба сервиса**

---

## 🎯 Какой выбрать?

| Платформа | Frontend | Плюсы | Минусы |
|-----------|----------|-------|---------|
| **Vercel** | ✅ | Лучший для Next.js, быстрый | Платный после лимитов |
| **Cloudflare Pages** | ✅ | Полностью бесплатный | Медленнее деплой |
| **Netlify** | ✅ | Простой, бесплатный | Чуть медленнее Vercel |
| **Railway** | API + DB | Очень простой для бэкенда | $5/мес после триала |

**Рекомендую:**
- Frontend: **Vercel** (самый быстрый для Next.js)
- Backend + DB: **Railway** (проще всего для Fastify + Postgres)

---

## 🆘 Нужна помощь?

Просто пришли мне ссылки на проекты после создания и я настрою всё остальное!
