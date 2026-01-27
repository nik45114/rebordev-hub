/**
 * Order Analyzer Agent
 * Analyzes freelance orders and extracts key information
 */

import { DeepSeekProvider, OrderAnalysis } from '../providers/deepseek';
import { OpenAIProvider } from '../providers/openai';
import { MemoryService, MemoryLevel } from '../memory/mem0-adapter';
import { SearchService } from '../memory/meilisearch-adapter';

export interface FreelanceOrder {
  id: string;
  title: string;
  description: string;
  budget?: number;
  deadline?: Date;
  skills?: string[];
  platform?: string;
  url?: string;
}

export interface EnhancedOrderAnalysis extends OrderAnalysis {
  orderId: string;
  keyPoints: string[];
  suggestedBid?: number;
  bidRange?: {
    min: number;
    max: number;
  };
  timeToComplete?: number;
  feasibility: 'high' | 'medium' | 'low';
  score: number; // 0-100
}

export interface OrderMatchResult {
  order: FreelanceOrder;
  analysis: EnhancedOrderAnalysis;
  matchScore: number;
  reasons: string[];
}

export class OrderAnalyzerAgent {
  private deepseek: DeepSeekProvider;
  private openai?: OpenAIProvider;
  private memoryService?: MemoryService;
  private searchService?: SearchService;

  constructor(
    deepseek: DeepSeekProvider,
    openai?: OpenAIProvider,
    memoryService?: MemoryService,
    searchService?: SearchService
  ) {
    this.deepseek = deepseek;
    this.openai = openai;
    this.memoryService = memoryService;
    this.searchService = searchService;
  }

  /**
   * Analyze freelance order
   */
  async analyzeOrder(order: FreelanceOrder): Promise<EnhancedOrderAnalysis> {
    // Basic analysis from DeepSeek
    const basicAnalysis = await this.deepseek.analyzeOrder(
      order.description
    );

    // Extract key points with OpenAI (if available)
    let keyPoints: string[] = [];
    if (this.openai) {
      keyPoints = await this.openai.extractKeyPoints(order.description);
    }

    // Calculate feasibility
    const feasibility = this.calculateFeasibility(basicAnalysis);

    // Calculate score
    const score = this.calculateOrderScore(basicAnalysis, order);

    // Suggest bid
    const bidRange = this.calculateBidRange(
      basicAnalysis.estimatedHours,
      order.budget
    );

    const analysis: EnhancedOrderAnalysis = {
      ...basicAnalysis,
      orderId: order.id,
      keyPoints,
      bidRange,
      suggestedBid: bidRange ? (bidRange.min + bidRange.max) / 2 : undefined,
      timeToComplete: basicAnalysis.estimatedHours,
      feasibility,
      score,
    };

    // Save to memory
    if (this.memoryService) {
      await this.saveAnalysisToMemory(order, analysis);
    }

    // Index for search
    if (this.searchService) {
      await this.indexAnalysis(order, analysis);
    }

    return analysis;
  }

