import { z } from 'zod'

// Zod schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(100),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  estimatedHours: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  estimatedHours: z.number().positive().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
})

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
})

export const getTasksQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
})

// Types
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>

export interface TaskResponse {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  estimatedHours: number | null
  dueDate: Date | null
  projectId: string
  assigneeId: string | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}
