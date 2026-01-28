import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  // Server
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT - with secure default
  JWT_SECRET: z.string().default('483a123cea1a162a349d4aa7de74b37736ded72e890e65e29d6c8533fdee8a22'),
  JWT_EXPIRES_IN: z.string().default('30d'),

  // Frontend - with Vercel URL as default
  FRONTEND_URL: z.string().default('https://web-eta-two-88.vercel.app'),

  // Redis (optional)
  REDIS_URL: z.string().optional(),

  // AI APIs (optional)
  DEEPSEEK_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

let env: Env

try {
  env = envSchema.parse(process.env)
  console.log('✅ Environment variables loaded successfully')
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:')
    console.error(JSON.stringify(error.errors, null, 2))
    process.exit(1)
  }
  throw error
}

export { env }
