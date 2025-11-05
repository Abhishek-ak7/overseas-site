import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { answers } = body

    // Get test with questions
    const test = await prisma.tests.findUnique({
      where: { id: params.id },
      include: {
        test_sections: {
          include: {
            questions: {
              select: {
                id: true,
                correct_answer: true,
                points: true,
              },
            },
          },
        },
      },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Calculate score
    let correctAnswers = 0
    let totalQuestions = 0

    test.test_sections.forEach((section) => {
      section.questions.forEach((question) => {
        totalQuestions++
        if (answers[question.id] === question.correct_answer) {
          correctAnswers++
        }
      })
    })

    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    const passed = test.passing_score ? score >= test.passing_score : false

    // Create attempt record
    const attemptId = randomUUID()

    // Note: Skipping actual DB insert for now since user auth is not available
    // await prisma.test_attempts.create({
    //   data: {
    //     id: attemptId,
    //     user_id: 'guest',
    //     test_id: test.id,
    //     score: score,
    //     total_questions: totalQuestions,
    //     correct_answers: correctAnswers,
    //     answers: answers,
    //     status: 'COMPLETED',
    //     started_at: new Date(),
    //     completed_at: new Date(),
    //   },
    // })

    return NextResponse.json({
      success: true,
      attemptId,
      results: {
        score: Math.round(score),
        passed,
        totalQuestions,
        correctAnswers,
        passingScore: test.passing_score,
        testTitle: test.title,
      },
    })
  } catch (error: any) {
    console.error('Submit test error:', error)
    return NextResponse.json(
      { error: 'Failed to submit test', details: error.message },
      { status: 500 }
    )
  }
}
