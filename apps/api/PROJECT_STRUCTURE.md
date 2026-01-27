# Структура проекта ReborDev Hub API

## Созданная структура

```
d:\2\newhub\apps\api\
├── package.json                 # Зависимости и скрипты
├── tsconfig.json                # TypeScript конфигурация
├── .env                         # Переменные окружения (для разработки)
├── .env.example                 # Пример env файла
├── .gitignore                   # Git ignore rules
├── README.md                    # Основная документация
├── SETUP.md                     # Инструкция по запуску
├── PROJECT_STRUCTURE.md         # Этот файл
│
├── prisma/
│   ├── schema.prisma            # ПОЛНАЯ схема БД (15+ моделей)
│   ├── prisma.config.ts         # Prisma 7 конфигурация
│   └── seed.ts                  # Mock-данные (5 users, 4 projects, etc)
│
└── src/
    ├── index.ts                 # Entry point
    ├── server.ts                # Fastify сервер с роутами
    │
    ├── config/
    │   ├── env.ts               # Zod валидация env переменных
    │   └── database.ts          # Prisma Client + pg adapter
    │
    ├── modules/
    │   └── auth/
    │       ├── auth.types.ts    # Zod схемы для валидации
    │       ├── auth.service.ts  # Бизнес-логика (register, login)
    │       ├── auth.controller.ts  # Handlers для routes
    │       └── auth.routes.ts   # Fastify роуты
    │
    ├── middleware/
    │   └── auth.middleware.ts   # JWT проверка + session validation
    │
    └── utils/
        └── jwt.ts               # Генерация и проверка JWT токенов
```

## База данных (Prisma Schema)

### Модели (15 таблиц)

#### Пользователи
- `User` - пользователи системы
- `Session` - JWT сессии
- `UserSkill` - навыки сотрудников (Python, React, etc)

#### Проекты и задачи
- `Project` - проекты
- `Task` - задачи (с поддержкой субзадач)
- `TaskComment` - комментарии к задачам
- `TaskFile` - файлы задач

#### Фриланс
- `Order` - заказы с бирж (FL.ru, Kwork, etc)
- `Client` - клиенты фрилансера

#### Чаты с AI
- `Chat` - чаты (проектные, задачные, свободные)
- `ChatMessage` - сообщения (USER, ASSISTANT, SYSTEM)
- `MemoryEntry` - система памяти AI (mem0)

#### Серверы
- `Server` - удаленные серверы
- `Backup` - бэкапы серверов

#### Уведомления
- `Notification` - системные уведомления

## API Endpoints

### Health Check
- `GET /health` - статус сервера

### Authentication
- `POST /api/auth/register` - регистрация (email, password, name)
- `POST /api/auth/login` - вход (email, password)
- `GET /api/auth/profile` - профиль (protected)
- `POST /api/auth/logout` - выход (protected)

## Технологии

### Core
- **Fastify 5.7** - быстрый веб-фреймворк
- **Prisma 7.3** - ORM с типобезопасностью
- **PostgreSQL** - реляционная БД
- **TypeScript 5.9** - типизированный JavaScript

### Validation & Security
- **Zod 3.25** - валидация схем
- **bcryptjs 2.4** - хеширование паролей
- **jsonwebtoken 9.0** - JWT токены

### Database
- **@prisma/adapter-pg** - Prisma 7 адаптер для PostgreSQL
- **pg 8.17** - PostgreSQL драйвер (connection pool)

### Development
- **tsx 4.21** - TypeScript executor (hot reload)
- **pino-pretty 13.1** - красивые логи

## Особенности реализации

### 1. Prisma 7 адаптер
Использует новую архитектуру Prisma 7 с адаптером:
```typescript
const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

### 2. Env валидация через Zod
Все переменные окружения проверяются при старте:
```typescript
const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  // ...
})
```

### 3. Middleware для авторизации
Проверяет JWT токен + наличие активной сессии в БД:
```typescript
export async function authMiddleware(request, reply) {
  const token = request.headers.authorization?.substring(7)
  const payload = verifyToken(token)
  const session = await prisma.session.findUnique({ where: { token } })
  // ...
}
```

### 4. Типобезопасный Auth
Все входные данные валидируются через Zod:
```typescript
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})
```

### 5. Mock-данные в seed
Seed скрипт создает полноценный набор тестовых данных:
- 5 пользователей с навыками
- 4 проекта с разными статусами
- Задачи для каждого проекта
- 3 сервера с метриками
- Фриланс заказы и клиенты
- Чаты с сообщениями

## Готовность к расширению

### Модули, которые можно добавить
- `projects/` - CRUD проектов
- `tasks/` - CRUD задач, канбан
- `chats/` - работа с AI чатами
- `freelance/` - парсинг FL.ru, Kwork
- `servers/` - управление серверами
- `notifications/` - WebSocket уведомления

### AI провайдеры (можно добавить в packages/ai-core)
- Claude Code CLI
- DeepSeek API
- OpenAI GPT-4 API

## Как использовать

1. **Запустите PostgreSQL** (Docker или локально)
2. **Установите зависимости**: `pnpm install`
3. **Создайте таблицы**: `pnpm prisma migrate dev --name init --url "postgresql://..."`
4. **Заполните данными**: `pnpm prisma:seed`
5. **Запустите сервер**: `pnpm dev`
6. **Тестируйте API**: http://localhost:4000

## Статус проекта

✅ **Выполнено:**
- Полная структура API сервера
- Prisma схема с 15 моделями
- Auth модуль (регистрация, вход, JWT)
- Env валидация через Zod
- Middleware для защищенных роутов
- Seed скрипт с mock-данными
- Документация (README, SETUP, PROJECT_STRUCTURE)

🚧 **TODO для MVP:**
- Projects API (CRUD, канбан)
- Tasks API (CRUD, статусы)
- Chats API (создание, сообщения)
- Freelance API (парсинг, AI анализ)
- WebSocket для real-time

## Команды разработки

```bash
# Разработка
pnpm dev              # Запуск с hot reload

# База данных
pnpm prisma:generate  # Генерация Prisma Client
pnpm prisma:migrate   # Создание миграции
pnpm prisma:seed      # Заполнение mock-данными
pnpm prisma:studio    # UI для БД

# Production
pnpm build            # TypeScript компиляция
pnpm start            # Запуск собранного кода
```

## Тестирование API

### Регистрация
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User"}'
```

### Логин
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vladimir@rebordev.ru","password":"password123"}'
```

### Профиль (с токеном)
```bash
curl http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Архитектура

```
Request → Fastify → Middleware → Controller → Service → Prisma → PostgreSQL
                                                     ↓
                                                Response
```

1. **Fastify** - обрабатывает HTTP запросы
2. **Middleware** - проверяет авторизацию
3. **Controller** - валидирует входные данные (Zod)
4. **Service** - бизнес-логика
5. **Prisma** - работа с БД через типобезопасный ORM
6. **PostgreSQL** - хранение данных

---

**Проект готов к разработке!** 🚀

Все файлы созданы, зависимости установлены, структура готова к расширению.
