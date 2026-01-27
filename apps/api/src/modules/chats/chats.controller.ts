import { FastifyRequest, FastifyReply } from 'fastify'
import { ChatsService } from './chats.service.js'
import {
  createChatSchema,
  updateChatModeSchema,
  sendMessageSchema,
  CreateChatInput,
  UpdateChatModeInput,
  SendMessageInput,
} from './chats.types.js'

export class ChatsController {
  private service: ChatsService

  constructor() {
    this.service = new ChatsService()
  }

  async getChats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const chats = await this.service.getChats(userId)

      return reply.send({
        success: true,
        data: chats,
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch chats',
      })
    }
  }

  async getChat(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      const chat = await this.service.getChatById(id, userId)

      return reply.send({
        success: true,
        data: chat,
      })
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : 'Chat not found',
      })
    }
  }

  async createChat(request: FastifyRequest<{ Body: CreateChatInput }>, reply: FastifyReply) {
    try {
      const userId = request.user!.id

      // Валидация
      const validatedData = createChatSchema.parse(request.body)

      const chat = await this.service.createChat(validatedData, userId)

      return reply.status(201).send({
        success: true,
        data: chat,
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
        error: error instanceof Error ? error.message : 'Failed to create chat',
      })
    }
  }

  async updateChatMode(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateChatModeInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      // Валидация
      const validatedData = updateChatModeSchema.parse(request.body)

      const chat = await this.service.updateChatMode(id, userId, validatedData)

      return reply.send({
        success: true,
        data: chat,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error,
        })
      }

      const statusCode = error instanceof Error && error.message === 'Chat not found' ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update chat mode',
      })
    }
  }

  async deleteChat(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      const result = await this.service.deleteChat(id, userId)

      return reply.send({
        success: true,
        data: result,
      })
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Chat not found' ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete chat',
      })
    }
  }

  async sendMessage(
    request: FastifyRequest<{ Params: { id: string }; Body: SendMessageInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      // Валидация
      const validatedData = sendMessageSchema.parse(request.body)

      const result = await this.service.sendMessage(id, userId, validatedData)

      return reply.status(201).send({
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
        error: error instanceof Error ? error.message : 'Failed to send message',
      })
    }
  }
}
