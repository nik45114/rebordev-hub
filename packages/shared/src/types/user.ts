export enum UserRole {
  OWNER = 'OWNER',
  TEAMLEAD = 'TEAMLEAD',
  DEVELOPER = 'DEVELOPER'
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  telegramId?: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface UserSkill {
  id: string
  userId: string
  name: string
  xp: number
  level: number
  tasksCompleted: number
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  userAgent?: string | null
  ipAddress?: string | null
  createdAt: Date
}
