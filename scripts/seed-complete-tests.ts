import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

async function main() {
  console.log('Starting comprehensive test seeding...')

  // Delete existing data
  await prisma.questions.deleteMany({})
  await prisma.test_sections.deleteMany({})
  await prisma.test_attempts.deleteMany({})
  await prisma.tests.deleteMany({})

  // IELTS Academic Practice Test
  const ieltsTest = await prisma.tests.create({
    data: {
      id: randomUUID(),
      title: 'IELTS Academic Practice Test',
      slug: 'ielts-academic-practice-test',
      description: 'Complete IELTS Academic test with Reading, Writing, Listening, and Speaking sections. Prepare for your IELTS exam with this comprehensive practice test.',
      type: 'IELTS',
      duration: 180,
      total_questions: 40,
      passing_score: 65,
      difficulty_level: 'MEDIUM',
      price: 0,
      is_published: true,
      is_free: true,
      instructions: 'This test simulates the actual IELTS Academic exam. You will have 180 minutes to complete all sections. Make sure you have a quiet environment and stable internet connection.',
      tags: ['IELTS', 'Academic', 'English', 'Full Length'],
      updated_at: new Date(),
    },
  })

  // IELTS Reading Section
  const ieltsReadingSection = await prisma.test_sections.create({
    data: {
      id: randomUUID(),
      test_id: ieltsTest.id,
      section_name: 'Reading',
      description: 'Academic Reading section with 3 passages',
      order_index: 1,
      question_count: 10,
      time_limit: 60,
      instructions: 'Read the passages carefully and answer all questions.',
    },
  })

  // IELTS Reading Questions
  const readingQuestions = [
    {
      question_text: 'According to the passage, what is the primary cause of climate change?',
      options: {
        A: 'Natural weather patterns',
        B: 'Human industrial activity',
        C: 'Volcanic eruptions',
        D: 'Solar radiation changes',
      },
      correct_answer: 'B',
      explanation: 'The passage clearly states that human industrial activity is the primary driver of modern climate change.',
    },
    {
      question_text: 'The author suggests that renewable energy sources are:',
      options: {
        A: 'Too expensive for widespread adoption',
        B: 'A viable alternative to fossil fuels',
        C: 'Only suitable for small-scale use',
        D: 'Less efficient than nuclear power',
      },
      correct_answer: 'B',
      explanation: 'The text emphasizes the viability of renewable energy as a replacement for fossil fuels.',
    },
    {
      question_text: 'What does the word "mitigation" mean in paragraph 3?',
      options: {
        A: 'Elimination',
        B: 'Reduction',
        C: 'Analysis',
        D: 'Acceleration',
      },
      correct_answer: 'B',
      explanation: 'In context, mitigation refers to reducing the severity of climate change impacts.',
    },
    {
      question_text: 'According to the passage, which country leads in solar energy production?',
      options: {
        A: 'United States',
        B: 'Germany',
        C: 'China',
        D: 'Japan',
      },
      correct_answer: 'C',
      explanation: 'The passage indicates China is the leading producer of solar energy.',
    },
    {
      question_text: 'The passage suggests that carbon emissions need to be reduced by what percentage by 2030?',
      options: {
        A: '25%',
        B: '45%',
        C: '60%',
        D: '75%',
      },
      correct_answer: 'B',
      explanation: 'The text specifically mentions a 45% reduction target by 2030.',
    },
    {
      question_text: 'What is the main purpose of the passage?',
      options: {
        A: 'To criticize government policies',
        B: 'To inform about climate change solutions',
        C: 'To promote renewable energy companies',
        D: 'To explain scientific research methods',
      },
      correct_answer: 'B',
      explanation: 'The primary purpose is to inform readers about various solutions to climate change.',
    },
    {
      question_text: 'According to the author, what role do forests play in climate regulation?',
      options: {
        A: 'They reflect sunlight',
        B: 'They absorb carbon dioxide',
        C: 'They create rainfall',
        D: 'They cool the atmosphere directly',
      },
      correct_answer: 'B',
      explanation: 'The passage explains that forests act as carbon sinks by absorbing CO2.',
    },
    {
      question_text: 'The passage indicates that electric vehicles will become mainstream by:',
      options: {
        A: '2025',
        B: '2030',
        C: '2035',
        D: '2040',
      },
      correct_answer: 'C',
      explanation: 'The text projects that electric vehicles will achieve mainstream adoption by 2035.',
    },
    {
      question_text: 'What challenge does the passage mention regarding wind energy?',
      options: {
        A: 'High maintenance costs',
        B: 'Intermittent power generation',
        C: 'Environmental impact on birds',
        D: 'Limited suitable locations',
      },
      correct_answer: 'B',
      explanation: 'The passage discusses the challenge of intermittent power generation from wind sources.',
    },
    {
      question_text: 'The author\'s tone throughout the passage can best be described as:',
      options: {
        A: 'Pessimistic and alarming',
        B: 'Neutral and informative',
        C: 'Optimistic and encouraging',
        D: 'Critical and judgmental',
      },
      correct_answer: 'C',
      explanation: 'The overall tone is optimistic, emphasizing solutions and positive developments.',
    },
  ]

  for (let i = 0; i < readingQuestions.length; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: ieltsTest.id,
        section_id: ieltsReadingSection.id,
        question_text: readingQuestions[i].question_text,
        question_type: 'MULTIPLE_CHOICE',
        options: readingQuestions[i].options,
        correct_answer: readingQuestions[i].correct_answer,
        explanation: readingQuestions[i].explanation,
        points: 1,
        difficulty: 'MEDIUM',
        tags: ['reading', 'comprehension'],
        order_index: i + 1,
        updated_at: new Date(),
      },
    })
  }

  // TOEFL iBT Practice Test
  const toeflTest = await prisma.tests.create({
    data: {
      id: randomUUID(),
      title: 'TOEFL iBT Complete Practice Test',
      slug: 'toefl-ibt-complete-practice-test',
      description: 'Full-length TOEFL iBT practice test covering Reading, Listening, Speaking, and Writing sections to help you prepare for your exam.',
      type: 'TOEFL',
      duration: 240,
      total_questions: 30,
      passing_score: 80,
      difficulty_level: 'HARD',
      price: 29.99,
      is_published: true,
      is_free: false,
      instructions: 'This test follows the official TOEFL iBT format. Ensure you complete all sections within the allotted time. You may use scratch paper for notes.',
      tags: ['TOEFL', 'iBT', 'English Proficiency', 'University Admission'],
      updated_at: new Date(),
    },
  })

  // TOEFL Reading Section
  const toeflReadingSection = await prisma.test_sections.create({
    data: {
      id: randomUUID(),
      test_id: toeflTest.id,
      section_name: 'Reading Comprehension',
      description: 'Academic passages with comprehension questions',
      order_index: 1,
      question_count: 10,
      time_limit: 54,
      instructions: 'Read each passage and answer the questions that follow.',
    },
  })

  const toeflQuestions = [
    {
      question_text: 'What is the main topic of the passage about ancient civilizations?',
      options: {
        A: 'Trade routes in ancient times',
        B: 'The development of writing systems',
        C: 'Agricultural practices',
        D: 'Religious beliefs and practices',
      },
      correct_answer: 'B',
      explanation: 'The passage primarily discusses how writing systems evolved in ancient civilizations.',
    },
    {
      question_text: 'According to the passage, cuneiform was developed by which civilization?',
      options: {
        A: 'Egyptians',
        B: 'Greeks',
        C: 'Sumerians',
        D: 'Romans',
      },
      correct_answer: 'C',
      explanation: 'The text clearly states that cuneiform originated with the Sumerians.',
    },
    {
      question_text: 'The word "intricate" in paragraph 2 is closest in meaning to:',
      options: {
        A: 'Simple',
        B: 'Complex',
        C: 'Ancient',
        D: 'Beautiful',
      },
      correct_answer: 'B',
      explanation: 'Intricate means having many complex details or elements.',
    },
    {
      question_text: 'Why does the author mention hieroglyphics in paragraph 3?',
      options: {
        A: 'To contrast them with cuneiform',
        B: 'To show their superiority',
        C: 'To demonstrate writing evolution',
        D: 'To criticize their complexity',
      },
      correct_answer: 'C',
      explanation: 'Hieroglyphics are mentioned as an example of writing system evolution.',
    },
    {
      question_text: 'Which of the following can be inferred about ancient scribes?',
      options: {
        A: 'They were common in society',
        B: 'They held important positions',
        C: 'They were poorly educated',
        D: 'They only wrote religious texts',
      },
      correct_answer: 'B',
      explanation: 'The passage implies scribes were valued members of society with important roles.',
    },
    {
      question_text: 'According to the passage, what was the primary purpose of early writing?',
      options: {
        A: 'Entertainment',
        B: 'Record keeping',
        C: 'Religious ceremonies',
        D: 'Education',
      },
      correct_answer: 'B',
      explanation: 'Early writing was primarily used for keeping records of transactions and events.',
    },
    {
      question_text: 'The passage suggests that the alphabet was:',
      options: {
        A: 'Invented by the Greeks',
        B: 'A revolutionary simplification',
        C: 'Less effective than pictographs',
        D: 'Difficult to learn',
      },
      correct_answer: 'B',
      explanation: 'The text describes the alphabet as a major simplification of writing systems.',
    },
    {
      question_text: 'What can be concluded about the preservation of ancient texts?',
      options: {
        A: 'All texts have been recovered',
        B: 'Many texts have been lost',
        C: 'Only religious texts survived',
        D: 'Preservation was never attempted',
      },
      correct_answer: 'B',
      explanation: 'The passage indicates that many ancient texts have not survived to modern times.',
    },
    {
      question_text: 'The author\'s attitude toward ancient writing systems is:',
      options: {
        A: 'Critical and dismissive',
        B: 'Respectful and appreciative',
        C: 'Indifferent and neutral',
        D: 'Confused and uncertain',
      },
      correct_answer: 'B',
      explanation: 'The tone shows respect and appreciation for these early innovations.',
    },
    {
      question_text: 'Which statement best summarizes the passage?',
      options: {
        A: 'Ancient writing was primitive and ineffective',
        B: 'Writing systems evolved to meet societal needs',
        C: 'Only educated elite could read ancient texts',
        D: 'Modern writing is superior to ancient systems',
      },
      correct_answer: 'B',
      explanation: 'The passage demonstrates how writing systems developed in response to social requirements.',
    },
  ]

  for (let i = 0; i < toeflQuestions.length; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: toeflTest.id,
        section_id: toeflReadingSection.id,
        question_text: toeflQuestions[i].question_text,
        question_type: 'MULTIPLE_CHOICE',
        options: toeflQuestions[i].options,
        correct_answer: toeflQuestions[i].correct_answer,
        explanation: toeflQuestions[i].explanation,
        points: 1,
        difficulty: 'HARD',
        tags: ['reading', 'comprehension', 'academic'],
        order_index: i + 1,
        updated_at: new Date(),
      },
    })
  }

  // PTE Academic Mock Test
  const pteTest = await prisma.tests.create({
    data: {
      id: randomUUID(),
      title: 'PTE Academic Mock Test',
      slug: 'pte-academic-mock-test',
      description: 'Comprehensive PTE Academic practice test with Speaking, Writing, Reading, and Listening sections.',
      type: 'PTE',
      duration: 120,
      total_questions: 20,
      passing_score: 70,
      difficulty_level: 'MEDIUM',
      price: 19.99,
      is_published: true,
      is_free: false,
      instructions: 'This mock test follows the PTE Academic format. Complete all sections in the given time frame.',
      tags: ['PTE', 'Academic', 'English', 'Computer-based'],
      updated_at: new Date(),
    },
  })

  // PTE Reading Section
  const pteReadingSection = await prisma.test_sections.create({
    data: {
      id: randomUUID(),
      test_id: pteTest.id,
      section_name: 'Reading',
      description: 'Multiple choice and reorder questions',
      order_index: 1,
      question_count: 10,
      time_limit: 32,
      instructions: 'Answer all reading questions carefully.',
    },
  })

  const pteQuestions = [
    {
      question_text: 'Based on the passage about renewable energy, what is the author\'s main argument?',
      options: {
        A: 'Renewable energy is too expensive',
        B: 'Renewable energy is the future',
        C: 'Fossil fuels are better',
        D: 'Nuclear power is safest',
      },
      correct_answer: 'B',
      explanation: 'The author argues that renewable energy represents the future of power generation.',
    },
    {
      question_text: 'What does the passage suggest about solar panel efficiency?',
      options: {
        A: 'It has decreased over time',
        B: 'It remains constant',
        C: 'It has improved significantly',
        D: 'It is not mentioned',
      },
      correct_answer: 'C',
      explanation: 'The passage indicates substantial improvements in solar panel efficiency.',
    },
    {
      question_text: 'The term "sustainable" in the passage refers to:',
      options: {
        A: 'Expensive methods',
        B: 'Long-lasting practices',
        C: 'Government programs',
        D: 'Traditional approaches',
      },
      correct_answer: 'B',
      explanation: 'Sustainable refers to practices that can be maintained over the long term.',
    },
    {
      question_text: 'According to the text, what is a major challenge for wind energy?',
      options: {
        A: 'High costs',
        B: 'Public opposition',
        C: 'Storage capacity',
        D: 'Weather dependence',
      },
      correct_answer: 'D',
      explanation: 'The passage highlights weather dependence as a key challenge for wind power.',
    },
    {
      question_text: 'What comparison does the author make between different energy sources?',
      options: {
        A: 'Cost per kilowatt-hour',
        B: 'Environmental impact',
        C: 'Implementation time',
        D: 'Public preference',
      },
      correct_answer: 'B',
      explanation: 'The author compares energy sources based on their environmental impact.',
    },
    {
      question_text: 'The passage implies that government policies should:',
      options: {
        A: 'Support fossil fuel industry',
        B: 'Incentivize renewable adoption',
        C: 'Remain neutral',
        D: 'Focus on nuclear power',
      },
      correct_answer: 'B',
      explanation: 'The text suggests governments should encourage renewable energy adoption.',
    },
    {
      question_text: 'What evidence does the author provide for climate change?',
      options: {
        A: 'Rising global temperatures',
        B: 'Economic indicators',
        C: 'Political statements',
        D: 'Social media trends',
      },
      correct_answer: 'A',
      explanation: 'Rising temperatures are cited as evidence of climate change.',
    },
    {
      question_text: 'The word "transition" in paragraph 4 most nearly means:',
      options: {
        A: 'Translation',
        B: 'Change',
        C: 'Transportation',
        D: 'Tradition',
      },
      correct_answer: 'B',
      explanation: 'Transition refers to the process of changing from one state to another.',
    },
    {
      question_text: 'According to the passage, which country has been most successful in renewable adoption?',
      options: {
        A: 'United States',
        B: 'Denmark',
        C: 'China',
        D: 'India',
      },
      correct_answer: 'B',
      explanation: 'Denmark is highlighted as a leader in renewable energy adoption.',
    },
    {
      question_text: 'What is the author\'s primary purpose in writing this passage?',
      options: {
        A: 'To entertain readers',
        B: 'To persuade about renewable energy',
        C: 'To describe technical specifications',
        D: 'To criticize current policies',
      },
      correct_answer: 'B',
      explanation: 'The primary purpose is to persuade readers about the benefits of renewable energy.',
    },
  ]

  for (let i = 0; i < pteQuestions.length; i++) {
    await prisma.questions.create({
      data: {
        id: randomUUID(),
        test_id: pteTest.id,
        section_id: pteReadingSection.id,
        question_text: pteQuestions[i].question_text,
        question_type: 'MULTIPLE_CHOICE',
        options: pteQuestions[i].options,
        correct_answer: pteQuestions[i].correct_answer,
        explanation: pteQuestions[i].explanation,
        points: 1,
        difficulty: 'MEDIUM',
        tags: ['reading', 'pte'],
        order_index: i + 1,
        updated_at: new Date(),
      },
    })
  }

  console.log('✅ Successfully seeded 3 complete tests with 30 questions')
  console.log(`✅ IELTS Test ID: ${ieltsTest.id}`)
  console.log(`✅ TOEFL Test ID: ${toeflTest.id}`)
  console.log(`✅ PTE Test ID: ${pteTest.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
