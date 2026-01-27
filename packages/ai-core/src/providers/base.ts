/**
 * Base AI Provider Interface
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  model?: string;
  finishReason?: string;
}

export abstract class BaseAIProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Send a single message to the AI provider
   */
  abstract sendMessage(message: string, context?: any): Promise<AIResponse>;

  /**
   * Send a conversation history to the AI provider
   */
  abstract chat(messages: Message[]): Promise<AIResponse>;

  /**
   * Stream response from AI provider
   */
  abstract streamMessage(
    message: string,
    options: StreamOptions,
    context?: any
  ): Promise<void>;

  /**
   * Get provider name
   */
  abstract getName(): string;

  /**
   * Validate provider configuration
   */
  protected validateConfig(): void {
    if (!this.config) {
      throw new Error('Provider configuration is required');
    }
  }
}

export interface ProviderError extends Error {
  code?: string;
  statusCode?: number;
  retryable?: boolean;
}

export class AIProviderError extends Error implements ProviderError {
  code?: string;
  statusCode?: number;
  retryable?: boolean;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    retryable?: boolean
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}
