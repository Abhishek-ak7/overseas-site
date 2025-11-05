import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'Database URL is required' },
        { status: 400 }
      )
    }

    // Create a temporary Prisma client with the provided URL
    const tempPrisma = new PrismaClient({
      datasources: {
        db: {
          url: url
        }
      }
    })

    try {
      // Test the connection
      await tempPrisma.$connect()
      await tempPrisma.$queryRaw`SELECT 1`

      return NextResponse.json({
        success: true,
        message: 'Database connection successful'
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database. Please check your connection string and database server.'
      })
    } finally {
      await tempPrisma.$disconnect()
    }
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}