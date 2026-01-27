# 🚀 Развертывание ReborDev Hub

## Варианты развертывания

1. **Vercel** (рекомендуется для Next.js)
2. **Docker**
3. **Static Export**
4. **VPS/Dedicated Server**

---

## 1️⃣ Vercel (самый простой)

### Шаг 1: Установка Vercel CLI

```bash
npm install -g vercel
```

### Шаг 2: Логин

```bash
vercel login
```

### Шаг 3: Деплой

```bash
cd d:\2\newhub\apps\web
vercel
```

Следуйте инструкциям CLI.

### Шаг 4: Переменные окружения

В веб-интерфейсе Vercel добавьте:

```
NEXT_PUBLIC_API_URL=https://your-api.com/api
```

### Шаг 5: Production деплой

```bash
vercel --prod
```

**Готово!** Ваше приложение доступно на `https://your-app.vercel.app`

---

## 2️⃣ Docker

### Dockerfile

Создайте `Dockerfile` в корне проекта:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./
RUN npm ci

# Копируем все файлы
COPY . .

# Билд
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Копируем необходимые файлы
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://your-api.com/api
    restart: unless-stopped
```

### Команды

```bash
# Билд
docker build -t rebordev-hub-web .

# Запуск
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://your-api.com/api rebordev-hub-web

# С docker-compose
docker-compose up -d
```

---

## 3️⃣ Static Export

### next.config.mjs

Измените:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Билд

```bash
npm run build
```

Статические файлы будут в `/out`

### Деплой на Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/rebordev-hub/out;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
}
```

---

## 4️⃣ VPS/Dedicated Server

### Требования
- Node.js 20+
- PM2 для process management
- Nginx для reverse proxy

### Установка на сервер

```bash
# 1. Склонируйте проект
git clone https://github.com/your-repo/rebordev-hub.git
cd rebordev-hub/apps/web

# 2. Установите зависимости
npm install

# 3. Создайте .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://your-api.com/api
EOF

# 4. Билд
npm run build

# 5. Установите PM2
npm install -g pm2

# 6. Запустите с PM2
pm2 start npm --name "rebordev-hub-web" -- start

# 7. Сохраните конфигурацию PM2
pm2 save
pm2 startup
```

### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL с Let's Encrypt

```bash
# Установите Certbot
sudo apt install certbot python3-certbot-nginx

# Получите сертификат
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

---

## 📊 Production Checklist

### Перед деплоем

- [ ] `.env.local` настроен правильно
- [ ] API URL указан корректно
- [ ] Все зависимости установлены
- [ ] TypeScript ошибок нет (`npm run build`)
- [ ] ESLint предупреждений нет (`npm run lint`)

### После деплоя

- [ ] Landing page загружается
- [ ] Login/Register работают
- [ ] Dashboard доступен после авторизации
- [ ] API запросы работают
- [ ] Все страницы открываются
- [ ] Мобильная версия работает
- [ ] SSL сертификат установлен (если production)

---

## 🔒 Безопасность

### Переменные окружения

**Никогда не коммитьте .env.local в git!**

Добавьте в `.gitignore`:
```
.env*.local
.env
```

### CORS

Настройте CORS на бэкенде для вашего домена:

```javascript
// Пример для Express.js
app.use(cors({
  origin: 'https://your-domain.com',
  credentials: true
}));
```

### Headers

Добавьте security headers в `next.config.mjs`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

---

## 📈 Мониторинг

### Vercel Analytics

Добавьте в `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Google Analytics

```typescript
// app/layout.tsx
import Script from 'next/script';

<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

---

## 🚀 Performance

### Оптимизация

1. **Lazy Loading**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

2. **Image Optimization**
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={100}
  alt="Logo"
/>
```

3. **Font Optimization**
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});
```

---

## 🔄 CI/CD

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

---

## 🆘 Troubleshooting

### Ошибка: "Build failed"
```bash
# Проверьте логи
npm run build

# Очистите кеш
rm -rf .next node_modules
npm install
npm run build
```

### Ошибка: "API requests failing"
Проверьте CORS и API URL в `.env.local`

### Ошибка: "Module not found"
```bash
npm install
```

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте документацию
2. Посмотрите логи (`pm2 logs` или Vercel dashboard)
3. Проверьте переменные окружения

---

**Успешного деплоя! 🎉**

© 2024 ReborDev. Все права защищены.
