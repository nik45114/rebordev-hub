import Fastify from 'fastify'
import cors from '@fastify/cors'
import { authRoutes } from './modules/auth/auth.routes.js'
import { projectsRoutes } from './modules/projects/projects.routes.js'
import { tasksRoutes } from './modules/tasks/tasks.routes.js'
import { chatsRoutes } from './modules/chats/chats.routes.js'
import { freelanceRoutes } from './modules/freelance/freelance.routes.js'
import { env } from './config/env.js'

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'error',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  })

  // CORS - allow multiple origins
  await server.register(cors, {
    origin: [
      env.FRONTEND_URL,
      'https://web-eta-two-88.vercel.app',
      'http://localhost:3000',
      'http://localhost:3002'
    ],
    credentials: true,
  })

  // Health check
  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }))

  // API Routes
  await server.register(authRoutes, { prefix: '/api/auth' })
  await server.register(projectsRoutes, { prefix: '/api/projects' })
  await server.register(tasksRoutes, { prefix: '/api/tasks' })
  await server.register(chatsRoutes, { prefix: '/api/chats' })
  await server.register(freelanceRoutes, { prefix: '/api/freelance' })

  // 404 Handler
  server.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Route not found',
      path: request.url,
    })
  })

  // Error Handler
  server.setErrorHandler((error, request, reply) => {
    server.log.error(error)

    reply.status(error.statusCode || 500).send({
      success: false,
      error: error.message || 'Internal Server Error',
    })
  })

  return server
}
