import { FastifyRequest, FastifyReply } from 'fastify'
import { ProjectsService } from './projects.service.js'
import {
  createProjectSchema,
  updateProjectSchema,
  aiGenerateTasksSchema,
  CreateProjectInput,
  UpdateProjectInput,
  AIGenerateTasksInput,
} from './projects.types.js'

export class ProjectsController {
  private service: ProjectsService

  constructor() {
    this.service = new ProjectsService()
  }

  async getProjects(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const projects = await this.service.getProjects(userId)

      return reply.send({
        success: true,
        data: projects,
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
      })
    }
  }

  async getProject(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      const project = await this.service.getProjectById(id, userId)

      return reply.send({
        success: true,
        data: project,
      })
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : 'Project not found',
      })
    }
  }

  async createProject(
    request: FastifyRequest<{ Body: CreateProjectInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id

      // Валидация
      const validatedData = createProjectSchema.parse(request.body)

      const project = await this.service.createProject(validatedData, userId)

      return reply.status(201).send({
        success: true,
        data: project,
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
        error: error instanceof Error ? error.message : 'Failed to create project',
      })
    }
  }

  async updateProject(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProjectInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      // Валидация
      const validatedData = updateProjectSchema.parse(request.body)

      const project = await this.service.updateProject(id, userId, validatedData)

      return reply.send({
        success: true,
        data: project,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error,
        })
      }

      const statusCode = error instanceof Error && error.message === 'Project not found' ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update project',
      })
    }
  }

  async deleteProject(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      const result = await this.service.deleteProject(id, userId)

      return reply.send({
        success: true,
        data: result,
      })
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Project not found' ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete project',
      })
    }
  }

  async aiGenerateTasks(
    request: FastifyRequest<{ Params: { id: string }; Body: AIGenerateTasksInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      // Валидация
      const validatedData = aiGenerateTasksSchema.parse(request.body)

      const result = await this.service.aiGenerateTasks(id, userId, validatedData)

      return reply.send({
        success: true,
        data: result,
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
        error: error instanceof Error ? error.message : 'Failed to generate tasks',
      })
    }
  }
}
