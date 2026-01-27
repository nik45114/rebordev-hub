/**
 * Meilisearch Adapter
 * Search integration with Meilisearch for memory entries
 */

import { MeiliSearch, Index } from 'meilisearch';
import { MemoryEntry, MemoryLevel } from './mem0-adapter';

export interface SearchConfig {
  host: string;
  apiKey?: string;
  indexName?: string;
}

export interface SearchOptions {
  level?: MemoryLevel;
  userId?: string;
  projectId?: string;
  teamId?: string;
  organizationId?: string;
  limit?: number;
  offset?: number;
  attributesToHighlight?: string[];
  attributesToCrop?: string[];
}

export interface SearchResult {
  hits: MemoryEntry[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

export class SearchService {
  private client: MeiliSearch;
  private index: Index;
  private indexName: string;

  constructor(config: SearchConfig) {
    this.client = new MeiliSearch({
      host: config.host,
      apiKey: config.apiKey,
    });

    this.indexName = config.indexName || 'memories';
    this.index = this.client.index(this.indexName);
  }

  /**
   * Initialize index with settings
   */
  async initializeIndex(): Promise<void> {
    try {
      // Create index if it doesn't exist
      await this.client.createIndex(this.indexName, { primaryKey: 'id' });
    } catch (error: any) {
      // Index might already exist, ignore error
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    // Configure searchable attributes
    await this.index.updateSettings({
      searchableAttributes: ['key', 'content', 'metadata'],
      filterableAttributes: [
        'level',
        'userId',
        'projectId',
        'teamId',
        'organizationId',
        'createdAt',
        'updatedAt',
      ],
      sortableAttributes: ['createdAt', 'updatedAt'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
    });
  }

  /**
   * Index a memory entry
   */
  async indexMemory(entry: MemoryEntry): Promise<void> {
    try {
      await this.index.addDocuments([this.transformForIndexing(entry)]);
    } catch (error: any) {
      throw new Error(`Failed to index memory: ${error.message}`);
    }
  }

  /**
   * Index multiple memory entries
   */
  async indexMemories(entries: MemoryEntry[]): Promise<void> {
    try {
      const documents = entries.map((entry) =>
        this.transformForIndexing(entry)
      );
      await this.index.addDocuments(documents);
    } catch (error: any) {
      throw new Error(`Failed to index memories: ${error.message}`);
    }
  }

  /**
   * Search memories
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    try {
      const filters = this.buildFilters(options);

      const searchParams: any = {
        limit: options.limit || 20,
        offset: options.offset || 0,
      };

      if (filters) {
        searchParams.filter = filters;
      }

      if (options.attributesToHighlight) {
        searchParams.attributesToHighlight = options.attributesToHighlight;
      }

      if (options.attributesToCrop) {
        searchParams.attributesToCrop = options.attributesToCrop;
      }

      const result = await this.index.search(query, searchParams);

      return {
        hits: result.hits.map((hit: any) =>
          this.transformFromIndexing(hit)
        ),
        query: result.query,
        processingTimeMs: result.processingTimeMs,
        limit: result.limit || 0,
        offset: result.offset || 0,
        estimatedTotalHits: result.estimatedTotalHits || 0,
      };
    } catch (error: any) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get memory by ID
   */
  async getMemory(id: string): Promise<MemoryEntry | null> {
    try {
      const document = await this.index.getDocument(id);
      return this.transformFromIndexing(document);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw new Error(`Failed to get memory: ${error.message}`);
    }
  }

  /**
   * Update memory in index
   */
  async updateMemory(entry: MemoryEntry): Promise<void> {
    try {
      await this.index.updateDocuments([this.transformForIndexing(entry)]);
    } catch (error: any) {
      throw new Error(`Failed to update memory: ${error.message}`);
    }
  }

  /**
   * Delete memory from index
   */
  async deleteMemory(id: string): Promise<void> {
    try {
      await this.index.deleteDocument(id);
    } catch (error: any) {
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  /**
   * Delete multiple memories
   */
  async deleteMemories(ids: string[]): Promise<void> {
    try {
      await this.index.deleteDocuments(ids);
    } catch (error: any) {
      throw new Error(`Failed to delete memories: ${error.message}`);
    }
  }

  /**
   * Clear all memories from index
   */
  async clearIndex(): Promise<void> {
    try {
      await this.index.deleteAllDocuments();
    } catch (error: any) {
      throw new Error(`Failed to clear index: ${error.message}`);
    }
  }

  /**
   * Get index stats
   */
  async getStats(): Promise<any> {
    try {
      return await this.index.getStats();
    } catch (error: any) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  /**
   * Faceted search by level
   */
  async searchByLevel(
    query: string,
    level: MemoryLevel,
    options: Omit<SearchOptions, 'level'> = {}
  ): Promise<SearchResult> {
    return this.search(query, { ...options, level });
  }

  /**
   * Search user memories
   */
  async searchUserMemories(
    query: string,
    userId: string,
    options: Omit<SearchOptions, 'userId' | 'level'> = {}
  ): Promise<SearchResult> {
    return this.search(query, {
      ...options,
      userId,
      level: MemoryLevel.USER,
    });
  }

  /**
   * Search project memories
   */
  async searchProjectMemories(
    query: string,
    projectId: string,
    options: Omit<SearchOptions, 'projectId' | 'level'> = {}
  ): Promise<SearchResult> {
    return this.search(query, {
      ...options,
      projectId,
      level: MemoryLevel.PROJECT,
    });
  }

  /**
   * Build Meilisearch filters
   */
  private buildFilters(options: SearchOptions): string | null {
    const filters: string[] = [];

    if (options.level) {
      filters.push(`level = "${options.level}"`);
    }

    if (options.userId) {
      filters.push(`userId = "${options.userId}"`);
    }

    if (options.projectId) {
      filters.push(`projectId = "${options.projectId}"`);
    }

    if (options.teamId) {
      filters.push(`teamId = "${options.teamId}"`);
    }

    if (options.organizationId) {
      filters.push(`organizationId = "${options.organizationId}"`);
    }

    return filters.length > 0 ? filters.join(' AND ') : null;
  }

  /**
   * Transform MemoryEntry for indexing
   */
  private transformForIndexing(entry: MemoryEntry): any {
    return {
      id: entry.id,
      level: entry.level,
      key: entry.key,
      content: entry.content,
      metadata: entry.metadata,
      createdAt: entry.createdAt.getTime(),
      updatedAt: entry.updatedAt.getTime(),
      userId: entry.userId,
      projectId: entry.projectId,
      teamId: entry.teamId,
      organizationId: entry.organizationId,
    };
  }

  /**
   * Transform indexed document to MemoryEntry
   */
  private transformFromIndexing(document: any): MemoryEntry {
    return {
      id: document.id,
      level: document.level,
      key: document.key,
      content: document.content,
      metadata: document.metadata || {},
      createdAt: new Date(document.createdAt),
      updatedAt: new Date(document.updatedAt),
      userId: document.userId,
      projectId: document.projectId,
      teamId: document.teamId,
      organizationId: document.organizationId,
    };
  }
}

export default SearchService;
