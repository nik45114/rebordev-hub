import puppeteer, { Browser, Page } from 'puppeteer'
import { ParsedOrder } from '../freelance.types.js'

export interface FLRUParserOptions {
  category?: string
  maxPages?: number
  minBudget?: number
  maxBudget?: number
  keywords?: string[]
}

export class FLRUParser {
  private browser: Browser | null = null
  private baseUrl = 'https://www.fl.ru'

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      })
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async parseOrders(options: FLRUParserOptions = {}): Promise<ParsedOrder[]> {
    await this.initialize()

    const { category = 'all', maxPages = 3, minBudget, maxBudget, keywords } = options

    const orders: ParsedOrder[] = []

    try {
      const page = await this.browser!.newPage()

      // Устанавливаем user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      // Парсим страницы
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const url = this.buildSearchUrl(category, pageNum)

        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        })

        // Ждем загрузки списка проектов
        try {
          await page.waitForSelector('.b-post', { timeout: 5000 })
        } catch {
          console.log(`No projects found on page ${pageNum}`)
          break
        }

        // Парсим проекты на странице
        const pageOrders = await this.parseProjectsPage(page)

        // Применяем фильтры
        const filteredOrders = this.applyFilters(pageOrders, { minBudget, maxBudget, keywords })

        orders.push(...filteredOrders)

        // Задержка между запросами
        await this.randomDelay(1000, 3000)
      }

      await page.close()
    } catch (error) {
      console.error('FL.ru parsing error:', error)
      throw new Error(`Failed to parse FL.ru: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return orders
  }

  private async parseProjectsPage(page: Page): Promise<ParsedOrder[]> {
    return page.evaluate(() => {
      const orders: any[] = []
      const projectElements = document.querySelectorAll('.b-post')

      projectElements.forEach((element) => {
        try {
          // Заголовок
          const titleElement = element.querySelector('.b-post__title a')
          const title = titleElement?.textContent?.trim() || 'No title'
          const url = titleElement?.getAttribute('href') || ''

          // Описание
          const descriptionElement = element.querySelector('.b-post__txt, .b-post__body')
          const description = descriptionElement?.textContent?.trim() || 'No description'

          // Бюджет
          let budget: number | undefined
          const budgetElement = element.querySelector('.b-post__price')
          if (budgetElement) {
            const budgetText = budgetElement.textContent?.trim() || ''
            const budgetMatch = budgetText.match(/(\d+\s*\d*)\s*₽/)
            if (budgetMatch) {
              budget = parseInt(budgetMatch[1].replace(/\s/g, ''))
            }
          }

          // Дедлайн (если есть)
          let deadline: Date | undefined
          const deadlineElement = element.querySelector('.b-post__txt_spec')
          if (deadlineElement) {
            const deadlineText = deadlineElement.textContent?.trim() || ''
            const deadlineMatch = deadlineText.match(/до\s+(\d{1,2})\s+(\w+)/)
            if (deadlineMatch) {
              // Парсинг даты (упрощенный)
              const months: Record<string, number> = {
                января: 0,
                февраля: 1,
                марта: 2,
                апреля: 3,
                мая: 4,
                июня: 5,
                июля: 6,
                августа: 7,
                сентября: 8,
                октября: 9,
                ноября: 10,
                декабря: 11,
              }
              const day = parseInt(deadlineMatch[1])
              const month = months[deadlineMatch[2]]
              if (month !== undefined) {
                const year = new Date().getFullYear()
                deadline = new Date(year, month, day)
              }
            }
          }

          orders.push({
            title,
            description: description.slice(0, 1000), // Ограничиваем длину
            budget,
            deadline,
            url: url.startsWith('http') ? url : `https://www.fl.ru${url}`,
            platform: 'FLRU',
          })
        } catch (error) {
          console.error('Error parsing project element:', error)
        }
      })

      return orders
    })
  }

  private buildSearchUrl(category: string, page: number): string {
    const baseSearchUrl = `${this.baseUrl}/projects/`
    const params = new URLSearchParams()

    if (category && category !== 'all') {
      params.set('category', category)
    }

    if (page > 1) {
      params.set('page', page.toString())
    }

    const queryString = params.toString()
    return queryString ? `${baseSearchUrl}?${queryString}` : baseSearchUrl
  }

  private applyFilters(
    orders: ParsedOrder[],
    filters: {
      minBudget?: number
      maxBudget?: number
      keywords?: string[]
    }
  ): ParsedOrder[] {
    return orders.filter((order) => {
      // Фильтр по минимальному бюджету
      if (filters.minBudget && (!order.budget || order.budget < filters.minBudget)) {
        return false
      }

      // Фильтр по максимальному бюджету
      if (filters.maxBudget && order.budget && order.budget > filters.maxBudget) {
        return false
      }

      // Фильтр по ключевым словам
      if (filters.keywords && filters.keywords.length > 0) {
        const text = `${order.title} ${order.description}`.toLowerCase()
        const hasKeyword = filters.keywords.some((keyword) => text.includes(keyword.toLowerCase()))
        if (!hasKeyword) {
          return false
        }
      }

      return true
    })
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    return new Promise((resolve) => setTimeout(resolve, delay))
  }
}

// Singleton instance
let parserInstance: FLRUParser | null = null

export function getFLRUParser(): FLRUParser {
  if (!parserInstance) {
    parserInstance = new FLRUParser()
  }
  return parserInstance
}

export async function closeFLRUParser(): Promise<void> {
  if (parserInstance) {
    await parserInstance.close()
    parserInstance = null
  }
}
