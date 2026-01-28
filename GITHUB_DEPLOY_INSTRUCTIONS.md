# Инструкция по деплою ReborDev Hub на GitHub + Vercel

Проект готов к деплою! Следуйте этим шагам для публикации.

---

## Шаг 1: Создание GitHub репозитория

### Вариант A: Через веб-интерфейс GitHub

1. Перейдите на [github.com](https://github.com) и войдите в аккаунт
2. Нажмите "New repository" (зеленая кнопка справа вверху)
3. Заполните форму:
   - **Repository name**: `rebordev-hub`
   - **Description**: "AI-powered project management and freelance platform"
   - **Visibility**: Private или Public (на ваше усмотрение)
   - **НЕ создавайте** README, .gitignore, license (они уже есть в проекте)
4. Нажмите "Create repository"

5. Скопируйте команды для "push existing repository":
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/rebordev-hub.git
   git branch -M main
   git push -u origin main
   ```

### Вариант B: Через GitHub CLI (если установлен)

```bash
cd d:\2\newhub
gh repo create rebordev-hub --private --source=. --remote=origin --push
```

---

## Шаг 2: Загрузка кода на GitHub

Откройте терминал в папке проекта:

```bash
cd d:\2\newhub

# Добавьте remote (замените YOUR_USERNAME на ваше имя пользователя)
git remote add origin https://github.com/YOUR_USERNAME/rebordev-hub.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Загрузите код
git push -u origin main
```

**После выполнения**: обновите страницу репозитория на GitHub - вы увидите все файлы проекта.

---

## Шаг 3: Деплой фронтенда на Vercel

### 1. Авторизация на Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "Sign Up" или "Log In"
3. Выберите "Continue with GitHub"
4. Разрешите Vercel доступ к вашим репозиториям

### 2. Импорт проекта

1. На главной странице Vercel нажмите **"Add New..."** → **"Project"**
2. В списке репозиториев найдите **`rebordev-hub`**
   - Если не видите: нажмите "Adjust GitHub App Permissions" и разрешите доступ
3. Нажмите **"Import"**

### 3. Настройка проекта

**Configure Project:**

- **Framework Preset**: `Next.js` (должно определиться автоматически)
- **Root Directory**: `apps/web` (нажмите "Edit" и выберите)
- **Build Command**: `npm run build` (по умолчанию)
- **Output Directory**: `.next` (по умолчанию)
- **Install Command**: `pnpm install` (нажмите "Override" если нужно)

**Environment Variables:**

Добавьте переменную окружения:
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `http://localhost:4000/api` (временно, обновим после деплоя бэкенда)

Нажмите **"Add"**

### 4. Деплой

1. Нажмите **"Deploy"**
2. Ждите 2-3 минуты пока проект соберется
3. После завершения получите URL типа: `https://rebordev-hub-xyz123.vercel.app`

**Важно**: Фронтенд развернут, но пока не работает полностью, так как API еще не задеплоен.

---

## Шаг 4: Деплой бэкенда на Railway

### 1. Регистрация на Railway

1. Перейдите на [railway.app](https://railway.app)
2. Нажмите "Login" → "Login with GitHub"
3. Разрешите Railway доступ

### 2. Создание проекта

1. Нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Найдите и выберите **`rebordev-hub`**

### 3. Добавление сервисов

#### 3.1 PostgreSQL

1. Нажмите **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway автоматически создаст БД и сгенерирует `DATABASE_URL`

#### 3.2 Redis

1. Нажмите **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway сгенерирует `REDIS_URL`

#### 3.3 API Service

1. Нажмите **"+ New"** → **"GitHub Repo"** → выберите `rebordev-hub`
2. Railway создаст новый сервис

### 4. Настройка API сервиса

1. Откройте созданный API сервис
2. Перейдите в **Settings**:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

3. Перейдите в **Variables** и добавьте:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-super-secret-production-jwt-key-min-32-chars
DEEPSEEK_API_KEY=sk-ваш-ключ-deepseek
OPENAI_API_KEY=sk-ваш-ключ-openai
FRONTEND_URL=https://rebordev-hub-xyz123.vercel.app
PORT=4000
NODE_ENV=production
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=masterKey123
CLAUDE_CODE_ENABLED=false
```

**Замените**:
- `JWT_SECRET` на случайную строку (минимум 32 символа)
- `DEEPSEEK_API_KEY` на ваш реальный API ключ DeepSeek
- `OPENAI_API_KEY` на ваш реальный API ключ OpenAI
- `FRONTEND_URL` на реальный URL Vercel

4. Нажмите **"Deploy"**

### 5. Применение миграций

После успешного деплоя:

1. Установите Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Авторизуйтесь:
   ```bash
   railway login
   ```

3. Привяжите проект:
   ```bash
   cd d:\2\newhub\apps\api
   railway link
   # Выберите ваш проект и API сервис
   ```

4. Примените миграции:
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma db seed
   ```

### 6. Получение API URL

1. В Railway откройте API сервис
2. Перейдите в **Settings** → **Networking**
3. Нажмите **"Generate Domain"**
4. Скопируйте созданный URL (например: `rebordev-hub-api.up.railway.app`)

---

## Шаг 5: Обновление переменных окружения

### Обновить Vercel (Frontend)

1. Откройте проект на Vercel
2. Перейдите в **Settings** → **Environment Variables**
3. Найдите `NEXT_PUBLIC_API_URL` и измените на:
   ```
   https://rebordev-hub-api.up.railway.app/api
   ```
   (замените на ваш реальный Railway URL)
4. Нажмите **"Save"**
5. Перейдите в **Deployments** → нажмите "Redeploy" для пересборки

### Обновить Railway (Backend)

1. Откройте API сервис на Railway
2. Перейдите в **Variables**
3. Обновите `FRONTEND_URL` на реальный Vercel URL:
   ```
   https://rebordev-hub-xyz123.vercel.app
   ```
4. Railway автоматически передеплоится

---

## Шаг 6: Тестирование

### Проверка API

Откройте в браузере:
```
https://rebordev-hub-api.up.railway.app/health
```

Должен вернуть: `{"status":"ok"}`

### Проверка фронтенда

1. Откройте: `https://rebordev-hub-xyz123.vercel.app`
2. Перейдите на страницу логина
3. Войдите с тестовым пользователем:
   - **Email**: `vladimir@rebordev.ru`
   - **Password**: `password123`

4. Если вход успешен - всё работает!

---

## Следующие шаги

### Опционально: Добавить Meilisearch

Если нужен полнотекстовый поиск:

1. Зарегистрируйтесь на [meilisearch.com](https://www.meilisearch.com)
2. Создайте проект и получите API ключ
3. Добавьте в Railway Variables:
   ```
   MEILI_HOST=https://your-instance.meilisearch.io
   MEILI_MASTER_KEY=your-master-key
   ```

### Опционально: Кастомный домен

**Для фронтенда на Vercel:**

1. Перейдите в **Settings** → **Domains**
2. Нажмите **"Add"**
3. Введите `rebordev.ru` и следуйте инструкциям по настройке DNS

**Для бэкенда на Railway:**

1. В API сервисе перейдите в **Settings** → **Networking**
2. Добавьте кастомный домен `api.rebordev.ru`
3. Настройте DNS записи согласно инструкциям

---

## Полезные команды

### Локальная разработка

```bash
# Запустить Docker
cd docker && docker-compose up -d

# API
cd apps/api && npm run dev

# Frontend
cd apps/web && npm run dev
```

### Деплой обновлений

```bash
# Закоммитить изменения
git add .
git commit -m "Update: описание изменений"
git push origin main

# Vercel и Railway автоматически задеплоят новую версию
```

### Просмотр логов

**Railway:**
```bash
railway logs
```

**Vercel:**
1. Откройте проект на vercel.com
2. Перейдите в **Deployments** → выберите деплой → **View Function Logs**

---

## Troubleshooting

### Ошибка "Cannot find module"

**Решение**: Убедитесь что в Railway:
- Root Directory: `apps/api`
- Install Command использует `pnpm install`

### CORS ошибки

**Решение**: Проверьте что:
1. В Railway Variables `FRONTEND_URL` указан правильный Vercel URL
2. В Vercel Variables `NEXT_PUBLIC_API_URL` указан правильный Railway URL

### База данных не доступна

**Решение**:
```bash
railway run npx prisma migrate reset
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

---

## Контакты

Если возникли вопросы:
- GitHub Issues: https://github.com/YOUR_USERNAME/rebordev-hub/issues
- Email: vladimir@rebordev.ru

---

**Проект готов к использованию!** 🚀

*Создано с помощью Claude Code - © 2026 ReborDev*
