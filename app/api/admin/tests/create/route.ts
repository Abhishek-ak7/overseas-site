import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const slug = body.slug || slugify(body.title)

    const test = await prisma.tests.create({
      data: {
        id: randomUUID(),
        title: body.title,
        slug: slug,
        description: body.description || '',
        type: body.type,
        duration: body.duration,
        total_questions: body.totalQuestions,
        passing_score: body.passingScore || 65,
        difficulty_level: body.difficultyLevel,
        price: body.price || 0,
        is_published: body.isPublished || false,
        is_free: body.isFree !== undefined ? body.isFree : true,
        instructions: body.instructions || '',
        tags: body.tags || [],
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      test: {
        id: test.id,
        title: test.title,
        slug: test.slug,
        isPublished: test.is_published,
      },
    }, { status: 201 })

  } catch (error: any) {
    console.error('Test creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create test', details: error.message },
      { status: 500 }
    )
  }
}
