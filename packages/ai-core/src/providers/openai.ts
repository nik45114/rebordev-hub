/**
 * OpenAI Provider
 * API integration with OpenAI
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

export interface OpenAIConfig extends ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  organization?: string;
}

export class OpenAIProvider extends BaseAIProvider {
  private client: AxiosInstance;
  private model: string;

  constructor(config: OpenAIConfig) {
    super(config);
    this.validateConfig();

    if (!config.apiKey) {
      throw new AIProviderError(
        'OpenAI API key is required',
        'MISSING_API_KEY'
      );
    }

    this.model = config.model || 'gpt-4-turbo-preview';

    const headers: any = {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (config.organization) {
      headers['OpenAI-Organization'] = config.organization;
    }

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.openai.com/v1',
      headers,
      timeout: 60000,
    });
  }

  getName(): string {
    return 'OpenAI';
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
   * Summarize text
   */
  async summarize(text: string, maxLength: number = 200): Promise<string> {
    const systemPrompt = `You are a text summarization expert. Provide a concise summary of the following text in approximately ${maxLength} characters.`;

    const response = await this.sendMessage(text, { systemPrompt });
    return response.content;
  }

  /**
   * Extract key points from text
   */
  async extractKeyPoints(text: string): Promise<string[]> {
    const systemPrompt = `You are an expert at extracting key points from text.
Extract the most important points from the following text and return them as a JSON array of strings.
Each point should be concise (max 100 characters).`;

    const response = await this.sendMessage(text, { systemPrompt });

    try {
      // Try to extract JSON array from response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const points = JSON.parse(jsonMatch[0]);
        return Array.isArray(points) ? points : [];
      }

      // Fallback: split by newlines
      return response.content
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-*•]\s*/, '').trim())
        .filter((line) => line.length > 0);
    } catch (error) {
      throw new AIProviderError(
        'Failed to parse key points response',
        'PARSE_ERROR'
      );
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.post('/embeddings', {
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data.data[0].embedding;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Classify text into categories
   */
  async classify(
    text: string,
    categories: string[]
  ): Promise<{ category: string; confidence: number }> {
    const systemPrompt = `You are a text classification expert.
Classify the following text into one of these categories: ${categories.join(', ')}.
Return a JSON object with "category" and "confidence" (0-1) fields.`;

    const response = await this.sendMessage(text, { systemPrompt });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback
      return {
        category: categories[0],
        confidence: 0.5,
      };
    } catch (error) {
      throw new AIProviderError(
        'Failed to parse classification response',
        'PARSE_ERROR'
      );
    }
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
        `OpenAI API Error: ${message}`,
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

export default OpenAIProvider;
