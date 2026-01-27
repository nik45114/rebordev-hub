import { FastifyRequest, FastifyReply } from 'fastify'
import { TasksService } from './tasks.service.js'
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  createCommentSchema,
  getTasksQuerySchema,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  CreateCommentInput,
  GetTasksQuery,
} from './tasks.types.js'

export class TasksController {
  private service: TasksService

  constructor() {
    this.service = new TasksService()
  }

  async getTasks(
    request: FastifyRequest<{ Querystring: GetTasksQuery }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id

      // Валидация query параметров
      const validatedQuery = getTasksQuerySchema.parse(request.query)

      const tasks = await this.service.getTasks(userId, validatedQuery)

      return reply.send({
        success: true,
        data: tasks,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error,
        })
      }

      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      })
    }
  }

  async getTask(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      const task = await this.service.getTaskById(id, userId)

      return reply.send({
        success: true,
        data: task,
      })
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : 'Task not found',
      })
    }
  }

  async createTask(
    request: FastifyRequest<{ Body: CreateTaskInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id

      // Валидация
      const validatedData = createTaskSchema.parse(request.body)

      const task = await this.service.createTask(validatedData, userId)

      return reply.status(201).send({
        success: true,
        data: task,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error,
        })
      }

      const statusCode =
        error instanceof Error &&
        (error.message === 'Project not found' || error.message === 'Assignee not found')
          ? 404
          : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      })
    }
  }

  async updateTask(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateTaskInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      // Валидация
      const validatedData = updateTaskSchema.parse(request.body)

      const task = await this.service.updateTask(id, userId, validatedData)

      return reply.send({
        success: true,
        data: task,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error,
        })
      }

      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
      })
    }
  }

  async updateTaskStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateTaskStatusInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      // Валидация
      const validatedData = updateTaskStatusSchema.parse(request.body)

      const task = await this.service.updateTaskStatus(id, userId, validatedData)

      return reply.send({
        success: true,
        data: task,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error,
        })
      }

      const statusCode = error instanceof Error && error.message === 'Task not found' ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task status',
      })
    }
  }

  async deleteTask(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      const result = await this.service.deleteTask(id, userId)

      return reply.send({
        success: true,
        data: result,
      })
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Task not found' ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete task',
      })
    }
  }

  async createComment(
    request: FastifyRequest<{ Params: { id: string }; Body: CreateCommentInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      // Валидация
      const validatedData = createCommentSchema.parse(request.body)

      const comment = await this.service.createComment(id, userId, validatedData)

      return reply.status(201).send({
        success: true,
        data: comment,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error,
        })
      }

      const statusCode = error instanceof Error && error.message === 'Task not found' ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create comment',
      })
    }
  }
}
