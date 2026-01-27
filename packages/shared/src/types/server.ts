export enum ServerAuth {
  SSH_KEY = 'SSH_KEY',
  AGENT = 'AGENT'
}

export enum ServerStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR'
}

export interface Server {
  id: string
  name: string
  host: string
  port: number
  username: string
  authType: ServerAuth
  privateKey?: string | null
  status: ServerStatus
  lastBackup?: Date | null
  metrics?: any
  createdAt: Date
  updatedAt: Date
}

export interface Backup {
  id: string
  serverId: string
  path: string
  size: number
  createdAt: Date
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  MENTION = 'MENTION',
  HELP_REQUEST = 'HELP_REQUEST',
  ORDER_NEW = 'ORDER_NEW',
  SERVER_ALERT = 'SERVER_ALERT'
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string | null
  read: boolean
  createdAt: Date
}
