// API константы
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Роли и права
export const ROLE_PERMISSIONS = {
  OWNER: ['*'],
  TEAMLEAD: ['projects:*', 'tasks:*', 'team:read', 'reports:read'],
  DEVELOPER: ['tasks:own', 'chats:*', 'profile:edit']
}

// Финансы
export const HOURLY_RATE = 1000 // 1000 ₽/час
export const BUDGET_SPLIT = {
  TEAM: 0.5,
  COMPANY: 0.5
}

// Парсинг
export const PARSING_FILTERS = {
  MIN_BUDGET: 50000,
  MIN_STACK_MATCH: 60
}

// AI лимиты (будут браться из API)
export const AI_LIMITS = {
  CLAUDE_CODE: 2000,
  DEEPSEEK: 10000,
  GPT4: 1000
}

// Канбан колонки
export const KANBAN_COLUMNS = [
  { id: 'BACKLOG', name: 'Бэклог', color: '#6B7280' },
  { id: 'TODO', name: 'К выполнению', color: '#3B82F6' },
  { id: 'IN_PROGRESS', name: 'В работе', color: '#F59E0B' },
  { id: 'REVIEW', name: 'На ревью', color: '#8B5CF6' },
  { id: 'DONE', name: 'Готово', color: '#10B981' }
]

// Режимы AI
export const AI_MODES = {
  ARCHITECT: { name: 'Архитектор', description: 'Планирует структуру, не пишет код' },
  CODE: { name: 'Код', description: 'Пишет код по плану или запросу' },
  REVIEW: { name: 'Ревью', description: 'Проверяет код, ищет баги' },
  DEBUG: { name: 'Отладка', description: 'Ищет и исправляет ошибки' },
  ASK: { name: 'Вопросы', description: 'Отвечает на вопросы' },
  CREATIVE: { name: 'Креатив', description: 'Придумывает фичи и улучшения' }
}
