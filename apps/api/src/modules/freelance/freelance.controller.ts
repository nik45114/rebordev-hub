import { FastifyRequest, FastifyReply } from 'fastify'
import { FreelanceService } from './freelance.service.js'
import {
  createOrderSchema,
  updateOrderSchema,
  analyzeOrderSchema,
  parseOrdersSchema,
  CreateOrderInput,
  UpdateOrderInput,
  AnalyzeOrderInput,
  ParseOrdersInput,
} from './freelance.types.js'

export class FreelanceController {
  private service: FreelanceService

  constructor() {
    this.service = new FreelanceService()
  }

  async getOrders(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const orders = await this.service.getOrders(userId)

      return reply.send({
        success: true,
        data: orders,
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      })
    }
  }

  async getOrder(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      const order = await this.service.getOrderById(id, userId)

      return reply.send({
        success: true,
        data: order,
      })
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : 'Order not found',
      })
    }
  }

  async createOrder(request: FastifyRequest<{ Body: CreateOrderInput }>, reply: FastifyReply) {
    try {
      const userId = request.user!.id

      // Валидация
      const validatedData = createOrderSchema.parse(request.body)

      const order = await this.service.createOrder(validatedData, userId)

      return reply.status(201).send({
        success: true,
        data: order,
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
        error: error instanceof Error ? error.message : 'Failed to create order',
      })
    }
  }

  async updateOrder(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateOrderInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      // Валидация
      const validatedData = updateOrderSchema.parse(request.body)

      const order = await this.service.updateOrder(id, userId, validatedData)

      return reply.send({
        success: true,
        data: order,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error,
        })
      }

      const statusCode = error instanceof Error && error.message === 'Order not found' ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order',
      })
    }
  }

  async analyzeOrder(
    request: FastifyRequest<{ Params: { id: string }; Body: AnalyzeOrderInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      // Валидация
      const validatedData = analyzeOrderSchema.parse(request.body)

      const result = await this.service.analyzeOrder(id, userId, validatedData)

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
        error: error instanceof Error ? error.message : 'Failed to analyze order',
      })
    }
  }

  async convertToProject(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const userId = request.user!.id

      const result = await this.service.convertToProject(id, userId)

      return reply.send({
        success: true,
        data: result,
      })
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Order not found' ? 404 : 500

      return reply.status(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert order',
      })
    }
  }

  async parseOrders(request: FastifyRequest<{ Body: ParseOrdersInput }>, reply: FastifyReply) {
    try {
      const userId = request.user!.id

      // Валидация
      const validatedData = parseOrdersSchema.parse(request.body)

      const result = await this.service.parseOrders(userId, validatedData)

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

      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse orders',
      })
    }
  }
}
