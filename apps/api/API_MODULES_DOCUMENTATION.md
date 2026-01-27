# ReborDev Hub API Modules Documentation

Полная документация по всем 4 API модулям.

## Оглавление

- [Projects Module](#projects-module)
- [Tasks Module](#tasks-module)
- [Chats Module](#chats-module)
- [Freelance Module](#freelance-module)

---

## Projects Module

### Endpoints

#### GET /api/projects
Получить список всех проектов пользователя.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Project description",
      "status": "PLANNING | IN_PROGRESS | COMPLETED | ARCHIVED",
      "deadline": "2024-12-31T00:00:00Z",
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "_count": {
        "tasks": 10
      }
    }
  ]
}
```

#### GET /api/projects/:id
Получить проект с задачами.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Project Name",
    "description": "Project description",
    "status": "IN_PROGRESS",
    "tasks": [...],
    "_count": {
      "tasks": 10
    }
  }
}
```

#### POST /api/projects
Создать новый проект (с опцией AI генерации задач).

**Request:**
```json
{
  "name": "My New Project",
  "description": "Project description",
  "status": "PLANNING",
  "deadline": "2024-12-31T00:00:00Z",
  "aiGenerate": true,
  "aiPrompt": "Generate tasks for a React + TypeScript web app"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My New Project",
    ...
  }
}
```

#### PATCH /api/projects/:id
Обновить проект.

**Request:**
```json
{
  "name": "Updated Name",
  "status": "IN_PROGRESS",
  "deadline": "2024-12-31T00:00:00Z"
}
```

#### DELETE /api/projects/:id
Удалить проект.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Project deleted successfully"
  }
}
```

#### POST /api/projects/:id/ai-generate
AI генерация задач для проекта.

**Request:**
```json
{
  "prompt": "Generate tasks for implementing user authentication",
  "count": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "count": 10,
    "tasks": [...]
  }
}
```

---

## Tasks Module

### Endpoints

#### GET /api/tasks
Получить список задач с фильтрами.

**Query Parameters:**
- `projectId` (optional) - UUID проекта
- `status` (optional) - TODO | IN_PROGRESS | REVIEW | DONE
- `assigneeId` (optional) - UUID исполнителя
- `priority` (optional) - LOW | MEDIUM | HIGH | URGENT

**Example:** `/api/tasks?projectId=uuid&status=IN_PROGRESS`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Task description",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "estimatedHours": 8,
      "dueDate": "2024-12-31T00:00:00Z",
      "project": {
        "id": "uuid",
        "name": "Project Name"
      },
      "assignee": {
        "id": "uuid",
        "name": "User Name",
        "email": "user@example.com"
      },
      "createdBy": {
        "id": "uuid",
        "name": "Creator Name"
      },
      "_count": {
        "comments": 5
      }
    }
  ]
}
```

