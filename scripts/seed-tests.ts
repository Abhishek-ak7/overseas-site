import { PrismaClient, TestType, DifficultyLevel, QuestionType } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding tests...')

  // Clean up existing tests
  console.log('Cleaning up existing test data...')
  await prisma.questions.deleteMany({})
  await prisma.test_sections.deleteMany({})
  await prisma.test_attempts.deleteMany({})
  await prisma.tests.deleteMany({})
  console.log('Cleanup complete.')

  // Create TOEFL Test
  const toeflTest = await prisma.tests.create({
    data: {
      id: randomUUID(),
      title: 'TOEFL iBT Practice Test',
      slug: 'toefl-ibt-practice-test',
      description: 'Complete TOEFL iBT practice test with all four sections: Reading, Listening, Speaking, and Writing. Experience real test conditions and improve your English proficiency.',
      type: 'TOEFL' as TestType,
      duration: 180, // 3 hours
      total_questions: 76,
      passing_score: 80,
      difficulty_level: 'MEDIUM' as DifficultyLevel,
      price: 29.99,
      is_published: true,
      is_free: false,
      instructions: 'This practice test simulates the actual TOEFL iBT exam. You will have 3 hours to complete all sections. Make sure you have a stable internet connection and a quiet environment.',
      tags: ['TOEFL', 'English', 'Study Abroad', 'Practice Test'],
      updated_at: new Date(),
    },
  })

  // Create TOEFL Reading Section
  const toeflReadingSection = await prisma.test_sections.create({
    data: {
      id: randomUUID(),
      test_id: toeflTest.id,
      section_name: 'Reading',
      description: 'Read passages and answer questions to demonstrate your reading comprehension skills.',
      order_index: 1,
      question_count: 30,
      time_limit: 54,
      instructions: 'You will read 3-4 passages and answer questions about them. You have 54-72 minutes for this section.',
    },
  })

  // Add sample reading questions
  for (let i = 1; i <= 10; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: toeflTest.id,
        section_id: toeflReadingSection.id,
        question_text: `According to the passage, which of the following statements about ${i === 1 ? 'ancient civilizations' : i === 2 ? 'modern technology' : 'environmental conservation'} is true?`,
        question_type: 'MULTIPLE_CHOICE' as QuestionType,
        options: {
          A: `Option A for question ${i}`,
          B: `Option B for question ${i}`,
          C: `Option C for question ${i}`,
          D: `Option D for question ${i}`,
        },
        correct_answer: 'B',
        explanation: `The correct answer is B because the passage clearly states this information in paragraph ${i}.`,
        points: 1,
        difficulty: 'MEDIUM' as DifficultyLevel,
        tags: ['Reading', 'Comprehension'],
        order_index: i,
        updated_at: new Date(),
      },
    })
  }

  // Create TOEFL Listening Section
  const toeflListeningSection = await prisma.test_sections.create({
    data: {
      id: randomUUID(),
      test_id: toeflTest.id,
      section_name: 'Listening',
      description: 'Listen to conversations and lectures, then answer questions.',
      order_index: 2,
      question_count: 28,
      time_limit: 41,
      instructions: 'You will listen to 3-4 lectures and 2-3 conversations. You have 41-57 minutes for this section.',
    },
  })

  // Add sample listening questions
  for (let i = 1; i <= 8; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: toeflTest.id,
        section_id: toeflListeningSection.id,
        question_text: `What is the main topic of the ${i % 2 === 0 ? 'lecture' : 'conversation'}?`,
        question_type: 'MULTIPLE_CHOICE' as QuestionType,
        options: {
          A: `Topic A for question ${i}`,
          B: `Topic B for question ${i}`,
          C: `Topic C for question ${i}`,
          D: `Topic D for question ${i}`,
        },
        correct_answer: 'C',
        explanation: `The main topic discussed throughout the ${i % 2 === 0 ? 'lecture' : 'conversation'} is option C.`,
        points: 1,
        difficulty: 'MEDIUM' as DifficultyLevel,
        tags: ['Listening', 'Comprehension'],
        order_index: i,
        updated_at: new Date(),
      },
    })
  }

  // Create IELTS Test
  const ieltsTest = await prisma.tests.create({
    data: {
      id: randomUUID(),
      title: 'IELTS Academic Practice Test',
      slug: 'ielts-academic-practice-test',
      description: 'Full IELTS Academic practice test covering Listening, Reading, Writing, and Speaking. Perfect for university admission preparation.',
      type: 'IELTS' as TestType,
      duration: 165, // 2 hours 45 minutes
      total_questions: 80,
      passing_score: 7,
      difficulty_level: 'HARD' as DifficultyLevel,
      price: 24.99,
      is_published: true,
      is_free: false,
      instructions: 'Complete IELTS Academic practice test. Timing is strict - manage your time carefully for each section.',
      tags: ['IELTS', 'English', 'Academic', 'Practice Test'],
      updated_at: new Date(),
    },
  })

  // Create IELTS Listening Section
  const ieltsListeningSection = await prisma.test_sections.create({
    data: {
      id: randomUUID(),
      test_id: ieltsTest.id,
      section_name: 'Listening',
      description: 'Listen to four recordings and answer questions.',
      order_index: 1,
      question_count: 40,
      time_limit: 30,
      instructions: 'You will hear four recordings of native English speakers and write your answers to questions.',
    },
  })

  // Add IELTS listening questions
  for (let i = 1; i <= 10; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: ieltsTest.id,
        section_id: ieltsListeningSection.id,
        question_text: `Complete the sentence: The speaker mentions that __________.`,
        question_type: 'FILL_BLANK' as QuestionType,
        options: null,
        correct_answer: 'the project deadline',
        explanation: 'The speaker clearly states the project deadline in the recording.',
        points: 1,
        difficulty: 'MEDIUM' as DifficultyLevel,
        tags: ['Listening', 'Fill in the blank'],
        order_index: i,
        updated_at: new Date(),
      },
    })
  }

  // Create Free PTE Practice Test
  const pteTest = await prisma.tests.create({
    data: {
      id: randomUUID(),
      title: 'PTE Academic Free Practice Test',
      slug: 'pte-academic-free-practice',
      description: 'Free PTE Academic practice test to help you prepare for your exam. Includes Speaking, Writing, Reading, and Listening sections.',
      type: 'PTE' as TestType,
      duration: 120, // 2 hours
      total_questions: 52,
      passing_score: 50,
      difficulty_level: 'MEDIUM' as DifficultyLevel,
      price: 0,
      is_published: true,
      is_free: true,
      instructions: 'This is a free practice test for PTE Academic. Take your time and familiarize yourself with the question types.',
      tags: ['PTE', 'English', 'Free', 'Practice Test'],
      updated_at: new Date(),
    },
  })

  // Create PTE Speaking & Writing Section
  const pteSpeakingSection = await prisma.test_sections.create({
    data: {
      id: randomUUID(),
      test_id: pteTest.id,
      section_name: 'Speaking & Writing',
      description: 'Demonstrate your speaking and writing skills in English.',
      order_index: 1,
      question_count: 28,
      time_limit: 77,
      instructions: 'This section tests your speaking and writing abilities together.',
    },
  })

  // Add PTE speaking questions
  for (let i = 1; i <= 5; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: pteTest.id,
        section_id: pteSpeakingSection.id,
        question_text: `Read the following text aloud: "The quick brown fox jumps over the lazy dog. This sentence is used to test speaking clarity and pronunciation in the PTE exam."`,
        question_type: 'SPEAKING' as QuestionType,
        options: null,
        correct_answer: 'N/A - Speaking task',
        explanation: 'Speaking tasks are evaluated based on fluency, pronunciation, and content.',
        points: 3,
        difficulty: 'EASY' as DifficultyLevel,
        tags: ['Speaking', 'Read Aloud'],
        order_index: i,
        updated_at: new Date(),
      },
    })
  }

  // Create GRE Test
  const greTest = await prisma.tests.create({
    data: {
      id: randomUUID(),
      title: 'GRE General Test Practice',
      slug: 'gre-general-test-practice',
      description: 'Comprehensive GRE practice test with Verbal Reasoning, Quantitative Reasoning, and Analytical Writing sections.',
      type: 'GRE' as TestType,
      duration: 225, // 3 hours 45 minutes
      total_questions: 82,
      passing_score: 150,
      difficulty_level: 'HARD' as DifficultyLevel,
      price: 39.99,
      is_published: true,
      is_free: false,
      instructions: 'Complete GRE practice test. This test measures your readiness for graduate-level academic work.',
      tags: ['GRE', 'Graduate', 'Practice Test'],
      updated_at: new Date(),
    },
  })

  // Create GRE Verbal Section
  const greVerbalSection = await prisma.test_sections.create({
    data: {
      id: randomUUID(),
      test_id: greTest.id,
      section_name: 'Verbal Reasoning',
      description: 'Test your ability to analyze and evaluate written material.',
      order_index: 1,
      question_count: 40,
      time_limit: 60,
      instructions: 'Answer questions about reading passages, complete sentences, and analyze arguments.',
    },
  })

  // Add GRE verbal questions
  for (let i = 1; i <= 10; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: greTest.id,
        section_id: greVerbalSection.id,
        question_text: `Select the two answer choices that, when used to complete the sentence, fit the meaning of the sentence as a whole and produce completed sentences that are alike in meaning.`,
        question_type: 'MULTIPLE_CHOICE' as QuestionType,
        options: {
          A: `Vocabulary word A`,
          B: `Vocabulary word B`,
          C: `Vocabulary word C`,
          D: `Vocabulary word D`,
          E: `Vocabulary word E`,
          F: `Vocabulary word F`,
        },
        correct_answer: 'B,D',
        explanation: `Both B and D create sentences with similar meanings that fit the context.`,
        points: 1,
        difficulty: 'HARD' as DifficultyLevel,
        tags: ['Verbal', 'Vocabulary'],
        order_index: i,
        updated_at: new Date(),
      },
    })
  }

  console.log('✅ Tests seeded successfully!')
  console.log(`Created ${5} tests with sections and questions`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding tests:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })