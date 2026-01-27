# @rebordev/ai-core

Полноценный пакет для интеграции AI в ваше приложение. Поддержка Claude Code CLI, DeepSeek, OpenAI, mem0 и Meilisearch.

## Возможности

- **Множество AI провайдеров**: Claude Code CLI, DeepSeek, OpenAI
- **Память**: Интеграция с mem0 для хранения контекста
- **Поиск**: Meilisearch для быстрого поиска по памяти
- **Агенты**: Готовые агенты для генерации проектов и анализа заказов
- **TypeScript**: Полная типизация
- **Streaming**: Поддержка потоковой передачи ответов

## Установка

```bash
npm install @rebordev/ai-core
```

## Быстрый старт

### Инициализация полного стека

```typescript
import { AICore } from '@rebordev/ai-core';

const aiStack = await AICore.initializeStack({
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  meilisearch: {
    host: 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_API_KEY,
  },
});

// Теперь у вас есть доступ ко всем компонентам
const { deepseek, openai, memory, search, projectGenerator, orderAnalyzer } = aiStack;
```

## Провайдеры

### Claude Code CLI

Интеграция с Claude Code через CLI:

```typescript
import { ClaudeCodeProvider } from '@rebordev/ai-core';

const claude = new ClaudeCodeProvider({
  workingDirectory: '/path/to/project',
  timeout: 300000, // 5 minutes
});

// Отправить сообщение
const response = await claude.sendMessage('Analyze this codebase');
console.log(response.content);

// Streaming
await claude.streamMessage(
  'Generate a new component',
  {
    onToken: (token) => process.stdout.write(token),
    onComplete: (fullText) => console.log('\nDone!'),
    onError: (error) => console.error('Error:', error),
  },
  {
    files: ['src/components/Button.tsx'],
    instructions: 'Follow React best practices',
  }
);

// Проверить доступность
const isAvailable = await ClaudeCodeProvider.isAvailable();
```

### DeepSeek

API интеграция с DeepSeek:

```typescript
import { DeepSeekProvider } from '@rebordev/ai-core';

const deepseek = new DeepSeekProvider({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  model: 'deepseek-chat',
  temperature: 0.7,
});

// Простой запрос
const response = await deepseek.sendMessage('Explain TypeScript generics');
console.log(response.content);

// Чат с историей
const chatResponse = await deepseek.chat([
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'What is React?' },
  { role: 'assistant', content: 'React is a JavaScript library...' },
  { role: 'user', content: 'How do I use hooks?' },
]);

// Анализ заказа
const analysis = await deepseek.analyzeOrder(`
  Create a web application for task management with user authentication,
  real-time updates, and mobile responsive design.
`);
console.log(analysis);
// {
//   title: "Task Management Web Application",
//   complexity: "medium",
//   estimatedHours: 80,
//   technologies: ["React", "Node.js", "WebSocket"],
//   risks: ["Real-time synchronization complexity"],
//   ...
// }

// Генерация задач проекта
const tasks = await deepseek.generateProjectTasks('Build an e-commerce website');
console.log(tasks);
```

### OpenAI

API интеграция с OpenAI:

```typescript
import { OpenAIProvider } from '@rebordev/ai-core';

const openai = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4-turbo-preview',
});

// Суммирование текста
const summary = await openai.summarize(longText, 200);

// Извлечение ключевых пунктов
const keyPoints = await openai.extractKeyPoints(article);
console.log(keyPoints);
// ["Point 1", "Point 2", "Point 3"]

// Классификация
const classification = await openai.classify(
  'This product is amazing!',
  ['positive', 'negative', 'neutral']
);
console.log(classification);
// { category: "positive", confidence: 0.95 }

// Генерация embeddings
const embedding = await openai.generateEmbedding('Some text to embed');
```

## Память и Поиск

### mem0 Adapter

