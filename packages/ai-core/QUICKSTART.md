# AI Core - Quick Start

## 30 Second Setup

```bash
# 1. Install
cd packages/ai-core && npm install

# 2. Configure
cp .env.example .env
# Add your API keys to .env

# 3. Build
npm run build

# 4. Test
npx ts-node examples/test-integration.ts
```

## 60 Second Example

```typescript
import { AICore } from '@rebordev/ai-core';

// Initialize
const ai = await AICore.initializeStack({
  deepseek: { apiKey: process.env.DEEPSEEK_API_KEY! }
});

// Use
const response = await ai.deepseek.sendMessage('Hello AI!');
console.log(response.content);
```

## Common Use Cases

### 1. Chat with AI

```typescript
import { DeepSeekProvider } from '@rebordev/ai-core';

const ai = new DeepSeekProvider({
  apiKey: process.env.DEEPSEEK_API_KEY!
});

const response = await ai.chat([
  { role: 'user', content: 'What is TypeScript?' }
]);
```

### 2. Analyze Project

```typescript
import { AICore } from '@rebordev/ai-core';

const ai = await AICore.initializeStack({
  deepseek: { apiKey: process.env.DEEPSEEK_API_KEY! }
});

const analysis = await ai.deepseek.analyzeOrder(
  'Build a todo app with React and Firebase'
);

console.log(analysis.estimatedHours); // 40
console.log(analysis.complexity); // 'medium'
```

### 3. Generate Project Tasks

```typescript
const tasks = await ai.deepseek.generateProjectTasks(
  'Create an e-commerce website'
);

tasks.forEach(task => {
  console.log(`${task.title} - ${task.estimatedHours}h`);
});
```

### 4. Use Claude Code

```typescript
import { ClaudeCodeProvider } from '@rebordev/ai-core';

const claude = new ClaudeCodeProvider();

await claude.streamMessage(
  'Create a React component',
  {
    onToken: (token) => process.stdout.write(token),
    onComplete: () => console.log('Done!')
  }
);
```

### 5. Summarize Text

```typescript
import { OpenAIProvider } from '@rebordev/ai-core';

const openai = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!
});

const summary = await openai.summarize(longText, 100);
```

### 6. Save to Memory

```typescript
import { MemoryService, MemoryLevel } from '@rebordev/ai-core';

const memory = new MemoryService();

await memory.saveMemory(
  MemoryLevel.USER,
  'preferences',
  'User prefers TypeScript and React'
);
```

### 7. Search Memories

```typescript
import { SearchService } from '@rebordev/ai-core';

const search = new SearchService({
  host: 'http://localhost:7700'
});

await search.initializeIndex();
const results = await search.search('React preferences');
```

### 8. Complete Workflow

```typescript
// Initialize everything
const ai = await AICore.initializeStack({
  deepseek: { apiKey: process.env.DEEPSEEK_API_KEY! },
  openai: { apiKey: process.env.OPENAI_API_KEY! },
  meilisearch: { host: 'http://localhost:7700' }
});

// Analyze order
const order = {
  id: '1',
  title: 'Build a website',
  description: 'Need a website with authentication...',
  budget: 5000
};

const analysis = await ai.orderAnalyzer.analyzeOrder(order);
console.log(`Score: ${analysis.score}/100`);

// Generate project
const project = await ai.projectGenerator.generateProject(
  order.description,
  { includeSubtasks: true, saveToMemory: true }
);

console.log(`Tasks: ${project.tasks.length}`);
console.log(`Hours: ${project.totalEstimatedHours}`);
```

## Error Handling

```typescript
import { AIProviderError } from '@rebordev/ai-core';

try {
  const response = await ai.deepseek.sendMessage('Hello');
} catch (error) {
  if (error instanceof AIProviderError && error.retryable) {
    // Retry the request
  }
}
```

## Environment Variables

```env
DEEPSEEK_API_KEY=sk-xxxxx
OPENAI_API_KEY=sk-xxxxx
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

## CLI Commands

```bash
# Build
npm run build

# Watch mode
npm run dev

# Clean
npm run clean
```

## Next Steps

1. Read [README.md](./README.md) for full documentation
2. Check [examples/](./examples/) for more code samples
3. See [SETUP.md](./SETUP.md) for detailed setup guide
4. Review [CHANGELOG.md](./CHANGELOG.md) for updates

## API Keys

- **DeepSeek**: https://platform.deepseek.com
- **OpenAI**: https://platform.openai.com
- **mem0**: https://mem0.ai

## Support

Need help? Check the documentation or create an issue!
