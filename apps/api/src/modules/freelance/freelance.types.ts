import { z } from 'zod'

// Zod schemas
export const createOrderSchema = z.object({
  title: z.string().min(1, 'Order title is required').max(200),
  description: z.string().min(1, 'Order description is required'),
  budget: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  url: z.string().url().optional(),
  platform: z.enum(['FLRU', 'UPWORK', 'FREELANCER', 'FIVERR', 'OTHER']).default('FLRU'),
  status: z.enum(['NEW', 'ANALYZING', 'INTERESTED', 'APPLIED', 'REJECTED', 'ACCEPTED']).default('NEW'),
})

export const updateOrderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  budget: z.number().positive().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  url: z.string().url().optional().nullable(),
  status: z.enum(['NEW', 'ANALYZING', 'INTERESTED', 'APPLIED', 'REJECTED', 'ACCEPTED']).optional(),
})

export const analyzeOrderSchema = z.object({
  aspects: z.array(z.enum(['TECHNICAL', 'BUDGET', 'TIMELINE', 'RISK', 'PROFIT'])).optional(),
})

export const parseOrdersSchema = z.object({
  category: z.string().optional(),
  maxPages: z.number().int().min(1).max(10).default(3),
  filters: z
    .object({
      minBudget: z.number().positive().optional(),
      maxBudget: z.number().positive().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
})

// Types
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type AnalyzeOrderInput = z.infer<typeof analyzeOrderSchema>
export type ParseOrdersInput = z.infer<typeof parseOrdersSchema>

export interface OrderResponse {
  id: string
  title: string
  description: string
  budget: number | null
  deadline: Date | null
  url: string | null
  platform: string
  status: string
  aiAnalysis: any | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface ParsedOrder {
  title: string
  description: string
  budget?: number
  deadline?: Date
  url: string
  platform: string
}
