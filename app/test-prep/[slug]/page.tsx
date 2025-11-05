import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TestPrepDetail } from '@/components/test-prep/test-prep-detail'
import { cookies } from 'next/headers'

interface PageProps {
  params: {
    slug: string
  }
}

async function getTest(slug: string) {
  const test = await prisma.tests.findUnique({
    where: {
      slug,
      is_published: true,
    },
    include: {
      test_sections: {
        orderBy: {
          order_index: 'asc',
        },
      },
    },
  })

  if (!test) {
    return null
  }

  return {
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
    sections: test.test_sections.map((section) => ({
      id: section.id,
      sectionName: section.section_name,
      description: section.description,
      questionCount: section.question_count,
      timeLimit: section.time_limit,
      orderIndex: section.order_index,
    })),
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const test = await getTest(params.slug)

  if (!test) {
    return {
      title: 'Test Not Found',
    }
  }

  return {
    title: `${test.title} | Test Prep | BnOverseas`,
    description: test.description,
  }
}

export default async function TestPrepPage({ params }: PageProps) {
  const test = await getTest(params.slug)

  if (!test) {
    notFound()
  }

  return <TestPrepDetail test={test} />
}