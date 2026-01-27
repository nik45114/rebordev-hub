/**
 * Project Generator Agent
 * Generates project structure and tasks from description
 */

import { DeepSeekProvider, Task } from '../providers/deepseek';
import { MemoryService, MemoryLevel } from '../memory/mem0-adapter';
import { SearchService } from '../memory/meilisearch-adapter';

export interface ProjectGenerationOptions {
  includeSubtasks?: boolean;
  estimateEffort?: boolean;
  suggestTechnologies?: boolean;
  saveToMemory?: boolean;
}

export interface GeneratedProject {
  name: string;
  description: string;
  tasks: Task[];
  technologies?: string[];
  totalEstimatedHours?: number;
  complexity?: 'simple' | 'medium' | 'complex';
  recommendations?: string[];
}

export class ProjectGeneratorAgent {
  private aiProvider: DeepSeekProvider;
  private memoryService?: MemoryService;
  private searchService?: SearchService;

  constructor(
    aiProvider: DeepSeekProvider,
    memoryService?: MemoryService,
    searchService?: SearchService
  ) {
    this.aiProvider = aiProvider;
    this.memoryService = memoryService;
    this.searchService = searchService;
  }

  /**
   * Generate project from description
   */
  async generateProject(
    description: string,
    options: ProjectGenerationOptions = {}
  ): Promise<GeneratedProject> {
    // Analyze project description
    const analysis = await this.aiProvider.analyzeOrder(description);

    // Generate tasks
    let tasks = await this.aiProvider.generateProjectTasks(description);

    // Add subtasks if requested
    if (options.includeSubtasks && tasks.length > 0) {
      tasks = await this.addSubtasks(tasks);
    }

    // Calculate total estimated hours
    const totalEstimatedHours = tasks.reduce(
      (sum, task) => sum + task.estimatedHours,
      0
    );

    const project: GeneratedProject = {
      name: analysis.title,
      description: analysis.summary,
      tasks,
      technologies: options.suggestTechnologies
        ? analysis.technologies
        : undefined,
      totalEstimatedHours: options.estimateEffort
        ? totalEstimatedHours
        : undefined,
      complexity: analysis.complexity,
      recommendations: analysis.recommendations,
    };

    // Save to memory if requested
    if (options.saveToMemory && this.memoryService) {
      await this.saveProjectToMemory(project);
    }

    // Index for search
    if (this.searchService) {
      await this.indexProject(project);
    }

    return project;
  }

  /**
   * Add subtasks to main tasks
   */
  private async addSubtasks(tasks: Task[]): Promise<Task[]> {
    const tasksWithSubtasks: Task[] = [];

    for (const task of tasks) {
      const subtaskPrompt = `Break down the following task into 3-5 subtasks:
Title: ${task.title}
Description: ${task.description}

Return as JSON array with fields: id, title, description, estimatedHours`;

      const response = await this.aiProvider.sendMessage(subtaskPrompt);

      try {
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const subtasks = JSON.parse(jsonMatch[0]);

          // Add main task
          tasksWithSubtasks.push(task);

          // Add subtasks with reference to parent
          subtasks.forEach((subtask: any) => {
            tasksWithSubtasks.push({
              ...subtask,
              dependencies: [task.id],
              priority: task.priority,
            });
          });
        } else {
          tasksWithSubtasks.push(task);
        }
      } catch (error) {
        // If parsing fails, just add the main task
        tasksWithSubtasks.push(task);
      }
    }

    return tasksWithSubtasks;
  }

  /**
   * Save project to memory
   */
  private async saveProjectToMemory(
    project: GeneratedProject
  ): Promise<void> {
    if (!this.memoryService) return;

    await this.memoryService.saveMemory(
      MemoryLevel.PROJECT,
      `project:${Date.now()}`,
      JSON.stringify(project),
      {
        name: project.name,
        complexity: project.complexity,
        totalEstimatedHours: project.totalEstimatedHours,
        technologies: project.technologies,
      }
    );
  }

  /**
   * Index project for search
   */
  private async indexProject(project: GeneratedProject): Promise<void> {
    if (!this.searchService || !this.memoryService) return;

    // Create memory entry
    const memoryEntry = {
      id: `project:${Date.now()}`,
      level: MemoryLevel.PROJECT,
      key: `project:${project.name}`,
      content: JSON.stringify(project),
      metadata: {
        name: project.name,
        complexity: project.complexity,
        totalEstimatedHours: project.totalEstimatedHours,
        technologies: project.technologies,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.searchService.indexMemory(memoryEntry);
  }

  /**
   * Search similar projects
   */
  async searchSimilarProjects(
    query: string,
    limit: number = 5
  ): Promise<GeneratedProject[]> {
    if (!this.searchService) {
      throw new Error('SearchService not configured');
    }

    const results = await this.searchService.searchByLevel(
      query,
      MemoryLevel.PROJECT,
      { limit }
    );

    return results.hits.map((hit) => JSON.parse(hit.content));
  }

  /**
   * Get project templates
   */
  async getProjectTemplates(): Promise<GeneratedProject[]> {
    if (!this.memoryService) {
      throw new Error('MemoryService not configured');
    }

    const templates = await this.memoryService.getMemoriesByLevel(
      MemoryLevel.GLOBAL,
      { limit: 50 }
    );

    return templates
      .filter((t) => t.key.startsWith('template:'))
      .map((t) => JSON.parse(t.content));
  }

  /**
   * Save project as template
   */
  async saveAsTemplate(project: GeneratedProject): Promise<void> {
    if (!this.memoryService) {
      throw new Error('MemoryService not configured');
    }

    await this.memoryService.saveMemory(
      MemoryLevel.GLOBAL,
      `template:${project.name}`,
      JSON.stringify(project),
      {
        name: project.name,
        complexity: project.complexity,
        technologies: project.technologies,
        isTemplate: true,
      }
    );
  }

  /**
   * Estimate project cost
   */
  async estimateProjectCost(
    project: GeneratedProject,
    hourlyRate: number
  ): Promise<{
    minCost: number;
    maxCost: number;
    averageCost: number;
  }> {
    const totalHours = project.totalEstimatedHours || 0;

    // Add 20% buffer for uncertainty
    const minHours = totalHours;
    const maxHours = totalHours * 1.5;
    const avgHours = (minHours + maxHours) / 2;

    return {
      minCost: minHours * hourlyRate,
      maxCost: maxHours * hourlyRate,
      averageCost: avgHours * hourlyRate,
    };
  }
}

export default ProjectGeneratorAgent;
