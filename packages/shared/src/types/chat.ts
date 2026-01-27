export enum ChatType {
  ORDER = 'ORDER',
  PROJECT = 'PROJECT',
  TASK = 'TASK',
  FREE = 'FREE',
  TEAM = 'TEAM'
}

export enum ChatMode {
  ARCHITECT = 'ARCHITECT',
  CODE = 'CODE',
  REVIEW = 'REVIEW',
  DEBUG = 'DEBUG',
  ASK = 'ASK',
  CREATIVE = 'CREATIVE'
}

export enum AIModel {
  CLAUDE_CODE = 'CLAUDE_CODE',
  CODEX = 'CODEX',
  DEEPSEEK = 'DEEPSEEK',
  GPT4 = 'GPT4'
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

export interface Chat {
  id: string
  name: string
  type: ChatType
  mode: ChatMode
  model: AIModel
  projectId?: string | null
  taskId?: string | null
  orderId?: string | null
  serverId?: string | null
  contextConfig?: any
  restrictions?: any
  tokensUsed: number
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  chatId: string
  userId?: string | null
  role: MessageRole
  content: string
  metadata?: any
  tokensUsed: number
  createdAt: Date
}

export enum MemoryLevel {
  GLOBAL = 'GLOBAL',
  PROJECT = 'PROJECT',
  CHAT = 'CHAT',
  USER = 'USER'
}

export interface MemoryEntry {
  id: string
  chatId?: string | null
  projectId?: string | null
  userId?: string | null
  level: MemoryLevel
  key: string
  content: string
  embedding: number[]
  metadata?: any
  createdAt: Date
  updatedAt: Date
}
