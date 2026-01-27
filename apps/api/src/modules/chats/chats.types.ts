import { z } from 'zod'

// Zod schemas
export const createChatSchema = z.object({
  title: z.string().min(1, 'Chat title is required').max(100),
  mode: z.enum(['ARCHITECT', 'CODE', 'REVIEW', 'DEBUG', 'DOCS']).default('CODE'),
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  freelanceOrderId: z.string().uuid().optional(),
})

export const updateChatModeSchema = z.object({
  mode: z.enum(['ARCHITECT', 'CODE', 'REVIEW', 'DEBUG', 'DOCS']),
})

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  useAI: z.boolean().default(true),
  provider: z.enum(['CLAUDE', 'DEEPSEEK', 'OPENAI']).optional(),
})

// Types
export type CreateChatInput = z.infer<typeof createChatSchema>
export type UpdateChatModeInput = z.infer<typeof updateChatModeSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>

export interface ChatResponse {
  id: string
  title: string
  mode: string
  userId: string
  projectId: string | null
  taskId: string | null
  freelanceOrderId: string | null
  createdAt: Date
  updatedAt: Date
  _count?: {
    messages: number
  }
}

export interface MessageResponse {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  provider: string | null
  chatId: string
  createdAt: Date
}
