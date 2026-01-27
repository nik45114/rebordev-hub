# Prisma Schema Additions for API Modules

Добавьте эти модели в ваш `schema.prisma` файл для поддержки всех 4 модулей.

```prisma
// ============================================
// PROJECTS MODULE
// ============================================

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      ProjectStatus @default(PLANNING)
  deadline    DateTime?
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks       Task[]
  chats       Chat[]

  @@index([userId])
  @@index([status])
  @@map("projects")
}

enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

// ============================================
// TASKS MODULE
// ============================================

model Task {
  id              String       @id @default(uuid())
  title           String
  description     String?
  status          TaskStatus   @default(TODO)
  priority        TaskPriority @default(MEDIUM)
  estimatedHours  Float?
  dueDate         DateTime?
  projectId       String
  assigneeId      String?
  createdById     String
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relations
  project         Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee        User?        @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  createdBy       User         @relation("TaskCreator", fields: [createdById], references: [id], onDelete: Cascade)
  comments        TaskComment[]
  chats           Chat[]

  @@index([projectId])
  @@index([assigneeId])
  @@index([createdById])
  @@index([status])
  @@index([priority])
  @@map("tasks")
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model TaskComment {
  id        String   @id @default(uuid())
  content   String
  taskId    String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([userId])
  @@map("task_comments")
}

// ============================================
// CHATS MODULE
// ============================================

model Chat {
  id                String     @id @default(uuid())
  title             String
  mode              ChatMode   @default(CODE)
  userId            String
  projectId         String?
  taskId            String?
  freelanceOrderId  String?
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  // Relations
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  project           Project?   @relation(fields: [projectId], references: [id], onDelete: SetNull)
  task              Task?      @relation(fields: [taskId], references: [id], onDelete: SetNull)
  freelanceOrder    FreelanceOrder? @relation(fields: [freelanceOrderId], references: [id], onDelete: SetNull)
  messages          ChatMessage[]

  @@index([userId])
  @@index([projectId])
  @@index([taskId])
  @@index([freelanceOrderId])
  @@index([updatedAt])
  @@map("chats")
}

enum ChatMode {
  ARCHITECT
  CODE
  REVIEW
  DEBUG
  DOCS
}

model ChatMessage {
  id        String          @id @default(uuid())
  content   String
  role      ChatMessageRole
  provider  String?
  chatId    String
  createdAt DateTime        @default(now())

  // Relations
  chat      Chat            @relation(fields: [chatId], references: [id], onDelete: Cascade)

  @@index([chatId])
  @@index([createdAt])
  @@map("chat_messages")
}

enum ChatMessageRole {
  user
  assistant
  system
}

// ============================================
// FREELANCE MODULE
// ============================================

model FreelanceOrder {
  id          String              @id @default(uuid())
  title       String
  description String
  budget      Float?
  deadline    DateTime?
  url         String?
  platform    FreelancePlatform   @default(FLRU)
  status      FreelanceOrderStatus @default(NEW)
  aiAnalysis  Json?
  userId      String
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  // Relations
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  chats       Chat[]

  @@index([userId])
  @@index([status])
  @@index([platform])
  @@index([createdAt])
  @@unique([url, userId])
  @@map("freelance_orders")
}

enum FreelancePlatform {
  FLRU
  UPWORK
  FREELANCER
  FIVERR
  OTHER
}

enum FreelanceOrderStatus {
  NEW
  ANALYZING
  INTERESTED
  APPLIED
  REJECTED
  ACCEPTED
}

// ============================================
// USER MODEL UPDATES
// ============================================

// Добавьте эти relations в существующую модель User:
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Existing relations
  sessions  Session[]

  // New relations for modules
  projects          Project[]
  tasksCreated      Task[]            @relation("TaskCreator")
  tasksAssigned     Task[]            @relation("TaskAssignee")
  taskComments      TaskComment[]
  chats             Chat[]
  freelanceOrders   FreelanceOrder[]

  @@map("users")
}
```

## Миграция

После добавления схемы выполните:

```bash
# Создать миграцию
npx prisma migrate dev --name add_api_modules

# Сгенерировать Prisma Client
npx prisma generate

# Применить миграцию в продакшене
npx prisma migrate deploy
```

## Примечания

1. **Каскадное удаление**:
   - При удалении проекта удаляются все его задачи
   - При удалении задачи удаляются все комментарии
   - При удалении чата удаляются все сообщения

2. **Nullable relations**:
   - Task.assigneeId может быть null (задача без исполнителя)
   - Chat может быть не привязан к проекту/задаче/заказу

3. **Indexes**:
   - Добавлены индексы на часто используемые поля для оптимизации запросов

4. **JSON fields**:
   - FreelanceOrder.aiAnalysis хранит JSON с результатом AI анализа

5. **Unique constraints**:
   - FreelanceOrder имеет уникальное ограничение на (url, userId) для избежания дубликатов
