import { prisma } from '../../config/database.js'
import { CreateChatInput, UpdateChatModeInput, SendMessageInput } from './chats.types.js'
import { createClaudeAgent, createDeepSeekAgent, createOpenAIAgent } from '@rebordev/ai-core'

export class ChatsService {
  async getChats(userId: string) {
    return prisma.chat.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        freelanceOrder: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        freelanceOrder: {
          select: {
            id: true,
            title: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!chat) {
      throw new Error('Chat not found')
    }

    return chat
  }

  async createChat(data: CreateChatInput, userId: string) {
    // Проверяем существование связанных сущностей
    if (data.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: data.projectId, userId },
      })
      if (!project) {
        throw new Error('Project not found')
      }
    }

    if (data.taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: data.taskId,
          project: { userId },
        },
      })
      if (!task) {
        throw new Error('Task not found')
      }
    }

    if (data.freelanceOrderId) {
      const order = await prisma.freelanceOrder.findFirst({
        where: { id: data.freelanceOrderId, userId },
      })
      if (!order) {
        throw new Error('Freelance order not found')
      }
    }

    // Создаем чат
    const chat = await prisma.chat.create({
      data: {
        title: data.title,
        mode: data.mode,
        userId,
        projectId: data.projectId,
        taskId: data.taskId,
        freelanceOrderId: data.freelanceOrderId,
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    })

    // Создаем системное сообщение с контекстом режима
    const systemPrompt = this.getSystemPrompt(data.mode)
    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: 'system',
        content: systemPrompt,
      },
    })

    return chat
  }

  async updateChatMode(chatId: string, userId: string, data: UpdateChatModeInput) {
    // Проверяем существование чата
    const existing = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    })

    if (!existing) {
      throw new Error('Chat not found')
    }

    // Обновляем режим
    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: { mode: data.mode },
    })

    // Добавляем системное сообщение о смене режима
    await prisma.chatMessage.create({
      data: {
        chatId,
        role: 'system',
        content: `Mode switched to ${data.mode}. ${this.getSystemPrompt(data.mode)}`,
      },
    })

    return chat
  }

  async deleteChat(chatId: string, userId: string) {
    // Проверяем существование чата
    const existing = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    })

    if (!existing) {
      throw new Error('Chat not found')
    }

    await prisma.chat.delete({
      where: { id: chatId },
    })

    return { success: true, message: 'Chat deleted successfully' }
  }

  async sendMessage(chatId: string, userId: string, data: SendMessageInput) {
    // Проверяем существование чата
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!chat) {
      throw new Error('Chat not found')
    }

    // Сохраняем сообщение пользователя
    const userMessage = await prisma.chatMessage.create({
      data: {
        chatId,
        role: 'user',
        content: data.content,
      },
    })

    // Если не нужен AI ответ, возвращаем только сообщение пользователя
    if (!data.useAI) {
      return { userMessage, aiMessage: null }
    }

    // Выбираем провайдера AI
    const provider = data.provider || this.getDefaultProvider(chat.mode)
    const agent = this.createAgent(provider, chat.mode)

    // Формируем историю сообщений для AI
    const messages = chat.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    // Добавляем новое сообщение
    messages.push({
      role: 'user',
      content: data.content,
    })

    try {
      // Получаем ответ от AI
      const response = await agent.chat(messages)

      // Сохраняем ответ AI
      const aiMessage = await prisma.chatMessage.create({
        data: {
          chatId,
          role: 'assistant',
          content: response.content,
          provider,
        },
      })

      // Обновляем время последнего обновления чата
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      })

      return { userMessage, aiMessage }
    } catch (error) {
      throw new Error(
        `AI response failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private getSystemPrompt(mode: string): string {
    const prompts: Record<string, string> = {
      ARCHITECT: `You are an expert software architect. Help design system architecture, choose technologies, and plan project structure. Focus on scalability, maintainability, and best practices.`,
      CODE: `You are an expert software developer. Write clean, efficient, and well-documented code. Follow best practices and coding standards.`,
      REVIEW: `You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and adherence to best practices. Provide constructive feedback.`,
      DEBUG: `You are an expert debugger. Help identify and fix bugs, analyze error messages, and suggest debugging strategies.`,
      DOCS: `You are an expert technical writer. Create clear, comprehensive documentation. Explain complex concepts in simple terms.`,
    }

    return prompts[mode] || prompts.CODE
  }

  private getDefaultProvider(mode: string): 'CLAUDE' | 'DEEPSEEK' | 'OPENAI' {
    // DeepSeek для кода и архитектуры (быстрый и дешевый)
    if (mode === 'CODE' || mode === 'DEBUG') {
      return 'DEEPSEEK'
    }
    // Claude для архитектуры и ревью (более вдумчивый)
    if (mode === 'ARCHITECT' || mode === 'REVIEW') {
      return 'CLAUDE'
    }
    // OpenAI для документации
    return 'OPENAI'
  }

  private createAgent(provider: string, mode: string) {
    const systemPrompt = this.getSystemPrompt(mode)

    switch (provider) {
      case 'CLAUDE':
        return createClaudeAgent({
          model: 'claude-3-5-sonnet-20241022',
          systemPrompt,
          temperature: 0.7,
        })
      case 'DEEPSEEK':
        return createDeepSeekAgent({
          model: 'deepseek-chat',
          systemPrompt,
          temperature: 0.7,
        })
      case 'OPENAI':
        return createOpenAIAgent({
          model: 'gpt-4o',
          systemPrompt,
          temperature: 0.7,
        })
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }
}
