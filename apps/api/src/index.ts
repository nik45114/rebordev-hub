import { buildServer } from './server.js'
import { env } from './config/env.js'
import { prisma } from './config/database.js'

async function start() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Build and start server
    const server = await buildServer()

    await server.listen({
      port: env.PORT,
      host: '0.0.0.0',
    })

    console.log(`🚀 Server is running on http://localhost:${env.PORT}`)
    console.log(`📝 Environment: ${env.NODE_ENV}`)
    console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`)
    console.log('\n📚 Available routes:')
    console.log('  GET  /health')
    console.log('  POST /api/auth/register')
    console.log('  POST /api/auth/login')
    console.log('  GET  /api/auth/profile (protected)')
    console.log('  POST /api/auth/logout (protected)')
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM']
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, shutting down gracefully...`)
    await prisma.$disconnect()
    process.exit(0)
  })
})

start()
