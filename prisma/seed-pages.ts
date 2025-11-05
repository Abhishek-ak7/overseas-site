import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CMS pages...')

  // Get or create a default user for pages
  let user = await prisma.users.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
  })

  if (!user) {
    console.log('Creating default admin user...')
    user = await prisma.users.create({
      data: {
        email: 'admin@bnoverseas.com',
        password: '$2a$10$YourHashedPasswordHere', // This should be hashed
        first_name: 'Admin',
        last_name: 'User',
        role: 'SUPER_ADMIN',
        is_active: true,
        email_verified: true,
      }
    })
  }

  const pages = [
    {
      title: 'About Us',
      slug: 'about-us',
      excerpt: 'Learn more about BN Overseas and our mission to help students achieve their dreams.',
      content: `
        <h2>Welcome to BN Overseas</h2>
        <p>BN Overseas is your trusted partner in international education. With years of experience in helping students achieve their dreams of studying abroad, we provide comprehensive guidance and support throughout your journey.</p>

        <h3>Our Mission</h3>
        <p>We believe that education is the key to unlocking potential and creating opportunities. Our mission is to make international education accessible to all students by providing expert guidance, comprehensive information, and personalized support.</p>

        <h3>Why Choose Us?</h3>
        <ul>
          <li>Expert counselors with years of experience</li>
          <li>Partnerships with top universities worldwide</li>
          <li>Personalized guidance tailored to your needs</li>
          <li>Complete support from application to visa</li>
          <li>Scholarship assistance</li>
        </ul>

        <h3>Our Values</h3>
        <p>Integrity, Excellence, and Student Success are at the core of everything we do. We are committed to providing honest advice and transparent processes to ensure the best outcomes for our students.</p>
      `,
      meta_title: 'About Us - BN Overseas Education Consultants',
      meta_description: 'Learn about BN Overseas, your trusted partner in international education. Expert guidance for studying abroad.',
      is_published: true,
      author_id: user.id,
    },
    {
      title: 'How to Choose the Right Course',
      slug: 'how-to-choose-course',
      excerpt: 'A comprehensive guide to selecting the perfect course for your international education journey.',
      content: `
        <h2>Choosing the Right Course: A Complete Guide</h2>
        <p>Selecting the right course is one of the most important decisions in your education journey. Here's how to make the best choice.</p>

        <h3>1. Assess Your Interests and Strengths</h3>
        <p>Start by identifying subjects you're passionate about and areas where you excel. Your interests and strengths will guide you toward courses where you can thrive.</p>

        <h3>2. Research Career Prospects</h3>
        <p>Look into the career opportunities associated with different courses. Consider:</p>
        <ul>
          <li>Job market demand</li>
          <li>Average salaries</li>
          <li>Growth potential</li>
          <li>Work-life balance</li>
        </ul>

        <h3>3. Consider Course Content</h3>
        <p>Review the curriculum, modules, and specializations offered. Make sure the course covers topics that interest you and align with your career goals.</p>

        <h3>4. Check Entry Requirements</h3>
        <p>Ensure you meet or can meet the academic requirements, including:</p>
        <ul>
          <li>GPA requirements</li>
          <li>Standardized test scores (SAT, GRE, GMAT)</li>
          <li>English proficiency (IELTS, TOEFL)</li>
          <li>Work experience (for some programs)</li>
        </ul>

        <h3>5. Evaluate University Rankings and Reputation</h3>
        <p>While rankings aren't everything, they can indicate the quality of education and research opportunities available.</p>

        <h3>6. Consider Location and Culture</h3>
        <p>Think about the country, city, and campus environment. Consider factors like:</p>
        <ul>
          <li>Climate</li>
          <li>Cost of living</li>
          <li>Cultural fit</li>
          <li>Distance from home</li>
          <li>Post-study work opportunities</li>
        </ul>

        <h3>7. Financial Planning</h3>
        <p>Calculate total costs including tuition, living expenses, and consider scholarship opportunities.</p>

        <h3>Need Help?</h3>
        <p>Our expert counselors can help you navigate these decisions. Book a free consultation today!</p>
      `,
      meta_title: 'How to Choose the Right Course for Study Abroad',
      meta_description: 'Complete guide to selecting the perfect international course. Learn how to choose based on interests, career prospects, and more.',
      is_published: true,
      author_id: user.id,
    },
    {
      title: 'Student Visa Guide',
      slug: 'student-visa-guide',
      excerpt: 'Everything you need to know about student visa applications for popular study destinations.',
      content: `
        <h2>Student Visa Application Guide</h2>
        <p>Obtaining a student visa is a crucial step in your study abroad journey. Here's what you need to know.</p>

        <h3>General Requirements</h3>
        <p>Most student visas require:</p>
        <ul>
          <li>Valid passport</li>
          <li>Letter of acceptance from university</li>
          <li>Proof of financial support</li>
          <li>English proficiency test scores</li>
          <li>Medical examination</li>
          <li>Police clearance certificate</li>
        </ul>

        <h3>Popular Destinations</h3>

        <h4>United States (F-1 Visa)</h4>
        <p>The F-1 visa is for full-time students. Key requirements include I-20 form, SEVIS fee payment, and visa interview.</p>

        <h4>Canada (Study Permit)</h4>
        <p>Canada requires proof of acceptance, proof of funds, and biometrics. Processing time varies by country.</p>

        <h4>Australia (Subclass 500)</h4>
        <p>Australia's student visa requires CoE (Confirmation of Enrollment), GTE (Genuine Temporary Entrant) statement, and health insurance.</p>

        <h4>United Kingdom (Student Route)</h4>
        <p>UK student visa requires CAS (Confirmation of Acceptance for Studies), maintenance funds, and TB test results.</p>

        <h3>Tips for Success</h3>
        <ul>
          <li>Apply early - visa processing can take weeks or months</li>
          <li>Ensure all documents are complete and accurate</li>
          <li>Be honest in your visa interview</li>
          <li>Keep copies of all documents</li>
          <li>Track your application status</li>
        </ul>

        <h3>Common Reasons for Rejection</h3>
        <ul>
          <li>Insufficient financial proof</li>
          <li>Incomplete documentation</li>
          <li>Unclear study intentions</li>
          <li>Previous visa violations</li>
        </ul>

        <p><strong>We can help!</strong> Our visa experts have a high success rate and can guide you through every step of the process.</p>
      `,
      meta_title: 'Student Visa Guide - Complete Application Process',
      meta_description: 'Comprehensive guide to student visa applications for USA, Canada, UK, Australia and more. Requirements, tips, and expert advice.',
      is_published: true,
      author_id: user.id,
    },
    {
      title: 'Scholarship Opportunities',
      slug: 'scholarships',
      excerpt: 'Discover scholarship opportunities to fund your international education.',
      content: `
        <h2>Scholarship Opportunities for International Students</h2>
        <p>Funding your education abroad doesn't have to be a burden. Explore various scholarship opportunities available to international students.</p>

        <h3>Types of Scholarships</h3>

        <h4>1. Merit-Based Scholarships</h4>
        <p>Awarded based on academic excellence, test scores, or special talents.</p>

        <h4>2. Need-Based Scholarships</h4>
        <p>Provided to students who demonstrate financial need.</p>

        <h4>3. Country-Specific Scholarships</h4>
        <p>Available for students from specific countries or regions.</p>

        <h4>4. Subject-Specific Scholarships</h4>
        <p>For students pursuing particular fields of study like STEM, arts, or business.</p>

        <h3>Popular Scholarship Programs</h3>

        <h4>Fulbright Program (USA)</h4>
        <p>Prestigious scholarship for graduate students, covering tuition, living expenses, and more.</p>

        <h4>Chevening Scholarships (UK)</h4>
        <p>Fully-funded UK government scholarship for master's degrees.</p>

        <h4>Australia Awards</h4>
        <p>Long-term development scholarships for students from developing countries.</p>

        <h4>Canadian Commonwealth Scholarship</h4>
        <p>For students from Commonwealth countries pursuing higher education in Canada.</p>

        <h3>How to Apply</h3>
        <ol>
          <li>Research early - deadlines are often 6-12 months before program start</li>
          <li>Check eligibility criteria carefully</li>
          <li>Prepare strong application essays</li>
          <li>Gather required documents</li>
          <li>Get strong letters of recommendation</li>
          <li>Apply to multiple scholarships</li>
        </ol>

        <h3>Tips for Success</h3>
        <ul>
          <li>Start your search early</li>
          <li>Tailor each application to the specific scholarship</li>
          <li>Highlight your unique qualities and achievements</li>
          <li>Proofread everything multiple times</li>
          <li>Meet all deadlines</li>
        </ul>

        <p><strong>Need guidance?</strong> Our counselors can help identify suitable scholarships and assist with your applications.</p>
      `,
      meta_title: 'Scholarship Opportunities for Study Abroad',
      meta_description: 'Discover scholarships for international students. Learn about merit-based, need-based, and country-specific funding opportunities.',
      is_published: true,
      author_id: user.id,
    },
  ]

  console.log('Creating pages...')
  for (const pageData of pages) {
    const existing = await prisma.pages.findUnique({
      where: { slug: pageData.slug }
    })

    if (existing) {
      console.log(`⚠ Page already exists: ${pageData.title}`)
      continue
    }

    const page = await prisma.pages.create({
      data: pageData
    })
    console.log(`✓ Created: ${page.title} (/${page.slug})`)
  }

  console.log('\n✅ Pages seeding completed!')
  console.log(`📄 Created ${pages.length} pages`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
