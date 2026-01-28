import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface JwtPayload {
  userId: string
}

export function generateToken(payload: JwtPayload): string {
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '30d' })
  return token
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}
