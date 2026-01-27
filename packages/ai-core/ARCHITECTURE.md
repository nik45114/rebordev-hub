# AI Core - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AI Core Package                      │
│                      @rebordev/ai-core                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Providers   │     │    Memory    │     │    Agents    │
│   Layer      │     │    Layer     │     │    Layer     │
└──────────────┘     └──────────────┘     └──────────────┘
        │                     │                     │
        │                     │                     │
┌───────┼────────┐    ┌───────┼────────┐   ┌───────┼────────┐
│       │        │    │       │        │   │       │        │
▼       ▼        ▼    ▼       ▼        ▼   ▼       ▼        ▼
Claude  DeepSeek OpenAI  mem0  Meilisearch  Project Order
Code                                         Generator Analyzer
CLI
```

## Providers Layer

### Base Provider Interface

```typescript
BaseAIProvider (Abstract)
├── sendMessage(message: string): Promise<AIResponse>
├── chat(messages: Message[]): Promise<AIResponse>
├── streamMessage(message: string, options: StreamOptions): Promise<void>
└── getName(): string
```

### Implementation Hierarchy

```
BaseAIProvider
├── ClaudeCodeProvider (CLI Integration)
│   └── child_process.spawn('claude')
├── DeepSeekProvider (API Integration)
│   └── axios → https://api.deepseek.com
└── OpenAIProvider (API Integration)
    └── axios → https://api.openai.com
```

## Memory Layer

### Memory Service (mem0)

```
MemoryService
├── Levels
│   ├── USER
│   ├── PROJECT
│   ├── TEAM
│   ├── ORGANIZATION
│   └── GLOBAL
├── Operations
│   ├── saveMemory()
│   ├── searchMemory()
│   ├── getMemory()
│   ├── updateMemory()
│   └── deleteMemory()
└── Helpers
    ├── saveUserMemory()
    ├── saveProjectMemory()
    ├── saveTeamMemory()
    └── saveOrganizationMemory()
```

### Search Service (Meilisearch)

```
SearchService
├── Index Management
│   ├── initializeIndex()
│   ├── getStats()
│   └── clearIndex()
├── CRUD Operations
│   ├── indexMemory()
│   ├── indexMemories()
│   ├── updateMemory()
│   ├── deleteMemory()
│   └── deleteMemories()
└── Search Operations
    ├── search()
    ├── searchByLevel()
    ├── searchUserMemories()
    └── searchProjectMemories()
```

## Agents Layer

### Project Generator Agent

```
ProjectGeneratorAgent
├── Input: Project Description
├── Processing
│   ├── analyzeOrder() → OrderAnalysis
│   ├── generateProjectTasks() → Task[]
│   └── addSubtasks() → Task[]
├── Output: GeneratedProject
│   ├── name
│   ├── description
│   ├── tasks[]
│   ├── technologies[]
│   ├── totalEstimatedHours
│   ├── complexity
│   └── recommendations[]
└── Additional Features
    ├── searchSimilarProjects()
    ├── estimateProjectCost()
    ├── saveAsTemplate()
    └── getProjectTemplates()
```

### Order Analyzer Agent

```
OrderAnalyzerAgent
├── Input: FreelanceOrder
├── Processing
│   ├── analyzeOrder() → EnhancedOrderAnalysis
│   ├── extractKeyPoints()
│   ├── calculateFeasibility()
│   ├── calculateOrderScore()
│   └── calculateBidRange()
├── Output: EnhancedOrderAnalysis
│   ├── orderId
│   ├── title, summary
│   ├── complexity, estimatedHours
│   ├── technologies[], categories[]
│   ├── keyPoints[]
│   ├── suggestedBid, bidRange
│   ├── feasibility, score
│   └── risks[], recommendations[]
└── Additional Features
    ├── analyzeOrders() (batch)
    ├── matchOrdersToProfile()
    └── findSimilarOrders()
