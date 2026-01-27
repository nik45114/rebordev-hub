# Integration Guide - Team AI Hub

## Интеграция AI Core в Team AI Hub Backend

### 1. Установка в проект

```bash
# В корне monorepo
npm install

# Или если нужно принудительно обновить
cd packages/ai-core && npm run build
cd ../.. && npm install
```

### 2. Настройка Backend

#### 2.1. Добавить переменные окружения

В `.env` файл backend:

```env
# AI Core Configuration
DEEPSEEK_API_KEY=sk-xxxxx
OPENAI_API_KEY=sk-xxxxx
MEM0_API_KEY=xxxxx
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

#### 2.2. Создать AI Service

`backend/src/services/aiService.ts`:

```typescript
import { AICore } from '@rebordev/ai-core';
import type {
  DeepSeekProvider,
  OpenAIProvider,
  MemoryService,
  SearchService,
  ProjectGeneratorAgent,
  OrderAnalyzerAgent,
} from '@rebordev/ai-core';

class AIService {
  private static instance: AIService;
  private initialized = false;

  public deepseek!: DeepSeekProvider;
  public openai?: OpenAIProvider;
  public memory?: MemoryService;
  public search?: SearchService;
  public projectGenerator!: ProjectGeneratorAgent;
  public orderAnalyzer!: OrderAnalyzerAgent;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize() {
    if (this.initialized) return;

    const config: any = {
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY!,
      },
    };

    // Add optional services if configured
    if (process.env.OPENAI_API_KEY) {
      config.openai = {
        apiKey: process.env.OPENAI_API_KEY,
      };
    }

    if (process.env.MEM0_API_KEY) {
      config.mem0 = {
        apiKey: process.env.MEM0_API_KEY,
      };
    }

    if (process.env.MEILISEARCH_HOST) {
      config.meilisearch = {
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
      };
    }

    const ai = await AICore.initializeStack(config);

    this.deepseek = ai.deepseek;
    this.openai = ai.openai;
    this.memory = ai.memory;
    this.search = ai.search;
    this.projectGenerator = ai.projectGenerator;
    this.orderAnalyzer = ai.orderAnalyzer;

    this.initialized = true;
    console.log('✅ AI Service initialized');
  }
}

export const aiService = AIService.getInstance();
```

#### 2.3. Инициализация в main

`backend/src/index.ts`:

```typescript
import { aiService } from './services/aiService';

