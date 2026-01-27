export enum ProjectStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Project {
  id: string
  name: string
  description?: string | null
  status: ProjectStatus
  priority: Priority
  deadline?: Date | null
  budget?: number | null
  ownerId: string
  orderId?: string | null
  createdAt: Date
  updatedAt: Date
}