```typescript
import { MemoryService, MemoryLevel } from '@rebordev/ai-core';

const memory = new MemoryService({
  apiKey: process.env.MEM0_API_KEY,
  userId: 'user123',
});

// Сохранить память
await memory.saveMemory(
  MemoryLevel.USER,
  'preferences',
  'User prefers dark mode and TypeScript',
  { theme: 'dark', language: 'typescript' }
);

// Сохранить память проекта
await memory.saveProjectMemory(
  'project-id',
  'architecture',
  'Using microservices architecture with Docker',
  { stack: 'Node.js, PostgreSQL, Redis' }
);

// Поиск
const results = await memory.searchMemory('dark mode', {
  level: MemoryLevel.USER,
  userId: 'user123',
  limit: 5,
});

// Получить память по ID
const entry = await memory.getMemory('memory-id');

// Обновить память
await memory.updateMemory('memory-id', {
  content: 'Updated content',
});

// Удалить память
await memory.deleteMemory('memory-id');
```

### Meilisearch Adapter

```typescript
import { SearchService } from '@rebordev/ai-core';

const search = new SearchService({
  host: 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
  indexName: 'memories',
});

// Инициализация индекса
await search.initializeIndex();

// Индексирование
await search.indexMemory(memoryEntry);

// Поиск
const results = await search.search('React hooks', {
  level: MemoryLevel.PROJECT,
  limit: 10,
  attributesToHighlight: ['content'],
});

console.log(results);
// {
//   hits: [...],
//   processingTimeMs: 5,
//   estimatedTotalHits: 42
// }

// Поиск по уровню
const projectMemories = await search.searchByLevel(
  'authentication',
  MemoryLevel.PROJECT
);

// Поиск пользовательских воспоминаний
const userMemories = await search.searchUserMemories(
  'preferences',
  'user123'
);

// Статистика индекса
const stats = await search.getStats();
```

## Агенты

### Project Generator Agent

Автоматическая генерация структуры проекта и задач:

```typescript
import { ProjectGeneratorAgent } from '@rebordev/ai-core';

const generator = new ProjectGeneratorAgent(
  deepseek,
  memory,
  search
);

// Генерация проекта
const project = await generator.generateProject(
  'Build a social media dashboard with analytics',
  {
    includeSubtasks: true,
    estimateEffort: true,
    suggestTechnologies: true,
    saveToMemory: true,
  }
);

console.log(project);
// {
//   name: "Social Media Dashboard",
//   description: "Analytics dashboard for social media...",
//   tasks: [
//     {
//       id: "task-1",
//       title: "Setup authentication",
//       description: "Implement OAuth 2.0...",
//       estimatedHours: 8,
//       priority: "high",
//       dependencies: [],
//       skills: ["Node.js", "OAuth"]
//     },
//     ...
//   ],
//   technologies: ["React", "Node.js", "PostgreSQL"],
//   totalEstimatedHours: 120,
//   complexity: "medium",
//   recommendations: [...]
// }

// Поиск похожих проектов
const similar = await generator.searchSimilarProjects(
  'e-commerce website',
  5
);

// Оценка стоимости
const cost = await generator.estimateProjectCost(project, 50); // $50/hour
console.log(cost);
// { minCost: 6000, maxCost: 9000, averageCost: 7500 }

// Сохранить как шаблон
await generator.saveAsTemplate(project);

// Получить шаблоны
const templates = await generator.getProjectTemplates();
```

### Order Analyzer Agent

Анализ фриланс заказов:

```typescript
import { OrderAnalyzerAgent, FreelanceOrder } from '@rebordev/ai-core';

const analyzer = new OrderAnalyzerAgent(
  deepseek,
  openai,
  memory,
  search
);

const order: FreelanceOrder = {
  id: 'order-123',
  title: 'Build a task management app',
  description: 'Looking for a developer to create...',
  budget: 5000,
  deadline: new Date('2024-03-01'),
  skills: ['React', 'Node.js'],
  platform: 'Upwork',
};

// Анализ одного заказа
const analysis = await analyzer.analyzeOrder(order);
console.log(analysis);
// {
//   orderId: "order-123",
//   title: "Task Management Application",
//   complexity: "medium",
//   estimatedHours: 100,
//   keyPoints: ["Real-time updates", "User authentication"],
//   suggestedBid: 4500,
//   bidRange: { min: 4000, max: 6000 },
//   feasibility: "high",
//   score: 85,
//   technologies: [...],
//   risks: [...],
//   recommendations: [...]
// }

// Пакетный анализ
const orders = [order1, order2, order3];
const analyses = await analyzer.analyzeOrders(orders);

// Подбор заказов под профиль
const matches = await analyzer.matchOrdersToProfile(orders, {
  skills: ['React', 'TypeScript', 'Node.js'],
  experience: ['Web development', 'API integration'],
  preferredBudget: { min: 3000, max: 8000 },
  preferredComplexity: ['simple', 'medium'],
});

console.log(matches);
// [
//   {
//     order: {...},
//     analysis: {...},
//     matchScore: 92,
//     reasons: [
//       "Matches 3 of your skills: React, TypeScript, Node.js",
//       "Complexity level (medium) matches your preference",
//       "High feasibility - low risk project"
//     ]
//   },
//   ...
// ]

// Поиск похожих заказов
const similar = await analyzer.findSimilarOrders('order-123', 5);
```

