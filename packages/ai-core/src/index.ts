/**
 * @rebordev/ai-core
 * AI Integration Package
 *
 * Provides unified access to multiple AI providers, memory management,
 * and intelligent agents for project generation and order analysis.
 */

// Providers
export {
  BaseAIProvider,
  Message,
  StreamOptions,
  ProviderConfig,
  AIResponse,
  AIProviderError,
} from './providers/base';

export {
  ClaudeCodeProvider,
  ClaudeCodeConfig,
  ClaudeCodeContext,
} from './providers/claude-cli';

export {
  DeepSeekProvider,
  DeepSeekConfig,
  OrderAnalysis,
  Task,
} from './providers/deepseek';

export {
  OpenAIProvider,
  OpenAIConfig,
} from './providers/openai';

// Memory
export {
  MemoryService,
  MemoryLevel,
  MemoryEntry,
  MemorySearchOptions,
  Mem0Config,
} from './memory/mem0-adapter';

export {
  SearchService,
  SearchConfig,
  SearchOptions,
  SearchResult,
} from './memory/meilisearch-adapter';

// Agents
export {
  ProjectGeneratorAgent,
  ProjectGenerationOptions,
  GeneratedProject,
} from './agents/project-generator';

export {
  OrderAnalyzerAgent,
  FreelanceOrder,
  EnhancedOrderAnalysis,
  OrderMatchResult,
} from './agents/order-analyzer';

/**
 * Factory functions for easy initialization
 */

import { ClaudeCodeProvider, ClaudeCodeConfig } from './providers/claude-cli';
import { DeepSeekProvider, DeepSeekConfig } from './providers/deepseek';
import { OpenAIProvider, OpenAIConfig } from './providers/openai';
import { MemoryService, Mem0Config } from './memory/mem0-adapter';
import { SearchService, SearchConfig } from './memory/meilisearch-adapter';
import { ProjectGeneratorAgent } from './agents/project-generator';
import { OrderAnalyzerAgent } from './agents/order-analyzer';

export class AICore {
  /**
   * Create Claude Code CLI provider
   */
  static createClaudeProvider(
    config?: ClaudeCodeConfig
  ): ClaudeCodeProvider {
    return new ClaudeCodeProvider(config);
  }

  /**
   * Create DeepSeek provider
   */
  static createDeepSeekProvider(
    config: DeepSeekConfig
  ): DeepSeekProvider {
    return new DeepSeekProvider(config);
  }

  /**
   * Create OpenAI provider
   */
  static createOpenAIProvider(config: OpenAIConfig): OpenAIProvider {
    return new OpenAIProvider(config);
  }

  /**
   * Create Memory service
   */
  static createMemoryService(config?: Mem0Config): MemoryService {
    return new MemoryService(config);
  }

  /**
   * Create Search service
   */
  static createSearchService(config: SearchConfig): SearchService {
    return new SearchService(config);
  }

  /**
   * Create Project Generator Agent
   */
  static createProjectGenerator(
    deepseek: DeepSeekProvider,
    memoryService?: MemoryService,
    searchService?: SearchService
  ): ProjectGeneratorAgent {
    return new ProjectGeneratorAgent(
      deepseek,
      memoryService,
      searchService
    );
  }

  /**
   * Create Order Analyzer Agent
   */
  static createOrderAnalyzer(
    deepseek: DeepSeekProvider,
    openai?: OpenAIProvider,
    memoryService?: MemoryService,
    searchService?: SearchService
  ): OrderAnalyzerAgent {
    return new OrderAnalyzerAgent(
      deepseek,
      openai,
      memoryService,
      searchService
    );
  }

  /**
   * Initialize complete AI stack
   */
  static async initializeStack(config: {
    deepseek: DeepSeekConfig;
    openai?: OpenAIConfig;
    mem0?: Mem0Config;
    meilisearch?: SearchConfig;
  }): Promise<{
    deepseek: DeepSeekProvider;
    openai?: OpenAIProvider;
    memory?: MemoryService;
    search?: SearchService;
    projectGenerator: ProjectGeneratorAgent;
    orderAnalyzer: OrderAnalyzerAgent;
  }> {
    // Create providers
    const deepseek = this.createDeepSeekProvider(config.deepseek);
    const openai = config.openai
      ? this.createOpenAIProvider(config.openai)
      : undefined;

    // Create memory services
    const memory = config.mem0
      ? this.createMemoryService(config.mem0)
      : undefined;

    const search = config.meilisearch
      ? this.createSearchService(config.meilisearch)
      : undefined;

    // Initialize search index if available
    if (search) {
      await search.initializeIndex();
    }

    // Create agents
    const projectGenerator = this.createProjectGenerator(
      deepseek,
      memory,
      search
    );

    const orderAnalyzer = this.createOrderAnalyzer(
      deepseek,
      openai,
      memory,
      search
    );

    return {
      deepseek,
      openai,
      memory,
      search,
      projectGenerator,
      orderAnalyzer,
    };
  }

  /**
   * Check Claude Code availability
   */
  static async isClaudeCodeAvailable(): Promise<boolean> {
    return ClaudeCodeProvider.isAvailable();
  }
}

export default AICore;