```

## Data Flow

### Simple Message Flow

```
User Request
    │
    ▼
AICore.createDeepSeekProvider()
    │
    ▼
DeepSeekProvider.sendMessage()
    │
    ▼
axios.post('/chat/completions')
    │
    ▼
DeepSeek API
    │
    ▼
AIResponse
    │
    ▼
User Application
```

### Project Generation Flow

```
User Input (Description)
    │
    ▼
ProjectGeneratorAgent.generateProject()
    │
    ├─► DeepSeek.analyzeOrder() ──► OrderAnalysis
    │
    ├─► DeepSeek.generateProjectTasks() ──► Task[]
    │
    ├─► [Optional] addSubtasks() ──► Enhanced Task[]
    │
    ├─► Calculate totalEstimatedHours
    │
    ├─► [Optional] MemoryService.saveMemory()
    │
    └─► [Optional] SearchService.indexMemory()
        │
        ▼
    GeneratedProject
```

### Order Analysis & Matching Flow

```
Freelance Orders[]
    │
    ▼
OrderAnalyzerAgent.matchOrdersToProfile()
    │
    ├─► For each order:
    │   ├─► DeepSeek.analyzeOrder() ──► OrderAnalysis
    │   ├─► OpenAI.extractKeyPoints() ──► KeyPoints[]
    │   ├─► calculateFeasibility() ──► Feasibility
    │   ├─► calculateOrderScore() ──► Score (0-100)
    │   └─► calculateBidRange() ──► BidRange
    │
    ├─► calculateMatchScore() ──► MatchScore (0-100)
    │
    ├─► generateMatchReasons() ──► Reasons[]
    │
    └─► Sort by matchScore
        │
        ▼
    OrderMatchResult[]
```

## Component Dependencies

```
┌────────────────────────────────────────┐
│           External APIs                 │
│  ┌──────────┬───────────┬──────────┐  │
│  │ DeepSeek │  OpenAI   │  mem0    │  │
│  └──────────┴───────────┴──────────┘  │
│  ┌──────────┬───────────────────────┐ │
│  │Meilisearch│   Claude Code CLI   │ │
│  └──────────┴───────────────────────┘ │
└────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────┐
│         HTTP Clients / Process         │
│  ┌──────────┬───────────────────────┐ │
│  │  axios   │  child_process        │ │
│  └──────────┴───────────────────────┘ │
└────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────┐
│           AI Core Package              │
│  ┌──────────────────────────────────┐ │
│  │  Providers, Memory, Agents       │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────┐
│        Application Layer               │
│  ┌──────────────────────────────────┐ │
│  │  Team AI Hub Backend API         │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

## Error Handling Flow

```
Try Block
    │
    ▼
API Call / Process Spawn
    │
    ├─► Success ──► Transform Response ──► Return
    │
    └─► Error
        │
        ▼
    Error Detection
        │
        ├─► Network Error
        │   └─► retryable: true
        │
        ├─► Rate Limit (429)
        │   └─► retryable: true
        │
        ├─► Server Error (5xx)
        │   └─► retryable: true
        │
        └─► Client Error (4xx)
            └─► retryable: false
                │
                ▼
    AIProviderError
        │
        ├─► code: string
        ├─► statusCode: number
        ├─► retryable: boolean
        └─► message: string
```

## Configuration Flow

```
Environment Variables (.env)
    │
    ├─► DEEPSEEK_API_KEY
    ├─► OPENAI_API_KEY
    ├─► MEM0_API_KEY
    ├─► MEILISEARCH_HOST
    └─► MEILISEARCH_API_KEY
        │
        ▼
Config Objects
    │
    ├─► DeepSeekConfig
    ├─► OpenAIConfig
    ├─► Mem0Config
    └─► SearchConfig
        │
        ▼
Provider/Service Initialization
    │
    ├─► new DeepSeekProvider(config)
    ├─► new OpenAIProvider(config)
    ├─► new MemoryService(config)
    └─► new SearchService(config)
        │
        ▼
Agent Initialization
    │
    ├─► new ProjectGeneratorAgent(provider, memory, search)
    └─► new OrderAnalyzerAgent(deepseek, openai, memory, search)
        │
        ▼
    AICore Stack Ready
```

