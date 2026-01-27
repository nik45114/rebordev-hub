import { z } from 'zod'

// Zod schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).default('PLANNING'),
  deadline: z.string().datetime().optional(),
  aiGenerate: z.boolean().default(false),
  aiPrompt: z.string().optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  deadline: z.string().datetime().optional(),
})

export const aiGenerateTasksSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  count: z.number().int().min(1).max(50).default(10),
})

// Types
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type AIGenerateTasksInput = z.infer<typeof aiGenerateTasksSchema>

export interface ProjectResponse {
  id: string
  name: string
  description: string | null
  status: string
  deadline: Date | null
  userId: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    tasks: number
  }
}
