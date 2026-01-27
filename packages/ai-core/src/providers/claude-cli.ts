/**
 * Claude Code CLI Provider
 * Integrates with Claude Code via CLI using child_process
 */

import { spawn, ChildProcess } from 'child_process';
import {
  BaseAIProvider,
  ProviderConfig,
  AIResponse,
  Message,
  StreamOptions,
  AIProviderError,
} from './base';

export interface ClaudeCodeConfig extends ProviderConfig {
  cliPath?: string; // Path to claude executable
  workingDirectory?: string;
  timeout?: number; // Timeout in milliseconds
}

export interface ClaudeCodeContext {
  files?: string[]; // Files to include in context
  instructions?: string; // Additional instructions
  workingDir?: string; // Working directory
}

export class ClaudeCodeProvider extends BaseAIProvider {
  private cliPath: string;
  private workingDirectory: string;
  private timeout: number;
  private activeProcess: ChildProcess | null = null;

  constructor(config: ClaudeCodeConfig = {}) {
    super(config);
    this.cliPath = config.cliPath || 'claude';
    this.workingDirectory = config.workingDirectory || process.cwd();
    this.timeout = config.timeout || 300000; // 5 minutes default
  }

  getName(): string {
    return 'Claude Code CLI';
  }

  /**
   * Send a message to Claude Code CLI
   */
  async sendMessage(
    message: string,
    context?: ClaudeCodeContext
  ): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const args = this.buildArgs(message, context);
      const workDir = context?.workingDir || this.workingDirectory;

      const process = spawn(this.cliPath, args, {
        cwd: workDir,
        shell: true,
      });

      this.activeProcess = process;

      // Set timeout
      const timeoutId = setTimeout(() => {
        if (this.activeProcess) {
          this.activeProcess.kill();
          reject(
            new AIProviderError(
              'Claude Code CLI timeout',
              'TIMEOUT',
              undefined,
              true
            )
          );
        }
      }, this.timeout);

      process.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      process.on('error', (error) => {
        clearTimeout(timeoutId);
        this.activeProcess = null;
        reject(
          new AIProviderError(
            `Failed to spawn Claude Code CLI: ${error.message}`,
            'SPAWN_ERROR',
            undefined,
            true
          )
        );
      });

      process.on('close', (code) => {
        clearTimeout(timeoutId);
        this.activeProcess = null;

        if (code !== 0) {
          reject(
            new AIProviderError(
              `Claude Code CLI exited with code ${code}: ${errorOutput}`,
              'CLI_ERROR',
              code ?? undefined,
              false
            )
          );
        } else {
          resolve({
            content: output.trim(),
            model: 'claude-code-cli',
          });
        }
      });
    });
  }

  /**
   * Stream message with real-time output
   */
  async streamMessage(
    message: string,
    options: StreamOptions,
    context?: ClaudeCodeContext
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let fullOutput = '';
      let errorOutput = '';

      const args = this.buildArgs(message, context);
      const workDir = context?.workingDir || this.workingDirectory;

      const process = spawn(this.cliPath, args, {
        cwd: workDir,
        shell: true,
      });

      this.activeProcess = process;

      // Set timeout
      const timeoutId = setTimeout(() => {
        if (this.activeProcess) {
          this.activeProcess.kill();
          const error = new AIProviderError(
            'Claude Code CLI timeout',
            'TIMEOUT',
            undefined,
            true
          );
          options.onError?.(error);
          reject(error);
        }
      }, this.timeout);

      process.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        fullOutput += chunk;

        if (options.onToken) {
          options.onToken(chunk);
        }
      });

      process.stderr?.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      process.on('error', (error) => {
        clearTimeout(timeoutId);
        this.activeProcess = null;
        const providerError = new AIProviderError(
          `Failed to spawn Claude Code CLI: ${error.message}`,
          'SPAWN_ERROR',
          undefined,
          true
        );
        options.onError?.(providerError);
        reject(providerError);
      });

      process.on('close', (code) => {
        clearTimeout(timeoutId);
        this.activeProcess = null;

        if (code !== 0) {
          const error = new AIProviderError(
            `Claude Code CLI exited with code ${code}: ${errorOutput}`,
            'CLI_ERROR',
            code ?? undefined,
            false
          );
          options.onError?.(error);
          reject(error);
        } else {
          options.onComplete?.(fullOutput.trim());
          resolve();
        }
      });
    });
  }

  /**
   * Chat method (converts to single message for CLI)
   */
  async chat(messages: Message[]): Promise<AIResponse> {
    // Convert conversation to single message
    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    return this.sendMessage(conversationText);
  }

  /**
   * Build CLI arguments
   */
  private buildArgs(
    message: string,
    context?: ClaudeCodeContext
  ): string[] {
    const args: string[] = ['code'];

    // Add message
    args.push('--message', message);

    // Add context files
    if (context?.files && context.files.length > 0) {
      context.files.forEach((file) => {
        args.push('--file', file);
      });
    }

    // Add instructions
    if (context?.instructions) {
      args.push('--instructions', context.instructions);
    }

    return args;
  }

  /**
   * Cancel active process
   */
  cancel(): void {
    if (this.activeProcess) {
      this.activeProcess.kill();
      this.activeProcess = null;
    }
  }

  /**
   * Check if Claude Code CLI is available
   */
  static async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const process = spawn('claude', ['--version'], { shell: true });

      process.on('error', () => resolve(false));
      process.on('close', (code) => resolve(code === 0));

      // Timeout after 5 seconds
      setTimeout(() => {
        process.kill();
        resolve(false);
      }, 5000);
    });
  }
}

export default ClaudeCodeProvider;
