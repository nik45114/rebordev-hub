import { prisma } from '../../config/database.js'
import { CreateProjectInput, UpdateProjectInput, AIGenerateTasksInput } from './projects.types.js'
import { createDeepSeekAgent } from '@rebordev/ai-core'

export class ProjectsService {
  async getProjects(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    return project
  }

  async createProject(data: CreateProjectInput, userId: string) {
    const { aiGenerate, aiPrompt, ...projectData } = data

    // Создаем проект
    const project = await prisma.project.create({
      data: {
        ...projectData,
        deadline: projectData.deadline ? new Date(projectData.deadline) : null,
        userId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    })

    // Если включена AI генерация задач
    if (aiGenerate && aiPrompt) {
      await this.aiGenerateTasks(project.id, userId, {
        prompt: aiPrompt,
        count: 10,
      })
    }

    return project
  }

  async updateProject(projectId: string, userId: string, data: UpdateProjectInput) {
    // Проверяем существование и права доступа
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
    })

    if (!existing) {
      throw new Error('Project not found')
    }

    return prisma.project.update({
      where: { id: projectId },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    })
  }

  async deleteProject(projectId: string, userId: string) {
    // Проверяем существование и права доступа
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
    })

    if (!existing) {
      throw new Error('Project not found')
    }

    // Удаляем проект (каскадное удаление задач настроено в Prisma)
    await prisma.project.delete({
      where: { id: projectId },
    })

    return { success: true, message: 'Project deleted successfully' }
  }

  async aiGenerateTasks(projectId: string, userId: string, data: AIGenerateTasksInput) {
    // Проверяем существование проекта
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // Используем DeepSeek для генерации задач
    const agent = createDeepSeekAgent({
      model: 'deepseek-chat',
      temperature: 0.7,
    })

    const prompt = `
You are a project management assistant. Generate ${data.count} realistic and actionable tasks for the following project:

Project: ${project.name}
Description: ${project.description || 'No description provided'}
User Request: ${data.prompt}

Return ONLY a JSON array of tasks in this exact format:
[
  {
    "title": "Task title (max 100 chars)",
    "description": "Detailed task description",
    "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    "estimatedHours": number (optional)
  }
]

Requirements:
- Tasks should be specific and actionable
- Include variety in priorities
- Use realistic time estimates
- Focus on practical development steps
`

    try {
      const response = await agent.chat([{ role: 'user', content: prompt }])
      const content = response.content

      // Парсим JSON из ответа
      let tasksData: any[]
      try {
        // Пытаемся найти JSON массив в ответе
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          tasksData = JSON.parse(jsonMatch[0])
        } else {
          tasksData = JSON.parse(content)
        }
      } catch (parseError) {
        throw new Error('Failed to parse AI response')
      }

      // Создаем задачи в БД
      const tasks = await Promise.all(
        tasksData.slice(0, data.count).map((task) =>
          prisma.task.create({
            data: {
              title: task.title.slice(0, 100),
              description: task.description || null,
              priority: task.priority || 'MEDIUM',
              status: 'TODO',
              estimatedHours: task.estimatedHours || null,
              projectId,
              createdById: userId,
            },
          })
        )
      )

      return {
        success: true,
        count: tasks.length,
        tasks,
      }
    } catch (error) {
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