## Streaming Architecture

```
User Request (Stream)
    │
    ▼
Provider.streamMessage(message, options)
    │
    ├─► options.onToken: (token) => void
    ├─► options.onComplete: (fullText) => void
    └─► options.onError: (error) => void
        │
        ▼
API Stream / Process stdout
    │
    ├─► on('data') ──► Parse chunk ──► onToken(chunk)
    │
    ├─► on('end') ──► onComplete(fullText)
    │
    └─► on('error') ──► onError(error)
```

## Memory Hierarchy

```
Global Memory (All users)
    │
    └─► Organization Memory (Org-wide)
        │
        └─► Team Memory (Team-specific)
            │
            └─► Project Memory (Project-specific)
                │
                └─► User Memory (User-specific)
```

## Search Index Structure

```
Meilisearch Index: "memories"
│
├── Documents
│   ├── id: string (primary key)
│   ├── level: MemoryLevel
│   ├── key: string
│   ├── content: string (searchable)
│   ├── metadata: object (searchable)
│   ├── userId?: string (filterable)
│   ├── projectId?: string (filterable)
│   ├── teamId?: string (filterable)
│   ├── organizationId?: string (filterable)
│   ├── createdAt: timestamp (sortable)
│   └── updatedAt: timestamp (sortable)
│
├── Settings
│   ├── searchableAttributes: ['key', 'content', 'metadata']
│   ├── filterableAttributes: ['level', 'userId', ...]
│   ├── sortableAttributes: ['createdAt', 'updatedAt']
│   └── rankingRules: ['words', 'typo', 'proximity', ...]
│
└── Operations
    ├── Search: POST /indexes/memories/search
    ├── Add: POST /indexes/memories/documents
    ├── Update: PUT /indexes/memories/documents
    └── Delete: DELETE /indexes/memories/documents/:id
```

## Performance Considerations

### Caching Strategy (Future)

```
Request
    │
    ▼
Check Cache
    │
    ├─► Hit ──► Return cached response
    │
    └─► Miss
        │
        ▼
    API Call
        │
        ▼
    Store in Cache (TTL: configurable)
        │
        ▼
    Return response
```

### Rate Limiting Strategy (Future)

```
Request Queue
    │
    ▼
Rate Limiter
    │
    ├─► Within limits ──► Process
    │
    └─► Exceeded limits ──► Wait or Queue
        │
        ▼
    Exponential Backoff
        │
        ▼
    Retry
```

## Security Layers

```
User Input
    │
    ▼
Input Validation
    │
    ▼
API Key from Environment
    │
    ▼
HTTPS Connection
    │
    ▼
API Provider
    │
    ▼
Response Sanitization
    │
    ▼
User Application
```

## Extension Points

1. **Custom Providers**: Extend `BaseAIProvider`
2. **Custom Agents**: Use providers + memory/search
3. **Custom Memory Levels**: Extend `MemoryLevel` enum
4. **Custom Search Filters**: Use Meilisearch filters
5. **Middleware**: Wrap providers for logging, caching, etc.

## Integration Examples

### Backend API Integration

```typescript
// routes/ai.ts
import { AICore } from '@rebordev/ai-core';

const ai = await AICore.initializeStack(config);

router.post('/analyze', async (req, res) => {
  const analysis = await ai.orderAnalyzer.analyzeOrder(req.body);
  res.json(analysis);
});
```

### Frontend Integration (via API)

```typescript
// frontend/src/api/ai.ts
export async function analyzeOrder(order: Order) {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    body: JSON.stringify(order),
  });
  return response.json();
}
```

---

**Document Version**: 1.0.0
**Last Updated**: 2024-01-27
