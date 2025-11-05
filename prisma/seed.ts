import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bnoverseas.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@bnoverseas.com',
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
  })

  // Seed Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 'main-settings' },
    update: {},
    create: {
      id: 'main-settings',
      siteName: 'BnOverseas',
      siteTagline: 'Your Gateway to Global Education',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      primaryColor: '#dc2626',
      secondaryColor: '#1f2937',
      accentColor: '#3b82f6',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: '16px',
      contactEmail: 'info@bnoverseas.com',
      contactPhone: '+1-234-567-8900',
      contactAddress: '123 Education Street, Learning City, LC 12345',
      facebookUrl: 'https://facebook.com/bnoverseas',
      twitterUrl: 'https://twitter.com/bnoverseas',
      linkedinUrl: 'https://linkedin.com/company/bnoverseas',
      metaTitle: 'BnOverseas - Study Abroad Consultancy',
      metaDescription: 'Expert guidance for international education. Get assistance with university applications, visa processing, and study abroad programs.',
      googleAnalyticsId: 'GA-XXXXXXXX-X',
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
      secondaryCtaText: 'Explore Programs',
      secondaryCtaLink: '/programs',
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
      secondaryCtaText: 'View Universities',
      secondaryCtaLink: '/universities',
      backgroundImage: '/hero-university-bg.jpg',
      textColor: '#ffffff',
      overlayColor: '#1f2937',
      overlayOpacity: 0.5,
      orderIndex: 1,
      isActive: true,
      displayDuration: 5000,
      animationType: 'SLIDE',
    },
    {
      title: 'Scholarship Opportunities Available',
      subtitle: 'Funding Your Dreams',
      description: 'Get assistance with scholarship applications and financial aid to make education affordable',
      ctaText: 'Find Scholarships',
      ctaLink: '/scholarships',
      secondaryCtaText: 'Calculate Costs',
      secondaryCtaLink: '/cost-calculator',
      backgroundImage: '/hero-scholarship-bg.jpg',
      textColor: '#ffffff',
      overlayColor: '#dc2626',
      overlayOpacity: 0.3,
      orderIndex: 2,
      isActive: true,
      displayDuration: 5000,
      animationType: 'ZOOM',
    },
  ]

  for (const slide of heroSlides) {
    await prisma.heroSlide.create({
      data: slide,
    })
  }

  // Seed Features (Why Choose Us)
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
    {
      title: 'Pre-Departure Support',
      description: 'Comprehensive orientation and support to prepare you for life in your destination country',
      icon: 'Plane',
      iconColor: '#8b5cf6',
      orderIndex: 4,
      isActive: true,
      isFeatured: false,
    },
    {
      title: 'Career Guidance',
      description: 'Post-graduation career support and job placement assistance in your field of study',
      icon: 'Briefcase',
      iconColor: '#06b6d4',
      orderIndex: 5,
      isActive: true,
      isFeatured: false,
    },
  ]

  for (const feature of features) {
    await prisma.feature.create({
      data: feature,
    })
  }

  // Seed Statistics
  const statistics = [
    {
      label: 'Students Placed',
      value: '15000',
      prefix: '',
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
      prefix: '',
      suffix: '+',
      icon: 'GraduationCap',
      iconColor: '#10b981',
      orderIndex: 1,
      isActive: true,
      autoUpdate: false,
    },
    {
      label: 'Visa Success Rate',
      value: '98',
      prefix: '',
      suffix: '%',
      icon: 'CheckCircle',
      iconColor: '#f59e0b',
      orderIndex: 2,
      isActive: true,
      autoUpdate: false,
    },
    {
      label: 'Countries Covered',
      value: '25',
      prefix: '',
      suffix: '+',
      icon: 'Globe',
      iconColor: '#ef4444',
      orderIndex: 3,
      isActive: true,
      autoUpdate: false,
    },
  ]

  for (const stat of statistics) {
    await prisma.statistic.create({
      data: stat,
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
    {
      name: 'MIT',
      logoUrl: '/partners/mit-logo.png',
      websiteUrl: 'https://mit.edu',
      country: 'USA',
      partnerType: 'university',
      description: 'Leading technology institute with cutting-edge research programs',
      isActive: true,
      isFeatured: true,
      orderIndex: 4,
    },
    {
      name: 'University of Cambridge',
      logoUrl: '/partners/cambridge-logo.png',
      websiteUrl: 'https://cam.ac.uk',
      country: 'UK',
      partnerType: 'university',
      description: 'Historic university known for academic excellence and innovation',
      isActive: true,
      isFeatured: true,
      orderIndex: 5,
    },
    {
      name: 'Stanford University',
      logoUrl: '/partners/stanford-logo.png',
      websiteUrl: 'https://stanford.edu',
      country: 'USA',
      partnerType: 'university',
      description: 'Premier research university in Silicon Valley',
      isActive: true,
      isFeatured: true,
      orderIndex: 6,
    },
    {
      name: 'University of Sydney',
      logoUrl: '/partners/sydney-logo.png',
      websiteUrl: 'https://sydney.edu.au',
      country: 'Australia',
      partnerType: 'university',
      description: 'Leading Australian university with diverse academic programs',
      isActive: true,
      isFeatured: true,
      orderIndex: 7,
    },
    {
      name: 'McGill University',
      logoUrl: '/partners/mcgill-logo.png',
      websiteUrl: 'https://mcgill.ca',
      country: 'Canada',
      partnerType: 'university',
      description: 'Internationally renowned Canadian research university',
      isActive: true,
      isFeatured: true,
      orderIndex: 8,
    },
    {
      name: 'Imperial College London',
      logoUrl: '/partners/imperial-logo.png',
      websiteUrl: 'https://imperial.ac.uk',
      country: 'UK',
      partnerType: 'university',
      description: 'World-leading university in science, engineering, medicine and business',
      isActive: true,
      isFeatured: true,
      orderIndex: 9,
    },
    {
      name: 'University of British Columbia',
      logoUrl: '/partners/ubc-logo.png',
      websiteUrl: 'https://ubc.ca',
      country: 'Canada',
      partnerType: 'university',
      description: 'Top Canadian university with beautiful campus and strong research programs',
      isActive: true,
      isFeatured: true,
      orderIndex: 10,
    },
    {
      name: 'Australian National University',
      logoUrl: '/partners/anu-logo.png',
      websiteUrl: 'https://anu.edu.au',
      country: 'Australia',
      partnerType: 'university',
      description: 'Australia\'s national university with excellence in research and education',
      isActive: true,
      isFeatured: true,
      orderIndex: 11,
    },
  ]

  for (const partner of partners) {
    await prisma.partner.create({
      data: partner,
    })
  }

  // Seed Countries
  const countries = [
    {
      name: 'United States',
      code: 'US',
      description: 'The United States offers world-class education with diverse programs, cutting-edge research opportunities, and a multicultural environment. Home to many of the world\'s top-ranked universities.',
      flagUrl: '/flags/usa-flag.jpg',
      universities: ['Harvard University', 'MIT', 'Stanford University', 'Yale University', 'Princeton University'],
      programs: ['Computer Science', 'Business Administration', 'Engineering', 'Medicine', 'Law'],
      requirements: {
        'academic': 'SAT/ACT scores, High School Diploma',
        'language': 'TOEFL/IELTS',
        'documents': 'Letters of recommendation, Essays'
      },
      livingCost: {
        'average': '$10,000 - $15,000 per year',
        'accommodation': '$6,000 - $12,000',
        'food': '$2,500 - $4,000',
        'transport': '$500 - $1,200'
      },
      scholarships: ['Fulbright Scholarship', 'Merit-based scholarships', 'Athletic scholarships'],
      workRights: {
        'during_studies': 'CPT - Curricular Practical Training',
        'after_graduation': 'OPT - Optional Practical Training (12-36 months)',
        'restrictions': '20 hours per week during studies'
      },
      intake: ['Fall (September)', 'Spring (January)', 'Summer (May)'],
      isPopular: true,
      isActive: true,
    },
    {
      name: 'United Kingdom',
      slug: 'uk',
      flagUrl: '/flags/uk-flag.jpg',
      imageUrl: '/countries/uk-study.jpg',
      description: 'The UK provides world-renowned education with a rich academic heritage. Known for shorter degree durations and prestigious institutions like Oxford and Cambridge.',
      shortDescription: 'A leading study destination known for its esteemed academic institutes',
      continent: 'Europe',
      currency: 'GBP',
      language: 'English',
      capital: 'London',
      population: 67000000,
      isActive: true,
      isFeatured: true,
      isPopular: true,
      orderIndex: 1,
      studyCost: '£10,000 - £38,000 per year',
      livingCost: '£12,000 - £15,000 per year',
      visaRequirements: 'Student Visa (Tier 4) required',
      workPermit: '20 hours per week during studies',
      universities: ['Oxford University', 'Cambridge University', 'Imperial College London', 'UCL', 'King\'s College London'],
      popularCourses: ['Business', 'Engineering', 'Law', 'Medicine', 'Arts & Humanities'],
      scholarships: ['Chevening Scholarship', 'Commonwealth Scholarship', 'University-specific scholarships'],
      admissionRequirements: 'A-levels or equivalent, IELTS/TOEFL, Personal statement',
      applicationDeadlines: 'October 15 (Oxford/Cambridge), January 15 (other universities)',
      intakeSeasons: ['September', 'January'],
      processingTime: '2-4 months',
      successRate: 90,
      metaTitle: 'Study in UK - Prestigious British Universities',
      metaDescription: 'Explore study opportunities in the UK. Apply to top British universities with our expert assistance.',
    },
    {
      name: 'Canada',
      slug: 'canada',
      flagUrl: '/flags/canada-flag.jpg',
      imageUrl: '/countries/canada-study.jpg',
      description: 'Canada offers high-quality education in a safe, multicultural environment. Known for affordable tuition fees, post-graduation work opportunities, and pathway to permanent residency.',
      shortDescription: 'Popular education destination known for world renowned universities & colleges',
      continent: 'North America',
      currency: 'CAD',
      language: 'English, French',
      capital: 'Ottawa',
      population: 38000000,
      isActive: true,
      isFeatured: true,
      isPopular: true,
      orderIndex: 2,
      studyCost: 'CAD $15,000 - $35,000 per year',
      livingCost: 'CAD $10,000 - $12,000 per year',
      visaRequirements: 'Study Permit required',
      workPermit: '20 hours per week during studies, PGWP after graduation',
      universities: ['University of Toronto', 'McGill University', 'University of British Columbia', 'University of Waterloo'],
      popularCourses: ['Computer Science', 'Engineering', 'Business', 'Healthcare', 'Natural Resources'],
      scholarships: ['Vanier Canada Graduate Scholarships', 'Provincial scholarships', 'University-specific aid'],
      admissionRequirements: 'High school diploma, IELTS/TOEFL, Letters of recommendation',
      applicationDeadlines: 'Fall: January-March, Winter: September-October',
      intakeSeasons: ['Fall (September)', 'Winter (January)', 'Summer (May)'],
      processingTime: '4-8 weeks',
      successRate: 92,
      metaTitle: 'Study in Canada - Quality Education & Immigration',
      metaDescription: 'Study in Canada with pathway to permanent residency. Expert guidance for Canadian universities.',
    },
    {
      name: 'Australia',
      slug: 'australia',
      flagUrl: '/flags/australia-flag.jpg',
      imageUrl: '/countries/australia-study.jpg',
      description: 'Australia provides excellent education with a focus on practical learning and research. Known for its relaxed lifestyle, beautiful campuses, and strong job prospects.',
      shortDescription: 'Popular destination for higher education with immense focus on practice and research',
      continent: 'Oceania',
      currency: 'AUD',
      language: 'English',
      capital: 'Canberra',
      population: 25000000,
      isActive: true,
      isFeatured: true,
      isPopular: true,
      orderIndex: 3,
      studyCost: 'AUD $20,000 - $45,000 per year',
      livingCost: 'AUD $18,000 - $20,000 per year',
      visaRequirements: 'Student Visa (subclass 500) required',
      workPermit: '20 hours per week during studies',
      universities: ['University of Melbourne', 'University of Sydney', 'Australian National University', 'University of Queensland'],
      popularCourses: ['Engineering', 'Business', 'IT', 'Healthcare', 'Environmental Science'],
      scholarships: ['Australia Awards', 'Endeavour Scholarships', 'University-specific scholarships'],
      admissionRequirements: 'Completion of Year 12 or equivalent, IELTS/TOEFL, Academic transcripts',
      applicationDeadlines: 'Semester 1: October-December, Semester 2: May-July',
      intakeSeasons: ['February', 'July'],
      processingTime: '6-8 weeks',
      successRate: 88,
      metaTitle: 'Study in Australia - World-Class Education Down Under',
      metaDescription: 'Discover study opportunities in Australia. Apply to top Australian universities with our guidance.',
    },
    {
      name: 'New Zealand',
      slug: 'new-zealand',
      flagUrl: '/flags/newzealand-flag.jpg',
      imageUrl: '/countries/newzealand-study.jpg',
      description: 'New Zealand offers innovative education in a stunning natural environment. Known for research excellence, small class sizes, and welcoming culture.',
      shortDescription: 'An emerging study destination with an excellent higher education system',
      continent: 'Oceania',
      currency: 'NZD',
      language: 'English',
      capital: 'Wellington',
      population: 5000000,
      isActive: true,
      isFeatured: true,
      isPopular: false,
      orderIndex: 4,
      studyCost: 'NZD $18,000 - $35,000 per year',
      livingCost: 'NZD $15,000 - $18,000 per year',
      visaRequirements: 'Student Visa required',
      workPermit: '20 hours per week during studies',
      universities: ['University of Auckland', 'University of Otago', 'Victoria University of Wellington', 'University of Canterbury'],
      popularCourses: ['Agriculture', 'Tourism', 'IT', 'Engineering', 'Environmental Studies'],
      scholarships: ['New Zealand International Scholarships', 'University scholarships'],
      admissionRequirements: 'NCEA Level 3 or equivalent, IELTS/TOEFL',
      applicationDeadlines: 'Semester 1: December, Semester 2: May',
      intakeSeasons: ['February', 'July'],
      processingTime: '4-6 weeks',
      successRate: 85,
      metaTitle: 'Study in New Zealand - Innovation in Nature',
      metaDescription: 'Study in New Zealand\'s beautiful environment. Quality education with excellent student support.',
    },
    {
      name: 'Germany',
      slug: 'germany',
      flagUrl: '/flags/germany-flag.jpg',
      imageUrl: '/countries/germany-study.jpg',
      description: 'Germany offers tuition-free education at public universities with strong focus on research and innovation. Known for engineering, technology, and business programs.',
      shortDescription: 'An emerging study abroad destination with world-class & affordable education',
      continent: 'Europe',
      currency: 'EUR',
      language: 'German, English',
      capital: 'Berlin',
      population: 83000000,
      isActive: true,
      isFeatured: true,
      isPopular: false,
      orderIndex: 5,
      studyCost: '€0 - €20,000 per year (public universities free)',
      livingCost: '€8,000 - €12,000 per year',
      visaRequirements: 'National Visa (Type D) for studies',
      workPermit: '120 full days or 240 half days per year',
      universities: ['Technical University of Munich', 'University of Heidelberg', 'Humboldt University Berlin', 'RWTH Aachen'],
      popularCourses: ['Engineering', 'Computer Science', 'Business', 'Medicine', 'Natural Sciences'],
      scholarships: ['DAAD Scholarships', 'Erasmus+', 'University-specific funding'],
      admissionRequirements: 'Abitur or equivalent, German language proficiency (some English programs available)',
      applicationDeadlines: 'Winter semester: July 15, Summer semester: January 15',
      intakeSeasons: ['October (Winter)', 'April (Summer)'],
      processingTime: '6-8 weeks',
      successRate: 80,
      metaTitle: 'Study in Germany - Free Quality Education',
      metaDescription: 'Study in Germany with free tuition at public universities. Strong engineering and research programs.',
    },
    {
      name: 'Ireland',
      slug: 'ireland',
      flagUrl: '/flags/ireland-flag.jpg',
      imageUrl: '/countries/ireland-study.jpg',
      description: 'Ireland provides quality education with a friendly culture and strong industry connections. Known for technology, pharmaceuticals, and financial services sectors.',
      shortDescription: 'An ideal destination to step into the world of cutting-edge education, innovations & global opportunities',
      continent: 'Europe',
      currency: 'EUR',
      language: 'English, Irish Gaelic',
      capital: 'Dublin',
      population: 5000000,
      isActive: true,
      isFeatured: true,
      isPopular: false,
      orderIndex: 6,
      studyCost: '€9,000 - €25,000 per year',
      livingCost: '€7,000 - €12,000 per year',
      visaRequirements: 'Study Visa required for non-EU students',
      workPermit: '20 hours per week during studies',
      universities: ['Trinity College Dublin', 'University College Dublin', 'National University of Ireland Galway', 'Dublin City University'],
      popularCourses: ['Computer Science', 'Business', 'Pharmaceuticals', 'Literature', 'Engineering'],
      scholarships: ['Government of Ireland Scholarships', 'University scholarships'],
      admissionRequirements: 'Leaving Certificate or equivalent, IELTS/TOEFL for non-native speakers',
      applicationDeadlines: 'February 1 (CAO), varies for postgraduate',
      intakeSeasons: ['September'],
      processingTime: '4-8 weeks',
      successRate: 87,
      metaTitle: 'Study in Ireland - English-Speaking EU Education',
      metaDescription: 'Study in Ireland with EU benefits. Quality education in English with strong industry connections.',
    },
    {
      name: 'Singapore',
      slug: 'singapore',
      flagUrl: '/flags/singapore-flag.jpg',
      imageUrl: '/countries/singapore-study.jpg',
      description: 'Singapore offers world-class education in Asia\'s financial hub. Known for its multicultural environment, strong economy, and gateway to Asian markets.',
      shortDescription: 'Experience the best education standards and a multicultural environment in the heart of South-East Asia',
      continent: 'Asia',
      currency: 'SGD',
      language: 'English, Mandarin, Malay, Tamil',
      capital: 'Singapore',
      population: 6000000,
      isActive: true,
      isFeatured: true,
      isPopular: false,
      orderIndex: 7,
      studyCost: 'SGD $20,000 - $40,000 per year',
      livingCost: 'SGD $12,000 - $15,000 per year',
      visaRequirements: 'Student Pass required',
      workPermit: 'Limited part-time work allowed',
      universities: ['National University of Singapore', 'Nanyang Technological University', 'Singapore Management University'],
      popularCourses: ['Business', 'Engineering', 'Computer Science', 'Finance', 'Biomedical Sciences'],
      scholarships: ['Singapore International Graduate Award', 'University scholarships'],
      admissionRequirements: 'A-levels or equivalent, IELTS/TOEFL, SAT/GRE for some programs',
      applicationDeadlines: 'January-March for August intake',
      intakeSeasons: ['August'],
      processingTime: '2-4 weeks',
      successRate: 90,
      metaTitle: 'Study in Singapore - Gateway to Asia',
      metaDescription: 'Study in Singapore, Asia\'s education hub. World-class universities in a multicultural environment.',
    },
  ]

  for (const country of countries) {
    await prisma.country.create({
      data: country,
    })
  }

  // Seed Testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      program: 'Masters in Computer Science',
      university: 'University of Toronto, Canada',
      country: 'Canada',
      imageUrl: '/testimonials/sarah-johnson.jpg',
      rating: 5,
      content: 'BnOverseas made my dream of studying in Canada a reality. Their counselors were incredibly supportive throughout the entire process, from university selection to visa approval. The personalized attention and expert guidance made all the difference. I couldn\'t have navigated this complex process without them!',
      graduationYear: 2023,
      courseType: 'Masters',
      isActive: true,
      isFeatured: true,
      orderIndex: 0,
      approvedAt: new Date(),
    },
    {
      name: 'Raj Patel',
      email: 'raj.patel@email.com',
      program: 'MBA',
      university: 'Harvard Business School, USA',
      country: 'USA',
      imageUrl: '/testimonials/raj-patel.jpg',
      rating: 5,
      content: 'The team at BnOverseas provided exceptional guidance for my MBA application. Their expertise in scholarship applications helped me secure significant funding that made my Harvard education possible. The mock interviews and application reviews were invaluable. Highly recommended for anyone serious about studying abroad.',
      graduationYear: 2022,
      courseType: 'MBA',
      isActive: true,
      isFeatured: true,
      orderIndex: 1,
      approvedAt: new Date(),
    },
    {
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      program: 'Bachelor of Engineering',
      university: 'University of Melbourne, Australia',
      country: 'Australia',
      imageUrl: '/testimonials/emily-chen.jpg',
      rating: 5,
      content: 'From the initial consultation to landing in Melbourne, BnOverseas was with me every step of the way. Their pre-departure sessions were incredibly helpful in preparing me for life in Australia. The cultural orientation and practical tips about accommodation and banking saved me so much stress.',
      graduationYear: 2024,
      courseType: 'Bachelor',
      isActive: true,
      isFeatured: true,
      orderIndex: 2,
      approvedAt: new Date(),
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      program: 'PhD in Physics',
      university: 'Oxford University, UK',
      country: 'UK',
      imageUrl: '/testimonials/michael-brown.jpg',
      rating: 5,
      content: 'The research assistance and application support I received was outstanding. BnOverseas helped me craft a compelling research proposal that got me accepted into my dream PhD program at Oxford. Their knowledge of the UK education system and application requirements was invaluable.',
      graduationYear: 2021,
      courseType: 'PhD',
      isActive: true,
      isFeatured: true,
      orderIndex: 3,
      approvedAt: new Date(),
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      program: 'Master of Business Analytics',
      university: 'MIT Sloan School of Management, USA',
      country: 'USA',
      imageUrl: '/testimonials/priya-sharma.jpg',
      rating: 5,
      content: 'BnOverseas helped me pivot my career from engineering to business analytics. Their career counseling sessions helped me identify the right program, and their application strategy was spot-on. I\'m now working at a top consulting firm in Boston.',
      designation: 'Senior Analyst',
      company: 'McKinsey & Company',
      graduationYear: 2023,
      courseType: 'Masters',
      isActive: true,
      isFeatured: true,
      orderIndex: 4,
      approvedAt: new Date(),
    },
    {
      name: 'David Kim',
      email: 'david.kim@email.com',
      program: 'Master of Finance',
      university: 'London School of Economics, UK',
      country: 'UK',
      imageUrl: '/testimonials/david-kim.jpg',
      rating: 5,
      content: 'The financial planning guidance was excellent. BnOverseas helped me understand all costs involved and plan my finances accordingly. Their scholarship guidance resulted in a partial scholarship that covered 40% of my tuition fees.',
      designation: 'Investment Analyst',
      company: 'Goldman Sachs',
      graduationYear: 2022,
      courseType: 'Masters',
      isActive: true,
      isFeatured: false,
      orderIndex: 5,
      approvedAt: new Date(),
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    })
  }

  // Seed Menus
  const headerMenu = await prisma.menu.create({
    data: {
      name: 'Header Menu',
      slug: 'header-menu',
      description: 'Main navigation menu displayed in the header',
      location: 'HEADER',
      isActive: true,
    },
  })

  const footerMenu = await prisma.menu.create({
    data: {
      name: 'Footer Menu',
      slug: 'footer-menu',
      description: 'Navigation menu displayed in the footer',
      location: 'FOOTER',
      isActive: true,
    },
  })

  // Header Menu Items
  const headerMenuItems = [
    {
      title: 'Home',
      url: '/',
      orderIndex: 0,
      menuId: headerMenu.id,
    },
    {
      title: 'Study Destinations',
      url: '/destinations',
      orderIndex: 1,
      menuId: headerMenu.id,
    },
    {
      title: 'Services',
      url: '/services',
      orderIndex: 2,
      menuId: headerMenu.id,
    },
    {
      title: 'Universities',
      url: '/universities',
      orderIndex: 3,
      menuId: headerMenu.id,
    },
    {
      title: 'Test Preparation',
      url: '/test-prep',
      orderIndex: 4,
      menuId: headerMenu.id,
    },
    {
      title: 'About Us',
      url: '/about',
      orderIndex: 5,
      menuId: headerMenu.id,
    },
    {
      title: 'Contact',
      url: '/contact',
      orderIndex: 6,
      menuId: headerMenu.id,
    },
  ]

  for (const item of headerMenuItems) {
    await prisma.menuItem.create({
      data: item,
    })
  }

  // Footer Menu Items
  const footerMenuItems = [
    {
      title: 'Privacy Policy',
      url: '/privacy',
      orderIndex: 0,
      menuId: footerMenu.id,
    },
    {
      title: 'Terms of Service',
      url: '/terms',
      orderIndex: 1,
      menuId: footerMenu.id,
    },
    {
      title: 'Cookie Policy',
      url: '/cookies',
      orderIndex: 2,
      menuId: footerMenu.id,
    },
    {
      title: 'Sitemap',
      url: '/sitemap',
      orderIndex: 3,
      menuId: footerMenu.id,
    },
  ]

  for (const item of footerMenuItems) {
    await prisma.menuItem.create({
      data: item,
    })
  }

  console.log('Database seeding completed successfully!')
  console.log('Created:')
  console.log('- 1 admin user')
  console.log('- 1 site settings configuration')
  console.log('- 3 hero slides')
  console.log('- 6 features')
  console.log('- 4 statistics')
  console.log('- 12 university partners')
  console.log('- 8 countries')
  console.log('- 6 testimonials')
  console.log('- 2 menus with navigation items')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })