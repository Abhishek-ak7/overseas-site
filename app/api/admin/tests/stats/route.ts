import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Verify admin access
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Get comprehensive test statistics
    const [
      totalTests,
      publishedTests,
      freeTests,
      totalAttempts,
      completedAttempts,
      averageScoreResult,
      testsByType,
      testsByDifficulty,
      recentTests
    ] = await Promise.all([
      // Total tests
      prisma.test.count(),

      // Published tests
      prisma.test.count({
        where: { isPublished: true }
      }),

      // Free tests
      prisma.test.count({
        where: { isFree: true }
      }),

      // Total attempts
      prisma.testAttempt.count(),

      // Completed attempts
      prisma.testAttempt.count({
        where: { status: 'COMPLETED' }
      }),

      // Average score across all completed attempts
      prisma.testAttempt.aggregate({
        where: { status: 'COMPLETED' },
        _avg: { score: true }
      }),

      // Tests by type
      prisma.test.groupBy({
        by: ['type'],
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } }
      }),

      // Tests by difficulty
      prisma.test.groupBy({
        by: ['difficultyLevel'],
        _count: { difficultyLevel: true },
        orderBy: { _count: { difficultyLevel: 'desc' } }
      }),

      // Recent tests
      prisma.test.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          type: true,
          isPublished: true,
          createdAt: true,
          _count: {
            select: { attempts: true }
          }
        }
      })
    ])

    // Calculate completion rate
    const completionRate = totalAttempts > 0
      ? Math.round((completedAttempts / totalAttempts) * 100)
      : 0

    const stats = {
      total: totalTests,
      published: publishedTests,
      free: freeTests,
      totalAttempts,
      completedAttempts,
      completionRate,
      averageScore: Math.round(averageScoreResult._avg.score?.toNumber() || 0),
      testsByType: testsByType.map(stat => ({
        type: stat.type,
        count: stat._count.type
      })),
      testsByDifficulty: testsByDifficulty.map(stat => ({
        difficulty: stat.difficultyLevel,
        count: stat._count.difficultyLevel
      })),
      recentTests: recentTests.map(test => ({
        id: test.id,
        title: test.title,
        type: test.type,
        isPublished: test.isPublished,
        createdAt: test.createdAt.toISOString(),
        attempts: test._count.attempts
      }))
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Test stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test statistics' },
      { status: 500 }
    )
  }
}