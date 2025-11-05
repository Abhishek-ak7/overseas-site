import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

interface TokenPayload {
  userId: string
  email: string
  role: UserRole
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  return jwt.sign(payload, secret, {
    expiresIn: '24h',
    issuer: 'bnoverseas',
    audience: 'bnoverseas-users',
    algorithm: 'HS256'
  })
}

export function generateRefreshToken(payload: TokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long')
  }
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
    issuer: 'bnoverseas',
    audience: 'bnoverseas-users',
    algorithm: 'HS256'
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = jwt.verify(token, secret, {
      issuer: 'bnoverseas',
      audience: 'bnoverseas-users',
      algorithms: ['HS256']
    }) as TokenPayload

    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_REFRESH_SECRET
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not configured')
    }

    const decoded = jwt.verify(token, secret, {
      issuer: 'bnoverseas',
      audience: 'bnoverseas-users',
      algorithms: ['HS256']
    }) as TokenPayload

    return decoded
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

export async function getUserFromToken(request: NextRequest) {
  try {
    // Try NextAuth token (recommended method)
    console.log('🔍 Checking NextAuth token...')
    console.log('🍪 Cookies:', request.cookies.getAll().map(c => c.name))
    
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    console.log('🎫 NextAuth token:', token ? 'Found' : 'Not found')
    
    if (token?.sub) {
      console.log('✅ Token sub:', token.sub)
      const user = await prisma.users.findUnique({
        where: { id: token.sub },
        include: {
          user_profiles: true,
        },
      })
      console.log('👤 User found:', user ? user.email : 'No user')
      return user
    }

    // Fall back to custom JWT token for API-based auth
    console.log('⚠️ NextAuth token not found, trying JWT...')
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('auth-token')?.value

    const jwtToken = authHeader || cookieToken
    console.log('🔑 JWT token:', jwtToken ? 'Found' : 'Not found')
    
    if (!jwtToken) {
      console.log('❌ No auth token found at all')
      return null
    }

    const decoded = verifyToken(jwtToken)
    if (!decoded) {
      return null
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      include: {
        user_profiles: true,
      },
    })

    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest, allowedRoles?: UserRole[]) {
  const user = await getUserFromToken(request)

  if (!user) {
    throw new Error('Authentication required')
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }

  return user
}

export function generateResetToken(): string {
  // Use crypto for secure random token generation
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

export function generateVerificationToken(): string {
  // Use crypto for secure random token generation
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}