## Обработка ошибок

```typescript
import { AIProviderError } from '@rebordev/ai-core';

try {
  const response = await deepseek.sendMessage('Hello');
} catch (error) {
  if (error instanceof AIProviderError) {
    console.error('AI Provider Error:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.statusCode);

    if (error.retryable) {
      // Можно повторить запрос
      console.log('Error is retryable');
    }
  }
}
```

## Примеры использования

### Полный пример: Анализ фриланс проектов

```typescript
import { AICore, MemoryLevel } from '@rebordev/ai-core';

async function analyzeFreelanceProjects() {
  // Инициализация
  const ai = await AICore.initializeStack({
    deepseek: { apiKey: process.env.DEEPSEEK_API_KEY! },
    openai: { apiKey: process.env.OPENAI_API_KEY! },
    meilisearch: {
      host: 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
    },
  });

  // Профиль пользователя
  const userProfile = {
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    experience: ['Web development', 'REST API', 'Real-time apps'],
    preferredBudget: { min: 2000, max: 10000 },
    preferredComplexity: ['medium', 'complex'],
  };

  // Заказы для анализа
  const orders = [
    {
      id: '1',
      title: 'E-commerce Platform',
      description: 'Need full-stack developer for online store...',
      budget: 8000,
    },
    {
      id: '2',
      title: 'Mobile App Backend',
      description: 'REST API for mobile application...',
      budget: 4500,
    },
  ];

  // Анализ и подбор
  const matches = await ai.orderAnalyzer.matchOrdersToProfile(
    orders,
    userProfile
  );

  // Вывод результатов
  for (const match of matches) {
    console.log(`\n${match.order.title}`);
    console.log(`Match Score: ${match.matchScore}%`);
    console.log(`Suggested Bid: $${match.analysis.suggestedBid}`);
    console.log('Reasons:');
    match.reasons.forEach((reason) => console.log(`  - ${reason}`));
  }
}
```

### Полный пример: Генерация проекта с Claude Code

```typescript
import { AICore } from '@rebordev/ai-core';

async function generateProjectWithClaude() {
  // Проверка доступности Claude Code
  const isAvailable = await AICore.isClaudeCodeAvailable();
  if (!isAvailable) {
    console.error('Claude Code CLI is not available');
    return;
  }

  // Инициализация
  const claude = AICore.createClaudeProvider({
    workingDirectory: './my-project',
  });

  const deepseek = AICore.createDeepSeekProvider({
    apiKey: process.env.DEEPSEEK_API_KEY!,
  });

  const generator = AICore.createProjectGenerator(deepseek);

  // Генерация структуры проекта
  const project = await generator.generateProject(
    'Create a blog platform with authentication and markdown support',
    {
      includeSubtasks: true,
      estimateEffort: true,
      suggestTechnologies: true,
    }
  );

  console.log('Generated project:', project.name);
  console.log('Tasks:', project.tasks.length);
  console.log('Estimated hours:', project.totalEstimatedHours);

  // Использование Claude Code для создания первой задачи
  const firstTask = project.tasks[0];
  console.log(`\nGenerating code for: ${firstTask.title}`);

  await claude.streamMessage(
    `Create ${firstTask.title}: ${firstTask.description}`,
    {
      onToken: (token) => process.stdout.write(token),
      onComplete: (text) => {
        console.log('\n\nTask completed!');
      },
    },
    {
      instructions: 'Use TypeScript and follow best practices',
    }
  );
}
```

## Переменные окружения

```env
# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# mem0
MEM0_API_KEY=your_mem0_api_key

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your_meilisearch_api_key
```

## Лицензия

MIT

## Поддержка

Для вопросов и предложений создавайте Issues в репозитории проекта.
