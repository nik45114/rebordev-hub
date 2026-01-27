# ReborDev Hub

AI-хаб для управления проектами и фрилансом

## Структура проекта

- `apps/web` - Next.js 14 фронтенд
- `apps/api` - Fastify API бэкенд
- `packages/shared` - Общие типы и константы
- `packages/ai-core` - AI интеграция (Claude Code, DeepSeek, OpenAI)
- `packages/ui` - Переиспользуемые UI компоненты
- `docker` - Docker Compose конфигурация

## Технологии

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Fastify, Node.js, TypeScript
- **Database:** PostgreSQL + Prisma
- **Cache/Queue:** Redis + BullMQ
- **Search:** Meilisearch
- **Storage:** MinIO
- **AI:** Claude Code CLI, DeepSeek API, OpenAI API, mem0

## Установка

```bash
# Установка зависимостей
pnpm install

# Запуск Docker контейнеров
cd docker && docker-compose up -d

# Применение миграций
cd apps/api && npx prisma migrate dev

# Запуск dev серверов
pnpm dev
```

## Разработка

- Web: http://localhost:3000
- API: http://localhost:4000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Meilisearch: http://localhost:7700
- MinIO: http://localhost:9001

## Деплой

- Demo: https://rebordev-hub.vercel.app
- Production: https://rebordev.ru