async function bootstrap() {
  // ... existing code ...

  // Initialize AI Service
  await aiService.initialize();

  // ... rest of the code ...
}
```

### 3. Создать API Endpoints

#### 3.1. AI Routes

`backend/src/routes/ai.ts`:

```typescript
import { Router } from 'express';
import { aiService } from '../services/aiService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/ai/chat
 * Simple chat with AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await aiService.deepseek.sendMessage(message);

    res.json({
      content: response.content,
      tokensUsed: response.tokensUsed,
      model: response.model,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/analyze-order
 * Analyze freelance order
 */
router.post('/analyze-order', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const analysis = await aiService.deepseek.analyzeOrder(description);

    res.json(analysis);
  } catch (error: any) {
    console.error('Order analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/generate-project
 * Generate project structure and tasks
 */
router.post('/generate-project', async (req, res) => {
  try {
    const { description, options } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const project = await aiService.projectGenerator.generateProject(
      description,
      options || {}
    );

    res.json(project);
  } catch (error: any) {
    console.error('Project generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/estimate-cost
 * Estimate project cost
 */
router.post('/estimate-cost', async (req, res) => {
  try {
    const { project, hourlyRate } = req.body;

    if (!project || !hourlyRate) {
      return res.status(400).json({
        error: 'Project and hourlyRate are required',
      });
    }

    const cost = await aiService.projectGenerator.estimateProjectCost(
      project,
      hourlyRate
    );

    res.json(cost);
  } catch (error: any) {
    console.error('Cost estimation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/match-orders
 * Match orders to user profile
 */
router.post('/match-orders', async (req, res) => {
  try {
    const { orders, profile } = req.body;

    if (!orders || !profile) {
      return res.status(400).json({
        error: 'Orders and profile are required',
      });
    }

    const matches = await aiService.orderAnalyzer.matchOrdersToProfile(
      orders,
      profile
    );

    res.json(matches);
  } catch (error: any) {
    console.error('Order matching error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/summarize
 * Summarize text
 */
router.post('/summarize', async (req, res) => {
  try {
    const { text, maxLength } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!aiService.openai) {
      return res.status(503).json({
        error: 'OpenAI service not configured',
      });
    }

    const summary = await aiService.openai.summarize(
      text,
      maxLength || 200
    );

    res.json({ summary });
  } catch (error: any) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/extract-key-points
 * Extract key points from text
 */
router.post('/extract-key-points', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!aiService.openai) {
      return res.status(503).json({
        error: 'OpenAI service not configured',
      });
    }

    const keyPoints = await aiService.openai.extractKeyPoints(text);

    res.json({ keyPoints });
  } catch (error: any) {
    console.error('Key points extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/memory/save
 * Save to memory
 */
router.post('/memory/save', async (req, res) => {
  try {
    const { level, key, content, metadata } = req.body;

    if (!level || !key || !content) {
      return res.status(400).json({
        error: 'Level, key, and content are required',
      });
    }

    if (!aiService.memory) {
      return res.status(503).json({
        error: 'Memory service not configured',
      });
    }

    const entry = await aiService.memory.saveMemory(
      level,
      key,
      content,
      metadata
    );

    res.json(entry);
  } catch (error: any) {
    console.error('Memory save error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/memory/search
 * Search in memory
 */
router.get('/memory/search', async (req, res) => {
  try {
    const { query, level, limit } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!aiService.memory) {
      return res.status(503).json({
        error: 'Memory service not configured',
      });
    }

    const results = await aiService.memory.searchMemory(
      query as string,
      {
        level: level as any,
        limit: limit ? parseInt(limit as string) : 10,
      }
    );

    res.json(results);
  } catch (error: any) {
    console.error('Memory search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/search
 * Full-text search
 */
router.get('/search', async (req, res) => {
  try {
    const { query, level, limit } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!aiService.search) {
      return res.status(503).json({
        error: 'Search service not configured',
      });
    }

    const results = await aiService.search.search(query as string, {
      level: level as any,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json(results);
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### 3.2. Подключить routes

`backend/src/index.ts`:

```typescript
import aiRoutes from './routes/ai';

// ... existing code ...

app.use('/api/ai', aiRoutes);
```

### 4. Frontend Integration

#### 4.1. Создать API client

`frontend/src/api/ai.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/ai',
});

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  content: string;
  tokensUsed?: number;
  model?: string;
}

export async function chat(message: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/chat', { message });
  return data;
}

export async function analyzeOrder(description: string) {
  const { data } = await api.post('/analyze-order', { description });
  return data;
}

export async function generateProject(
  description: string,
  options?: any
) {
  const { data } = await api.post('/generate-project', {
    description,
    options,
  });
  return data;
}

export async function estimateProjectCost(
  project: any,
  hourlyRate: number
) {
  const { data } = await api.post('/estimate-cost', {
    project,
    hourlyRate,
  });
  return data;
}

export async function matchOrders(orders: any[], profile: any) {
  const { data } = await api.post('/match-orders', { orders, profile });
  return data;
}

export async function summarize(text: string, maxLength?: number) {
  const { data } = await api.post('/summarize', { text, maxLength });
  return data;
}

export async function extractKeyPoints(text: string) {
  const { data } = await api.post('/extract-key-points', { text });
  return data;
}

export async function saveMemory(
  level: string,
  key: string,
  content: string,
  metadata?: any
) {
  const { data } = await api.post('/memory/save', {
    level,
    key,
    content,
    metadata,
  });
  return data;
}

export async function searchMemory(
  query: string,
  level?: string,
  limit?: number
) {
  const { data } = await api.get('/memory/search', {
    params: { query, level, limit },
  });
  return data;
}

export async function search(
  query: string,
  level?: string,
  limit?: number
) {
  const { data } = await api.get('/search', {
    params: { query, level, limit },
  });
  return data;
}
```

#### 4.2. Использование в компонентах

`frontend/src/pages/ProjectGeneratorPage.tsx`:

```typescript
import React, { useState } from 'react';
import { generateProject, estimateProjectCost } from '../api/ai';

export function ProjectGeneratorPage() {
  const [description, setDescription] = useState('');
  const [project, setProject] = useState<any>(null);
  const [cost, setCost] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateProject(description, {
        includeSubtasks: true,
        estimateEffort: true,
        suggestTechnologies: true,
      });
      setProject(result);

      // Estimate cost
      const estimatedCost = await estimateProjectCost(result, 50);
      setCost(estimatedCost);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Project Generator</h1>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your project..."
        rows={6}
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Project'}
      </button>

      {project && (
        <div>
          <h2>{project.name}</h2>
          <p>{project.description}</p>

          <div>
            <strong>Complexity:</strong> {project.complexity}
          </div>
          <div>
            <strong>Estimated Hours:</strong> {project.totalEstimatedHours}
          </div>

          {cost && (
            <div>
              <strong>Estimated Cost:</strong> ${cost.minCost} - $
              {cost.maxCost}
            </div>
          )}

          <h3>Tasks ({project.tasks.length})</h3>
          <ul>
            {project.tasks.map((task: any) => (
              <li key={task.id}>
                {task.title} - {task.estimatedHours}h
              </li>
            ))}
          </ul>

          <h3>Technologies</h3>
          <div>
            {project.technologies?.map((tech: string) => (
              <span key={tech}>{tech} </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 5. Testing

#### 5.1. Backend Tests

```bash
# Test AI endpoints
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Hello AI!"}'
```

#### 5.2. Integration Tests

```typescript
// backend/tests/ai.test.ts
import { aiService } from '../src/services/aiService';

describe('AI Service', () => {
  beforeAll(async () => {
    await aiService.initialize();
  });

  it('should send a message', async () => {
    const response = await aiService.deepseek.sendMessage('Hello');
    expect(response.content).toBeDefined();
  });

  it('should analyze order', async () => {
    const analysis = await aiService.deepseek.analyzeOrder(
      'Build a todo app'
    );
    expect(analysis.title).toBeDefined();
    expect(analysis.estimatedHours).toBeGreaterThan(0);
  });
});
```

### 6. Deployment

#### 6.1. Environment Variables

Production `.env`:

```env
# Required
DEEPSEEK_API_KEY=sk-production-key

# Optional
OPENAI_API_KEY=sk-production-key
MEM0_API_KEY=production-key
MEILISEARCH_HOST=https://meilisearch.yourdomain.com
MEILISEARCH_API_KEY=production-master-key
```

#### 6.2. Docker Compose

Add Meilisearch service:

```yaml
services:
  meilisearch:
    image: getmeili/meilisearch:latest
    ports:
      - '7700:7700'
    environment:
      - MEILI_MASTER_KEY=${MEILISEARCH_API_KEY}
    volumes:
      - meilisearch_data:/meili_data

volumes:
  meilisearch_data:
```

### 7. Monitoring

#### 7.1. Add Logging

```typescript
// backend/src/services/aiService.ts
import { logger } from './logger';

// Log all AI calls
const response = await this.deepseek.sendMessage(message);
logger.info('AI Chat', {
  tokensUsed: response.tokensUsed,
  model: response.model,
});
```

#### 7.2. Error Tracking

```typescript
try {
  const result = await aiService.deepseek.analyzeOrder(description);
} catch (error) {
  if (error instanceof AIProviderError) {
    logger.error('AI Provider Error', {
      code: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable,
    });

    if (error.retryable) {
      // Implement retry logic
    }
  }
}
```

---

**Guide Version**: 1.0.0
**Last Updated**: 2024-01-27