#### GET /api/tasks/:id
Получить задачу с комментариями.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task Title",
    "description": "Task description",
    "comments": [
      {
        "id": "uuid",
        "content": "Comment text",
        "user": {
          "id": "uuid",
          "name": "User Name"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /api/tasks
Создать задачу.

**Request:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "TODO",
  "priority": "HIGH",
  "projectId": "uuid",
  "assigneeId": "uuid",
  "estimatedHours": 8,
  "dueDate": "2024-12-31T00:00:00Z"
}
```

#### PATCH /api/tasks/:id
Обновить задачу.

**Request:**
```json
{
  "title": "Updated Task",
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "assigneeId": "uuid"
}
```

#### PATCH /api/tasks/:id/status
Изменить статус задачи (для канбана).

**Request:**
```json
{
  "status": "DONE"
}
```

#### DELETE /api/tasks/:id
Удалить задачу.

#### POST /api/tasks/:id/comments
Добавить комментарий к задаче.

**Request:**
```json
{
  "content": "This is a comment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "This is a comment",
    "user": {
      "id": "uuid",
      "name": "User Name"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Chats Module

### Endpoints

#### GET /api/chats
Получить список чатов пользователя.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Chat Title",
      "mode": "CODE",
      "userId": "uuid",
      "projectId": "uuid",
      "taskId": null,
      "freelanceOrderId": null,
      "project": {
        "id": "uuid",
        "name": "Project Name"
      },
      "_count": {
        "messages": 15
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/chats/:id
Получить чат с историей сообщений.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Chat Title",
    "mode": "CODE",
    "messages": [
      {
        "id": "uuid",
        "content": "Message content",
        "role": "user",
        "provider": null,
        "createdAt": "2024-01-01T00:00:00Z"
      },
      {
        "id": "uuid",
        "content": "AI response",
        "role": "assistant",
        "provider": "DEEPSEEK",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /api/chats
Создать чат с привязкой к проекту/задаче/заказу.

**Request:**
```json
{
  "title": "Chat about authentication",
  "mode": "CODE",
  "projectId": "uuid",
  "taskId": "uuid",
  "freelanceOrderId": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Chat about authentication",
    "mode": "CODE",
    "_count": {
      "messages": 1
    }
  }
}
```

#### POST /api/chats/:id/messages
Отправить сообщение (с AI интеграцией).

**Request:**
```json
{
  "content": "How do I implement JWT authentication?",
  "useAI": true,
  "provider": "DEEPSEEK"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "uuid",
      "content": "How do I implement JWT authentication?",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "aiMessage": {
      "id": "uuid",
      "content": "To implement JWT authentication...",
      "role": "assistant",
      "provider": "DEEPSEEK",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### PATCH /api/chats/:id/mode
Сменить режим чата.

**Request:**
```json
{
  "mode": "ARCHITECT"
}
```

**Available modes:**
- `ARCHITECT` - Архитектурное проектирование
- `CODE` - Написание кода
- `REVIEW` - Ревью кода
- `DEBUG` - Отладка
- `DOCS` - Документация

#### DELETE /api/chats/:id
Удалить чат.

---

## Freelance Module

### Endpoints

#### GET /api/freelance/orders
Получить список заказов.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Order Title",
      "description": "Order description",
      "budget": 50000,
      "deadline": "2024-12-31T00:00:00Z",
      "url": "https://www.fl.ru/projects/...",
      "platform": "FLRU",
      "status": "NEW",
      "aiAnalysis": null,
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/freelance/orders/:id
Получить заказ.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Order Title",
    "description": "Full order description...",
    "budget": 50000,
    "aiAnalysis": {
      "technical": {...},
      "budget": {...},
      "timeline": {...},
      "risk": {...},
      "profit": {...}
    }
  }
}
```

#### POST /api/freelance/orders
Добавить заказ вручную.

**Request:**
```json
{
  "title": "React Developer Needed",
  "description": "We need a React developer for...",
  "budget": 50000,
  "deadline": "2024-12-31T00:00:00Z",
  "url": "https://www.fl.ru/projects/...",
  "platform": "FLRU",
  "status": "NEW"
}
```

#### POST /api/freelance/orders/:id/analyze
AI анализ заказа (DeepSeek).

**Request:**
```json
{
  "aspects": ["TECHNICAL", "BUDGET", "TIMELINE", "RISK", "PROFIT"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "analysis": {
      "technical": {
        "complexity": "MEDIUM",
        "technologies": ["React", "TypeScript", "Node.js"],
        "estimatedHours": 80,
        "notes": "..."
      },
      "budget": {
        "isRealistic": true,
        "recommendedBudget": 60000,
        "profitMargin": 20,
        "notes": "..."
      },
      "timeline": {
        "isRealistic": true,
        "estimatedDays": 14,
        "risks": ["..."],
        "notes": "..."
      },
      "risk": {
        "level": "LOW",
        "factors": ["..."],
        "mitigation": ["..."],
        "notes": "..."
      },
      "profit": {
        "score": 8,
        "pros": ["..."],
        "cons": ["..."],
        "recommendation": "ACCEPT",
        "notes": "..."
      },
      "summary": "Overall analysis summary..."
    },
    "order": {...}
  }
}
```

#### POST /api/freelance/orders/:id/convert
Конвертировать заказ в проект.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "project": {
      "id": "uuid",
      "name": "Order Title",
      "description": "Order description",
      "status": "PLANNING",
      ...
    }
  }
}
```

#### POST /api/freelance/parse
Запустить парсинг FL.ru (Puppeteer).

**Request:**
```json
{
  "category": "razrabotka-saytov",
  "maxPages": 3,
  "filters": {
    "minBudget": 30000,
    "maxBudget": 100000,
    "keywords": ["React", "TypeScript"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "total": 50,
    "saved": 45,
    "orders": [...]
  }
}
```

---

## Общие особенности

### Авторизация
Все эндпоинты защищены авторизацией. Необходимо передавать JWT токен в заголовке:

```
Authorization: Bearer <token>
```

### Валидация
Все входные данные валидируются с помощью Zod. При ошибке валидации возвращается:

```json
{
  "success": false,
  "error": "Validation error",
  "details": {...}
}
```

### Обработка ошибок
Стандартный формат ошибки:

```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP коды:
- `200` - Success
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `404` - Not found
- `500` - Internal server error

### AI Интеграция
Модули используют пакет `@rebordev/ai-core` для AI функций:
- **DeepSeek** - Для кода, анализа заказов, генерации задач (быстрый и дешевый)
- **Claude** - Для архитектуры и ревью (более вдумчивый)
- **OpenAI** - Для документации

### База данных
Используется Prisma ORM для работы с PostgreSQL.

---

## Примеры использования

### Создание проекта с AI генерацией задач

```typescript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'E-commerce Platform',
    description: 'Full-stack e-commerce with React and Node.js',
    aiGenerate: true,
    aiPrompt: 'Generate tasks for building an e-commerce platform with React, Node.js, PostgreSQL, and Stripe payment integration'
  })
})

const data = await response.json()
```

### Работа с канбаном (изменение статуса задачи)

```typescript
const response = await fetch(`/api/tasks/${taskId}/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'DONE'
  })
})
```

### AI чат с контекстом проекта

```typescript
// Создать чат
const chatResponse = await fetch('/api/chats', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Authentication Discussion',
    mode: 'CODE',
    projectId: projectId
  })
})

