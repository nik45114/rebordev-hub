export enum OrderSource {
  FL_RU = 'FL_RU',
  KWORK = 'KWORK',
  HABR_FREELANCE = 'HABR_FREELANCE',
  FREELANCE_RU = 'FREELANCE_RU',
  UPWORK = 'UPWORK',
  FREELANCER = 'FREELANCER',
  FIVERR = 'FIVERR',
  TOPTAL = 'TOPTAL',
  MANUAL = 'MANUAL'
}

export enum OrderStatus {
  NEW = 'NEW',
  RESPONDED = 'RESPONDED',
  NEGOTIATING = 'NEGOTIATING',
  AGREED = 'AGREED',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  PAID = 'PAID',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED'
}

export interface Order {
  id: string
  title: string
  description: string
  source: OrderSource
  sourceUrl: string
  budget?: number | null
  currency: string
  status: OrderStatus
  clientId?: string | null
  stackMatch?: number | null
  aiAnalysis?: any
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  name: string
  company?: string | null
  email?: string | null
  telegram?: string | null
  phone?: string | null
  source: OrderSource
  notes?: string | null
  totalPaid: number
  createdAt: Date
  updatedAt: Date
}
