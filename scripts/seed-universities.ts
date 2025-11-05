import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed universities and programs...')

  // Delete existing data
  await prisma.programs.deleteMany()
  await prisma.universities.deleteMany()
  console.log('Cleared existing data')

  // Create Universities
  const harvard = await prisma.universities.create({
    data: {
      name: 'Harvard University',
      slug: 'harvard-university',
      country: 'United States',
      city: 'Cambridge',
      state: 'Massachusetts',
      address: 'Massachusetts Hall, Cambridge, MA 02138',
      postal_code: '02138',
      logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Harvard_shield_wreath.svg/1200px-Harvard_shield_wreath.svg.png',
      banner_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200',
      website: 'https://www.harvard.edu',
      email: 'admissions@harvard.edu',
      phone: '+1-617-495-1000',
      description: 'Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636, it is the oldest institution of higher learning in the United States.',
      about: '<p>Harvard University is devoted to excellence in teaching, learning, and research, and to developing leaders who make a difference globally.</p>',
      facilities: ['Libraries', 'Research Labs', 'Sports Complex', 'Museums', 'Medical Center'],
      type: 'Private',
      established_year: 1636,
      accreditation: 'New England Commission of Higher Education',
      ranking_national: 1,
      ranking_world: 1,
      student_count: 23000,
      international_students: 5000,
      acceptance_rate: 4.5,
      avg_tuition_fee: '57261',
      currency: 'USD',
      campus_size: '209 acres',
      departments: ['Arts & Sciences', 'Business', 'Law', 'Medicine', 'Engineering'],
      notable_alumni: ['Barack Obama', 'Mark Zuckerberg', 'Bill Gates'],
      partnerships: ['MIT', 'Stanford', 'Oxford University'],
      admission_requirements: 'Strong academic record, SAT/ACT scores, recommendations, essays',
      application_deadline: 'January 1st',
      language_requirement: 'TOEFL 100 or IELTS 7.0',
      is_featured: true,
      is_published: true,
    },
  })
  console.log(`Created university: ${harvard.name}`)

  const stanford = await prisma.universities.create({
    data: {
      name: 'Stanford University',
      slug: 'stanford-university',
      country: 'United States',
      city: 'Stanford',
      state: 'California',
      website: 'https://www.stanford.edu',
      email: 'admission@stanford.edu',
      phone: '+1-650-723-2300',
      description: 'Stanford University is a private research university in Stanford, California. Known for its academic strength, entrepreneurial spirit, and proximity to Silicon Valley.',
      type: 'Private',
      established_year: 1885,
      ranking_national: 3,
      ranking_world: 3,
      student_count: 17000,
      international_students: 3800,
      acceptance_rate: 3.9,
      avg_tuition_fee: '58416',
      currency: 'USD',
      campus_size: '8,180 acres',
      departments: ['Engineering', 'Business', 'Medicine', 'Law', 'Humanities'],
      facilities: ['Innovation Labs', 'Sports Facilities', 'Research Centers'],
      is_published: true,
    },
  })
  console.log(`Created university: ${stanford.name}`)

  const toronto = await prisma.universities.create({
    data: {
      name: 'University of Toronto',
      slug: 'university-of-toronto',
      country: 'Canada',
      city: 'Toronto',
      state: 'Ontario',
      website: 'https://www.utoronto.ca',
      email: 'admissions@utoronto.ca',
      phone: '+1-416-978-2011',
      description: 'The University of Toronto is a public research university in Toronto, Ontario, Canada, and one of the most prestigious universities in the world.',
      type: 'Public',
      established_year: 1827,
      ranking_national: 1,
      ranking_world: 18,
      student_count: 91000,
      international_students: 23000,
      acceptance_rate: 43.0,
      avg_tuition_fee: '45690',
      currency: 'CAD',
      departments: ['Arts & Science', 'Engineering', 'Medicine', 'Law', 'Business'],
      facilities: ['Libraries', 'Research Institutes', 'Athletic Facilities'],
      is_featured: true,
      is_published: true,
    },
  })
  console.log(`Created university: ${toronto.name}`)

  // Create Programs
  await prisma.programs.create({
    data: {
      university_id: harvard.id,
      name: 'Bachelor of Computer Science',
      slug: 'harvard-bachelor-computer-science',
      degree_type: 'Bachelor',
      discipline: 'Computer Science',
      specialization: 'Artificial Intelligence',
      duration_years: 4,
      duration_months: 48,
      intake_months: ['September'],
      description: 'A comprehensive undergraduate program in computer science with focus on AI, machine learning, and software engineering.',
      overview: '<p>This program provides a strong foundation in computer science principles, programming, algorithms, and modern computing technologies.</p>',
      curriculum: '<p>Core courses include Data Structures, Algorithms, Computer Systems, AI, Machine Learning, Software Engineering.</p>',
      career_opportunities: '<p>Graduates work at top tech companies like Google, Facebook, Microsoft, or pursue graduate studies.</p>',
      tuition_fee: '57261',
      application_fee: '75',
      currency: 'USD',
      scholarship_available: true,
      scholarship_details: 'Merit-based and need-based scholarships available',
      hostel_available: true,
      hostel_fee: '18000',
      living_cost_min: '15000',
      living_cost_max: '25000',
      total_seats: 100,
      international_seats: 20,
      language_requirement: 'TOEFL 100 or IELTS 7.0',
      min_gpa: 3.8,
      entrance_exam: 'SAT',
      work_permit: true,
      pr_pathway: false,
      internship_included: true,
      online_available: false,
      requirements: 'High school diploma with strong math and science background',
      documents_needed: ['Transcript', 'SAT Scores', 'Essays', 'Recommendations'],
      job_prospects: ['Software Engineer', 'Data Scientist', 'AI Engineer'],
      average_salary: '120000',
      tags: ['CS', 'AI', 'Technology', 'STEM'],
      is_featured: true,
      is_published: true,
    },
  })
  console.log('Created program: Harvard CS')

  await prisma.programs.create({
    data: {
      university_id: harvard.id,
      name: 'Master of Business Administration (MBA)',
      slug: 'harvard-mba',
      degree_type: 'Master',
      discipline: 'Business',
      duration_years: 2,
      duration_months: 24,
      intake_months: ['September'],
      description: 'Harvard Business School MBA program - one of the most prestigious business programs in the world.',
      tuition_fee: '73440',
      currency: 'USD',
      scholarship_available: true,
      total_seats: 900,
      international_seats: 350,
      language_requirement: 'TOEFL 109 or IELTS 7.5',
      min_gpa: 3.5,
      entrance_exam: 'GMAT or GRE',
      job_prospects: ['Management Consultant', 'Investment Banker', 'CEO', 'Entrepreneur'],
      average_salary: '150000',
      is_featured: true,
      is_published: true,
    },
  })
  console.log('Created program: Harvard MBA')

  await prisma.programs.create({
    data: {
      university_id: stanford.id,
      name: 'Bachelor of Engineering in Electrical Engineering',
      slug: 'stanford-bachelor-electrical-engineering',
      degree_type: 'Bachelor',
      discipline: 'Engineering',
      specialization: 'Electrical & Electronics',
      duration_years: 4,
      intake_months: ['September'],
      description: 'Top-ranked electrical engineering program focusing on circuits, systems, and signal processing.',
      tuition_fee: '58416',
      currency: 'USD',
      scholarship_available: true,
      total_seats: 120,
      work_permit: true,
      internship_included: true,
      is_published: true,
    },
  })
  console.log('Created program: Stanford EE')

  await prisma.programs.create({
    data: {
      university_id: stanford.id,
      name: 'Master of Science in Data Science',
      slug: 'stanford-ms-data-science',
      degree_type: 'Master',
      discipline: 'Computer Science',
      specialization: 'Data Science',
      duration_years: 1.5,
      intake_months: ['September', 'January'],
      description: 'Advanced data science program covering machine learning, big data analytics, and statistical modeling.',
      tuition_fee: '61875',
      currency: 'USD',
      total_seats: 80,
      international_seats: 30,
      job_prospects: ['Data Scientist', 'ML Engineer', 'Data Analyst'],
      average_salary: '135000',
      is_published: true,
    },
  })
  console.log('Created program: Stanford Data Science')

  await prisma.programs.create({
    data: {
      university_id: toronto.id,
      name: 'Bachelor of Arts in Economics',
      slug: 'toronto-bachelor-economics',
      degree_type: 'Bachelor',
      discipline: 'Social Sciences',
      specialization: 'Economics',
      duration_years: 4,
      intake_months: ['September'],
      description: 'Comprehensive economics program covering micro and macroeconomics, econometrics, and economic policy.',
      tuition_fee: '58160',
      currency: 'CAD',
      scholarship_available: true,
      hostel_available: true,
      hostel_fee: '14000',
      living_cost_min: '15000',
      living_cost_max: '20000',
      work_permit: true,
      pr_pathway: true,
      is_published: true,
    },
  })
  console.log('Created program: Toronto Economics')

  await prisma.programs.create({
    data: {
      university_id: toronto.id,
      name: 'Master of Engineering in Civil Engineering',
      slug: 'toronto-meng-civil-engineering',
      degree_type: 'Master',
      discipline: 'Engineering',
      specialization: 'Civil Engineering',
      duration_years: 2,
      intake_months: ['September', 'January', 'May'],
      description: 'Advanced civil engineering program focusing on infrastructure, structures, and sustainable design.',
      tuition_fee: '45690',
      currency: 'CAD',
      work_permit: true,
      pr_pathway: true,
      internship_included: true,
      is_featured: true,
      is_published: true,
    },
  })
  console.log('Created program: Toronto Civil Engineering')

  console.log('\n✅ Seeding completed successfully!')
  console.log(`Total Universities: 3`)
  console.log(`Total Programs: 6`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
