# API Testing Examples

Примеры тестирования всех 4 модулей API с помощью curl и JavaScript/TypeScript.

## Настройка

Предполагается, что API запущен на `http://localhost:4000` и у вас есть JWT токен.

```bash
export API_URL="http://localhost:4000"
export TOKEN="your_jwt_token_here"
```

---

## Projects Module Tests

### 1. Создать проект без AI

```bash
curl -X POST "${API_URL}/api/projects" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "This is a test project",
    "status": "PLANNING",
    "deadline": "2024-12-31T23:59:59Z"
  }'
```

### 2. Создать проект с AI генерацией задач

```bash
curl -X POST "${API_URL}/api/projects" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-commerce Platform",
    "description": "Full-stack e-commerce application",
    "aiGenerate": true,
    "aiPrompt": "Generate tasks for building an e-commerce platform with React, Node.js, PostgreSQL, and Stripe payments"
  }'
```

### 3. Получить список проектов

```bash
curl -X GET "${API_URL}/api/projects" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 4. Получить проект с задачами

```bash
PROJECT_ID="your_project_id"

curl -X GET "${API_URL}/api/projects/${PROJECT_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 5. Обновить проект

```bash
curl -X PATCH "${API_URL}/api/projects/${PROJECT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "deadline": "2024-12-15T23:59:59Z"
  }'
```

### 6. AI генерация задач для существующего проекта

```bash
curl -X POST "${API_URL}/api/projects/${PROJECT_ID}/ai-generate" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Generate additional tasks for implementing user authentication and authorization",
    "count": 5
  }'
```

### 7. Удалить проект

```bash
curl -X DELETE "${API_URL}/api/projects/${PROJECT_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## Tasks Module Tests

### 1. Создать задачу

```bash
curl -X POST "${API_URL}/api/tasks" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT authentication to the API",
    "status": "TODO",
    "priority": "HIGH",
    "projectId": "'"${PROJECT_ID}"'",
    "estimatedHours": 8,
    "dueDate": "2024-12-20T23:59:59Z"
  }'
```

### 2. Получить все задачи проекта

```bash
curl -X GET "${API_URL}/api/tasks?projectId=${PROJECT_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 3. Фильтровать задачи по статусу и приоритету

```bash
curl -X GET "${API_URL}/api/tasks?status=IN_PROGRESS&priority=HIGH" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 4. Получить задачу с комментариями

```bash
TASK_ID="your_task_id"

curl -X GET "${API_URL}/api/tasks/${TASK_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 5. Обновить задачу

```bash
curl -X PATCH "${API_URL}/api/tasks/${TASK_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "estimatedHours": 12
  }'
```

### 6. Изменить статус (канбан)

```bash
curl -X PATCH "${API_URL}/api/tasks/${TASK_ID}/status" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DONE"
  }'
```

### 7. Добавить комментарий к задаче

```bash
curl -X POST "${API_URL}/api/tasks/${TASK_ID}/comments" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I have completed the authentication implementation"
  }'
```

### 8. Удалить задачу

```bash
curl -X DELETE "${API_URL}/api/tasks/${TASK_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## Chats Module Tests

### 1. Создать чат с привязкой к проекту

```bash
curl -X POST "${API_URL}/api/chats" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Authentication Discussion",
    "mode": "CODE",
    "projectId": "'"${PROJECT_ID}"'"
  }'
```

### 2. Создать чат с привязкой к задаче

```bash
curl -X POST "${API_URL}/api/chats" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task Implementation Chat",
    "mode": "DEBUG",
    "taskId": "'"${TASK_ID}"'"
  }'
```

### 3. Получить список чатов

```bash
curl -X GET "${API_URL}/api/chats" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 4. Получить чат с историей

```bash
CHAT_ID="your_chat_id"

curl -X GET "${API_URL}/api/chats/${CHAT_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 5. Отправить сообщение с AI (DeepSeek)

```bash
curl -X POST "${API_URL}/api/chats/${CHAT_ID}/messages" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "How do I implement JWT refresh tokens in Node.js?",
    "useAI": true,
    "provider": "DEEPSEEK"
  }'
```

### 6. Отправить сообщение с AI (Claude)

```bash
curl -X POST "${API_URL}/api/chats/${CHAT_ID}/messages" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Review this authentication code for security issues",
    "useAI": true,
    "provider": "CLAUDE"
  }'
```

### 7. Отправить сообщение без AI

```bash
curl -X POST "${API_URL}/api/chats/${CHAT_ID}/messages" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Just a note for myself",
    "useAI": false
  }'
```

### 8. Сменить режим чата

```bash
curl -X PATCH "${API_URL}/api/chats/${CHAT_ID}/mode" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "ARCHITECT"
  }'
```

### 9. Удалить чат

```bash
curl -X DELETE "${API_URL}/api/chats/${CHAT_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## Freelance Module Tests

### 1. Создать заказ вручную

```bash
curl -X POST "${API_URL}/api/freelance/orders" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Developer Needed",
    "description": "We need an experienced React developer to build a dashboard...",
    "budget": 50000,
    "deadline": "2024-12-31T23:59:59Z",
    "url": "https://www.fl.ru/projects/12345678.html",
    "platform": "FLRU",
    "status": "NEW"
  }'
```

### 2. Получить список заказов

```bash
curl -X GET "${API_URL}/api/freelance/orders" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 3. Получить заказ

```bash
ORDER_ID="your_order_id"

curl -X GET "${API_URL}/api/freelance/orders/${ORDER_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 4. Обновить заказ

```bash
curl -X PATCH "${API_URL}/api/freelance/orders/${ORDER_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INTERESTED",
    "budget": 60000
  }'
```

### 5. AI анализ заказа (все аспекты)

```bash
curl -X POST "${API_URL}/api/freelance/orders/${ORDER_ID}/analyze" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "aspects": ["TECHNICAL", "BUDGET", "TIMELINE", "RISK", "PROFIT"]
  }'
```

### 6. AI анализ заказа (только прибыль)

```bash
curl -X POST "${API_URL}/api/freelance/orders/${ORDER_ID}/analyze" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "aspects": ["PROFIT"]
  }'
```

### 7. Конвертировать заказ в проект

```bash
curl -X POST "${API_URL}/api/freelance/orders/${ORDER_ID}/convert" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 8. Парсинг FL.ru (базовый)

```bash
curl -X POST "${API_URL}/api/freelance/parse" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "maxPages": 2
  }'
```

### 9. Парсинг FL.ru с фильтрами

```bash
curl -X POST "${API_URL}/api/freelance/parse" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "razrabotka-saytov",
    "maxPages": 3,
    "filters": {
      "minBudget": 30000,
      "maxBudget": 100000,
      "keywords": ["React", "TypeScript", "Node.js"]
    }
  }'
```

---

## JavaScript/TypeScript Examples

### Projects

```typescript
import axios from 'axios'

const API_URL = 'http://localhost:4000'
const token = 'your_jwt_token'

