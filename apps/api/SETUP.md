# Инструкция по запуску API

## 1. Установка PostgreSQL

### Вариант А: Docker (рекомендуется)

```bash
docker run --name rebordev-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=rebordev_hub \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Вариант Б: Локальная установка

1. Скачайте PostgreSQL 16 с https://www.postgresql.org/download/
2. Установите с паролем `postgres`
3. Создайте базу данных `rebordev_hub`

## 2. Установка зависимостей

```bash
cd d:\2\newhub\apps\api
pnpm install
```

## 3. Настройка окружения

Файл `.env` уже создан с настройками для локальной разработки:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rebordev_hub?schema=public"
JWT_SECRET=super-secret-jwt-key-minimum-32-characters-long-for-production
PORT=4000
```

## 4. Создание таблиц в БД

```bash
pnpm prisma migrate dev --name init --url "postgresql://postgres:postgres@localhost:5432/rebordev_hub?schema=public"
```

## 5. Заполнение mock-данными

```bash
pnpm prisma:seed
```

Это создаст:
- 5 пользователей (password: `password123`)
- 4 проекта с задачами
- 3 сервера
- Фриланс заказы и клиентов
- Чаты с сообщениями

## 6. Запуск сервера

```bash
pnpm dev
```

Сервер будет доступен на http://localhost:4000

## 7. Проверка работы

```bash
# Health check
curl http://localhost:4000/health

# Регистрация
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Логин
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vladimir@rebordev.ru","password":"password123"}'
```

## API Endpoints

### Публичные
- `GET /health` - проверка статуса
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход

### Защищенные (требуют Bearer token)
- `GET /api/auth/profile` - профиль пользователя
- `POST /api/auth/logout` - выход

## Тестовые пользователи

| Email | Пароль | Роль |
|-------|--------|------|
| vladimir@rebordev.ru | password123 | OWNER |
| alexey@rebordev.ru | password123 | TEAMLEAD |
| maria@rebordev.ru | password123 | DEVELOPER |
| dmitry@rebordev.ru | password123 | DEVELOPER |
| anna@rebordev.ru | password123 | DEVELOPER |

## Prisma Studio

Просмотр и редактирование данных в удобном интерфейсе:

```bash
pnpm prisma:studio
```

Откроется на http://localhost:5555

## Troubleshooting

### Ошибка подключения к БД

```
Error: Can't reach database server at `localhost:5432`
```

**Решение:** Убедитесь что PostgreSQL запущен:
```bash
docker ps  # Проверить запущенные контейнеры
# или
pg_ctl status  # Для локальной установки
```

### Prisma 7 требует adapter

Prisma 7 использует новую архитектуру с адаптерами. В проекте уже настроено:
- `@prisma/adapter-pg` для подключения к PostgreSQL
- `pg` пул соединений
- Конфигурация в `src/config/database.ts`

### Port уже занят

```bash
# Найти процесс на порту 4000
netstat -ano | findstr :4000

# Остановить процесс
taskkill /PID <PID> /F
```
