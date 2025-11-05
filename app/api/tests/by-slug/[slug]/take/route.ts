import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const test = await prisma.tests.findUnique({
      where: {
        slug: params.slug,
        is_published: true,
      },
      include: {
        test_sections: {
          orderBy: { order_index: 'asc' },
          include: {
            questions: {
              orderBy: { order_index: 'asc' },
              select: {
                id: true,
                question_text: true,
                question_type: true,
                options: true,
                order_index: true,
                audio_url: true,
                image_url: true,
              },
            },
          },
        },
      },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found or not published' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      test: {
        id: test.id,
        title: test.title,
        type: test.type,
        duration: test.duration,
        totalQuestions: test.total_questions,
        instructions: test.instructions,
        sections: test.test_sections.map((section) => ({
          id: section.id,
          sectionName: section.section_name,
          description: section.description,
          questionCount: section.question_count,
          timeLimit: section.time_limit,
          instructions: section.instructions,
          questions: section.questions.map((q) => ({
            id: q.id,
            questionText: q.question_text,
            questionType: q.question_type,
            options: q.options,
            orderIndex: q.order_index,
            audioUrl: q.audio_url,
            imageUrl: q.image_url,
          })),
        })),
      },
    })
  } catch (error) {
    console.error('Get test for taking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}