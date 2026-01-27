import { prisma } from '../../config/database.js'
import {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  CreateCommentInput,
  GetTasksQuery,
} from './tasks.types.js'

export class TasksService {
  async getTasks(userId: string, query: GetTasksQuery) {
    // Строим where условие
    const where: any = {}

    // Фильтр по проекту (если указан)
    if (query.projectId) {
      where.projectId = query.projectId

      // Проверяем доступ к проекту
      const project = await prisma.project.findFirst({
        where: { id: query.projectId, userId },
      })

      if (!project) {
        throw new Error('Project not found')
      }
    } else {
      // Если проект не указан, показываем только задачи из проектов пользователя
      where.project = {
        userId,
      }
    }

    // Фильтр по статусу
    if (query.status) {
      where.status = query.status
    }

    // Фильтр по приоритету
    if (query.priority) {
      where.priority = query.priority
    }

    // Фильтр по исполнителю
    if (query.assigneeId) {
      where.assigneeId = query.assigneeId
    }

    return prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    })
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!task) {
      throw new Error('Task not found')
    }

    return task
  }

  async createTask(data: CreateTaskInput, userId: string) {
    // Проверяем доступ к проекту
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // Если указан assignee, проверяем его существование
    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId },
      })

      if (!assignee) {
        throw new Error('Assignee not found')
      }
    }

    return prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdById: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskInput) {
    // Проверяем существование задачи и права доступа
    const existing = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId,
        },
      },
    })

    if (!existing) {
      throw new Error('Task not found')
    }

    // Если меняется assignee, проверяем его существование
    if (data.assigneeId !== undefined && data.assigneeId !== null) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId },
      })

      if (!assignee) {
        throw new Error('Assignee not found')
      }
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === null ? null : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async updateTaskStatus(taskId: string, userId: string, data: UpdateTaskStatusInput) {
    // Проверяем существование задачи и права доступа
    const existing = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId,
        },
      },
    })

    if (!existing) {
      throw new Error('Task not found')
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        status: data.status,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async deleteTask(taskId: string, userId: string) {
    // Проверяем существование задачи и права доступа
    const existing = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId,
        },
      },
    })

    if (!existing) {
      throw new Error('Task not found')
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    return { success: true, message: 'Task deleted successfully' }
  }

  async createComment(taskId: string, userId: string, data: CreateCommentInput) {
    // Проверяем существование задачи и права доступа
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId,
        },
      },
    })

    if (!task) {
      throw new Error('Task not found')
    }

    return prisma.taskComment.create({
      data: {
        content: data.content,
        taskId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }
}
