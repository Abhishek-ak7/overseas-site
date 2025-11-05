import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.users.findUnique({
            where: {
              email: credentials.email.toLowerCase()
            },
            include: {
              user_profiles: true
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            return null
          }

          // Check if email is verified for non-admin users
          if (!user.is_verified && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('VERIFICATION_REQUIRED')
          }

          // Update last login
          await prisma.users.update({
            where: { id: user.id },
            data: { last_login: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isVerified: user.is_verified,
            phone: user.phone,
            country: user.country,
            studyLevel: user.study_level,
            profile: user.user_profiles
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.isVerified = user.isVerified
        token.phone = user.phone
        token.country = user.country
        token.studyLevel = user.studyLevel
        token.profile = user.profile
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.isVerified = token.isVerified as boolean
        session.user.phone = token.phone as string
        session.user.country = token.country as string
        session.user.studyLevel = token.studyLevel as string
        session.user.profile = token.profile
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  events: {
    async signIn({ user }) {
      console.log(`User ${user.email} signed in successfully`)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}