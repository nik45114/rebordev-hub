import bcrypt from 'bcryptjs'
import { prisma } from '../../config/database.js'
import { generateToken } from '../../utils/jwt.js'
import type { RegisterInput, LoginInput } from './auth.types.js'

export class AuthService {
  async register(input: RegisterInput) {
    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(input.password, 10)

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(input.name)}&background=7C3AED&color=fff`,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    // Генерация токена
    const token = generateToken({ userId: user.id })

    // Создание сессии
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      },
    })

    return { user, token }
  }

  async login(input: LoginInput) {
    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password')
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Генерация токена
    const token = generateToken({ userId: user.id })

    // Создание сессии
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        telegramId: true,
        createdAt: true,
        updatedAt: true,
        skills: {
          select: {
            id: true,
            name: true,
            level: true,
            xp: true,
            tasksCompleted: true,
          },
        },
        _count: {
          select: {
            authoredProjects: true,
            assignedTasks: true,
            chatMessages: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  async logout(token: string) {
    await prisma.session.delete({
      where: { token },
    })

    return { message: 'Logged out successfully' }
  }
}
