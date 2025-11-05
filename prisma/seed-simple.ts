import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting simple database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.users.upsert({
    where: { email: 'admin@bnoverseas.com' },
    update: {},
    create: {
      id: randomUUID(),
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@bnoverseas.com',
      password_hash: hashedPassword,
      role: 'SUPER_ADMIN',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  // Seed Site Settings
  await prisma.site_settings.upsert({
    where: { id: 'main-settings' },
    update: {},
    create: {
      id: 'main-settings',
      site_name: 'BnOverseas',
      site_tagline: 'Your Gateway to Global Education',
      logo_url: '/logo.png',
      favicon_url: '/favicon.ico',
      primary_color: '#dc2626',
      secondary_color: '#1f2937',
      accent_color: '#3b82f6',
      heading_font: 'Inter',
      body_font: 'Inter',
      font_size: '16px',
      contact_email: 'info@bnoverseas.com',
      contact_phone: '+1-234-567-8900',
      contact_address: '123 Education Street, Learning City, LC 12345',
      facebook_url: 'https://facebook.com/bnoverseas',
      twitter_url: 'https://twitter.com/bnoverseas',
      linkedin_url: 'https://linkedin.com/company/bnoverseas',
      meta_title: 'BnOverseas - Study Abroad Consultancy',
      meta_description: 'Expert guidance for international education. Get assistance with university applications, visa processing, and study abroad programs.',
      google_analytics_id: 'GA-XXXXXXXX-X',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  // Seed Hero Slides
  const heroSlides = [
    {
      title: 'Your Journey to Global Education Starts Here',
      subtitle: 'Study Abroad Consultancy',
      description: 'Expert guidance for international students seeking world-class education opportunities',
      ctaText: 'Get Free Consultation',
      ctaLink: '/consultation',
      backgroundImage: '/hero-education-bg.jpg',
      textColor: '#ffffff',
      overlayColor: '#000000',
      overlayOpacity: 0.4,
      orderIndex: 0,
      isActive: true,
      displayDuration: 5000,
      animationType: 'FADE',
    },
    {
      title: 'Transform Your Future with International Education',
      subtitle: 'World-Class Universities Await',
      description: 'Access top universities in USA, UK, Canada, Australia and more with our expert guidance',
      ctaText: 'Start Your Application',
      ctaLink: '/apply',
      backgroundImage: '/hero-university-bg.jpg',
      textColor: '#ffffff',
      overlayColor: '#1f2937',
      overlayOpacity: 0.5,
      orderIndex: 1,
      isActive: true,
      displayDuration: 5000,
      animationType: 'SLIDE',
    },
  ]

  for (const slide of heroSlides) {
    await prisma.hero_slides.create({
      data: {
        id: randomUUID(),
        ...slide,
        created_at: new Date(),
        updated_at: new Date()
      },
    })
  }

  // Seed Features
  const features = [
    {
      title: 'Expert Counseling',
      description: 'Get personalized guidance from experienced education consultants who understand your goals',
      icon: 'Users',
      iconColor: '#3b82f6',
      orderIndex: 0,
      isActive: true,
      isFeatured: true,
    },
    {
      title: 'University Partnerships',
      description: 'Direct partnerships with 500+ universities worldwide for streamlined applications',
      icon: 'GraduationCap',
      iconColor: '#10b981',
      orderIndex: 1,
      isActive: true,
      isFeatured: true,
    },
    {
      title: 'Visa Assistance',
      description: 'Complete visa processing support with 98% success rate for student visa applications',
      icon: 'FileText',
      iconColor: '#f59e0b',
      orderIndex: 2,
      isActive: true,
      isFeatured: true,
    },
    {
      title: 'Scholarship Support',
      description: 'Expert assistance in finding and applying for scholarships to reduce education costs',
      icon: 'DollarSign',
      iconColor: '#ef4444',
      orderIndex: 3,
      isActive: true,
      isFeatured: true,
    },
  ]

  for (const feature of features) {
    await prisma.features.create({
      data: {
        id: randomUUID(),
        ...feature,
        created_at: new Date(),
        updated_at: new Date()
      },
    })
  }

  // Seed Services
  const services = [
    {
      title: 'On-Demand & Cloud Counselling',
      description: 'Find the best-suited study abroad destination with our experts\' advice.',
      icon: 'FileText',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/counselling',
      orderIndex: 0,
      isActive: true,
      isFeatured: false,
      category: 'Counselling',
    },
    {
      title: 'AI-Powered Program Selection',
      description: 'Connect with programs that best fit your interests and career goals.',
      icon: 'Zap',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/program-selection',
      orderIndex: 1,
      isActive: true,
      isFeatured: false,
      category: 'Technology',
    },
    {
      title: 'Express Admissions Services',
      description: 'Get priority and secure admission with our dedicated team.',
      icon: 'GraduationCap',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/admissions',
      orderIndex: 2,
      isActive: true,
      isFeatured: false,
      category: 'Admissions',
    },
    {
      title: 'Scholarship Guidance',
      description: 'Get guidance from top institutions globally and apply settlement beyond supporting genuine scholarships.',
      icon: 'Users',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/scholarships',
      orderIndex: 3,
      isActive: true,
      isFeatured: false,
      category: 'Financial',
    },
    {
      title: 'Education Loan Assistance',
      description: 'Get assistance with our associated banking partners.',
      icon: 'DollarSign',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/loans',
      orderIndex: 4,
      isActive: true,
      isFeatured: false,
      category: 'Financial',
    },
    {
      title: 'Pre-departure Session',
      description: 'Get ready for your study abroad journey with our pre-departure tips, providing settling into a new university and adjusting to life abroad.',
      icon: 'Plane',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/pre-departure',
      orderIndex: 5,
      isActive: true,
      isFeatured: false,
      category: 'Support',
    },
  ]

  for (const service of services) {
    await prisma.services.create({
      data: {
        id: randomUUID(),
        ...service,
        created_at: new Date(),
        updated_at: new Date()
      },
    })
  }

  // Seed Journey Steps
  const journeySteps = [
    {
      title: 'Research and Explore',
      description: 'Dive into the world of diverse study destinations offering programs that align with your academic background, interests, and career goals.',
      icon: 'Search',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/research',
      orderIndex: 0,
      isActive: true,
      isFeatured: false,
      category: 'Planning',
    },
    {
      title: 'Narrow Down your Options',
      description: 'Determine your ideal university matching with our advanced tools, considering factors like location, specializations, tuition fee, deadlines, scholarships, and more.',
      icon: 'BarChart3',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/university-selection',
      orderIndex: 1,
      isActive: true,
      isFeatured: false,
      category: 'Planning',
    },
    {
      title: 'Profile Evaluation',
      description: 'Prepare a personalized document plan for a holistic application process, highlighting your strengths and maximizing your admission chances.',
      icon: 'User',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/profile-evaluation',
      orderIndex: 2,
      isActive: true,
      isFeatured: false,
      category: 'Assessment',
    },
    {
      title: 'Ace English Proficiency Tests',
      description: 'Achieve competitive scores in English language tests like IELTS, TOEFL, PTE, and Duolingo with our comprehensive test preparation programs.',
      icon: 'FileText',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/test-prep',
      orderIndex: 3,
      isActive: true,
      isFeatured: false,
      category: 'Preparation',
    },
    {
      title: 'Prepare Application Documents',
      description: 'Collect and prepare supporting documents with 100% SOPs, LORs, and essays with professional guidance to make your application stand out.',
      icon: 'Plane',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/documents',
      orderIndex: 4,
      isActive: true,
      isFeatured: false,
      category: 'Application',
    },
    {
      title: 'Submit the Application',
      description: 'Make multiple applications to your chosen institutes, keeping your best fit of the shortlisted universities, ensuring all deadlines are met.',
      icon: 'Building',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/application-submission',
      orderIndex: 5,
      isActive: true,
      isFeatured: false,
      category: 'Application',
    },
    {
      title: 'Visa Guidance',
      description: 'Get comprehensive support with visa documentation and interview preparation to ensure a smooth visa approval process.',
      icon: 'DollarSign',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/visa',
      orderIndex: 6,
      isActive: true,
      isFeatured: false,
      category: 'Immigration',
    },
    {
      title: 'Funding Opportunities',
      description: 'Full support with our wide network of education loan partners and scholarship opportunities to make your education affordable.',
      icon: 'Shield',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/funding',
      orderIndex: 7,
      isActive: true,
      isFeatured: false,
      category: 'Financial',
    },
    {
      title: 'Accommodation Solutions',
      description: 'Secure comfortable and safe accommodation options near your university with our trusted accommodation partners worldwide.',
      icon: 'Home',
      iconType: 'lucide',
      iconColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      ctaText: 'Learn More',
      ctaLink: '/services/accommodation',
      orderIndex: 8,
      isActive: true,
      isFeatured: false,
      category: 'Support',
    },
  ]

  for (const journeyStep of journeySteps) {
    await prisma.journey_steps.create({
      data: {
        id: randomUUID(),
        ...journeyStep,
        created_at: new Date(),
        updated_at: new Date()
      },
    })
  }

  // Seed Statistics
  const statistics = [
    {
      label: 'Students Placed',
      value: '15000',
      suffix: '+',
      icon: 'Users',
      iconColor: '#3b82f6',
      orderIndex: 0,
      isActive: true,
      autoUpdate: true,
      querySource: 'users',
    },
    {
      label: 'University Partners',
      value: '500',
      suffix: '+',
      icon: 'GraduationCap',
      iconColor: '#10b981',
      orderIndex: 1,
      isActive: true,
    },
    {
      label: 'Visa Success Rate',
      value: '98',
      suffix: '%',
      icon: 'CheckCircle',
      iconColor: '#f59e0b',
      orderIndex: 2,
      isActive: true,
    },
    {
      label: 'Countries Covered',
      value: '25',
      suffix: '+',
      icon: 'Globe',
      iconColor: '#ef4444',
      orderIndex: 3,
      isActive: true,
    },
  ]

  for (const stat of statistics) {
    await prisma.statistics.create({
      data: {
        id: randomUUID(),
        ...stat,
        created_at: new Date(),
        updated_at: new Date()
      },
    })
  }

  // Seed Partners
  const partners = [
    {
      name: 'Harvard University',
      logoUrl: '/partners/harvard-logo.png',
      websiteUrl: 'https://harvard.edu',
      country: 'USA',
      partnerType: 'university',
      description: 'Prestigious Ivy League university known for excellence in education and research',
      isActive: true,
      isFeatured: true,
      orderIndex: 0,
    },
    {
      name: 'Oxford University',
      logoUrl: '/partners/oxford-logo.png',
      websiteUrl: 'https://oxford.ac.uk',
      country: 'UK',
      partnerType: 'university',
      description: 'One of the oldest and most prestigious universities in the world',
      isActive: true,
      isFeatured: true,
      orderIndex: 1,
    },
    {
      name: 'University of Toronto',
      logoUrl: '/partners/toronto-logo.png',
      websiteUrl: 'https://utoronto.ca',
      country: 'Canada',
      partnerType: 'university',
      description: 'Leading Canadian research university with global recognition',
      isActive: true,
      isFeatured: true,
      orderIndex: 2,
    },
    {
      name: 'University of Melbourne',
      logoUrl: '/partners/melbourne-logo.png',
      websiteUrl: 'https://unimelb.edu.au',
      country: 'Australia',
      partnerType: 'university',
      description: 'Top-ranked Australian university with excellent research facilities',
      isActive: true,
      isFeatured: true,
      orderIndex: 3,
    },
  ]

  for (const partner of partners) {
    await prisma.partners.create({
      data: {
        id: randomUUID(),
        ...partner,
        created_at: new Date(),
        updated_at: new Date()
      },
    })
  }

  // Seed Countries (matching the actual schema)
  const countries = [
    {
      name: 'United States',
      code: 'US',
      description: 'The United States offers world-class education with diverse programs and top universities.',
      flagUrl: '/flags/usa-flag.jpg',
      universities: ['Harvard University', 'MIT', 'Stanford University', 'Yale University'],
      programs: ['Computer Science', 'Business Administration', 'Engineering', 'Medicine'],
      requirements: {
        'academic': 'SAT/ACT scores, High School Diploma',
        'language': 'TOEFL/IELTS',
        'documents': 'Letters of recommendation, Essays'
      },
      livingCost: {
        'average': '$10,000 - $15,000 per year',
        'accommodation': '$6,000 - $12,000',
        'food': '$2,500 - $4,000'
      },
      scholarships: ['Fulbright Scholarship', 'Merit-based scholarships'],
      workRights: {
        'during_studies': 'CPT allowed',
        'after_graduation': 'OPT - 12-36 months'
      },
      intake: ['Fall (September)', 'Spring (January)', 'Summer (May)'],
      isPopular: true,
      isActive: true,
    },
    {
      name: 'United Kingdom',
      code: 'GB',
      description: 'The UK provides world-renowned education with a rich academic heritage.',
      flagUrl: '/flags/uk-flag.jpg',
      universities: ['Oxford University', 'Cambridge University', 'Imperial College London'],
      programs: ['Business', 'Engineering', 'Law', 'Medicine', 'Arts & Humanities'],
      requirements: {
        'academic': 'A-levels or equivalent',
        'language': 'IELTS/TOEFL'
      },
      livingCost: {
        'average': '£12,000 - £15,000 per year'
      },
      scholarships: ['Chevening Scholarship', 'Commonwealth Scholarship'],
      workRights: {
        'during_studies': '20 hours per week allowed'
      },
      intake: ['September', 'January'],
      isPopular: true,
      isActive: true,
    },
    {
      name: 'Canada',
      code: 'CA',
      description: 'Canada offers high-quality education in a safe, multicultural environment.',
      flagUrl: '/flags/canada-flag.jpg',
      universities: ['University of Toronto', 'McGill University', 'University of British Columbia'],
      programs: ['Computer Science', 'Engineering', 'Business', 'Healthcare'],
      requirements: {
        'academic': 'High school diploma',
        'language': 'IELTS/TOEFL'
      },
      livingCost: {
        'average': 'CAD $10,000 - $12,000 per year'
      },
      scholarships: ['Vanier Canada Graduate Scholarships'],
      workRights: {
        'during_studies': '20 hours per week',
        'after_graduation': 'PGWP available'
      },
      intake: ['Fall (September)', 'Winter (January)', 'Summer (May)'],
      isPopular: true,
      isActive: true,
    },
    {
      name: 'Australia',
      code: 'AU',
      description: 'Australia provides excellent education with a focus on practical learning and research.',
      flagUrl: '/flags/australia-flag.jpg',
      universities: ['University of Melbourne', 'University of Sydney', 'Australian National University'],
      programs: ['Engineering', 'Business', 'IT', 'Healthcare', 'Environmental Science'],
      requirements: {
        'academic': 'Year 12 or equivalent',
        'language': 'IELTS/TOEFL'
      },
      livingCost: {
        'average': 'AUD $18,000 - $20,000 per year'
      },
      scholarships: ['Australia Awards', 'Endeavour Scholarships'],
      workRights: {
        'during_studies': '20 hours per week allowed'
      },
      intake: ['February', 'July'],
      isPopular: true,
      isActive: true,
    },
  ]

  for (const country of countries) {
    await prisma.countries.upsert({
      where: { name: country.name },
      update: {
        ...country,
        updated_at: new Date()
      },
      create: {
        id: randomUUID(),
        ...country,
        created_at: new Date(),
        updated_at: new Date()
      },
    })
  }

  // Seed Testimonials
  const testimonials = [
    {
      student_name: 'Sarah Johnson',
      program: 'Masters in Computer Science',
      university: 'University of Toronto, Canada',
      country: 'Canada',
      image_url: '/testimonials/sarah-johnson.jpg',
      rating: 5,
      content: 'BnOverseas made my dream of studying in Canada a reality. Their counselors were incredibly supportive throughout the entire process.',
      is_published: true,
      is_featured: true,
      position: 0,
    },
    {
      student_name: 'Raj Patel',
      program: 'MBA',
      university: 'Harvard Business School, USA',
      country: 'USA',
      image_url: '/testimonials/raj-patel.jpg',
      rating: 5,
      content: 'The team at BnOverseas provided exceptional guidance for my MBA application. Their expertise helped me secure significant funding.',
      is_published: true,
      is_featured: true,
      position: 1,
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonials.upsert({
      where: { id: `testimonial-${testimonial.student_name.toLowerCase().replace(' ', '-')}` },
      update: {
        ...testimonial,
        updated_at: new Date()
      },
      create: {
        id: `testimonial-${testimonial.student_name.toLowerCase().replace(' ', '-')}`,
        ...testimonial,
        created_at: new Date(),
        updated_at: new Date()
      },
    })
  }

  // Note: Menu models not implemented yet - skipping menu seeding

  console.log('Database seeding completed successfully!')
  console.log('Created:')
  console.log('- 1 admin user (admin@bnoverseas.com / admin123)')
  console.log('- Site settings configuration')
  console.log('- 2 hero slides')
  console.log('- 4 features')
  console.log('- 6 services')
  console.log('- 9 journey steps')
  console.log('- 4 statistics')
  console.log('- 4 university partners')
  console.log('- 4 countries')
  console.log('- 2 testimonials')
  console.log('- (Menu items skipped - model not implemented)')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })