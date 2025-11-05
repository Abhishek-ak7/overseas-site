import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding events...')

  // Get or create a default user for events
  let user = await prisma.users.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
  })

  if (!user) {
    console.log('Creating default admin user...')
    user = await prisma.users.create({
      data: {
        email: 'admin@bnoverseas.com',
        password: '$2a$10$YourHashedPasswordHere',
        first_name: 'Admin',
        last_name: 'User',
        role: 'SUPER_ADMIN',
        is_active: true,
        email_verified: true,
      }
    })
  }

  const events = [
    {
      title: 'Study Abroad Fair 2025 - New York',
      slug: 'study-abroad-fair-2025-new-york',
      excerpt: 'Meet representatives from top universities across USA, Canada, UK, and Australia. Get on-the-spot admissions and scholarship information.',
      content: `
        <h2>Join the Biggest Study Abroad Fair of 2025!</h2>
        <p>This is your opportunity to meet with representatives from over 50 top universities from around the world. Whether you're interested in undergraduate or graduate programs, we have something for everyone.</p>

        <h3>What to Expect</h3>
        <ul>
          <li>One-on-one consultations with university representatives</li>
          <li>Information sessions on admissions, scholarships, and visa processes</li>
          <li>On-the-spot application processing</li>
          <li>Career counseling sessions</li>
          <li>Test preparation workshops (IELTS, TOEFL, GRE, GMAT)</li>
        </ul>

        <h3>Participating Universities</h3>
        <p>Universities from USA, Canada, UK, Australia, New Zealand, Ireland, and Germany will be present.</p>

        <h3>Who Should Attend?</h3>
        <p>Students planning to study abroad, parents, and education counselors are all welcome!</p>

        <h3>Registration</h3>
        <p>Entry is FREE but registration is required. Register early to secure your spot!</p>
      `,
      event_type: 'Fair',
      featured_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      images: [
        'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'
      ],

      // Location
      venue: 'Manhattan Convention Center',
      address: '655 West 34th Street, NY 10001',
      city: 'New York',
      country: 'United States',
      is_online: false,

      // Date & Time - Set to 2 months from now
      start_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // Same day, 8 hours later
      registration_deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000), // 5 days before event

      // Registration
      is_free: true,
      max_attendees: 500,
      registration_link: 'https://example.com/register',

      // Organizer
      organizer_name: 'BN Overseas Education',
      organizer_email: 'info@bnoverseas.com',
      organizer_phone: '+1 (555) 123-4567',

      // Meta
      meta_title: 'Study Abroad Fair 2025 - New York | BN Overseas',
      meta_description: 'Meet representatives from 50+ top universities. Free entry, on-the-spot admissions, scholarship info. Register now!',
      tags: ['Study Abroad', 'University Fair', 'Admissions', 'Scholarships'],

      is_published: true,
      is_featured: true,
      author_id: user.id,
    },
    {
      title: 'FREE IELTS Preparation Webinar',
      slug: 'free-ielts-preparation-webinar',
      excerpt: 'Join our expert instructors for a comprehensive IELTS preparation session. Learn tips, tricks, and strategies to ace your test.',
      content: `
        <h2>Master IELTS with Expert Guidance</h2>
        <p>Are you preparing for the IELTS exam? Join our FREE webinar conducted by experienced IELTS trainers with 10+ years of teaching experience.</p>

        <h3>What You'll Learn</h3>
        <ul>
          <li>Understanding the IELTS test format</li>
          <li>Time management strategies</li>
          <li>Tips for Reading section</li>
          <li>Writing Task 1 and Task 2 strategies</li>
          <li>Speaking test confidence building</li>
          <li>Common mistakes to avoid</li>
          <li>Practice exercises and sample questions</li>
        </ul>

        <h3>Who Should Attend?</h3>
        <p>Anyone planning to take the IELTS exam for study abroad, immigration, or professional purposes.</p>

        <h3>Interactive Q&A</h3>
        <p>Get your questions answered live during the session!</p>
      `,
      event_type: 'Webinar',
      featured_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',

      // Online event
      is_online: true,
      meeting_link: 'https://zoom.us/j/example123',

      // Date & Time - Set to 3 weeks from now
      start_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
      registration_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),

      // Registration
      is_free: true,
      max_attendees: 200,
      registration_link: 'https://example.com/ielts-webinar',

      // Organizer
      organizer_name: 'BN Overseas Education',
      organizer_email: 'info@bnoverseas.com',
      organizer_phone: '+1 (555) 123-4567',

      // Meta
      meta_title: 'FREE IELTS Preparation Webinar | BN Overseas',
      meta_description: 'Join expert instructors for IELTS tips, strategies, and practice. Free online webinar. Limited seats!',
      tags: ['IELTS', 'Test Prep', 'Webinar', 'Free'],

      is_published: true,
      is_featured: true,
      author_id: user.id,
    },
    {
      title: 'Canadian Universities Info Session',
      slug: 'canadian-universities-info-session',
      excerpt: 'Learn about studying in Canada, top universities, programs, scholarships, work permits, and PR pathways.',
      content: `
        <h2>Study in Canada - Complete Information Session</h2>
        <p>Canada is one of the most popular study destinations for international students. Learn everything you need to know about studying in Canada.</p>

        <h3>Topics Covered</h3>
        <ul>
          <li>Why study in Canada?</li>
          <li>Top universities and colleges</li>
          <li>Popular programs and courses</li>
          <li>Admission requirements</li>
          <li>Application process and timelines</li>
          <li>Scholarship opportunities</li>
          <li>Student visa process</li>
          <li>Post-graduation work permit (PGWP)</li>
          <li>PR pathways for international students</li>
          <li>Cost of living and part-time work</li>
        </ul>

        <h3>Special Guest</h3>
        <p>Representatives from leading Canadian universities will join us to answer your questions.</p>

        <h3>Free Study Abroad Guide</h3>
        <p>All attendees will receive a comprehensive guide to studying in Canada!</p>
      `,
      event_type: 'Info Session',
      featured_image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800',
      images: ['https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800'],

      // Location
      venue: 'BN Overseas Office',
      address: '123 Education Street, Toronto, ON M5H 2N2',
      city: 'Toronto',
      country: 'Canada',
      is_online: false,

      // Date & Time - Set to 1 month from now
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      registration_deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),

      // Registration
      is_free: true,
      max_attendees: 100,

      // Organizer
      organizer_name: 'BN Overseas - Canada',
      organizer_email: 'canada@bnoverseas.com',
      organizer_phone: '+1 (416) 555-7890',

      // Meta
      meta_title: 'Canadian Universities Info Session | Study in Canada',
      meta_description: 'Learn about studying in Canada, universities, scholarships, work permits, and PR pathways. Free info session.',
      tags: ['Canada', 'Study Abroad', 'Universities', 'Info Session'],

      is_published: true,
      author_id: user.id,
    },
    {
      title: 'UK University Application Workshop',
      slug: 'uk-university-application-workshop',
      excerpt: 'Get expert help with your UCAS application, personal statement, and UK student visa process.',
      content: `
        <h2>Complete UK Application Workshop</h2>
        <p>Applying to UK universities can be complex. Our experts will guide you through every step of the process.</p>

        <h3>Workshop Agenda</h3>
        <ul>
          <li>Understanding the UCAS system</li>
          <li>Choosing the right universities and courses</li>
          <li>Writing a compelling personal statement</li>
          <li>Securing strong letters of recommendation</li>
          <li>Meeting entry requirements</li>
          <li>Scholarship opportunities in the UK</li>
          <li>Student visa application process</li>
          <li>Financial planning and proof of funds</li>
        </ul>

        <h3>Hands-on Practice</h3>
        <p>Bring your laptop! We'll have dedicated time for you to work on your applications with expert guidance.</p>

        <h3>Materials Provided</h3>
        <ul>
          <li>Personal statement templates</li>
          <li>Application checklist</li>
          <li>Visa guide</li>
          <li>Sample applications</li>
        </ul>
      `,
      event_type: 'Workshop',
      featured_image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',

      // Location
      venue: 'London Education Hub',
      address: '45 King Street, London EC2V 8AS',
      city: 'London',
      country: 'United Kingdom',
      is_online: false,

      // Date & Time - Set to 6 weeks from now
      start_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registration_deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),

      // Registration - Paid workshop
      is_free: false,
      price: 49.99,
      currency: 'GBP',
      max_attendees: 50,
      registration_link: 'https://example.com/uk-workshop',

      // Organizer
      organizer_name: 'BN Overseas - UK',
      organizer_email: 'uk@bnoverseas.com',
      organizer_phone: '+44 20 1234 5678',

      // Meta
      meta_title: 'UK University Application Workshop | UCAS Help',
      meta_description: 'Expert workshop on UCAS applications, personal statements, and UK student visas. Hands-on guidance.',
      tags: ['UK', 'UCAS', 'Workshop', 'Applications'],

      is_published: true,
      author_id: user.id,
    },
    {
      title: 'Scholarships & Financial Aid Seminar',
      slug: 'scholarships-financial-aid-seminar',
      excerpt: 'Discover scholarship opportunities, learn how to write winning applications, and explore financial aid options for international students.',
      content: `
        <h2>Fund Your Education: Scholarships & Financial Aid</h2>
        <p>Studying abroad doesn't have to break the bank. Learn about various scholarship opportunities and financial aid options available to international students.</p>

        <h3>What We'll Cover</h3>
        <ul>
          <li>Types of scholarships (merit-based, need-based, country-specific)</li>
          <li>Top scholarship programs for international students</li>
          <li>How to find hidden scholarship opportunities</li>
          <li>Writing compelling scholarship essays</li>
          <li>Preparing strong recommendation letters</li>
          <li>Financial aid and education loans</li>
          <li>Work-study programs</li>
          <li>Budgeting and financial planning</li>
        </ul>

        <h3>Success Stories</h3>
        <p>Hear from students who successfully secured full scholarships to top universities!</p>

        <h3>Personalized Scholarship Matching</h3>
        <p>Our experts will help identify scholarships that match your profile.</p>
      `,
      event_type: 'Seminar',
      featured_image: 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800',

      // Online event
      is_online: true,
      meeting_link: 'https://zoom.us/j/scholarship-seminar',

      // Date & Time - Set to 2 weeks from now
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours
      registration_deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),

      // Registration
      is_free: true,
      max_attendees: 300,
      registration_link: 'https://example.com/scholarship-seminar',

      // Organizer
      organizer_name: 'BN Overseas Education',
      organizer_email: 'scholarships@bnoverseas.com',
      organizer_phone: '+1 (555) 123-4567',

      // Meta
      meta_title: 'Scholarships & Financial Aid Seminar for International Students',
      meta_description: 'Learn about scholarship opportunities, essay writing tips, and financial aid options. Free online seminar.',
      tags: ['Scholarships', 'Financial Aid', 'Seminar', 'Study Abroad'],

      is_published: true,
      is_featured: true,
      author_id: user.id,
    },
    {
      title: 'Australia Education Expo 2025',
      slug: 'australia-education-expo-2025',
      excerpt: 'Meet representatives from Australian universities, learn about courses, scholarships, and post-study work opportunities.',
      content: `
        <h2>Study in Australia - Education Expo 2025</h2>
        <p>Australia offers world-class education, beautiful landscapes, and excellent post-study work opportunities. Explore your options at our education expo!</p>

        <h3>Participating Institutions</h3>
        <p>Representatives from over 30 Australian universities and colleges will be present, including Group of Eight universities.</p>

        <h3>What You'll Learn</h3>
        <ul>
          <li>Popular courses and programs in Australia</li>
          <li>Admission requirements and application process</li>
          <li>Scholarship and bursary opportunities</li>
          <li>Student visa requirements (Subclass 500)</li>
          <li>Post-study work visa (Subclass 485)</li>
          <li>PR pathways for graduates</li>
          <li>Cost of living and part-time work opportunities</li>
          <li>Student accommodation options</li>
        </ul>

        <h3>Special Features</h3>
        <ul>
          <li>On-the-spot conditional offers</li>
          <li>Application fee waivers</li>
          <li>One-on-one counseling sessions</li>
          <li>Student life presentations</li>
          <li>Visa application assistance</li>
        </ul>

        <h3>Free Gifts</h3>
        <p>All attendees will receive a comprehensive Australia study guide and merchandise!</p>
      `,
      event_type: 'Fair',
      featured_image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
      images: [
        'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
        'https://images.unsplash.com/photo-1529310399831-ed472b81d589?w=800'
      ],

      // Location
      venue: 'Sydney Exhibition Centre',
      address: '14 Darling Drive, Sydney NSW 2000',
      city: 'Sydney',
      country: 'Australia',
      is_online: false,

      // Date & Time - Set to 3 months from now
      start_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      registration_deadline: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),

      // Registration
      is_free: true,
      max_attendees: 1000,
      registration_link: 'https://example.com/australia-expo',

      // Organizer
      organizer_name: 'BN Overseas - Australia',
      organizer_email: 'australia@bnoverseas.com',
      organizer_phone: '+61 2 1234 5678',

      // Meta
      meta_title: 'Australia Education Expo 2025 | Study in Australia',
      meta_description: 'Meet 30+ Australian universities, get conditional offers, scholarship info, and visa guidance. Free entry!',
      tags: ['Australia', 'Education Expo', 'Universities', 'Study Abroad'],

      is_published: true,
      is_featured: true,
      author_id: user.id,
    },
  ]

  console.log('Creating events...')
  for (const eventData of events) {
    const existing = await prisma.events.findUnique({
      where: { slug: eventData.slug }
    })

    if (existing) {
      console.log(`⚠ Event already exists: ${eventData.title}`)
      continue
    }

    const event = await prisma.events.create({
      data: eventData
    })
    console.log(`✓ Created: ${event.title} (${event.start_date.toDateString()})`)
  }

  console.log('\n✅ Events seeding completed!')
  console.log(`📅 Created ${events.length} events`)
  console.log('\nEvent types:')
  console.log('- Study Abroad Fairs')
  console.log('- Webinars')
  console.log('- Info Sessions')
  console.log('- Workshops')
  console.log('- Seminars')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
