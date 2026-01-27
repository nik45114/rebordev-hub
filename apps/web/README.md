# ReborDev Hub - Frontend

Современный фронтенд для платформы управления проектами, фрилансом и командной работой.

## Технологии

- **Next.js 14** с App Router
- **TypeScript** для типобезопасности
- **Tailwind CSS** для стилизации
- **shadcn/ui** компоненты
- **React Query** для управления состоянием сервера
- **Zustand** для клиентского состояния
- **React Hook Form + Zod** для валидации форм
- **Axios** для HTTP запросов

## Установка

```bash
# Установка зависимостей
npm install

# Создание файла окружения
cp .env.local.example .env.local

# Укажите URL бэкенда в .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Запуск

```bash
# Режим разработки
npm run dev

# Открыть в браузере: http://localhost:3000

# Билд для продакшена
npm run build

# Запуск продакшен версии
npm run start
```

## Структура проекта

```
apps/web/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Корневой layout с темой
│   ├── page.tsx             # Landing page
│   ├── providers.tsx        # React Query provider
│   ├── login/               # Страница входа
│   ├── register/            # Страница регистрации
│   └── dashboard/           # Защищенная область
│       ├── layout.tsx       # Layout с Sidebar + Header
│       └── page.tsx         # Главная страница дашборда
├── components/
│   ├── ui/                  # shadcn/ui компоненты
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/              # Layout компоненты
│   │   ├── Sidebar.tsx      # Боковое меню (сворачивается)
│   │   └── Header.tsx       # Шапка с профилем
│   └── dashboard/
│       └── MetricCard.tsx   # Карточка метрики
├── lib/
│   ├── api-client.ts        # Axios клиент с JWT
│   └── utils.ts             # Утилиты (cn для tailwind)
├── hooks/
│   └── useAuth.ts           # React Query + Zustand для auth
├── tailwind.config.ts       # Tailwind конфигурация
├── next.config.mjs          # Next.js конфигурация
└── tsconfig.json            # TypeScript конфигурация
```

## Дизайн система

### Цветовая палитра (темная тема)

- **Фон**: `#0F0D1A` (--background)
- **Карточки**: `#1E1B2E` (--card)
- **Акцент**: `#7C3AED` (--primary)
- **Текст**: `#FAFAFA` (--foreground)
- **Приглушенный**: `#A3A3A3` (--muted-foreground)

### Компоненты

Все UI компоненты используют shadcn/ui с кастомной темной палитрой:
- Button (5 вариантов)
- Input
- Card
- Label
- Avatar
- Dropdown Menu

## Функционал

### Авторизация
- ✅ Форма входа с валидацией (Zod)
- ✅ Форма регистрации
- ✅ JWT токены в localStorage
- ✅ Автоматический редирект на /login
- ✅ Interceptors для добавления токена к запросам

### Dashboard
- ✅ Sidebar с 8 пунктами меню (иконки Heroicons)
- ✅ Header с профилем и уведомлениями
- ✅ Метрики (проекты, команда, часы, доход)
- ✅ Недавние проекты с прогресс-барами
- ✅ Активность команды
- ✅ Быстрые действия

### Роутинг
- `/` - Landing page
- `/login` - Вход
- `/register` - Регистрация
- `/dashboard` - Главная (защищено)
- `/dashboard/projects` - Проекты
- `/dashboard/freelance` - Фриланс биржа
- `/dashboard/chats` - Чаты
- `/dashboard/team` - Команда
- `/dashboard/servers` - Серверы
- `/dashboard/reports` - Отчёты
- `/dashboard/settings` - Настройки

## API Integration

API клиент настроен в `lib/api-client.ts`:

```typescript
// Пример использования
import { authAPI } from '@/lib/api-client';

const response = await authAPI.login({
  email: 'user@example.com',
  password: 'password'
});
```

Все запросы автоматически включают JWT токен из localStorage.

## Интерфейс

- 🌑 **Только темная тема** (соответствие ТЗ)
- 🇷🇺 **Русский интерфейс**
- 📱 **Адаптивный дизайн** (mobile, tablet, desktop)
- ⚡ **Оптимизация**: сворачивающийся Sidebar, lazy loading
- 🎨 **Современный UI**: градиенты, тени, анимации

## Лицензия

© 2024 ReborDev. Все права защищены.
