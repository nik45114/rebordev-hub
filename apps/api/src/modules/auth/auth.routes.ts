import { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const authController = new AuthController()

export async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post('/register', authController.register.bind(authController))
  fastify.post('/login', authController.login.bind(authController))

  // Protected routes
  fastify.get('/profile', {
    preHandler: authMiddleware,
    handler: authController.getProfile.bind(authController),
  })

  fastify.post('/logout', {
    preHandler: authMiddleware,
    handler: authController.logout.bind(authController),
  })
}
