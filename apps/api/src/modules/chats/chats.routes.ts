import { FastifyInstance } from 'fastify'
import { ChatsController } from './chats.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const chatsController = new ChatsController()

export async function chatsRoutes(fastify: FastifyInstance) {
  // Все роуты защищены авторизацией
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/chats - список чатов
  fastify.get('/', chatsController.getChats.bind(chatsController))

  // GET /api/chats/:id - получить чат с историей
  fastify.get('/:id', chatsController.getChat.bind(chatsController))

  // POST /api/chats - создать чат
  fastify.post('/', chatsController.createChat.bind(chatsController))

  // PATCH /api/chats/:id/mode - сменить режим
  fastify.patch('/:id/mode', chatsController.updateChatMode.bind(chatsController))

  // DELETE /api/chats/:id - удалить чат
  fastify.delete('/:id', chatsController.deleteChat.bind(chatsController))

  // POST /api/chats/:id/messages - отправить сообщение
  fastify.post('/:id/messages', chatsController.sendMessage.bind(chatsController))
}
