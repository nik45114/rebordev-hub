import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from './auth.service.js'
import { registerSchema, loginSchema } from './auth.types.js'

const authService = new AuthService()

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const input = registerSchema.parse(request.body)
      const result = await authService.register(input)

      return reply.status(201).send({
        success: true,
        data: result,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const input = loginSchema.parse(request.body)
      const result = await authService.login(input)

      return reply.status(200).send({
        success: true,
        data: result,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(401).send({
          success: false,
          error: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized',
        })
      }

      const profile = await authService.getProfile(request.user.id)

      return reply.status(200).send({
        success: true,
        data: profile,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(404).send({
          success: false,
          error: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = request.headers.authorization?.substring(7)

      if (!token) {
        return reply.status(400).send({
          success: false,
          error: 'No token provided',
        })
      }

      const result = await authService.logout(token)

      return reply.status(200).send({
        success: true,
        data: result,
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Internal server error',
      })
    }
  }
}