  /**
   * Batch analyze orders
   */
  async analyzeOrders(
    orders: FreelanceOrder[]
  ): Promise<EnhancedOrderAnalysis[]> {
    const analyses: EnhancedOrderAnalysis[] = [];

    for (const order of orders) {
      try {
        const analysis = await this.analyzeOrder(order);
        analyses.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze order ${order.id}:`, error);
      }
    }

    return analyses;
  }

  /**
   * Match orders to user profile
   */
  async matchOrdersToProfile(
    orders: FreelanceOrder[],
    userProfile: {
      skills: string[];
      experience: string[];
      preferredBudget?: { min: number; max: number };
      preferredComplexity?: ('simple' | 'medium' | 'complex')[];
    }
  ): Promise<OrderMatchResult[]> {
    const matches: OrderMatchResult[] = [];

    for (const order of orders) {
      const analysis = await this.analyzeOrder(order);

      const matchScore = this.calculateMatchScore(
        analysis,
        userProfile
      );

      const reasons = this.generateMatchReasons(
        analysis,
        userProfile
      );

      matches.push({
        order,
        analysis,
        matchScore,
        reasons,
      });
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches;
  }

  /**
   * Find similar orders
   */
  async findSimilarOrders(
    orderId: string,
    limit: number = 5
  ): Promise<FreelanceOrder[]> {
    if (!this.searchService) {
      throw new Error('SearchService not configured');
    }

    const order = await this.getOrderFromMemory(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const results = await this.searchService.search(
      order.description,
      {
        level: MemoryLevel.PROJECT,
        limit: limit + 1, // +1 to exclude the query order itself
      }
    );

    return results.hits
      .filter((hit) => hit.metadata?.orderId !== orderId)
      .slice(0, limit)
      .map((hit) => JSON.parse(hit.metadata?.order || '{}'));
  }

  /**
   * Calculate feasibility
   */
  private calculateFeasibility(
    analysis: OrderAnalysis
  ): 'high' | 'medium' | 'low' {
    const riskCount = analysis.risks.length;

    if (riskCount === 0) return 'high';
    if (riskCount <= 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate order score (0-100)
   */
  private calculateOrderScore(
    analysis: OrderAnalysis,
    order: FreelanceOrder
  ): number {
    let score = 50; // Base score

    // Complexity bonus
    if (analysis.complexity === 'simple') score += 20;
    else if (analysis.complexity === 'medium') score += 10;

    // Budget bonus
    if (order.budget && analysis.estimatedHours) {
      const hourlyRate = order.budget / analysis.estimatedHours;
      if (hourlyRate >= 50) score += 20;
      else if (hourlyRate >= 30) score += 10;
    }

    // Risk penalty
    score -= analysis.risks.length * 5;

    // Technology match bonus
    if (analysis.technologies.length > 0) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate bid range
   */
  private calculateBidRange(
    estimatedHours: number,
    budget?: number
  ): { min: number; max: number } | undefined {
    if (!budget) {
      // Default hourly rates
      const minRate = 30;
      const maxRate = 80;
      return {
        min: estimatedHours * minRate,
        max: estimatedHours * maxRate,
      };
    }

    // Use budget as reference
    return {
      min: budget * 0.8,
      max: budget * 1.2,
    };
  }

  /**
   * Calculate match score with user profile
   */
  private calculateMatchScore(
    analysis: EnhancedOrderAnalysis,
    userProfile: any
  ): number {
    let score = 0;

    // Skill match
    const skillMatches = analysis.technologies.filter((tech) =>
      userProfile.skills.some((skill: string) =>
        skill.toLowerCase().includes(tech.toLowerCase())
      )
    );
    score += (skillMatches.length / analysis.technologies.length) * 40;

    // Complexity match
    if (
      userProfile.preferredComplexity?.includes(analysis.complexity)
    ) {
      score += 20;
    }

    // Budget match
    if (
      userProfile.preferredBudget &&
      analysis.suggestedBid
    ) {
      if (
        analysis.suggestedBid >= userProfile.preferredBudget.min &&
        analysis.suggestedBid <= userProfile.preferredBudget.max
      ) {
        score += 20;
      }
    }

    // Feasibility bonus
    if (analysis.feasibility === 'high') score += 20;
    else if (analysis.feasibility === 'medium') score += 10;

    return Math.min(100, score);
  }

  /**
   * Generate match reasons
   */
  private generateMatchReasons(
    analysis: EnhancedOrderAnalysis,
    userProfile: any
  ): string[] {
    const reasons: string[] = [];

    // Skill matches
    const skillMatches = analysis.technologies.filter((tech) =>
      userProfile.skills.some((skill: string) =>
        skill.toLowerCase().includes(tech.toLowerCase())
      )
    );

    if (skillMatches.length > 0) {
      reasons.push(
        `Matches ${skillMatches.length} of your skills: ${skillMatches.join(', ')}`
      );
    }

    // Complexity match
    if (
      userProfile.preferredComplexity?.includes(analysis.complexity)
    ) {
      reasons.push(`Complexity level (${analysis.complexity}) matches your preference`);
    }

    // Feasibility
    if (analysis.feasibility === 'high') {
      reasons.push('High feasibility - low risk project');
    }

    // Budget
    if (analysis.suggestedBid) {
      reasons.push(
        `Suggested bid: $${analysis.suggestedBid.toFixed(2)}`
      );
    }

    return reasons;
  }

  /**
   * Save analysis to memory
   */
  private async saveAnalysisToMemory(
    order: FreelanceOrder,
    analysis: EnhancedOrderAnalysis
  ): Promise<void> {
    if (!this.memoryService) return;

    await this.memoryService.saveMemory(
      MemoryLevel.PROJECT,
      `order:${order.id}`,
      JSON.stringify(analysis),
      {
        orderId: order.id,
        title: order.title,
        complexity: analysis.complexity,
        score: analysis.score,
        order: JSON.stringify(order),
      }
    );
  }

  /**
   * Index analysis for search
   */
  private async indexAnalysis(
    order: FreelanceOrder,
    analysis: EnhancedOrderAnalysis
  ): Promise<void> {
    if (!this.searchService) return;

    const memoryEntry = {
      id: `order:${order.id}`,
      level: MemoryLevel.PROJECT,
      key: `order:${order.id}`,
      content: order.description,
      metadata: {
        orderId: order.id,
        title: order.title,
        complexity: analysis.complexity,
        score: analysis.score,
        technologies: analysis.technologies,
        order: JSON.stringify(order),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.searchService.indexMemory(memoryEntry);
  }

  /**
   * Get order from memory
   */
  private async getOrderFromMemory(
    orderId: string
  ): Promise<FreelanceOrder | null> {
    if (!this.memoryService) return null;

    try {
      const memory = await this.memoryService.getMemory(
        `order:${orderId}`
      );
      return JSON.parse(memory.metadata?.order || 'null');
    } catch (error) {
      return null;
    }
  }
}

export default OrderAnalyzerAgent;
