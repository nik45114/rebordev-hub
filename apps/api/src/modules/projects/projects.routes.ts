import { FastifyInstance } from 'fastify'
import { ProjectsController } from './projects.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const projectsController = new ProjectsController()

export async function projectsRoutes(fastify: FastifyInstance) {
  // Все роуты защищены авторизацией
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/projects - список проектов
  fastify.get('/', projectsController.getProjects.bind(projectsController))

  // GET /api/projects/:id - получить проект
  fastify.get('/:id', projectsController.getProject.bind(projectsController))

  // POST /api/projects - создать проект
  fastify.post('/', projectsController.createProject.bind(projectsController))

  // PATCH /api/projects/:id - обновить проект
  fastify.patch('/:id', projectsController.updateProject.bind(projectsController))

  // DELETE /api/projects/:id - удалить проект
  fastify.delete('/:id', projectsController.deleteProject.bind(projectsController))

  // POST /api/projects/:id/ai-generate - AI генерация задач
  fastify.post('/:id/ai-generate', projectsController.aiGenerateTasks.bind(projectsController))
}
