# Инструкция по установке ReborDev Hub Frontend

## Быстрый старт

### 1. Установка зависимостей

```bash
cd d:\2\newhub\apps\web
npm install
```

### 2. Настройка окружения

Создайте файл `.env.local`:

```bash
cp .env.local.example .env.local
```

Отредактируйте `.env.local` и укажите URL вашего бэкенда:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Запуск приложения

```bash
# Режим разработки
npm run dev
```

Откройте браузер: http://localhost:3000

## Структура проекта

```
apps/web/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout с темной темой
│   ├── page.tsx                 # Landing page
│   ├── providers.tsx            # React Query provider
│   ├── globals.css              # Global styles + Tailwind
│   ├── login/page.tsx           # Форма входа
│   ├── register/page.tsx        # Форма регистрации
│   └── dashboard/               # Защищенная область
│       ├── layout.tsx           # Layout с Sidebar + Header
│       ├── page.tsx             # Главная дашборда
│       ├── projects/page.tsx    # Проекты
│       ├── freelance/page.tsx   # Фриланс
│       ├── chats/page.tsx       # Чаты
│       ├── team/page.tsx        # Команда
│       ├── servers/page.tsx     # Серверы
│       ├── reports/page.tsx     # Отчёты
│       └── settings/page.tsx    # Настройки
├── components/
│   ├── ui/                      # shadcn/ui компоненты
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── label.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   └── dropdown-menu.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx          # Боковое меню (8 пунктов)
│   │   └── Header.tsx           # Шапка с профилем
│   └── dashboard/
│       └── MetricCard.tsx       # Карточка метрики
├── lib/
│   ├── api-client.ts            # Axios + JWT interceptors
│   └── utils.ts                 # cn для Tailwind
├── hooks/
│   └── useAuth.ts               # React Query + Zustand
├── package.json
├── next.config.mjs
├── tailwind.config.ts           # Кастомная темная тема
├── tsconfig.json
└── README.md
```

## Функционал

### ✅ Авторизация
- Форма входа с валидацией (React Hook Form + Zod)
- Форма регистрации
- JWT токены в localStorage
- Автоматический редирект на /login при отсутствии авторизации
- Axios interceptors для добавления токена

### ✅ Dashboard
- **Sidebar**: 8 пунктов меню с иконками Heroicons, сворачивается
- **Header**: Профиль пользователя, уведомления, выход
- **Метрики**: Проекты, команда, часы, доход с трендами
- **Проекты**: Список с прогресс-барами
- **Команда**: Список участников с поиском
- **Фриланс**: Биржа заказов
- **Чаты**: Мессенджер с списком чатов
- **Серверы**: Мониторинг с CPU/Memory/Disk
- **Отчёты**: Заглушки для графиков
- **Настройки**: Профиль, безопасность, уведомления

### ✅ Дизайн система
- Фон: `#0F0D1A`
- Карточки: `#1E1B2E`
- Акцент: `#7C3AED`
- Только темная тема
- Русский интерфейс
- Адаптивный дизайн

## API Integration

Все API запросы настроены в `lib/api-client.ts`:

```typescript
import { authAPI, projectsAPI, teamAPI } from '@/lib/api-client';

// Вход
await authAPI.login({ email, password });

// Получение профиля
await authAPI.getProfile();

// Проекты
await projectsAPI.getAll();
```

JWT токен автоматически добавляется к каждому запросу.

## Технологии

- **Next.js 14** - App Router, Server Components
- **TypeScript** - Типобезопасность
- **Tailwind CSS** - Стилизация
- **shadcn/ui** - UI компоненты
- **React Query** - Состояние сервера
- **Zustand** - Клиентское состояние
- **React Hook Form + Zod** - Формы и валидация
- **Axios** - HTTP клиент
- **Heroicons** - Иконки

## Полезные команды

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Билд для продакшена
npm run build

# Запуск продакшен версии
npm run start

# Линтинг
npm run lint
```

## Troubleshooting

### Проблема: "Module not found"
```bash
# Удалите node_modules и переустановите
rm -rf node_modules
npm install
```

### Проблема: Ошибки TypeScript
```bash
# Проверьте версии пакетов
npm outdated

# Обновите зависимости
npm update
```

### Проблема: Не работает API
Проверьте `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Производительность

- ⚡ Server Components по умолчанию
- ⚡ Автоматическое code splitting
- ⚡ Оптимизация изображений
- ⚡ Lazy loading компонентов
- ⚡ React Query кеширование

## Безопасность

- 🔒 JWT токены в localStorage
- 🔒 Автоматический refresh при 401
- 🔒 HTTPS в продакшене
- 🔒 XSS защита (React по умолчанию)
- 🔒 CSRF защита

## Развертывание

### Vercel (рекомендуется)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
# Build
docker build -t rebordev-hub-web .

# Run
docker run -p 3000:3000 rebordev-hub-web
```

### Static Export
```bash
npm run build
# Файлы в /out
```

## Лицензия

© 2024 ReborDev. Все права защищены.
