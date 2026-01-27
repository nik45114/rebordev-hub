import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '../utils/jwt.js'
import { prisma } from '../config/database.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized: No token provided' })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    // Проверяем существование сессии
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return reply.status(401).send({ error: 'Unauthorized: Invalid or expired session' })
    }

    // Добавляем пользователя в request
    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Unauthorized: Invalid token' })
  }
}
