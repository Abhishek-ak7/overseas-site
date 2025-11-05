import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

const updateTestSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['IELTS', 'TOEFL', 'PTE', 'GRE', 'GMAT', 'SAT', 'ACT', 'DUOLINGO', 'CAEL', 'CELPIP', 'CUSTOM']).optional(),
  duration: z.number().optional(),
  totalQuestions: z.number().optional(),
  passingScore: z.number().optional(),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  price: z.number().optional(),
  isFree: z.boolean().optional(),
  instructions: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
})

// GET single test
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.tests.findUnique({
      where: { id: params.id },
      include: {
        test_sections: {
          orderBy: { order_index: 'asc' },
        },
      },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      test: {
        id: test.id,
        title: test.title,
        slug: test.slug,
        description: test.description,
        type: test.type,
        duration: test.duration,
        totalQuestions: test.total_questions,
        passingScore: test.passing_score,
        difficultyLevel: test.difficulty_level,
        price: Number(test.price),
        isPublished: test.is_published,
        isFree: test.is_free,
        instructions: test.instructions,
        tags: test.tags,
        createdAt: test.created_at,
        updatedAt: test.updated_at,
        sections: test.test_sections.map(s => ({
          id: s.id,
          sectionName: s.section_name,
          questionCount: s.question_count,
          timeLimit: s.time_limit,
          orderIndex: s.order_index,
        })),
      },
    })
  } catch (error) {
    console.error('Get test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update test
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateTestSchema.parse(body)

    const updateData: any = {
      updated_at: new Date(),
    }

    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.description) updateData.description = validatedData.description
    if (validatedData.type) updateData.type = validatedData.type
    if (validatedData.duration) updateData.duration = validatedData.duration
    if (validatedData.totalQuestions) updateData.total_questions = validatedData.totalQuestions
    if (validatedData.passingScore !== undefined) updateData.passing_score = validatedData.passingScore
    if (validatedData.difficultyLevel) updateData.difficulty_level = validatedData.difficultyLevel
    if (validatedData.price !== undefined) updateData.price = validatedData.price
    if (validatedData.isFree !== undefined) updateData.is_free = validatedData.isFree
    if (validatedData.instructions !== undefined) updateData.instructions = validatedData.instructions
    if (validatedData.tags) updateData.tags = validatedData.tags
    if (validatedData.isPublished !== undefined) updateData.is_published = validatedData.isPublished

    // Update slug if title changed
    if (validatedData.title) {
      const slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      updateData.slug = slug
    }

    const test = await prisma.tests.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Test updated successfully',
      test,
    })
  } catch (error) {
    console.error('Update test error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update specific fields (like publish status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const updateData: any = {
      updated_at: new Date(),
    }

    if (body.isPublished !== undefined) {
      updateData.is_published = body.isPublished
    }

    const test = await prisma.tests.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Test updated successfully',
      test: {
        id: test.id,
        isPublished: test.is_published,
      },
    })
  } catch (error) {
    console.error('Patch test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE test
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.tests.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Test deleted successfully',
    })
  } catch (error) {
    console.error('Delete test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}