// Создать проект с AI
async function createProjectWithAI() {
  const response = await axios.post(
    `${API_URL}/api/projects`,
    {
      name: 'AI Project',
      description: 'Project created with AI assistance',
      aiGenerate: true,
      aiPrompt: 'Generate tasks for a React + TypeScript web app',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  console.log('Project created:', response.data)
  return response.data.data
}

// Получить проекты
async function getProjects() {
  const response = await axios.get(`${API_URL}/api/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  console.log('Projects:', response.data.data)
  return response.data.data
}
```

### Tasks

```typescript
// Создать задачу
async function createTask(projectId: string) {
  const response = await axios.post(
    `${API_URL}/api/tasks`,
    {
      title: 'Implement feature',
      description: 'Feature description',
      status: 'TODO',
      priority: 'HIGH',
      projectId,
      estimatedHours: 8,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data.data
}

// Канбан: переместить задачу
async function moveTask(taskId: string, newStatus: string) {
  const response = await axios.patch(
    `${API_URL}/api/tasks/${taskId}/status`,
    { status: newStatus },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data.data
}

// Получить задачи проекта
async function getProjectTasks(projectId: string) {
  const response = await axios.get(`${API_URL}/api/tasks`, {
    params: { projectId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data.data
}
```

### Chats

```typescript
// Создать чат и отправить сообщение
async function chatWithAI(projectId: string) {
  // Создать чат
  const chatResponse = await axios.post(
    `${API_URL}/api/chats`,
    {
      title: 'Code Discussion',
      mode: 'CODE',
      projectId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const chat = chatResponse.data.data

  // Отправить сообщение
  const messageResponse = await axios.post(
    `${API_URL}/api/chats/${chat.id}/messages`,
    {
      content: 'How do I implement JWT authentication?',
      useAI: true,
      provider: 'DEEPSEEK',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  console.log('User message:', messageResponse.data.data.userMessage.content)
  console.log('AI response:', messageResponse.data.data.aiMessage.content)

  return messageResponse.data.data
}

// Получить историю чата
async function getChatHistory(chatId: string) {
  const response = await axios.get(`${API_URL}/api/chats/${chatId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data.data
}
```

### Freelance

```typescript
// Полный workflow: парсинг -> анализ -> конвертация
async function freelanceWorkflow() {
  // 1. Парсим заказы
  const parseResponse = await axios.post(
    `${API_URL}/api/freelance/parse`,
    {
      category: 'razrabotka-saytov',
      maxPages: 2,
      filters: {
        minBudget: 50000,
        keywords: ['React', 'TypeScript'],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  console.log(`Parsed ${parseResponse.data.data.saved} orders`)

  // 2. Анализируем первый заказ
  const orders = parseResponse.data.data.orders
  if (orders.length === 0) {
    console.log('No orders found')
    return
  }

  const orderId = orders[0].id

  const analyzeResponse = await axios.post(
    `${API_URL}/api/freelance/orders/${orderId}/analyze`,
    {
      aspects: ['TECHNICAL', 'BUDGET', 'PROFIT'],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const analysis = analyzeResponse.data.data.analysis

  console.log('Analysis:', {
    complexity: analysis.technical.complexity,
    recommendation: analysis.profit.recommendation,
    score: analysis.profit.score,
  })

  // 3. Если заказ подходит - конвертируем в проект
  if (analysis.profit.recommendation === 'ACCEPT' && analysis.profit.score >= 7) {
    const convertResponse = await axios.post(
      `${API_URL}/api/freelance/orders/${orderId}/convert`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    console.log('Converted to project:', convertResponse.data.data.project)
  }
}
```

---

## Integration Tests

### Complete Project Workflow

```typescript
async function completeProjectWorkflow() {
  // 1. Создать проект с AI
  const project = await createProjectWithAI()
  console.log('✓ Project created')

  // 2. Получить сгенерированные задачи
  const tasks = await getProjectTasks(project.id)
  console.log(`✓ ${tasks.length} tasks generated`)

  // 3. Создать чат для проекта
  const chat = await chatWithAI(project.id)
  console.log('✓ Chat created')

  // 4. Обновить статус первой задачи
  if (tasks.length > 0) {
    await moveTask(tasks[0].id, 'IN_PROGRESS')
    console.log('✓ Task moved to IN_PROGRESS')
  }

  // 5. Добавить комментарий
  if (tasks.length > 0) {
    await axios.post(
      `${API_URL}/api/tasks/${tasks[0].id}/comments`,
      {
        content: 'Started working on this task',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    console.log('✓ Comment added')
  }

  console.log('✅ Complete workflow finished')
}
```

### Complete Freelance Workflow

```typescript
async function completeFreelanceWorkflow() {
  // 1. Парсинг заказов
  console.log('Parsing orders...')
  await freelanceWorkflow()

  // 2. Получить все заказы
  const ordersResponse = await axios.get(`${API_URL}/api/freelance/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const orders = ordersResponse.data.data
  console.log(`✓ Total orders: ${orders.length}`)

  // 3. Фильтровать подходящие заказы
  const goodOrders = orders.filter((order: any) => {
    if (!order.aiAnalysis) return false
    return (
      order.aiAnalysis.profit?.recommendation === 'ACCEPT' && order.aiAnalysis.profit?.score >= 7
    )
  })

  console.log(`✓ Good orders: ${goodOrders.length}`)

  console.log('✅ Freelance workflow finished')
}
```

---

## Error Handling

```typescript
import axios, { AxiosError } from 'axios'

async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<T | null> {
  try {
    return await apiCall()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ success: boolean; error: string }>

      console.error('API Error:', {
        status: axiosError.response?.status,
        message: axiosError.response?.data?.error,
      })

      if (axiosError.response?.status === 401) {
        console.error('Unauthorized - check your token')
      }
    } else {
      console.error('Unexpected error:', error)
    }

    return null
  }
}

// Использование
const project = await safeApiCall(() => createProjectWithAI())
if (project) {
  console.log('Project created successfully')
}
```

---

## Environment Setup

```bash
# .env.test
API_URL=http://localhost:4000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
```

```typescript
// test-setup.ts
import axios from 'axios'

let cachedToken: string | null = null

export async function getTestToken(): Promise<string> {
  if (cachedToken) return cachedToken

  const response = await axios.post(`${process.env.API_URL}/api/auth/login`, {
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  })

  cachedToken = response.data.data.token
  return cachedToken
}

export async function createTestProject() {
  const token = await getTestToken()
  const response = await axios.post(
    `${process.env.API_URL}/api/projects`,
    {
      name: 'Test Project',
      description: 'Test description',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data.data
}
```

---

## Notes

- Все примеры предполагают наличие валидного JWT токена
- Замените `your_project_id`, `your_task_id` и т.д. на реальные ID
- Для продакшена используйте HTTPS
- Обрабатывайте ошибки соответствующим образом
- Используйте переменные окружения для чувствительных данных
