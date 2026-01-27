import { FastifyInstance } from 'fastify'
import { TasksController } from './tasks.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const tasksController = new TasksController()

export async function tasksRoutes(fastify: FastifyInstance) {
  // Все роуты защищены авторизацией
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/tasks - список задач (с фильтрами)
  fastify.get('/', tasksController.getTasks.bind(tasksController))

  // GET /api/tasks/:id - получить задачу с комментариями
  fastify.get('/:id', tasksController.getTask.bind(tasksController))

  // POST /api/tasks - создать задачу
  fastify.post('/', tasksController.createTask.bind(tasksController))

  // PATCH /api/tasks/:id - обновить задачу
  fastify.patch('/:id', tasksController.updateTask.bind(tasksController))

  // PATCH /api/tasks/:id/status - изменить статус (для канбана)
  fastify.patch('/:id/status', tasksController.updateTaskStatus.bind(tasksController))

  // DELETE /api/tasks/:id - удалить задачу
  fastify.delete('/:id', tasksController.deleteTask.bind(tasksController))

  // POST /api/tasks/:id/comments - добавить комментарий
  fastify.post('/:id/comments', tasksController.createComment.bind(tasksController))
}
