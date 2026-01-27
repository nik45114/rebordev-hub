import { FastifyInstance } from 'fastify'
import { FreelanceController } from './freelance.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const freelanceController = new FreelanceController()

export async function freelanceRoutes(fastify: FastifyInstance) {
  // Все роуты защищены авторизацией
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/freelance/orders - список заказов
  fastify.get('/orders', freelanceController.getOrders.bind(freelanceController))

  // GET /api/freelance/orders/:id - получить заказ
  fastify.get('/orders/:id', freelanceController.getOrder.bind(freelanceController))

  // POST /api/freelance/orders - добавить заказ вручную
  fastify.post('/orders', freelanceController.createOrder.bind(freelanceController))

  // PATCH /api/freelance/orders/:id - обновить заказ
  fastify.patch('/orders/:id', freelanceController.updateOrder.bind(freelanceController))

  // POST /api/freelance/orders/:id/analyze - AI анализ заказа
  fastify.post('/orders/:id/analyze', freelanceController.analyzeOrder.bind(freelanceController))

  // POST /api/freelance/orders/:id/convert - конвертировать в проект
  fastify.post(
    '/orders/:id/convert',
    freelanceController.convertToProject.bind(freelanceController)
  )

  // POST /api/freelance/parse - запустить парсинг FL.ru
  fastify.post('/parse', freelanceController.parseOrders.bind(freelanceController))
}
