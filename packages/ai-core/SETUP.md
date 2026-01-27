# AI Core Package Setup Guide

## Быстрая установка

### 1. Установка зависимостей

```bash
cd packages/ai-core
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Заполните необходимые API ключи:

```env
DEEPSEEK_API_KEY=sk-xxxxx
OPENAI_API_KEY=sk-xxxxx
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

### 3. Сборка пакета

```bash
npm run build
```

## Запуск Meilisearch (опционально)

Если вы хотите использовать поиск по памяти:

### Docker

```bash
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=masterKey \
  getmeili/meilisearch:latest
```

### Или локально

```bash
# macOS
brew install meilisearch

# Linux
curl -L https://install.meilisearch.com | sh

# Запуск
meilisearch --master-key=masterKey
```

Проверьте: http://localhost:7700

## Проверка установки

### Запуск тестов

```bash
cd examples
npx ts-node test-integration.ts
```

### Запуск примеров

```bash
# Базовое использование
npx ts-node examples/basic-usage.ts

# Или конкретный пример
npx ts-node -e "require('./examples/basic-usage').example2_DeepSeekAnalysis()"
```

## Использование в проекте

### Установка в другой пакет

В вашем `package.json`:

```json
{
  "dependencies": {
    "@rebordev/ai-core": "*"
  }
}
```

Затем в корне monorepo:

```bash
npm install
```

### Импорт в код

```typescript
import { AICore, DeepSeekProvider, ClaudeCodeProvider } from '@rebordev/ai-core';

// Инициализация
const ai = await AICore.initializeStack({
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY!,
  },
});

// Использование
const response = await ai.deepseek.sendMessage('Hello!');
console.log(response.content);
```

## Требования

### Обязательные

- Node.js >= 18.0.0
- TypeScript >= 5.0.0
- npm или yarn

### Опциональные

- Claude Code CLI (для ClaudeCodeProvider)
- Meilisearch (для SearchService)
- mem0 API ключ (для MemoryService)

## Проверка Claude Code CLI

```bash
claude --version
```

Если не установлен:

```bash
# macOS/Linux
curl -fsSL https://claude.ai/install.sh | sh

# Windows
# Скачайте с https://claude.ai/download
```

## API Ключи

### DeepSeek

1. Зарегистрируйтесь на https://platform.deepseek.com
2. Создайте API ключ в настройках
3. Добавьте в `.env`: `DEEPSEEK_API_KEY=sk-xxxxx`

### OpenAI

1. Зарегистрируйтесь на https://platform.openai.com
2. Создайте API ключ
3. Добавьте в `.env`: `OPENAI_API_KEY=sk-xxxxx`

### mem0

1. Зарегистрируйтесь на https://mem0.ai
2. Получите API ключ
3. Добавьте в `.env`: `MEM0_API_KEY=xxxxx`

## Структура пакета

```
ai-core/
├── src/
│   ├── providers/          # AI провайдеры
│   │   ├── base.ts         # Базовый интерфейс
│   │   ├── claude-cli.ts   # Claude Code CLI
│   │   ├── deepseek.ts     # DeepSeek API
│   │   ├── openai.ts       # OpenAI API
│   │   └── index.ts
│   ├── memory/             # Память и поиск
│   │   ├── mem0-adapter.ts # mem0 интеграция
│   │   ├── meilisearch-adapter.ts # Meilisearch
│   │   └── index.ts
│   ├── agents/             # Умные агенты
│   │   ├── project-generator.ts # Генератор проектов
│   │   ├── order-analyzer.ts    # Анализатор заказов
│   │   └── index.ts
│   └── index.ts           # Главный экспорт
├── examples/              # Примеры использования
│   ├── basic-usage.ts
│   └── test-integration.ts
├── package.json
├── tsconfig.json
├── README.md
├── SETUP.md
└── .env.example
```

## Troubleshooting

### "Module not found" ошибка

```bash
# Пересобрать пакет
npm run clean && npm run build

# Обновить зависимости в monorepo
cd ../.. && npm install
```

### "API key not found"

Проверьте `.env` файл и убедитесь, что все ключи правильно установлены.

### "Meilisearch connection refused"

```bash
# Проверьте, что Meilisearch запущен
curl http://localhost:7700/health

# Если не запущен
docker start meilisearch
# или
meilisearch --master-key=masterKey
```

### "Claude Code CLI not found"

```bash
# Проверьте установку
which claude

# Или укажите полный путь
CLAUDE_CLI_PATH=/path/to/claude
```

## Дополнительная информация

- [README.md](./README.md) - Полная документация
- [examples/](./examples/) - Примеры кода
- [@rebordev/shared](../shared/) - Общие типы и утилиты

## Поддержка

Для вопросов и проблем создавайте Issues в репозитории проекта.
