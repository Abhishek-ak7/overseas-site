import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting comprehensive database seeding...')

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
      site_name: 'BN Overseas',
      site_tagline: 'Your Gateway to Global Education',
      site_description: 'Expert guidance for international education. Get assistance with university applications, visa processing, and study abroad programs worldwide.',
      logo_url: '/bnoverseas-logo.webp',
      favicon_url: '/favicon.ico',
      primary_color: '#dc2626',
      secondary_color: '#1f2937',
      accent_color: '#3b82f6',
      heading_font: 'Inter',
      body_font: 'Inter',
      font_size: '16px',
      contact_email: 'info@bnoverseas.com',
      contact_phone: '+1 (555) 123-4567',
      contact_address: '123 Education Street, Learning City, LC 12345',
      facebook_url: 'https://facebook.com/bnoverseas',
      twitter_url: 'https://twitter.com/bnoverseas',
      linkedin_url: 'https://linkedin.com/company/bnoverseas',
      instagram_url: 'https://instagram.com/bnoverseas',
      youtube_url: 'https://youtube.com/@bnoverseas',
      meta_title: 'BN Overseas - Study Abroad Consultancy | International Education',
      meta_description: 'Expert guidance for international education. Get assistance with university applications, visa processing, and study abroad programs worldwide.',
      google_analytics_id: 'GA-XXXXXXXX-X',
      copyright_text: '© 2024 BN Overseas. All rights reserved.',
      footer_text: 'Your trusted partner for international education.',
      from_email: 'noreply@bnoverseas.com',
      from_name: 'BN Overseas',
      reply_to_email: 'info@bnoverseas.com',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  // Seed Hero Slides
  const heroSlides = [
    {
      title: 'Your Journey to Global Education Starts Here',
      subtitle: 'Study Abroad Consultancy',
      description: 'Expert guidance for international students seeking world-class education opportunities across top universities worldwide.',
      cta_text: 'Get Free Consultation',
      cta_link: '/consultation',
      secondary_cta_text: 'Explore Programs',
      secondary_cta_link: '/programs',
      background_image: '/hero-education-bg.jpg',
      text_color: '#ffffff',
      overlay_color: '#000000',
      overlay_opacity: 0.4,
      order_index: 0,
      is_active: true,
      display_duration: 5000,
      animation_type: 'fade',
    },
    {
      title: 'Transform Your Future with International Education',
      subtitle: 'World-Class Universities Await',
      description: 'Access top universities in USA, UK, Canada, Australia and more with our expert guidance and comprehensive support.',
      cta_text: 'Start Your Application',
      cta_link: '/apply',
      secondary_cta_text: 'View Universities',
      secondary_cta_link: '/universities',
      background_image: '/hero-university-bg.jpg',
      text_color: '#ffffff',
      overlay_color: '#1f2937',
      overlay_opacity: 0.5,
      order_index: 1,
      is_active: true,
      display_duration: 5000,
      animation_type: 'slide',
    },
    {
      title: 'Scholarship Opportunities Available',
      subtitle: 'Funding Your Dreams',
      description: 'Get assistance with scholarship applications and financial aid to make your international education affordable and accessible.',
      cta_text: 'Find Scholarships',
      cta_link: '/scholarships',
      secondary_cta_text: 'Calculate Costs',
      secondary_cta_link: '/cost-calculator',
      background_image: '/hero-scholarship-bg.jpg',
      text_color: '#ffffff',
      overlay_color: '#dc2626',
      overlay_opacity: 0.3,
      order_index: 2,
      is_active: true,
      display_duration: 5000,
      animation_type: 'zoom',
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

  // Seed Features (Why Choose Us section)
  const features = [
    {
      title: 'Expert Counselors',
      description: 'Our certified education consultants have years of experience helping students achieve their study abroad goals.',
      icon: 'Users',
      icon_type: 'lucide',
      icon_color: '#3b82f6',
      background_color: '#ffffff',
      cta_text: 'Meet Our Team',
      cta_link: '/about',
      order_index: 0,
      is_active: true,
      is_featured: true,
      category: 'team'
    },
    {
      title: 'High Success Rate',
      description: 'With a proven track record of 98% visa success rate, we ensure your application gets approved.',
      icon: 'Award',
      icon_type: 'lucide',
      icon_color: '#10b981',
      background_color: '#ffffff',
      cta_text: 'View Success Stories',
      cta_link: '/testimonials',
      order_index: 1,
      is_active: true,
      is_featured: true,
      category: 'success'
    },
    {
      title: 'Global University Network',
      description: 'Partner with 1000+ universities worldwide offering diverse programs across all study levels.',
      icon: 'Globe',
      icon_type: 'lucide',
      icon_color: '#f59e0b',
      background_color: '#ffffff',
      cta_text: 'Explore Universities',
      cta_link: '/universities',
      order_index: 2,
      is_active: true,
      is_featured: true,
      category: 'network'
    },
    {
      title: 'Personalized Support',
      description: 'Every student receives dedicated one-on-one guidance tailored to their unique goals and circumstances.',
      icon: 'Heart',
      icon_type: 'lucide',
      icon_color: '#ef4444',
      background_color: '#ffffff',
      cta_text: 'Book Consultation',
      cta_link: '/consultation',
      order_index: 3,
      is_active: true,
      is_featured: true,
      category: 'support'
    },
    {
      title: 'Fast Processing',
      description: 'Quick turnaround times for applications and visa processing to meet your admission deadlines.',
      icon: 'Clock',
      icon_type: 'lucide',
      icon_color: '#8b5cf6',
      background_color: '#ffffff',
      cta_text: 'Learn More',
      cta_link: '/services',
      order_index: 4,
      is_active: true,
      is_featured: false,
      category: 'efficiency'
    },
    {
      title: 'Secure & Reliable',
      description: 'Your personal information and documents are protected with bank-level security protocols.',
      icon: 'Shield',
      icon_type: 'lucide',
      icon_color: '#06b6d4',
      background_color: '#ffffff',
      cta_text: 'Privacy Policy',
      cta_link: '/privacy',
      order_index: 5,
      is_active: true,
      is_featured: false,
      category: 'security'
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
      title: 'University Selection',
      description: 'Get personalized university recommendations based on your academic profile, career goals, and preferences.',
      icon: 'GraduationCap',
      icon_type: 'lucide',
      icon_color: '#3b82f6',
      background_color: '#ffffff',
      cta_text: 'Find Universities',
      cta_link: '/universities',
      order_index: 0,
      is_active: true,
      is_featured: true,
      category: 'guidance'
    },
    {
      title: 'Application Support',
      description: 'Complete assistance with university applications, including document preparation and submission.',
      icon: 'FileText',
      icon_type: 'lucide',
      icon_color: '#10b981',
      background_color: '#ffffff',
      cta_text: 'Start Application',
      cta_link: '/apply',
      order_index: 1,
      is_active: true,
      is_featured: true,
      category: 'application'
    },
    {
      title: 'Visa Assistance',
      description: 'Expert guidance through visa application and interview preparation with high success rates.',
      icon: 'Plane',
      icon_type: 'lucide',
      icon_color: '#f59e0b',
      background_color: '#ffffff',
      cta_text: 'Visa Services',
      cta_link: '/visa',
      order_index: 2,
      is_active: true,
      is_featured: true,
      category: 'visa'
    },
    {
      title: 'Test Preparation',
      description: 'Comprehensive training for IELTS, TOEFL, GRE, GMAT and other standardized tests.',
      icon: 'BookOpen',
      icon_type: 'lucide',
      icon_color: '#ef4444',
      background_color: '#ffffff',
      cta_text: 'Test Prep',
      cta_link: '/test-prep',
      order_index: 3,
      is_active: true,
      is_featured: true,
      category: 'preparation'
    },
    {
      title: 'Scholarship Guidance',
      description: 'Expert assistance in finding and applying for scholarships to reduce education costs.',
      icon: 'DollarSign',
      icon_type: 'lucide',
      icon_color: '#8b5cf6',
      background_color: '#ffffff',
      cta_text: 'Find Scholarships',
      cta_link: '/scholarships',
      order_index: 4,
      is_active: true,
      is_featured: true,
      category: 'financial'
    },
    {
      title: 'Pre-Departure Support',
      description: 'Comprehensive orientation and support to prepare you for life in your destination country.',
      icon: 'MapPin',
      icon_type: 'lucide',
      icon_color: '#06b6d4',
      background_color: '#ffffff',
      cta_text: 'Pre-Departure',
      cta_link: '/pre-departure',
      order_index: 5,
      is_active: true,
      is_featured: false,
      category: 'support'
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
      title: 'Free Consultation',
      description: 'Start with a personalized consultation to understand your goals, preferences, and academic background.',
      icon: 'Users',
      icon_type: 'lucide',
      icon_color: '#3b82f6',
      background_color: '#ffffff',
      cta_text: 'Book Now',
      cta_link: '/consultation',
      order_index: 0,
      is_active: true,
      is_featured: true,
      category: 'consultation'
    },
    {
      title: 'University Selection',
      description: 'Get expert guidance to choose the best universities that match your profile and career aspirations.',
      icon: 'Building',
      icon_type: 'lucide',
      icon_color: '#10b981',
      background_color: '#ffffff',
      cta_text: 'Explore',
      cta_link: '/universities',
      order_index: 1,
      is_active: true,
      is_featured: true,
      category: 'selection'
    },
    {
      title: 'Document Preparation',
      description: 'Professional assistance with SOPs, LORs, essays, and all required documents for your applications.',
      icon: 'FileText',
      icon_type: 'lucide',
      icon_color: '#8b5cf6',
      background_color: '#ffffff',
      cta_text: 'Get Help',
      cta_link: '/documents',
      order_index: 2,
      is_active: true,
      is_featured: true,
      category: 'documentation'
    },
    {
      title: 'Test Preparation',
      description: 'Achieve your target scores in IELTS, TOEFL, GRE, GMAT with our comprehensive test prep programs.',
      icon: 'Award',
      icon_type: 'lucide',
      icon_color: '#f59e0b',
      background_color: '#ffffff',
      cta_text: 'Start Prep',
      cta_link: '/test-prep',
      order_index: 3,
      is_active: true,
      is_featured: true,
      category: 'preparation'
    },
    {
      title: 'Application Submission',
      description: 'Submit your applications to multiple universities with our expert review and deadline tracking.',
      icon: 'Plane',
      icon_type: 'lucide',
      icon_color: '#ef4444',
      background_color: '#ffffff',
      cta_text: 'Apply Now',
      cta_link: '/apply',
      order_index: 4,
      is_active: true,
      is_featured: true,
      category: 'application'
    },
    {
      title: 'Visa Assistance',
      description: 'Complete visa support including documentation, interview preparation, and application tracking.',
      icon: 'Shield',
      icon_type: 'lucide',
      icon_color: '#06b6d4',
      background_color: '#ffffff',
      cta_text: 'Get Support',
      cta_link: '/visa',
      order_index: 5,
      is_active: true,
      is_featured: true,
      category: 'visa'
    },
    {
      title: 'Scholarship & Funding',
      description: 'Maximize your funding opportunities with scholarship applications and education loan assistance.',
      icon: 'DollarSign',
      icon_type: 'lucide',
      icon_color: '#10b981',
      background_color: '#ffffff',
      cta_text: 'Find Funding',
      cta_link: '/scholarships',
      order_index: 6,
      is_active: true,
      is_featured: false,
      category: 'funding'
    },
    {
      title: 'Pre-Departure Support',
      description: 'Complete preparation for your journey including accommodation, travel, and orientation support.',
      icon: 'Home',
      icon_type: 'lucide',
      icon_color: '#8b5cf6',
      background_color: '#ffffff',
      cta_text: 'Get Ready',
      cta_link: '/pre-departure',
      order_index: 7,
      is_active: true,
      is_featured: false,
      category: 'predeparture'
    },
    {
      title: 'Post-Arrival Assistance',
      description: 'Continued support after you arrive, helping with settlement and academic integration.',
      icon: 'CheckCircle',
      icon_type: 'lucide',
      icon_color: '#f59e0b',
      background_color: '#ffffff',
      cta_text: 'Learn More',
      cta_link: '/post-arrival',
      order_index: 8,
      is_active: true,
      is_featured: false,
      category: 'postarrival'
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
      label: 'Years of Experience',
      value: '29',
      prefix: '',
      suffix: '+',
      icon: 'Calendar',
      icon_color: '#10b981',
      background_color: '#ecfdf5',
      is_animated: true,
      animation_duration: 2000,
      order_index: 0,
      is_active: true,
      category: 'experience',
      auto_update: false,
    },
    {
      label: 'University Options',
      value: '1250',
      prefix: '',
      suffix: '+',
      icon: 'GraduationCap',
      icon_color: '#3b82f6',
      background_color: '#eff6ff',
      is_animated: true,
      animation_duration: 2000,
      order_index: 1,
      is_active: true,
      category: 'universities',
      auto_update: false,
    },
    {
      label: 'Program Options',
      value: '140000',
      prefix: '',
      suffix: '+',
      icon: 'BookOpen',
      icon_color: '#f59e0b',
      background_color: '#fffbeb',
      is_animated: true,
      animation_duration: 2000,
      order_index: 2,
      is_active: true,
      category: 'programs',
      auto_update: false,
    },
    {
      label: 'Students Counselled',
      value: '5',
      prefix: '',
      suffix: ' M+',
      icon: 'Users',
      icon_color: '#ef4444',
      background_color: '#fef2f2',
      is_animated: true,
      animation_duration: 2000,
      order_index: 3,
      is_active: true,
      category: 'students',
      auto_update: false,
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

  // Seed Partners (Universities)
  const partners = [
    {
      name: 'University of Toronto',
      logo_url: '/partners/toronto.jpg',
      website_url: 'https://utoronto.ca',
      country: 'Canada',
      partner_type: 'university',
      description: 'Leading Canadian research university with global recognition and excellent academic programs.',
      ranking: 18,
      established_year: 1827,
      student_count: 97000,
      courses_offered: ['Engineering', 'Medicine', 'Business', 'Computer Science'],
      is_active: true,
      is_featured: true,
      is_preferred: true,
      order_index: 0,
    },
    {
      name: 'Harvard University',
      logo_url: '/partners/harvard.jpg',
      website_url: 'https://harvard.edu',
      country: 'USA',
      partner_type: 'university',
      description: 'Prestigious Ivy League university known for excellence in education and research worldwide.',
      ranking: 2,
      established_year: 1636,
      student_count: 31000,
      courses_offered: ['Medicine', 'Law', 'Business', 'Engineering'],
      is_active: true,
      is_featured: true,
      is_preferred: true,
      order_index: 1,
    },
    {
      name: 'Oxford University',
      logo_url: '/partners/oxford.jpg',
      website_url: 'https://oxford.ac.uk',
      country: 'UK',
      partner_type: 'university',
      description: 'One of the oldest and most prestigious universities in the world with rich academic heritage.',
      ranking: 4,
      established_year: 1096,
      student_count: 24000,
      courses_offered: ['Medicine', 'Engineering', 'Business', 'Arts'],
      is_active: true,
      is_featured: true,
      is_preferred: true,
      order_index: 2,
    },
    {
      name: 'University of Melbourne',
      logo_url: '/partners/melbourne.jpg',
      website_url: 'https://unimelb.edu.au',
      country: 'Australia',
      partner_type: 'university',
      description: 'Top-ranked Australian university with excellent research facilities and diverse programs.',
      ranking: 33,
      established_year: 1853,
      student_count: 50000,
      courses_offered: ['Engineering', 'Medicine', 'Arts', 'Science'],
      is_active: true,
      is_featured: true,
      is_preferred: true,
      order_index: 3,
    },
    {
      name: 'Cambridge University',
      logo_url: '/partners/cambridge.jpg',
      website_url: 'https://cam.ac.uk',
      country: 'UK',
      partner_type: 'university',
      description: 'Historic university known for academic excellence, innovation, and research contributions.',
      ranking: 3,
      established_year: 1209,
      student_count: 23000,
      courses_offered: ['Engineering', 'Computer Science', 'Medicine', 'Mathematics'],
      is_active: true,
      is_featured: true,
      is_preferred: false,
      order_index: 4,
    },
    {
      name: 'MIT',
      logo_url: '/partners/mit.jpg',
      website_url: 'https://mit.edu',
      country: 'USA',
      partner_type: 'university',
      description: 'Leading technology institute with cutting-edge research programs and innovation focus.',
      ranking: 1,
      established_year: 1861,
      student_count: 11000,
      courses_offered: ['Engineering', 'Computer Science', 'Business', 'Architecture'],
      is_active: true,
      is_featured: true,
      is_preferred: false,
      order_index: 5,
    },
    {
      name: 'Stanford University',
      logo_url: '/partners/stanford.jpg',
      website_url: 'https://stanford.edu',
      country: 'USA',
      partner_type: 'university',
      description: 'Premier research university in Silicon Valley known for innovation and entrepreneurship.',
      ranking: 5,
      established_year: 1885,
      student_count: 17000,
      courses_offered: ['Computer Science', 'Engineering', 'Business', 'Medicine'],
      is_active: true,
      is_featured: true,
      is_preferred: false,
      order_index: 6,
    },
    {
      name: 'University of Sydney',
      logo_url: '/partners/sydney.jpg',
      website_url: 'https://sydney.edu.au',
      country: 'Australia',
      partner_type: 'university',
      description: 'Leading Australian university with diverse academic programs and excellent student support.',
      ranking: 40,
      established_year: 1850,
      student_count: 73000,
      courses_offered: ['Business', 'Engineering', 'Medicine', 'Arts'],
      is_active: true,
      is_featured: true,
      is_preferred: false,
      order_index: 7,
    },
    {
      name: 'McGill University',
      logo_url: '/partners/mcgill.jpg',
      website_url: 'https://mcgill.ca',
      country: 'Canada',
      partner_type: 'university',
      description: 'Internationally renowned Canadian research university with strong academic reputation.',
      ranking: 31,
      established_year: 1821,
      student_count: 41000,
      courses_offered: ['Medicine', 'Engineering', 'Business', 'Arts'],
      is_active: true,
      is_featured: true,
      is_preferred: false,
      order_index: 8,
    },
    {
      name: 'Imperial College London',
      logo_url: '/partners/imperial.jpg',
      website_url: 'https://imperial.ac.uk',
      country: 'UK',
      partner_type: 'university',
      description: 'World-leading university in science, engineering, medicine and business with global impact.',
      ranking: 6,
      established_year: 1907,
      student_count: 20000,
      courses_offered: ['Engineering', 'Medicine', 'Science', 'Business'],
      is_active: true,
      is_featured: true,
      is_preferred: false,
      order_index: 9,
    },
    {
      name: 'University of British Columbia',
      logo_url: '/partners/ubc.jpg',
      website_url: 'https://ubc.ca',
      country: 'Canada',
      partner_type: 'university',
      description: 'Top Canadian university with beautiful campus and strong research programs across disciplines.',
      ranking: 46,
      established_year: 1908,
      student_count: 71000,
      courses_offered: ['Engineering', 'Business', 'Science', 'Arts'],
      is_active: true,
      is_featured: true,
      is_preferred: false,
      order_index: 10,
    },
    {
      name: 'Australian National University',
      logo_url: '/partners/anu.jpg',
      website_url: 'https://anu.edu.au',
      country: 'Australia',
      partner_type: 'university',
      description: 'Australia\'s national university with excellence in research and education across all fields.',
      ranking: 27,
      established_year: 1946,
      student_count: 25000,
      courses_offered: ['Science', 'Engineering', 'Business', 'Arts'],
      is_active: true,
      is_featured: true,
      is_preferred: false,
      order_index: 11,
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

  // Seed Countries
  const countries = [
    {
      name: 'United States',
      code: 'US',
      description: 'The United States offers world-class education with diverse programs, cutting-edge research opportunities, and a multicultural environment. Home to many of the world\'s top-ranked universities.',
      flag_url: '/flags/usa-flag.jpg',
      universities: { universities: ['Harvard University', 'MIT', 'Stanford University', 'Yale University', 'Princeton University'] },
      programs: { programs: ['Computer Science', 'Business Administration', 'Engineering', 'Medicine', 'Law'] },
      requirements: {
        academic: 'SAT/ACT scores, High School Diploma',
        language: 'TOEFL/IELTS',
        documents: 'Letters of recommendation, Essays'
      },
      living_cost: {
        average: '$10,000 - $15,000 per year',
        accommodation: '$6,000 - $12,000',
        food: '$2,500 - $4,000',
        transport: '$500 - $1,200'
      },
      scholarships: { scholarships: ['Fulbright Scholarship', 'Merit-based scholarships', 'Athletic scholarships'] },
      work_rights: {
        during_studies: 'CPT - Curricular Practical Training',
        after_graduation: 'OPT - Optional Practical Training (12-36 months)',
        restrictions: '20 hours per week during studies'
      },
      intake: { seasons: ['Fall (September)', 'Spring (January)', 'Summer (May)'] },
      is_popular: true,
      is_active: true,
    },
    {
      name: 'United Kingdom',
      code: 'GB',
      description: 'The UK provides world-renowned education with a rich academic heritage. Known for shorter degree durations and prestigious institutions like Oxford and Cambridge.',
      flag_url: '/flags/uk-flag.jpg',
      universities: { universities: ['Oxford University', 'Cambridge University', 'Imperial College London', 'UCL', 'King\'s College London'] },
      programs: { programs: ['Business', 'Engineering', 'Law', 'Medicine', 'Arts & Humanities'] },
      requirements: {
        academic: 'A-levels or equivalent',
        language: 'IELTS/TOEFL',
        documents: 'Personal statement'
      },
      living_cost: {
        average: '£12,000 - £15,000 per year',
        accommodation: '£6,000 - £10,000',
        food: '£2,000 - £3,000'
      },
      scholarships: { scholarships: ['Chevening Scholarship', 'Commonwealth Scholarship', 'University-specific scholarships'] },
      work_rights: {
        during_studies: '20 hours per week during studies',
        after_graduation: 'Graduate route visa available'
      },
      intake: { seasons: ['September', 'January'] },
      is_popular: true,
      is_active: true,
    },
    {
      name: 'Canada',
      code: 'CA',
      description: 'Canada offers high-quality education in a safe, multicultural environment. Known for affordable tuition fees, post-graduation work opportunities, and pathway to permanent residency.',
      flag_url: '/flags/canada-flag.jpg',
      universities: { universities: ['University of Toronto', 'McGill University', 'University of British Columbia', 'University of Waterloo'] },
      programs: { programs: ['Computer Science', 'Engineering', 'Business', 'Healthcare', 'Natural Resources'] },
      requirements: {
        academic: 'High school diploma',
        language: 'IELTS/TOEFL',
        documents: 'Letters of recommendation'
      },
      living_cost: {
        average: 'CAD $10,000 - $12,000 per year',
        accommodation: 'CAD $6,000 - $8,000',
        food: 'CAD $2,500 - $3,500'
      },
      scholarships: { scholarships: ['Vanier Canada Graduate Scholarships', 'Provincial scholarships', 'University-specific aid'] },
      work_rights: {
        during_studies: '20 hours per week during studies',
        after_graduation: 'PGWP - Post-Graduate Work Permit available'
      },
      intake: { seasons: ['Fall (September)', 'Winter (January)', 'Summer (May)'] },
      is_popular: true,
      is_active: true,
    },
    {
      name: 'Australia',
      code: 'AU',
      description: 'Australia provides excellent education with a focus on practical learning and research. Known for its relaxed lifestyle, beautiful campuses, and strong job prospects.',
      flag_url: '/flags/australia-flag.jpg',
      universities: { universities: ['University of Melbourne', 'University of Sydney', 'Australian National University', 'University of Queensland'] },
      programs: { programs: ['Engineering', 'Business', 'IT', 'Healthcare', 'Environmental Science'] },
      requirements: {
        academic: 'Year 12 or equivalent',
        language: 'IELTS/TOEFL',
        documents: 'Academic transcripts'
      },
      living_cost: {
        average: 'AUD $18,000 - $20,000 per year',
        accommodation: 'AUD $10,000 - $15,000',
        food: 'AUD $3,000 - $4,000'
      },
      scholarships: { scholarships: ['Australia Awards', 'Endeavour Scholarships', 'University-specific scholarships'] },
      work_rights: {
        during_studies: '20 hours per week during studies',
        after_graduation: 'Temporary Graduate visa available'
      },
      intake: { seasons: ['February', 'July'] },
      is_popular: true,
      is_active: true,
    },
    {
      name: 'New Zealand',
      code: 'NZ',
      description: 'New Zealand offers innovative education in a stunning natural environment. Known for research excellence, small class sizes, and welcoming culture.',
      flag_url: '/flags/newzealand-flag.jpg',
      universities: { universities: ['University of Auckland', 'University of Otago', 'Victoria University of Wellington', 'University of Canterbury'] },
      programs: { programs: ['Agriculture', 'Tourism', 'IT', 'Engineering', 'Environmental Studies'] },
      requirements: {
        academic: 'NCEA Level 3 or equivalent',
        language: 'IELTS/TOEFL'
      },
      living_cost: {
        average: 'NZD $15,000 - $18,000 per year'
      },
      scholarships: { scholarships: ['New Zealand International Scholarships', 'University scholarships'] },
      work_rights: {
        during_studies: '20 hours per week during studies'
      },
      intake: { seasons: ['February', 'July'] },
      is_popular: false,
      is_active: true,
    },
    {
      name: 'Germany',
      code: 'DE',
      description: 'Germany offers tuition-free education at public universities with strong focus on research and innovation. Known for engineering, technology, and business programs.',
      flag_url: '/flags/germany-flag.jpg',
      universities: { universities: ['Technical University of Munich', 'University of Heidelberg', 'Humboldt University Berlin', 'RWTH Aachen'] },
      programs: { programs: ['Engineering', 'Computer Science', 'Business', 'Medicine', 'Natural Sciences'] },
      requirements: {
        academic: 'Abitur or equivalent',
        language: 'German language proficiency (some English programs available)'
      },
      living_cost: {
        average: '€8,000 - €12,000 per year'
      },
      scholarships: { scholarships: ['DAAD Scholarships', 'Erasmus+', 'University-specific funding'] },
      work_rights: {
        during_studies: '120 full days or 240 half days per year'
      },
      intake: { seasons: ['October (Winter)', 'April (Summer)'] },
      is_popular: false,
      is_active: true,
    },
    {
      name: 'Ireland',
      code: 'IE',
      description: 'Ireland provides quality education with a friendly culture and strong industry connections. Known for technology, pharmaceuticals, and financial services sectors.',
      flag_url: '/flags/ireland-flag.jpg',
      universities: { universities: ['Trinity College Dublin', 'University College Dublin', 'National University of Ireland Galway', 'Dublin City University'] },
      programs: { programs: ['Computer Science', 'Business', 'Pharmaceuticals', 'Literature', 'Engineering'] },
      requirements: {
        academic: 'Leaving Certificate or equivalent',
        language: 'IELTS/TOEFL for non-native speakers'
      },
      living_cost: {
        average: '€7,000 - €12,000 per year'
      },
      scholarships: { scholarships: ['Government of Ireland Scholarships', 'University scholarships'] },
      work_rights: {
        during_studies: '20 hours per week during studies'
      },
      intake: { seasons: ['September'] },
      is_popular: false,
      is_active: true,
    },
    {
      name: 'Singapore',
      code: 'SG',
      description: 'Singapore offers world-class education in Asia\'s financial hub. Known for its multicultural environment, strong economy, and gateway to Asian markets.',
      flag_url: '/flags/singapore-flag.jpg',
      universities: { universities: ['National University of Singapore', 'Nanyang Technological University', 'Singapore Management University'] },
      programs: { programs: ['Business', 'Engineering', 'Computer Science', 'Finance', 'Biomedical Sciences'] },
      requirements: {
        academic: 'A-levels or equivalent',
        language: 'IELTS/TOEFL',
        tests: 'SAT/GRE for some programs'
      },
      living_cost: {
        average: 'SGD $12,000 - $15,000 per year'
      },
      scholarships: { scholarships: ['Singapore International Graduate Award', 'University scholarships'] },
      work_rights: {
        during_studies: 'Limited part-time work allowed'
      },
      intake: { seasons: ['August'] },
      is_popular: false,
      is_active: true,
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
      content: 'BN Overseas made my dream of studying in Canada a reality. Their expert guidance and support throughout the application process was exceptional. I couldn\'t have done it without them!',
      rating: 5,
      country: 'Canada',
      university: 'University of Toronto',
      program: 'Computer Science',
      image_url: '/young-woman-professional-headshot.png',
      is_published: true,
      is_featured: true,
      position: 0,
    },
    {
      student_name: 'Rajesh Kumar',
      content: 'The team at BN Overseas provided incredible support during my PhD application process. Their attention to detail and personalized approach helped me secure admission to my dream university.',
      rating: 5,
      country: 'USA',
      university: 'Stanford University',
      program: 'Engineering',
      image_url: '/young-man-professional-headshot.png',
      is_published: true,
      is_featured: true,
      position: 1,
    },
    {
      student_name: 'Emily Chen',
      content: 'From university selection to visa approval, BN Overseas handled everything professionally. Their expertise in UK admissions was invaluable. Highly recommended!',
      rating: 5,
      country: 'UK',
      university: 'Oxford University',
      program: 'Business Administration',
      image_url: '/professional-headshot-of-young-asian-woman.jpg',
      is_published: true,
      is_featured: true,
      position: 2,
    },
    {
      student_name: 'David Miller',
      content: 'Studying in Australia seemed impossible until I met the BN Overseas team. They guided me through every step and made the entire process seamless and stress-free.',
      rating: 5,
      country: 'Australia',
      university: 'University of Melbourne',
      program: 'Environmental Science',
      image_url: '/young-man-glasses-headshot.png',
      is_published: true,
      is_featured: true,
      position: 3,
    },
    {
      student_name: 'Priya Sharma',
      content: 'Thanks to BN Overseas, I\'m now pursuing my medical degree at UBC. Their scholarship assistance helped me secure funding, and their counselors were always available for support.',
      rating: 5,
      country: 'Canada',
      university: 'University of British Columbia',
      program: 'Medicine',
      is_published: true,
      is_featured: false,
      position: 4,
    },
    {
      student_name: 'James Wilson',
      content: 'The personalized approach of BN Overseas is what sets them apart. They understood my research interests and helped me find the perfect supervisor and program at Cambridge.',
      rating: 5,
      country: 'UK',
      university: 'Cambridge University',
      program: 'Physics',
      is_published: true,
      is_featured: false,
      position: 5,
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonials.create({
      data: {
        id: randomUUID(),
        ...testimonial,
        created_at: new Date(),
        updated_at: new Date()
      },
    })
  }

  // Seed Menus
  const headerMenu = await prisma.menus.upsert({
    where: { slug: 'header-menu' },
    update: {
      name: 'Header Menu',
      description: 'Main navigation menu displayed in the header',
      location: 'HEADER',
      is_active: true,
    },
    create: {
      name: 'Header Menu',
      slug: 'header-menu',
      description: 'Main navigation menu displayed in the header',
      location: 'HEADER',
      is_active: true,
    },
  })

  const footerMenu = await prisma.menus.upsert({
    where: { slug: 'footer-menu' },
    update: {
      name: 'Footer Menu',
      description: 'Navigation menu displayed in the footer',
      location: 'FOOTER',
      is_active: true,
    },
    create: {
      name: 'Footer Menu',
      slug: 'footer-menu',
      description: 'Navigation menu displayed in the footer',
      location: 'FOOTER',
      is_active: true,
    },
  })

  // Header Menu Items
  const headerMenuItems = [
    {
      label: 'Home',
      url: '/',
      order_index: 0,
      menu_id: headerMenu.id,
    },
    {
      label: 'Study Destinations',
      url: '/destinations',
      order_index: 1,
      menu_id: headerMenu.id,
    },
    {
      label: 'Services',
      url: '/services',
      order_index: 2,
      menu_id: headerMenu.id,
    },
    {
      label: 'Universities',
      url: '/universities',
      order_index: 3,
      menu_id: headerMenu.id,
    },
    {
      label: 'Test Preparation',
      url: '/test-prep',
      order_index: 4,
      menu_id: headerMenu.id,
    },
    {
      label: 'About Us',
      url: '/about',
      order_index: 5,
      menu_id: headerMenu.id,
    },
    {
      label: 'Contact',
      url: '/contact',
      order_index: 6,
      menu_id: headerMenu.id,
    },
  ]

  for (const item of headerMenuItems) {
    await prisma.menu_items.create({
      data: item,
    })
  }

  // Footer Menu Items
  const footerMenuItems = [
    {
      label: 'Privacy Policy',
      url: '/privacy',
      order_index: 0,
      menu_id: footerMenu.id,
    },
    {
      label: 'Terms of Service',
      url: '/terms',
      order_index: 1,
      menu_id: footerMenu.id,
    },
    {
      label: 'Cookie Policy',
      url: '/cookies',
      order_index: 2,
      menu_id: footerMenu.id,
    },
    {
      label: 'Sitemap',
      url: '/sitemap',
      order_index: 3,
      menu_id: footerMenu.id,
    },
  ]

  for (const item of footerMenuItems) {
    await prisma.menu_items.create({
      data: item,
    })
  }

  console.log('✅ Comprehensive database seeding completed successfully!')
  console.log('Created:')
  console.log('📧 1 admin user (admin@bnoverseas.com / admin123)')
  console.log('⚙️  Site settings configuration')
  console.log('🎭 3 hero slides')
  console.log('⭐ 6 features (why choose us)')
  console.log('🔧 6 services')
  console.log('📍 9 journey steps')
  console.log('📊 4 statistics')
  console.log('🏛️  12 university partners')
  console.log('🌍 8 countries')
  console.log('💬 6 testimonials')
  console.log('📱 2 menus with navigation items')
  console.log('')
  console.log('🚀 All homepage sections now have proper seed data!')
  console.log('🔗 Admin panel is fully connected to manage all content.')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })