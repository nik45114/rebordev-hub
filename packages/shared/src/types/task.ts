import { Priority } from './project'

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export interface Task {
  id: string
  projectId: string
  parentId?: string | null
  title: string
  description?: string | null
  status: TaskStatus
  priority: Priority
  authorId: string
  assigneeId?: string | null
  estimatedHours?: number | null
  tags: string[]
  order: number
  deadline?: Date | null
  completedAt?: Date | null
  dependencies: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  mentions: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TaskFile {
  id: string
  taskId: string
  filename: string
  url: string
  mimeType: string
  size: number
  uploadedAt: Date
}
