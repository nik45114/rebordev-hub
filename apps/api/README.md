# ReborDev Hub - Fastify API

Fastify API сервер для ReborDev Hub с Prisma ORM и PostgreSQL.

## Структура

```
src/
├── config/          # Конфигурация (env, database)
├── modules/         # Модули (auth, projects, tasks, etc)
├── middleware/      # Middleware (auth)
├── utils/           # Утилиты (jwt)
├── server.ts        # Fastify сервер
└── index.ts         # Entry point
```

## Установка

```bash
pnpm install
```

## Настройка базы данных

1. Создайте PostgreSQL базу данных:
```bash
docker run --name rebordev-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=rebordev_hub -p 5432:5432 -d postgres:16-alpine
```

2. Скопируйте `.env.example` в `.env` и настройте переменные окружения

3. Запустите миграции:
```bash
pnpm prisma:migrate
```

4. Заполните базу mock-данными:
```bash
pnpm prisma:seed
```

## Разработка

```bash
pnpm dev
```

Сервер запустится на http://localhost:4000

## API Endpoints

### Health Check
- `GET /health` - проверка статуса сервера

### Authentication
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/auth/profile` - профиль (protected)
- `POST /api/auth/logout` - выход (protected)

## Тестовые пользователи

После выполнения seed скрипта доступны следующие аккаунты:

- **Владимир Иванов (OWNER)**: `vladimir@rebordev.ru` / `password123`
- **Алексей Петров (TEAMLEAD)**: `alexey@rebordev.ru` / `password123`
- **Мария Сидорова (DEVELOPER)**: `maria@rebordev.ru` / `password123`
- **Дмитрий Козлов (DEVELOPER)**: `dmitry@rebordev.ru` / `password123`
- **Анна Новикова (DEVELOPER)**: `anna@rebordev.ru` / `password123`

## Prisma

```bash
# Открыть Prisma Studio
pnpm prisma:studio

# Создать новую миграцию
pnpm prisma:migrate

# Сгенерировать Prisma Client
pnpm prisma:generate
```

## Production Build

```bash
pnpm build
pnpm start
```
