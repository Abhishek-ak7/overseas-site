import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Quick seeding tests...')

  // Clear existing
  await prisma.questions.deleteMany({}).catch(() => {})
  await prisma.test_sections.deleteMany({}).catch(() => {})
  await prisma.test_attempts.deleteMany({}).catch(() => {})
  await prisma.tests.deleteMany({}).catch(() => {})

  // IELTS Test
  const ieltsId = randomUUID()
  const ieltsReadingId = randomUUID()

  await prisma.tests.create({
    data: {
      id: ieltsId,
      title: 'IELTS Academic Practice Test',
      slug: 'ielts-academic-practice-test',
      description: 'Complete IELTS Academic test preparation',
      type: 'IELTS',
      duration: 180,
      total_questions: 10,
      passing_score: 65,
      difficulty_level: 'MEDIUM',
      price: 0,
      is_published: true,
      is_free: true,
      instructions: 'Read carefully and answer all questions.',
      tags: ['IELTS', 'Academic'],
      updated_at: new Date(),
    },
  })

  await prisma.test_sections.create({
    data: {
      id: ieltsReadingId,
      test_id: ieltsId,
      section_name: 'Reading',
      description: 'Reading section',
      order_index: 1,
      question_count: 10,
      time_limit: 60,
      instructions: 'Read the passages and answer questions.',
    },
  })

  // Add 10 questions
  for (let i = 1; i <= 10; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: ieltsId,
        section_id: ieltsReadingId,
        question_text: `Question ${i}: What is the main idea of paragraph ${i}?`,
        question_type: 'MULTIPLE_CHOICE',
        options: {
          A: `Option A for question ${i}`,
          B: `Option B for question ${i}`,
          C: `Option C for question ${i}`,
          D: `Option D for question ${i}`,
        },
        correct_answer: 'B',
        explanation: `The correct answer is B because...`,
        points: 1,
        difficulty: 'MEDIUM',
        tags: ['reading'],
        order_index: i,
        updated_at: new Date(),
      },
    })
  }

  console.log('✅ IELTS test created!')

  // TOEFL Test
  const toeflId = randomUUID()
  const toeflReadingId = randomUUID()

  await prisma.tests.create({
    data: {
      id: toeflId,
      title: 'TOEFL iBT Practice Test',
      slug: 'toefl-ibt-practice-test',
      description: 'TOEFL iBT preparation test',
      type: 'TOEFL',
      duration: 120,
      total_questions: 10,
      passing_score: 70,
      difficulty_level: 'HARD',
      price: 29.99,
      is_published: true,
      is_free: false,
      instructions: 'Complete all sections within time limit.',
      tags: ['TOEFL', 'iBT'],
      updated_at: new Date(),
    },
  })

  await prisma.test_sections.create({
    data: {
      id: toeflReadingId,
      test_id: toeflId,
      section_name: 'Reading',
      description: 'Reading section',
      order_index: 1,
      question_count: 10,
      time_limit: 54,
      instructions: 'Read and answer.',
    },
  })

  for (let i = 1; i <= 10; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: toeflId,
        section_id: toeflReadingId,
        question_text: `TOEFL Question ${i}: Based on the passage, what can be inferred about...?`,
        question_type: 'MULTIPLE_CHOICE',
        options: {
          A: `Answer A`,
          B: `Answer B`,
          C: `Answer C`,
          D: `Answer D`,
        },
        correct_answer: 'C',
        explanation: `C is correct because...`,
        points: 1,
        difficulty: 'HARD',
        tags: ['reading', 'toefl'],
        order_index: i,
        updated_at: new Date(),
      },
    })
  }

  console.log('✅ TOEFL test created!')
  console.log('✅ All done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