const { data: chat } = await chatResponse.json()

// Отправить сообщение
const messageResponse = await fetch(`/api/chats/${chat.id}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'How do I implement JWT refresh tokens?',
    useAI: true,
    provider: 'DEEPSEEK'
  })
})
```

### Парсинг и анализ заказов с FL.ru

```typescript
// Парсим заказы
const parseResponse = await fetch('/api/freelance/parse', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    category: 'razrabotka-saytov',
    maxPages: 3,
    filters: {
      minBudget: 50000,
      keywords: ['React', 'TypeScript']
    }
  })
})

const { data: parseResult } = await parseResponse.json()

// Анализируем первый заказ
const orderId = parseResult.orders[0].id

const analyzeResponse = await fetch(`/api/freelance/orders/${orderId}/analyze`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    aspects: ['TECHNICAL', 'BUDGET', 'PROFIT']
  })
})

const { data: analysis } = await analyzeResponse.json()

// Если заказ подходит - конвертируем в проект
if (analysis.analysis.profit.recommendation === 'ACCEPT') {
  await fetch(`/api/freelance/orders/${orderId}/convert`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}
```

---

## Структура файлов

```
apps/api/src/modules/
├── projects/
│   ├── projects.routes.ts       # Роуты
│   ├── projects.controller.ts   # Контроллер
│   ├── projects.service.ts      # Бизнес-логика
│   ├── projects.types.ts        # Типы и схемы валидации
│   └── index.ts                 # Экспорты
├── tasks/
│   ├── tasks.routes.ts
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── tasks.types.ts
│   └── index.ts
├── chats/
│   ├── chats.routes.ts
│   ├── chats.controller.ts
│   ├── chats.service.ts
│   ├── chats.types.ts
│   └── index.ts
└── freelance/
    ├── freelance.routes.ts
    ├── freelance.controller.ts
    ├── freelance.service.ts
    ├── freelance.types.ts
    ├── index.ts
    └── parsers/
        └── flru-parser.ts       # Puppeteer парсер FL.ru
```

---

## Deployment

После создания всех модулей:

1. Установить зависимости (если нужно):
```bash
npm install puppeteer zod
```

2. Создать Prisma миграцию для новых моделей
3. Запустить сервер:
```bash
npm run dev
```

4. API будет доступен на `http://localhost:4000`

---

## Support

Для вопросов и предложений обращайтесь к команде разработки ReborDev Hub.
