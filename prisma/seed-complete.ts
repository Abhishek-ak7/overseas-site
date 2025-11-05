import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting comprehensive database seeding...')

  // Clear existing data
  await prisma.$transaction([
    prisma.consultation_inquiries.deleteMany(),
    prisma.contact_inquiries.deleteMany(),
    prisma.menu_items.deleteMany(),
    prisma.menus.deleteMany(),
    prisma.hero_slides.deleteMany(),
    prisma.features.deleteMany(),
    prisma.services.deleteMany(),
    prisma.statistics.deleteMany(),
    prisma.testimonials.deleteMany(),
    prisma.partners.deleteMany(),
    prisma.journey_steps.deleteMany(),
    prisma.countries.deleteMany(),
    prisma.universities.deleteMany(),
    prisma.site_settings.deleteMany(),
    prisma.users.deleteMany(),
  ])

  // 1. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.users.create({
    data: {
      id: 'admin-user-id',
      email: 'admin@bnoverseas.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'ADMIN',
      is_verified: true,
    }
  })
  console.log('✅ Created admin user')

  // 2. Create Site Settings
  await prisma.site_settings.create({
    data: {
      id: 'site-settings-1',
      site_name: 'BnOverseas',
      site_tagline: 'Your Gateway to Global Education',
      site_description: 'Expert study abroad consultancy helping students achieve their international education dreams',
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      accent_color: '#EF4444',
      contact_email: 'info@bnoverseas.com',
      contact_phone: '+1-234-567-8900',
      contact_address: '123 Education Street, Academic City, AC 12345',
      business_hours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
      facebook_url: 'https://facebook.com/bnoverseas',
      twitter_url: 'https://twitter.com/bnoverseas',
      linkedin_url: 'https://linkedin.com/company/bnoverseas',
      instagram_url: 'https://instagram.com/bnoverseas',
      meta_title: 'BnOverseas - Study Abroad Consultancy',
      meta_description: 'Expert guidance for international students seeking world-class education opportunities abroad',
      copyright_text: '© 2024 BnOverseas. All rights reserved.',
    }
  })
  console.log('✅ Created site settings')

  // 3. Create Menus
  const headerMenu = await prisma.menus.create({
    data: {
      id: 'header-menu',
      name: 'Header Menu',
      slug: 'header-menu',
      description: 'Main navigation menu',
      location: 'HEADER',
      is_active: true,
    }
  })

  const footerMenu = await prisma.menus.create({
    data: {
      id: 'footer-menu',
      name: 'Footer Menu',
      slug: 'footer-menu',
      description: 'Footer navigation menu',
      location: 'FOOTER',
      is_active: true,
    }
  })

  // Header Menu Items
  await prisma.menu_items.createMany({
    data: [
      {
        id: 'menu-home',
        menu_id: headerMenu.id,
        label: 'Home',
        url: '/',
        type: 'custom',
        order_index: 1,
        is_active: true,
      },
      {
        id: 'menu-about',
        menu_id: headerMenu.id,
        label: 'About Us',
        url: '/about',
        type: 'custom',
        order_index: 2,
        is_active: true,
      },
      {
        id: 'menu-services',
        menu_id: headerMenu.id,
        label: 'Services',
        url: '/services',
        type: 'custom',
        order_index: 3,
        is_active: true,
      },
      {
        id: 'menu-universities',
        menu_id: headerMenu.id,
        label: 'Universities',
        url: '/universities',
        type: 'custom',
        order_index: 4,
        is_active: true,
      },
      {
        id: 'menu-countries',
        menu_id: headerMenu.id,
        label: 'Countries',
        url: '/countries',
        type: 'custom',
        order_index: 5,
        is_active: true,
      },
      {
        id: 'menu-consultation',
        menu_id: headerMenu.id,
        label: 'Consultation',
        url: '/consultation',
        type: 'custom',
        order_index: 6,
        is_active: true,
      },
      {
        id: 'menu-contact',
        menu_id: headerMenu.id,
        label: 'Contact',
        url: '/contact',
        type: 'custom',
        order_index: 7,
        is_active: true,
      },
    ]
  })

  // Footer Menu Items
  await prisma.menu_items.createMany({
    data: [
      {
        id: 'footer-privacy',
        menu_id: footerMenu.id,
        label: 'Privacy Policy',
        url: '/privacy',
        type: 'custom',
        order_index: 1,
        is_active: true,
      },
      {
        id: 'footer-terms',
        menu_id: footerMenu.id,
        label: 'Terms of Service',
        url: '/terms',
        type: 'custom',
        order_index: 2,
        is_active: true,
      },
      {
        id: 'footer-faq',
        menu_id: footerMenu.id,
        label: 'FAQ',
        url: '/faq',
        type: 'custom',
        order_index: 3,
        is_active: true,
      },
    ]
  })
  console.log('✅ Created menus and menu items')

  // 4. Create Hero Slides
  await prisma.hero_slides.createMany({
    data: [
      {
        id: 'hero-slide-1',
        title: 'Your Journey to Global Education Starts Here',
        subtitle: 'Study Abroad Consultancy',
        description: 'Expert guidance for international students seeking world-class education opportunities',
        cta_text: 'Get Free Consultation',
        cta_link: '/consultation',
        background_image: '/images/hero-education-bg.jpg',
        text_color: '#ffffff',
        overlay_color: '#000000',
        overlay_opacity: 0.4,
        order_index: 1,
        is_active: true,
        display_duration: 5000,
        animation_type: 'fade',
      },
      {
        id: 'hero-slide-2',
        title: 'Study in Top Universities Worldwide',
        subtitle: 'Premium Education Partners',
        description: 'Access to prestigious universities in USA, UK, Canada, Australia and more',
        cta_text: 'Explore Universities',
        cta_link: '/universities',
        background_image: '/images/hero-university-bg.jpg',
        text_color: '#ffffff',
        overlay_color: '#1e40af',
        overlay_opacity: 0.3,
        order_index: 2,
        is_active: true,
        display_duration: 5000,
        animation_type: 'slide',
      },
      {
        id: 'hero-slide-3',
        title: 'Scholarship Opportunities Available',
        subtitle: 'Financial Support',
        description: 'Get assistance in finding and applying for scholarships to fund your education',
        cta_text: 'Learn About Scholarships',
        cta_link: '/scholarships',
        background_image: '/images/hero-scholarship-bg.jpg',
        text_color: '#ffffff',
        overlay_color: '#059669',
        overlay_opacity: 0.35,
        order_index: 3,
        is_active: true,
        display_duration: 5000,
        animation_type: 'zoom',
      },
    ]
  })
  console.log('✅ Created hero slides')

  // 5. Create Features
  await prisma.features.createMany({
    data: [
      {
        id: 'feature-1',
        title: 'Expert Guidance',
        description: 'Get personalized advice from experienced education consultants who understand the international education landscape.',
        icon: 'UserCheck',
        icon_color: '#3B82F6',
        order_index: 1,
        is_active: true,
        is_featured: true,
      },
      {
        id: 'feature-2',
        title: 'University Selection',
        description: 'Find the perfect university that matches your academic profile, career goals, and budget requirements.',
        icon: 'GraduationCap',
        icon_color: '#10B981',
        order_index: 2,
        is_active: true,
        is_featured: true,
      },
      {
        id: 'feature-3',
        title: 'Visa Assistance',
        description: 'Complete support throughout the visa application process with high success rates.',
        icon: 'FileText',
        icon_color: '#8B5CF6',
        order_index: 3,
        is_active: true,
        is_featured: true,
      },
      {
        id: 'feature-4',
        title: 'Scholarship Support',
        description: 'Identify and apply for scholarships and financial aid opportunities to reduce education costs.',
        icon: 'Award',
        icon_color: '#F59E0B',
        order_index: 4,
        is_active: true,
        is_featured: true,
      },
      {
        id: 'feature-5',
        title: 'Test Preparation',
        description: 'Comprehensive preparation for IELTS, TOEFL, GRE, GMAT and other standardized tests.',
        icon: 'BookOpen',
        icon_color: '#EF4444',
        order_index: 5,
        is_active: true,
        is_featured: false,
      },
      {
        id: 'feature-6',
        title: 'Pre-Departure Support',
        description: 'Essential guidance for accommodation, travel, and settling into your new country.',
        icon: 'Plane',
        icon_color: '#06B6D4',
        order_index: 6,
        is_active: true,
        is_featured: false,
      },
    ]
  })
  console.log('✅ Created features')

  // 6. Create Services
  await prisma.services.createMany({
    data: [
      {
        id: 'service-1',
        title: 'University Application',
        description: 'Complete assistance with university applications including document preparation, essay writing, and submission management.',
        icon: 'Send',
        icon_color: '#3B82F6',
        cta_text: 'Learn More',
        cta_link: '/services/university-application',
        order_index: 1,
        is_active: true,
        is_featured: true,
      },
      {
        id: 'service-2',
        title: 'Visa Consultation',
        description: 'Expert guidance for student visa applications with document preparation and interview coaching.',
        icon: 'Shield',
        icon_color: '#10B981',
        cta_text: 'Get Started',
        cta_link: '/services/visa-consultation',
        order_index: 2,
        is_active: true,
        is_featured: true,
      },
      {
        id: 'service-3',
        title: 'Career Counseling',
        description: 'Professional career guidance to help you choose the right course and university for your future goals.',
        icon: 'TrendingUp',
        icon_color: '#8B5CF6',
        cta_text: 'Book Session',
        cta_link: '/services/career-counseling',
        order_index: 3,
        is_active: true,
        is_featured: true,
      },
      {
        id: 'service-4',
        title: 'Test Preparation',
        description: 'Comprehensive coaching for IELTS, TOEFL, GRE, GMAT, and other required standardized tests.',
        icon: 'Brain',
        icon_color: '#F59E0B',
        cta_text: 'Start Prep',
        cta_link: '/services/test-preparation',
        order_index: 4,
        is_active: true,
        is_featured: false,
      },
    ]
  })
  console.log('✅ Created services')

  // 7. Create Statistics
  await prisma.statistics.createMany({
    data: [
      {
        id: 'stat-1',
        label: 'Students Placed',
        value: '5000',
        suffix: '+',
        icon: 'Users',
        icon_color: '#3B82F6',
        order_index: 1,
        is_active: true,
        is_animated: true,
      },
      {
        id: 'stat-2',
        label: 'Universities Partnered',
        value: '500',
        suffix: '+',
        icon: 'Building',
        icon_color: '#10B981',
        order_index: 2,
        is_active: true,
        is_animated: true,
      },
      {
        id: 'stat-3',
        label: 'Countries',
        value: '15',
        suffix: '+',
        icon: 'Globe',
        icon_color: '#8B5CF6',
        order_index: 3,
        is_active: true,
        is_animated: true,
      },
      {
        id: 'stat-4',
        label: 'Success Rate',
        value: '95',
        suffix: '%',
        icon: 'TrendingUp',
        icon_color: '#F59E0B',
        order_index: 4,
        is_active: true,
        is_animated: true,
      },
    ]
  })
  console.log('✅ Created statistics')

  // 8. Create Testimonials
  await prisma.testimonials.createMany({
    data: [
      {
        id: 'testimonial-1',
        student_name: 'Sarah Johnson',
        content: 'BnOverseas made my dream of studying at Oxford University come true. Their guidance throughout the application process was invaluable.',
        rating: 5,
        country: 'UK',
        university: 'Oxford University',
        program: 'Masters in Computer Science',
        image_url: '/images/testimonials/sarah.jpg',
        is_published: true,
        is_featured: true,
        position: 1,
      },
      {
        id: 'testimonial-2',
        student_name: 'Ahmed Rahman',
        content: 'The visa consultation service was exceptional. I got my student visa approved on the first attempt thanks to their expert guidance.',
        rating: 5,
        country: 'Canada',
        university: 'University of Toronto',
        program: 'MBA',
        image_url: '/images/testimonials/ahmed.jpg',
        is_published: true,
        is_featured: true,
        position: 2,
      },
      {
        id: 'testimonial-3',
        student_name: 'Maria Garcia',
        content: 'From university selection to scholarship applications, BnOverseas supported me every step of the way. Highly recommended!',
        rating: 5,
        country: 'USA',
        university: 'Stanford University',
        program: 'PhD in Engineering',
        image_url: '/images/testimonials/maria.jpg',
        is_published: true,
        is_featured: true,
        position: 3,
      },
      {
        id: 'testimonial-4',
        student_name: 'David Kim',
        content: 'Professional and reliable service. They helped me secure admission to my dream university in Australia.',
        rating: 5,
        country: 'Australia',
        university: 'University of Melbourne',
        program: 'Masters in Data Science',
        image_url: '/images/testimonials/david.jpg',
        is_published: true,
        is_featured: false,
        position: 4,
      },
    ]
  })
  console.log('✅ Created testimonials')

  // 9. Create Journey Steps
  await prisma.journey_steps.createMany({
    data: [
      {
        id: 'step-1',
        title: 'Initial Consultation',
        description: 'Free consultation to understand your academic background, goals, and preferences.',
        icon: 'MessageCircle',
        icon_color: '#3B82F6',
        order_index: 1,
        is_active: true,
        cta_text: 'Book Consultation',
        cta_link: '/consultation',
      },
      {
        id: 'step-2',
        title: 'University Selection',
        description: 'Shortlist universities based on your profile, budget, and career aspirations.',
        icon: 'Search',
        icon_color: '#10B981',
        order_index: 2,
        is_active: true,
        cta_text: 'View Universities',
        cta_link: '/universities',
      },
      {
        id: 'step-3',
        title: 'Application Preparation',
        description: 'Complete assistance with application forms, documents, and essays.',
        icon: 'FileEdit',
        icon_color: '#8B5CF6',
        order_index: 3,
        is_active: true,
      },
      {
        id: 'step-4',
        title: 'Visa Application',
        description: 'Expert guidance for visa application and interview preparation.',
        icon: 'Shield',
        icon_color: '#F59E0B',
        order_index: 4,
        is_active: true,
      },
      {
        id: 'step-5',
        title: 'Pre-Departure',
        description: 'Final preparations including accommodation, travel, and orientation.',
        icon: 'Plane',
        icon_color: '#EF4444',
        order_index: 5,
        is_active: true,
      },
    ]
  })
  console.log('✅ Created journey steps')

  // 10. Create Countries
  await prisma.countries.createMany({
    data: [
      {
        id: 'country-usa',
        name: 'United States',
        code: 'US',
        description: 'Home to world-renowned universities like Harvard, MIT, and Stanford.',
        flag_url: '/images/flags/usa.png',
        is_popular: true,
        is_active: true,
      },
      {
        id: 'country-uk',
        name: 'United Kingdom',
        code: 'GB',
        description: 'Historic universities like Oxford and Cambridge with excellent academic reputation.',
        flag_url: '/images/flags/uk.png',
        is_popular: true,
        is_active: true,
      },
      {
        id: 'country-canada',
        name: 'Canada',
        code: 'CA',
        description: 'High-quality education with affordable costs and immigration opportunities.',
        flag_url: '/images/flags/canada.png',
        is_popular: true,
        is_active: true,
      },
      {
        id: 'country-australia',
        name: 'Australia',
        code: 'AU',
        description: 'Top universities with strong research programs and multicultural environment.',
        flag_url: '/images/flags/australia.png',
        is_popular: true,
        is_active: true,
      },
      {
        id: 'country-germany',
        name: 'Germany',
        code: 'DE',
        description: 'Excellent engineering and technical programs with low tuition fees.',
        flag_url: '/images/flags/germany.png',
        is_popular: false,
        is_active: true,
      },
      {
        id: 'country-france',
        name: 'France',
        code: 'FR',
        description: 'World-class business schools and cultural diversity.',
        flag_url: '/images/flags/france.png',
        is_popular: false,
        is_active: true,
      },
    ]
  })
  console.log('✅ Created countries')

  // 11. Create Universities
  await prisma.universities.createMany({
    data: [
      {
        id: 'uni-harvard',
        name: 'Harvard University',
        country: 'United States',
        city: 'Cambridge, MA',
        ranking: 1,
        world_ranking: 1,
        type: 'private',
        established_year: 1636,
        logo_url: '/images/universities/harvard.png',
        website: 'https://harvard.edu',
        description: 'One of the most prestigious universities in the world, known for excellence in all fields.',
        programs: ['Medicine', 'Law', 'Business', 'Engineering', 'Liberal Arts'],
        tuition_range: { min: 50000, max: 70000, currency: 'USD' },
        living_cost_range: { min: 20000, max: 25000, currency: 'USD' },
        intakes: ['Fall', 'Spring'],
        scholarships: ['Need-based aid', 'Merit scholarships'],
        features: ['World-class faculty', 'Extensive alumni network', 'Research opportunities'],
        is_active: true,
        is_featured: true,
      },
      {
        id: 'uni-oxford',
        name: 'University of Oxford',
        country: 'United Kingdom',
        city: 'Oxford',
        ranking: 1,
        world_ranking: 2,
        type: 'public',
        established_year: 1096,
        logo_url: '/images/universities/oxford.png',
        website: 'https://ox.ac.uk',
        description: 'The oldest university in the English-speaking world with unparalleled academic tradition.',
        programs: ['Medicine', 'Law', 'Philosophy', 'Engineering', 'Natural Sciences'],
        tuition_range: { min: 35000, max: 45000, currency: 'GBP' },
        living_cost_range: { min: 15000, max: 20000, currency: 'GBP' },
        intakes: ['Michaelmas', 'Hilary', 'Trinity'],
        scholarships: ['Rhodes Scholarship', 'Clarendon Fund'],
        features: ['Tutorial system', 'Historic colleges', 'Research excellence'],
        is_active: true,
        is_featured: true,
      },
      {
        id: 'uni-toronto',
        name: 'University of Toronto',
        country: 'Canada',
        city: 'Toronto, ON',
        ranking: 1,
        world_ranking: 18,
        type: 'public',
        established_year: 1827,
        logo_url: '/images/universities/toronto.png',
        website: 'https://utoronto.ca',
        description: 'Canada\'s top university with strong research programs and diverse student body.',
        programs: ['Medicine', 'Engineering', 'Business', 'Computer Science', 'Arts & Science'],
        tuition_range: { min: 35000, max: 55000, currency: 'CAD' },
        living_cost_range: { min: 12000, max: 18000, currency: 'CAD' },
        intakes: ['Fall', 'Winter', 'Summer'],
        scholarships: ['Lester B. Pearson Scholarship', 'President\'s Scholars'],
        features: ['Research intensive', 'Urban campus', 'Co-op programs'],
        is_active: true,
        is_featured: true,
      },
      {
        id: 'uni-melbourne',
        name: 'University of Melbourne',
        country: 'Australia',
        city: 'Melbourne, VIC',
        ranking: 1,
        world_ranking: 33,
        type: 'public',
        established_year: 1853,
        logo_url: '/images/universities/melbourne.png',
        website: 'https://unimelb.edu.au',
        description: 'Australia\'s leading university with strong international reputation.',
        programs: ['Medicine', 'Engineering', 'Business', 'Law', 'Arts'],
        tuition_range: { min: 30000, max: 45000, currency: 'AUD' },
        living_cost_range: { min: 20000, max: 25000, currency: 'AUD' },
        intakes: ['Semester 1', 'Semester 2'],
        scholarships: ['Melbourne International Scholarship', 'Graduate Research Scholarships'],
        features: ['Research excellence', 'Industry partnerships', 'Global outlook'],
        is_active: true,
        is_featured: true,
      },
    ]
  })
  console.log('✅ Created universities')

  // 12. Create Partners
  await prisma.partners.createMany({
    data: [
      {
        id: 'partner-1',
        name: 'Harvard University',
        logo_url: '/images/partners/harvard.png',
        website_url: 'https://harvard.edu',
        country: 'United States',
        partner_type: 'university',
        ranking: 1,
        is_active: true,
        is_featured: true,
        is_preferred: true,
        order_index: 1,
      },
      {
        id: 'partner-2',
        name: 'Oxford University',
        logo_url: '/images/partners/oxford.png',
        website_url: 'https://ox.ac.uk',
        country: 'United Kingdom',
        partner_type: 'university',
        ranking: 2,
        is_active: true,
        is_featured: true,
        is_preferred: true,
        order_index: 2,
      },
      {
        id: 'partner-3',
        name: 'University of Toronto',
        logo_url: '/images/partners/toronto.png',
        website_url: 'https://utoronto.ca',
        country: 'Canada',
        partner_type: 'university',
        ranking: 18,
        is_active: true,
        is_featured: true,
        is_preferred: false,
        order_index: 3,
      },
      {
        id: 'partner-4',
        name: 'University of Melbourne',
        logo_url: '/images/partners/melbourne.png',
        website_url: 'https://unimelb.edu.au',
        country: 'Australia',
        partner_type: 'university',
        ranking: 33,
        is_active: true,
        is_featured: true,
        is_preferred: false,
        order_index: 4,
      },
      {
        id: 'partner-5',
        name: 'IELTS Official',
        logo_url: '/images/partners/ielts.png',
        website_url: 'https://ielts.org',
        country: 'Global',
        partner_type: 'testing',
        is_active: true,
        is_featured: false,
        is_preferred: false,
        order_index: 5,
      },
      {
        id: 'partner-6',
        name: 'ETS TOEFL',
        logo_url: '/images/partners/toefl.png',
        website_url: 'https://ets.org/toefl',
        country: 'Global',
        partner_type: 'testing',
        is_active: true,
        is_featured: false,
        is_preferred: false,
        order_index: 6,
      },
    ]
  })
  console.log('✅ Created partners')

  // 13. Create sample consultation inquiries
  await prisma.consultation_inquiries.createMany({
    data: [
      {
        id: 'consult-1',
        full_name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        query_type: 'university_selection',
        study_destination: 'Canada',
        current_education: 'Bachelor\'s Degree',
        message: 'I want to pursue a Master\'s in Computer Science in Canada. Please guide me.',
        source: 'homepage_consultation',
        status: 'new',
        priority: 'medium',
      },
      {
        id: 'consult-2',
        full_name: 'Lisa Chen',
        email: 'lisa.chen@email.com',
        phone: '+86-138-0013-8000',
        query_type: 'visa_guidance',
        study_destination: 'USA',
        current_education: 'Bachelor\'s Degree',
        message: 'Need help with F-1 visa application for MBA program.',
        source: 'consultation_form',
        status: 'contacted',
        priority: 'high',
      },
      {
        id: 'consult-3',
        full_name: 'Ahmed Hassan',
        email: 'ahmed.hassan@email.com',
        phone: '+971-50-123-4567',
        query_type: 'document_help',
        study_destination: 'UK',
        current_education: 'High School',
        message: 'What documents do I need for undergraduate application in UK?',
        source: 'homepage_consultation',
        status: 'in_progress',
        priority: 'medium',
      },
    ]
  })
  console.log('✅ Created sample consultation inquiries')

  // 14. Create sample contact inquiries
  await prisma.contact_inquiries.createMany({
    data: [
      {
        id: 'contact-1',
        full_name: 'Maria Rodriguez',
        email: 'maria.rodriguez@email.com',
        phone: '+34-123-456-789',
        study_destination: 'Australia',
        message: 'Interested in studying medicine in Australia. Please contact me.',
        source: 'hero_form',
        status: 'new',
        priority: 'medium',
      },
      {
        id: 'contact-2',
        full_name: 'David Johnson',
        email: 'david.johnson@email.com',
        phone: '+44-20-1234-5678',
        study_destination: 'USA',
        message: 'Looking for scholarship opportunities for PhD programs.',
        source: 'contact_page',
        status: 'contacted',
        priority: 'high',
      },
    ]
  })
  console.log('✅ Created sample contact inquiries')

  console.log('🎉 Database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log('- Admin user: admin@bnoverseas.com / admin123')
  console.log('- Site settings configured')
  console.log('- Header and footer menus created')
  console.log('- 3 hero slides')
  console.log('- 6 features')
  console.log('- 4 services')
  console.log('- 4 statistics')
  console.log('- 4 testimonials')
  console.log('- 5 journey steps')
  console.log('- 6 countries')
  console.log('- 4 universities')
  console.log('- 6 partners')
  console.log('- Sample consultation and contact inquiries')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })