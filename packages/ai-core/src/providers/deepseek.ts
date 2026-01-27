/**
 * DeepSeek AI Provider
 * API integration with DeepSeek
 */

import axios, { AxiosInstance } from 'axios';
import {
  BaseAIProvider,
  ProviderConfig,
  AIResponse,
  Message,
  StreamOptions,
  AIProviderError,
} from './base';

export interface DeepSeekConfig extends ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface OrderAnalysis {
  title: string;
  summary: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedHours: number;
  technologies: string[];
  categories: string[];
  risks: string[];
  recommendations: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  dependencies: string[];
  skills: string[];
}

export class DeepSeekProvider extends BaseAIProvider {
  private client: AxiosInstance;
  private model: string;

  constructor(config: DeepSeekConfig) {
    super(config);
    this.validateConfig();

    if (!config.apiKey) {
      throw new AIProviderError(
        'DeepSeek API key is required',
        'MISSING_API_KEY'
      );
    }

    this.model = config.model || 'deepseek-chat';

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.deepseek.com/v1',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  getName(): string {
    return 'DeepSeek';
  }

  /**
   * Send a single message
   */
  async sendMessage(message: string, context?: any): Promise<AIResponse> {
    const messages: Message[] = [
      {
        role: 'user',
        content: message,
      },
    ];

    if (context?.systemPrompt) {
      messages.unshift({
        role: 'system',
        content: context.systemPrompt,
      });
    }

    return this.chat(messages);
  }

  /**
   * Chat with conversation history
   */
  async chat(messages: Message[]): Promise<AIResponse> {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 4096,
        stream: false,
      });

      const data = response.data;

      return {
        content: data.choices[0].message.content,
        tokensUsed: data.usage?.total_tokens,
        model: data.model,
        finishReason: data.choices[0].finish_reason,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Stream message
   */
  async streamMessage(
    message: string,
    options: StreamOptions,
    context?: any
  ): Promise<void> {
    const messages: Message[] = [
      {
        role: 'user',
        content: message,
      },
    ];

    if (context?.systemPrompt) {
      messages.unshift({
        role: 'system',
        content: context.systemPrompt,
      });
    }

    try {
      const response = await this.client.post(
        '/chat/completions',
        {
          model: this.model,
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 4096,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      let fullText = '';

      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line) => line.trim().startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') {
            options.onComplete?.(fullText);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              options.onToken?.(delta);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });

      response.data.on('error', (error: Error) => {
        options.onError?.(error);
      });
    } catch (error: any) {
      const providerError = this.handleError(error);
      options.onError?.(providerError);
      throw providerError;
    }
  }

  /**
   * Analyze freelance order
   */
  async analyzeOrder(description: string): Promise<OrderAnalysis> {
    const systemPrompt = `You are an expert at analyzing freelance project orders.
Analyze the following project description and provide a structured analysis in JSON format.
Include: title, summary, complexity (simple/medium/complex), estimatedHours, technologies, categories, risks, and recommendations.`;

    const response = await this.sendMessage(description, { systemPrompt });

    try {
      // Try to extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: parse structured text
      return this.parseOrderAnalysisFromText(response.content);
    } catch (error) {
      throw new AIProviderError(
        'Failed to parse order analysis response',
        'PARSE_ERROR'
      );
    }
  }

  /**
   * Generate project tasks from description
   */
  async generateProjectTasks(description: string): Promise<Task[]> {
    const systemPrompt = `You are an expert project manager. Break down the following project into specific tasks.
For each task provide: id (uuid), title, description, estimatedHours, priority (low/medium/high), dependencies (array of task ids), and skills (array of required skills).
Return tasks as a JSON array.`;

    const response = await this.sendMessage(description, { systemPrompt });

    try {
      // Try to extract JSON array from response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: empty array
      return [];
    } catch (error) {
      throw new AIProviderError(
        'Failed to parse tasks response',
        'PARSE_ERROR'
      );
    }
  }

  /**
   * Parse order analysis from text (fallback)
   */
  private parseOrderAnalysisFromText(text: string): OrderAnalysis {
    // Basic fallback parser
    return {
      title: 'Untitled Project',
      summary: text.substring(0, 200),
      complexity: 'medium',
      estimatedHours: 40,
      technologies: [],
      categories: [],
      risks: [],
      recommendations: [],
    };
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): AIProviderError {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const message =
        error.response?.data?.error?.message || error.message;
      const code = error.response?.data?.error?.code || error.code;

      const retryable =
        statusCode === 429 || // Rate limit
        statusCode === 500 || // Server error
        statusCode === 502 || // Bad gateway
        statusCode === 503 || // Service unavailable
        statusCode === 504; // Gateway timeout

      return new AIProviderError(
        `DeepSeek API Error: ${message}`,
        code,
        statusCode,
        retryable
      );
    }

    return new AIProviderError(
      `Unknown error: ${error.message}`,
      'UNKNOWN_ERROR'
    );
  }
}

export default DeepSeekProvider;
