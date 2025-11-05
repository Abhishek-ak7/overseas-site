import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sections = await prisma.test_sections.findMany({
      where: { test_id: params.id },
      orderBy: { order_index: 'asc' },
      include: {
        questions: {
          orderBy: { order_index: 'asc' },
          select: {
            id: true,
            question_text: true,
            question_type: true,
            correct_answer: true,
            points: true,
            difficulty: true,
            order_index: true,
          },
        },
      },
    })

    return NextResponse.json({
      sections: sections.map((section) => ({
        id: section.id,
        sectionName: section.section_name,
        questionCount: section.question_count,
        questions: section.questions.map((q) => ({
          id: q.id,
          questionText: q.question_text,
          questionType: q.question_type,
          correctAnswer: q.correct_answer,
          points: q.points,
          difficulty: q.difficulty,
          orderIndex: q.order_index,
        })),
      })),
    })
  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}