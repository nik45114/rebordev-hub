import { prisma } from '../../config/database.js'
import {
  CreateOrderInput,
  UpdateOrderInput,
  AnalyzeOrderInput,
  ParseOrdersInput,
} from './freelance.types.js'
import { createDeepSeekAgent } from '@rebordev/ai-core'
import { getFLRUParser } from './parsers/flru-parser.js'

export class FreelanceService {
  async getOrders(userId: string) {
    return prisma.freelanceOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await prisma.freelanceOrder.findFirst({
      where: {
        id: orderId,
        userId,
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    return order
  }

  async createOrder(data: CreateOrderInput, userId: string) {
    return prisma.freelanceOrder.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        userId,
      },
    })
  }

  async updateOrder(orderId: string, userId: string, data: UpdateOrderInput) {
    // Проверяем существование и права доступа
    const existing = await prisma.freelanceOrder.findFirst({
      where: { id: orderId, userId },
    })

    if (!existing) {
      throw new Error('Order not found')
    }

    return prisma.freelanceOrder.update({
      where: { id: orderId },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : data.deadline === null ? null : undefined,
      },
    })
  }

  async analyzeOrder(orderId: string, userId: string, data: AnalyzeOrderInput) {
    // Проверяем существование заказа
    const order = await prisma.freelanceOrder.findFirst({
      where: { id: orderId, userId },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Обновляем статус на "анализируется"
    await prisma.freelanceOrder.update({
      where: { id: orderId },
      data: { status: 'ANALYZING' },
    })

    // Используем DeepSeek для анализа
    const agent = createDeepSeekAgent({
      model: 'deepseek-chat',
      temperature: 0.5,
    })

    const aspects = data.aspects || ['TECHNICAL', 'BUDGET', 'TIMELINE', 'RISK', 'PROFIT']

    const prompt = `
You are a freelance project analyst. Analyze the following order and provide detailed insights.

Order Details:
- Title: ${order.title}
- Description: ${order.description}
- Budget: ${order.budget ? `${order.budget} RUB` : 'Not specified'}
- Deadline: ${order.deadline ? order.deadline.toISOString() : 'Not specified'}
- Platform: ${order.platform}

Analyze these aspects: ${aspects.join(', ')}

Return a JSON object with this structure:
{
  "technical": {
    "complexity": "LOW" | "MEDIUM" | "HIGH",
    "technologies": ["list", "of", "technologies"],
    "estimatedHours": number,
    "notes": "technical analysis notes"
  },
  "budget": {
    "isRealistic": boolean,
    "recommendedBudget": number,
    "profitMargin": number,
    "notes": "budget analysis notes"
  },
  "timeline": {
    "isRealistic": boolean,
    "estimatedDays": number,
    "risks": ["list", "of", "timeline", "risks"],
    "notes": "timeline analysis notes"
  },
  "risk": {
    "level": "LOW" | "MEDIUM" | "HIGH",
    "factors": ["list", "of", "risk", "factors"],
    "mitigation": ["list", "of", "mitigation", "strategies"],
    "notes": "risk analysis notes"
  },
  "profit": {
    "score": number (0-10),
    "pros": ["list", "of", "pros"],
    "cons": ["list", "of", "cons"],
    "recommendation": "ACCEPT" | "REJECT" | "NEGOTIATE",
    "notes": "profitability analysis notes"
  },
  "summary": "overall summary and recommendation"
}
`

    try {
      const response = await agent.chat([{ role: 'user', content: prompt }])
      const content = response.content

      // Парсим JSON из ответа
      let analysisData: any
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0])
        } else {
          analysisData = JSON.parse(content)
        }
      } catch (parseError) {
        throw new Error('Failed to parse AI analysis')
      }

      // Сохраняем анализ
      const updatedOrder = await prisma.freelanceOrder.update({
        where: { id: orderId },
        data: {
          aiAnalysis: analysisData,
          status: 'INTERESTED',
        },
      })

      return {
        success: true,
        analysis: analysisData,
        order: updatedOrder,
      }
    } catch (error) {
      // В случае ошибки возвращаем статус обратно
      await prisma.freelanceOrder.update({
        where: { id: orderId },
        data: { status: order.status },
      })

      throw new Error(
        `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async convertToProject(orderId: string, userId: string) {
    // Получаем заказ
    const order = await prisma.freelanceOrder.findFirst({
      where: { id: orderId, userId },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Создаем проект на основе заказа
    const project = await prisma.project.create({
      data: {
        name: order.title,
        description: order.description,
        status: 'PLANNING',
        deadline: order.deadline,
        userId,
      },
    })

    // Если есть AI анализ, создаем задачи на основе него
    if (order.aiAnalysis && typeof order.aiAnalysis === 'object' && 'technical' in order.aiAnalysis) {
      const analysis = order.aiAnalysis as any

      // Создаем базовые задачи
      const tasks = []

      if (analysis.technical?.technologies) {
        tasks.push({
          title: 'Setup development environment',
          description: `Technologies: ${analysis.technical.technologies.join(', ')}`,
          status: 'TODO',
          priority: 'HIGH',
          projectId: project.id,
          createdById: userId,
        })
      }

      if (analysis.timeline?.estimatedDays) {
        tasks.push({
          title: 'Project implementation',
          description: `Estimated: ${analysis.timeline.estimatedDays} days`,
          status: 'TODO',
          priority: 'MEDIUM',
          estimatedHours: analysis.technical?.estimatedHours || null,
          projectId: project.id,
          createdById: userId,
        })
      }

      tasks.push({
        title: 'Testing and QA',
        description: 'Test all functionality and fix bugs',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project.id,
        createdById: userId,
      })

      tasks.push({
        title: 'Deployment and delivery',
        description: 'Deploy to production and deliver to client',
        status: 'TODO',
        priority: 'LOW',
        projectId: project.id,
        createdById: userId,
      })

      await prisma.task.createMany({
        data: tasks,
      })
    }

    // Обновляем статус заказа
    await prisma.freelanceOrder.update({
      where: { id: orderId },
      data: { status: 'ACCEPTED' },
    })

    return {
      success: true,
      project,
    }
  }

  async parseOrders(userId: string, data: ParseOrdersInput) {
    const parser = getFLRUParser()

    try {
      // Парсим заказы
      const parsedOrders = await parser.parseOrders({
        category: data.category,
        maxPages: data.maxPages,
        minBudget: data.filters?.minBudget,
        maxBudget: data.filters?.maxBudget,
        keywords: data.filters?.keywords,
      })

      // Сохраняем в БД (избегаем дубликатов по URL)
      const savedOrders = []

      for (const orderData of parsedOrders) {
        // Проверяем существование по URL
        if (orderData.url) {
          const existing = await prisma.freelanceOrder.findFirst({
            where: {
              url: orderData.url,
              userId,
            },
          })

          if (existing) {
            continue // Пропускаем дубликаты
          }
        }

        // Создаем заказ
        const order = await prisma.freelanceOrder.create({
          data: {
            title: orderData.title,
            description: orderData.description,
            budget: orderData.budget || null,
            deadline: orderData.deadline || null,
            url: orderData.url,
            platform: orderData.platform as any,
            status: 'NEW',
            userId,
          },
        })

        savedOrders.push(order)
      }

      return {
        success: true,
        total: parsedOrders.length,
        saved: savedOrders.length,
        orders: savedOrders,
      }
    } catch (error) {
      throw new Error(
        `Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
