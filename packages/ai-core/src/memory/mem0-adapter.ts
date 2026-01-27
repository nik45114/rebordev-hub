/**
 * mem0 Memory Adapter
 * Integration with mem0 for memory management
 */

import axios, { AxiosInstance } from 'axios';

export enum MemoryLevel {
  USER = 'user',
  PROJECT = 'project',
  TEAM = 'team',
  ORGANIZATION = 'organization',
  GLOBAL = 'global',
}

export interface MemoryEntry {
  id: string;
  level: MemoryLevel;
  key: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  projectId?: string;
  teamId?: string;
  organizationId?: string;
}

export interface MemorySearchOptions {
  level?: MemoryLevel;
  userId?: string;
  projectId?: string;
  teamId?: string;
  organizationId?: string;
  limit?: number;
  offset?: number;
}

export interface Mem0Config {
  apiKey?: string;
  baseUrl?: string;
  userId?: string;
  organizationId?: string;
}

export class MemoryService {
  private client: AxiosInstance;
  private userId?: string;
  private organizationId?: string;

  constructor(config: Mem0Config = {}) {
    this.userId = config.userId;
    this.organizationId = config.organizationId;

    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.mem0.ai/v1',
      headers,
      timeout: 30000,
    });
  }

  /**
   * Save memory entry
   */
  async saveMemory(
    level: MemoryLevel,
    key: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<MemoryEntry> {
    try {
      const response = await this.client.post('/memories', {
        level,
        key,
        content,
        metadata: {
          ...metadata,
          userId: this.userId,
          organizationId: this.organizationId,
        },
      });

      return this.transformMemoryResponse(response.data);
    } catch (error: any) {
      throw new Error(
        `Failed to save memory: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Search memories
   */
  async searchMemory(
    query: string,
    options: MemorySearchOptions = {}
  ): Promise<MemoryEntry[]> {
    try {
      const params: any = {
        query,
        limit: options.limit || 10,
        offset: options.offset || 0,
      };

      if (options.level) params.level = options.level;
      if (options.userId) params.user_id = options.userId;
      if (options.projectId) params.project_id = options.projectId;
      if (options.teamId) params.team_id = options.teamId;
      if (options.organizationId)
        params.organization_id = options.organizationId;

      const response = await this.client.get('/memories/search', {
        params,
      });

      return (response.data.memories || []).map((m: any) =>
        this.transformMemoryResponse(m)
      );
    } catch (error: any) {
      throw new Error(
        `Failed to search memory: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Get memory by ID
   */
  async getMemory(id: string): Promise<MemoryEntry> {
    try {
      const response = await this.client.get(`/memories/${id}`);
      return this.transformMemoryResponse(response.data);
    } catch (error: any) {
      throw new Error(
        `Failed to get memory: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Update memory
   */
  async updateMemory(
    id: string,
    updates: Partial<{
      content: string;
      metadata: Record<string, any>;
    }>
  ): Promise<MemoryEntry> {
    try {
      const response = await this.client.patch(`/memories/${id}`, updates);
      return this.transformMemoryResponse(response.data);
    } catch (error: any) {
      throw new Error(
        `Failed to update memory: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Delete memory
   */
  async deleteMemory(id: string): Promise<void> {
    try {
      await this.client.delete(`/memories/${id}`);
    } catch (error: any) {
      throw new Error(
        `Failed to delete memory: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Get all memories for a specific level
   */
  async getMemoriesByLevel(
    level: MemoryLevel,
    options: {
      userId?: string;
      projectId?: string;
      teamId?: string;
      organizationId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<MemoryEntry[]> {
    try {
      const params: any = {
        level,
        limit: options.limit || 100,
        offset: options.offset || 0,
      };

      if (options.userId) params.user_id = options.userId;
      if (options.projectId) params.project_id = options.projectId;
      if (options.teamId) params.team_id = options.teamId;
      if (options.organizationId)
        params.organization_id = options.organizationId;

      const response = await this.client.get('/memories', { params });

      return (response.data.memories || []).map((m: any) =>
        this.transformMemoryResponse(m)
      );
    } catch (error: any) {
      throw new Error(
        `Failed to get memories by level: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Save user memory
   */
  async saveUserMemory(
    userId: string,
    key: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<MemoryEntry> {
    return this.saveMemory(MemoryLevel.USER, key, content, {
      ...metadata,
      userId,
    });
  }

  /**
   * Save project memory
   */
  async saveProjectMemory(
    projectId: string,
    key: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<MemoryEntry> {
    return this.saveMemory(MemoryLevel.PROJECT, key, content, {
      ...metadata,
      projectId,
    });
  }

  /**
   * Save team memory
   */
  async saveTeamMemory(
    teamId: string,
    key: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<MemoryEntry> {
    return this.saveMemory(MemoryLevel.TEAM, key, content, {
      ...metadata,
      teamId,
    });
  }

  /**
   * Save organization memory
   */
  async saveOrganizationMemory(
    organizationId: string,
    key: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<MemoryEntry> {
    return this.saveMemory(MemoryLevel.ORGANIZATION, key, content, {
      ...metadata,
      organizationId,
    });
  }

  /**
   * Transform API response to MemoryEntry
   */
  private transformMemoryResponse(data: any): MemoryEntry {
    return {
      id: data.id || data._id,
      level: data.level,
      key: data.key,
      content: data.content,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at || data.createdAt),
      updatedAt: new Date(data.updated_at || data.updatedAt),
      userId: data.metadata?.userId || data.user_id,
      projectId: data.metadata?.projectId || data.project_id,
      teamId: data.metadata?.teamId || data.team_id,
      organizationId:
        data.metadata?.organizationId || data.organization_id,
    };
  }
}

export default MemoryService;
