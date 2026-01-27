# Примеры использования API

## Базовый URL
```
http://localhost:4000
```

## 1. Health Check

### Request
```bash
curl http://localhost:4000/health
```

### Response
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T15:06:50.202Z",
  "environment": "development"
}
```

---

## 2. Регистрация нового пользователя

### Request
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securePassword123",
    "name": "New User"
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123456789",
      "email": "newuser@example.com",
      "name": "New User",
      "role": "DEVELOPER",
      "avatarUrl": "https://ui-avatars.com/api/?name=New+User&background=7C3AED&color=fff",
      "createdAt": "2026-01-27T15:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Ошибки

#### 400 - Пользователь уже существует
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

#### 400 - Невалидные данные
```json
{
  "success": false,
  "error": "Validation error: password must be at least 8 characters"
}
```

---

## 3. Вход (Login)

### Request
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vladimir@rebordev.ru",
    "password": "password123"
  }'
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx987654321",
      "email": "vladimir@rebordev.ru",
      "name": "Владимир Иванов",
      "role": "OWNER",
      "avatarUrl": "https://ui-avatars.com/api/?name=Vladimir+Ivanov&background=7C3AED&color=fff"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Ошибки

#### 401 - Неверные учетные данные
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

## 4. Получение профиля (Protected)

### Request
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "clx987654321",
    "email": "vladimir@rebordev.ru",
    "name": "Владимир Иванов",
    "role": "OWNER",
    "avatarUrl": "https://ui-avatars.com/api/?name=Vladimir+Ivanov&background=7C3AED&color=fff",
    "telegramId": null,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z",
    "skills": [],
    "_count": {
      "authoredProjects": 4,
      "assignedTasks": 0,
      "chatMessages": 0
    }
  }
}
```

### Ошибки

#### 401 - Токен не предоставлен
```json
{
  "error": "Unauthorized: No token provided"
}
```

#### 401 - Невалидный токен
```json
{
  "error": "Unauthorized: Invalid token"
}
```

#### 401 - Сессия истекла
```json
{
  "error": "Unauthorized: Invalid or expired session"
}
```

---

## 5. Выход (Logout)

### Request
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Тестирование в Postman

### 1. Создайте коллекцию "ReborDev Hub API"

### 2. Добавьте переменные окружения
```
base_url: http://localhost:4000
token: (оставьте пустым, будет автоматически заполнено)
```

### 3. Настройте автоматическое сохранение токена

В **Tests** запроса Login добавьте:
```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("token", response.data.token);
}
```

### 4. Для защищенных роутов используйте
```
Authorization: Bearer {{token}}
```

---

## Тестовые пользователи (из seed)

| Email | Пароль | Роль | Навыки |
|-------|--------|------|--------|
| vladimir@rebordev.ru | password123 | OWNER | - |
| alexey@rebordev.ru | password123 | TEAMLEAD | Python, React, Docker |
| maria@rebordev.ru | password123 | DEVELOPER | React, TypeScript, Figma |
| dmitry@rebordev.ru | password123 | DEVELOPER | Python, FastAPI, PostgreSQL |
| anna@rebordev.ru | password123 | DEVELOPER | React Native, iOS, Android |

---

## Полный Flow: Регистрация → Вход → Профиль

### 1. Регистрация
```bash
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User"}')

echo $REGISTER_RESPONSE | python -m json.tool
```

### 2. Извлечение токена
```bash
TOKEN=$(echo $REGISTER_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
echo "Token: $TOKEN"
```

### 3. Получение профиля
```bash
curl -s http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
```

### 4. Выход
```bash
curl -s -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
```

---

## WebSocket (TODO)

В будущем здесь будут примеры:
- Подключение к чату
- Отправка сообщений AI
- Получение уведомлений в реальном времени

---

## Rate Limiting (TODO)

В будущем будет добавлен rate limiting:
- 100 запросов в минуту для публичных эндпоинтов
- 1000 запросов в минуту для авторизованных пользователей

---

## Pagination (TODO для других модулей)

Будет использоваться следующий формат:
```
GET /api/projects?page=1&limit=20&sort=createdAt&order=desc
```

Response:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```
