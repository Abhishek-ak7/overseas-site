import { UserRole } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName: string
      lastName: string
      role: UserRole
      isVerified: boolean
      phone?: string | null
      country?: string | null
      studyLevel?: string | null
      profile?: any
    }
  }

  interface User {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    role: UserRole
    isVerified: boolean
    phone?: string | null
    country?: string | null
    studyLevel?: string | null
    profile?: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    firstName: string
    lastName: string
    isVerified: boolean
    phone?: string | null
    country?: string | null
    studyLevel?: string | null
    profile?: any
  }
}