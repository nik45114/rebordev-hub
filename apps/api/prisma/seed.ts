import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Очистка БД
  await prisma.taskComment.deleteMany()
  await prisma.taskFile.deleteMany()
  await prisma.task.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.memoryEntry.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.order.deleteMany()
  await prisma.client.deleteMany()
  await prisma.project.deleteMany()
  await prisma.backup.deleteMany()
  await prisma.server.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.userSkill.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // 1. Создание пользователей
  const passwordHash = await bcrypt.hash('password123', 10)

  const vladimir = await prisma.user.create({
    data: {
      email: 'vladimir@rebordev.ru',
      name: 'Владимир Иванов',
      passwordHash,
      role: 'OWNER',
      avatarUrl: 'https://ui-avatars.com/api/?name=Vladimir+Ivanov&background=7C3AED&color=fff',
    },
  })

  const alexey = await prisma.user.create({
    data: {
      email: 'alexey@rebordev.ru',
      name: 'Алексей Петров',
      passwordHash,
      role: 'TEAMLEAD',
      avatarUrl: 'https://ui-avatars.com/api/?name=Alexey+Petrov&background=22C55E&color=fff',
    },
  })

  const maria = await prisma.user.create({
    data: {
      email: 'maria@rebordev.ru',
      name: 'Мария Сидорова',
      passwordHash,
      role: 'DEVELOPER',
      avatarUrl: 'https://ui-avatars.com/api/?name=Maria+Sidorova&background=F59E0B&color=fff',
    },
  })

  const dmitry = await prisma.user.create({
    data: {
      email: 'dmitry@rebordev.ru',
      name: 'Дмитрий Козлов',
      passwordHash,
      role: 'DEVELOPER',
      avatarUrl: 'https://ui-avatars.com/api/?name=Dmitry+Kozlov&background=3B82F6&color=fff',
    },
  })

  const anna = await prisma.user.create({
    data: {
      email: 'anna@rebordev.ru',
      name: 'Анна Новикова',
      passwordHash,
      role: 'DEVELOPER',
      avatarUrl: 'https://ui-avatars.com/api/?name=Anna+Novikova&background=EC4899&color=fff',
    },
  })

  console.log('✅ Users created:', { vladimir: vladimir.id, alexey: alexey.id })

  // 2. Навыки сотрудников
  await prisma.userSkill.createMany({
    data: [
      { userId: alexey.id, name: 'Python', level: 5, xp: 5000, tasksCompleted: 42 },
      { userId: alexey.id, name: 'React', level: 4, xp: 3200, tasksCompleted: 28 },
      { userId: alexey.id, name: 'Docker', level: 4, xp: 2800, tasksCompleted: 19 },
      { userId: maria.id, name: 'React', level: 5, xp: 4500, tasksCompleted: 38 },
      { userId: maria.id, name: 'TypeScript', level: 5, xp: 4200, tasksCompleted: 35 },
      { userId: maria.id, name: 'Figma', level: 3, xp: 1800, tasksCompleted: 12 },
      { userId: dmitry.id, name: 'Python', level: 5, xp: 5200, tasksCompleted: 45 },
      { userId: dmitry.id, name: 'FastAPI', level: 4, xp: 3500, tasksCompleted: 31 },
      { userId: dmitry.id, name: 'PostgreSQL', level: 4, xp: 3100, tasksCompleted: 27 },
      { userId: anna.id, name: 'React Native', level: 5, xp: 4800, tasksCompleted: 40 },
      { userId: anna.id, name: 'iOS', level: 4, xp: 3300, tasksCompleted: 29 },
      { userId: anna.id, name: 'Android', level: 4, xp: 3100, tasksCompleted: 26 },
    ],
  })

  console.log('✅ User skills created')

  // 3. Серверы
  const prodServer = await prisma.server.create({
    data: {
      name: 'Production',
      host: '192.168.1.100',
      port: 22,
      username: 'admin',
      authType: 'SSH_KEY',
      status: 'ONLINE',
      metrics: { cpu: 34, ram: 52, disk: 78 },
    },
  })

  const stagingServer = await prisma.server.create({
    data: {
      name: 'Staging',
      host: '192.168.1.101',
      port: 22,
      username: 'admin',
      authType: 'SSH_KEY',
      status: 'ONLINE',
      metrics: { cpu: 12, ram: 34, disk: 45 },
    },
  })

  const devServer = await prisma.server.create({
    data: {
      name: 'Dev',
      host: '192.168.1.102',
      port: 22,
      username: 'admin',
      authType: 'SSH_KEY',
      status: 'ONLINE',
      metrics: { cpu: 78, ram: 82, disk: 56 },
    },
  })

  console.log('✅ Servers created')

  // 4. Проекты
  const crmProject = await prisma.project.create({
    data: {
      name: 'CRM для клиники',
      description: 'Разработка CRM системы для управления пациентами, записями и медицинскими картами',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      deadline: new Date('2026-02-15'),
      budget: 150000,
      ownerId: vladimir.id,
    },
  })

  const shopProject = await prisma.project.create({
    data: {
      name: 'Интернет-магазин одежды',
      description: 'E-commerce платформа с каталогом, корзиной, оплатой и личным кабинетом',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      deadline: new Date('2026-02-28'),
      budget: 200000,
      ownerId: vladimir.id,
    },
  })

  const mobileProject = await prisma.project.create({
    data: {
      name: 'Мобильное приложение доставки',
      description: 'iOS и Android приложение для заказа еды с трекингом курьера',
      status: 'REVIEW',
      priority: 'HIGH',
      deadline: new Date('2026-01-30'),
      budget: 180000,
      ownerId: vladimir.id,
    },
  })

  const redesignProject = await prisma.project.create({
    data: {
      name: 'Редизайн корпоративного сайта',
      description: 'Обновление дизайна и переход на современный стек технологий',
      status: 'IN_PROGRESS',
      priority: 'LOW',
      deadline: new Date('2026-03-10'),
      budget: 80000,
      ownerId: vladimir.id,
    },
  })

  console.log('✅ Projects created:', { crm: crmProject.id, shop: shopProject.id })

  // 5. Задачи для CRM проекта
  const crmTask1 = await prisma.task.create({
    data: {
      projectId: crmProject.id,
      title: 'Разработка API для управления пациентами',
      description: 'REST API с CRUD операциями для пациентов, врачей и записей',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      authorId: alexey.id,
      assigneeId: dmitry.id,
      estimatedHours: 24,
      tags: ['Python', 'FastAPI', 'PostgreSQL'],
      order: 1,
    },
  })

  const crmTask2 = await prisma.task.create({
    data: {
      projectId: crmProject.id,
      title: 'UI для расписания записей',
      description: 'Календарь с drag-and-drop для управления записями пациентов',
      status: 'TODO',
      priority: 'MEDIUM',
      authorId: alexey.id,
      assigneeId: maria.id,
      estimatedHours: 16,
      tags: ['React', 'TypeScript', 'DnD'],
      order: 2,
    },
  })

  const crmTask3 = await prisma.task.create({
    data: {
      projectId: crmProject.id,
      title: 'Интеграция с медицинским оборудованием',
      description: 'Подключение к аппаратам для автоматической загрузки данных',
      status: 'BACKLOG',
      priority: 'LOW',
      authorId: alexey.id,
      estimatedHours: 40,
      tags: ['Python', 'IoT', 'API'],
      order: 3,
    },
  })

  // 6. Задачи для магазина
  await prisma.task.createMany({
    data: [
      {
        projectId: shopProject.id,
        title: 'Каталог товаров с фильтрами',
        status: 'DONE',
        priority: 'HIGH',
        authorId: alexey.id,
        assigneeId: maria.id,
        tags: ['React', 'Redux'],
        order: 1,
        completedAt: new Date('2026-01-15'),
      },
      {
        projectId: shopProject.id,
        title: 'Корзина и оформление заказа',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        authorId: alexey.id,
        assigneeId: maria.id,
        tags: ['React', 'Payment'],
        order: 2,
      },
      {
        projectId: shopProject.id,
        title: 'Админ-панель для управления товарами',
        status: 'TODO',
        priority: 'MEDIUM',
        authorId: alexey.id,
        tags: ['React', 'Admin'],
        order: 3,
      },
    ],
  })

  // 7. Задачи для мобильного приложения
  await prisma.task.createMany({
    data: [
      {
        projectId: mobileProject.id,
        title: 'iOS приложение',
        status: 'REVIEW',
        priority: 'CRITICAL',
        authorId: alexey.id,
        assigneeId: anna.id,
        tags: ['React Native', 'iOS'],
        order: 1,
      },
      {
        projectId: mobileProject.id,
        title: 'Android приложение',
        status: 'REVIEW',
        priority: 'CRITICAL',
        authorId: alexey.id,
        assigneeId: anna.id,
        tags: ['React Native', 'Android'],
        order: 2,
      },
      {
        projectId: mobileProject.id,
        title: 'Трекинг курьера в реальном времени',
        status: 'DONE',
        priority: 'HIGH',
        authorId: alexey.id,
        assigneeId: anna.id,
        tags: ['WebSocket', 'Maps'],
        order: 3,
        completedAt: new Date('2026-01-20'),
      },
    ],
  })

  console.log('✅ Tasks created')

  // 8. Фриланс клиенты и заказы
  const client1 = await prisma.client.create({
    data: {
      name: 'Анатолий Смирнов',
      company: 'ООО "Медицинский центр"',
      email: 'a.smirnov@medcenter.ru',
      telegram: '@asmirnov',
      source: 'FL_RU',
      totalPaid: 0,
    },
  })

  const order1 = await prisma.order.create({
    data: {
      title: 'Разработка системы онлайн-записи к врачам',
      description:
        'Нужна система для записи пациентов через сайт. Интеграция с 1С. Бюджет до 200 000 руб.',
      source: 'FL_RU',
      sourceUrl: 'https://www.fl.ru/projects/12345',
      budget: 200000,
      currency: 'RUB',
      status: 'NEGOTIATING',
      clientId: client1.id,
      stackMatch: 85,
      aiAnalysis: {
        summary: 'Проект подходит под наш стек',
        requiredSkills: ['Python', 'React', 'PostgreSQL', '1C API'],
        estimatedTime: '3-4 месяца',
        complexity: 'средняя',
        recommendations: 'Уточнить детали интеграции с 1С',
      },
    },
  })

  const client2 = await prisma.client.create({
    data: {
      name: 'Елена Кузнецова',
      company: 'ИП Кузнецова',
      email: 'e.kuznetsova@shop.ru',
      source: 'KWORK',
      totalPaid: 150000,
    },
  })

  await prisma.order.create({
    data: {
      title: 'Доработка интернет-магазина на React',
      description: 'Нужно добавить личный кабинет, wishlist и сравнение товаров',
      source: 'KWORK',
      sourceUrl: 'https://kwork.ru/projects/67890',
      budget: 80000,
      currency: 'RUB',
      status: 'NEW',
      clientId: client2.id,
      stackMatch: 95,
      aiAnalysis: {
        summary: 'Простой проект, подходит идеально',
        requiredSkills: ['React', 'Redux', 'REST API'],
        estimatedTime: '1-2 месяца',
        complexity: 'низкая',
      },
    },
  })

  console.log('✅ Orders created:', { order1: order1.id })

  // 9. Чаты
  const projectChat = await prisma.chat.create({
    data: {
      name: 'Чат по CRM проекту',
      type: 'PROJECT',
      mode: 'CODE',
      model: 'CLAUDE_CODE',
      projectId: crmProject.id,
      serverId: prodServer.id,
      tokensUsed: 1247,
    },
  })

  const taskChat = await prisma.chat.create({
    data: {
      name: 'Обсуждение API пациентов',
      type: 'TASK',
      mode: 'ARCHITECT',
      model: 'DEEPSEEK',
      taskId: crmTask1.id,
      tokensUsed: 543,
    },
  })

  // 10. Сообщения в чатах
  await prisma.chatMessage.createMany({
    data: [
      {
        chatId: projectChat.id,
        userId: dmitry.id,
        role: 'USER',
        content: 'Как лучше организовать структуру API для работы с пациентами?',
        tokensUsed: 15,
      },
      {
        chatId: projectChat.id,
        role: 'ASSISTANT',
        content: `Рекомендую следующую структуру:

1. **Модульная архитектура:**
   - \`/api/patients\` - CRUD пациентов
   - \`/api/appointments\` - управление записями
   - \`/api/doctors\` - врачи
   - \`/api/medical-records\` - медкарты

2. **База данных:**
   - Patient (id, name, phone, email, birth_date)
   - Doctor (id, name, specialization)
   - Appointment (id, patient_id, doctor_id, datetime, status)
   - MedicalRecord (id, patient_id, diagnosis, prescriptions)

3. **Используй FastAPI + SQLAlchemy + Pydantic для валидации**`,
        tokensUsed: 180,
      },
      {
        chatId: taskChat.id,
        userId: alexey.id,
        role: 'USER',
        content: 'Нужен ревью архитектуры перед началом работы',
        tokensUsed: 12,
      },
    ],
  })

  console.log('✅ Chats and messages created')

  // 11. Уведомления
  await prisma.notification.createMany({
    data: [
      {
        userId: dmitry.id,
        type: 'TASK_ASSIGNED',
        title: 'Новая задача',
        message: 'Вам назначена задача "Разработка API для управления пациентами"',
        link: `/tasks/${crmTask1.id}`,
        read: false,
      },
      {
        userId: maria.id,
        type: 'TASK_ASSIGNED',
        title: 'Новая задача',
        message: 'Вам назначена задача "UI для расписания записей"',
        link: `/tasks/${crmTask2.id}`,
        read: false,
      },
      {
        userId: vladimir.id,
        type: 'ORDER_NEW',
        title: 'Новый заказ с FL.ru',
        message: 'Найден заказ "Разработка системы онлайн-записи к врачам" (совпадение 85%)',
        link: `/freelance/${order1.id}`,
        read: false,
      },
      {
        userId: alexey.id,
        type: 'DEADLINE_APPROACHING',
        title: 'Приближается дедлайн',
        message: 'Проект "Мобильное приложение доставки" должен быть сдан через 3 дня',
        link: `/projects/${mobileProject.id}`,
        read: true,
      },
    ],
  })

  console.log('✅ Notifications created')

  console.log('🎉 Seed completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('Email: vladimir@rebordev.ru | Password: password123')
  console.log('Email: alexey@rebordev.ru | Password: password123')
  console.log('Email: maria@rebordev.ru | Password: password123')
  console.log('Email: dmitry@rebordev.ru | Password: password123')
  console.log('Email: anna@rebordev.ru | Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
