import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting blog content seeding...')

  // Get admin user ID
  const adminUser = await prisma.users.findUnique({
    where: { email: 'admin@bnoverseas.com' }
  })

  if (!adminUser) {
    console.error('Admin user not found. Please run the main seed first.')
    return
  }

  // Seed Categories
  const categories = [
    {
      name: 'Study Abroad',
      slug: 'study-abroad',
      description: 'Articles about studying abroad, university selection, and international education opportunities.',
      order_index: 0,
      is_active: true,
    },
    {
      name: 'Test Preparation',
      slug: 'test-preparation',
      description: 'Tips and guides for standardized tests like IELTS, TOEFL, GRE, GMAT, and more.',
      order_index: 1,
      is_active: true,
    },
    {
      name: 'Scholarships',
      slug: 'scholarships',
      description: 'Information about scholarship opportunities, funding options, and financial aid.',
      order_index: 2,
      is_active: true,
    },
    {
      name: 'Visa Guide',
      slug: 'visa-guide',
      description: 'Comprehensive guides about visa processes, requirements, and application tips.',
      order_index: 3,
      is_active: true,
    },
    {
      name: 'University Life',
      slug: 'university-life',
      description: 'Articles about campus life, student experiences, and adapting to university culture.',
      order_index: 4,
      is_active: true,
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const createdCategory = await prisma.categories.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        id: randomUUID(),
        ...category,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    createdCategories.push(createdCategory)
  }

  // Seed Tags
  const tags = [
    'Canada', 'USA', 'UK', 'Australia', 'Germany', 'Ireland', 'Singapore',
    'Universities', 'Study Abroad', 'IELTS', 'TOEFL', 'GRE', 'GMAT',
    'Scholarships', 'Financial Aid', 'Visa', 'Student Life', 'Test Prep',
    'Application Tips', 'University Selection', 'Masters', 'Bachelors', 'PhD'
  ]

  const createdTags = []
  for (const tagName of tags) {
    const tag = await prisma.tags.upsert({
      where: { slug: tagName.toLowerCase().replace(' ', '-') },
      update: {},
      create: {
        id: randomUUID(),
        name: tagName,
        slug: tagName.toLowerCase().replace(' ', '-'),
        description: `Articles related to ${tagName}`,
        color: '#3b82f6',
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    createdTags.push(tag)
  }

  // Seed Blog Posts
  const blogPosts = [
    {
      title: 'Complete Guide to Studying in Canada 2024',
      slug: 'complete-guide-studying-canada-2024',
      content: `<h2>Why Choose Canada for Your Studies?</h2>
<p>Canada has become one of the most popular destinations for international students, and for good reasons. With world-class universities, affordable education costs, and welcoming immigration policies, Canada offers an exceptional educational experience.</p>

<h3>Top Universities in Canada</h3>
<p>Canada is home to some of the world's most prestigious universities:</p>
<ul>
<li>University of Toronto - Ranked among top 25 globally</li>
<li>McGill University - Known for research excellence</li>
<li>University of British Columbia - Beautiful campus with strong programs</li>
<li>University of Waterloo - Leading in technology and innovation</li>
</ul>

<h3>Admission Requirements</h3>
<p>To study in Canada, you'll typically need:</p>
<ul>
<li>Academic transcripts and diplomas</li>
<li>English language proficiency (IELTS/TOEFL)</li>
<li>Letters of recommendation</li>
<li>Statement of Purpose</li>
<li>Financial proof</li>
</ul>

<h3>Visa Process</h3>
<p>The Canadian student visa (Study Permit) process involves several steps. Our expert counselors can guide you through each requirement and help ensure your application is successful.</p>`,
      excerpt: 'Everything you need to know about studying in Canada, from university selection to visa requirements and living expenses. Your complete guide for 2024.',
      featured_image: '/news-1.jpg',
      author_id: adminUser.id,
      author_name: 'Study Abroad Expert',
      category_id: createdCategories.find(c => c.slug === 'study-abroad')?.id,
      status: 'PUBLISHED',
      published_at: new Date('2024-01-15'),
      seo_title: 'Complete Guide to Studying in Canada 2024 - BN Overseas',
      seo_description: 'Comprehensive guide to studying in Canada. Learn about top universities, admission requirements, visa process, and living expenses.',
      view_count: 1250,
      read_time: 8,
      tags: ['Canada', 'Study Abroad', 'Universities', 'Visa']
    },
    {
      title: 'IELTS vs TOEFL: Which Test Should You Take?',
      slug: 'ielts-vs-toefl-which-test-should-you-take',
      content: `<h2>Understanding IELTS and TOEFL</h2>
<p>Both IELTS and TOEFL are English proficiency tests accepted by universities worldwide. However, there are key differences that might make one more suitable for you than the other.</p>

<h3>IELTS Overview</h3>
<p>The International English Language Testing System (IELTS) is widely accepted in the UK, Australia, Canada, and New Zealand.</p>
<ul>
<li>Test Format: Paper-based or computer-based</li>
<li>Speaking Test: Face-to-face with examiner</li>
<li>Score Range: 0-9 bands</li>
<li>Test Duration: 2 hours 45 minutes</li>
</ul>

<h3>TOEFL Overview</h3>
<p>The Test of English as a Foreign Language (TOEFL) is primarily accepted in the United States and Canada.</p>
<ul>
<li>Test Format: Internet-based (iBT)</li>
<li>Speaking Test: Computer-based recording</li>
<li>Score Range: 0-120 points</li>
<li>Test Duration: 3 hours</li>
</ul>

<h3>Which Test Should You Choose?</h3>
<p>Your choice depends on your target universities and personal preferences. Our test preparation experts can help you decide and prepare effectively.</p>`,
      excerpt: 'A comprehensive comparison of IELTS and TOEFL to help you choose the right English proficiency test for your study abroad goals.',
      featured_image: '/news-2.jpg',
      author_id: adminUser.id,
      author_name: 'Test Prep Specialist',
      category_id: createdCategories.find(c => c.slug === 'test-preparation')?.id,
      status: 'PUBLISHED',
      published_at: new Date('2024-01-10'),
      seo_title: 'IELTS vs TOEFL: Complete Comparison Guide 2024',
      seo_description: 'Compare IELTS and TOEFL tests. Learn the differences, scoring systems, and which test is best for your study abroad plans.',
      view_count: 980,
      read_time: 6,
      tags: ['IELTS', 'TOEFL', 'Test Prep', 'Study Abroad']
    },
    {
      title: 'Scholarship Opportunities for International Students',
      slug: 'scholarship-opportunities-international-students',
      content: `<h2>Types of Scholarships Available</h2>
<p>Studying abroad can be expensive, but numerous scholarship opportunities can help make your dream education affordable.</p>

<h3>Merit-Based Scholarships</h3>
<p>These scholarships are awarded based on academic excellence, achievements, and potential.</p>
<ul>
<li>University-specific scholarships</li>
<li>Government scholarships</li>
<li>Private foundation scholarships</li>
<li>Corporate scholarships</li>
</ul>

<h3>Need-Based Financial Aid</h3>
<p>Financial assistance for students who demonstrate financial need:</p>
<ul>
<li>Grants and bursaries</li>
<li>Work-study programs</li>
<li>Low-interest student loans</li>
</ul>

<h3>Popular International Scholarships</h3>
<ul>
<li><strong>Fulbright Scholarships</strong> - USA</li>
<li><strong>Chevening Scholarships</strong> - UK</li>
<li><strong>Australia Awards</strong> - Australia</li>
<li><strong>Vanier Canada Graduate Scholarships</strong> - Canada</li>
<li><strong>DAAD Scholarships</strong> - Germany</li>
</ul>

<h3>Application Tips</h3>
<p>Our scholarship advisors can help you identify suitable opportunities and craft compelling applications that stand out.</p>`,
      excerpt: 'Discover the best scholarship programs available for international students and learn how to increase your chances of securing funding.',
      featured_image: '/news-3.jpg',
      author_id: adminUser.id,
      author_name: 'Financial Aid Counselor',
      category_id: createdCategories.find(c => c.slug === 'scholarships')?.id,
      status: 'PUBLISHED',
      published_at: new Date('2024-01-05'),
      seo_title: 'International Student Scholarships 2024 - Complete Guide',
      seo_description: 'Find scholarship opportunities for international students. Learn about merit-based, need-based aid and how to apply successfully.',
      view_count: 1580,
      read_time: 7,
      tags: ['Scholarships', 'Financial Aid', 'Funding', 'International Students']
    },
    {
      title: 'Student Visa Interview Tips: How to Succeed',
      slug: 'student-visa-interview-tips-how-to-succeed',
      content: `<h2>Preparing for Your Visa Interview</h2>
<p>The visa interview is a crucial step in your study abroad journey. Proper preparation can significantly increase your chances of approval.</p>

<h3>Common Interview Questions</h3>
<p>Be prepared to answer these typical questions:</p>
<ul>
<li>Why do you want to study in [country]?</li>
<li>Why did you choose this university/program?</li>
<li>How will you fund your studies?</li>
<li>What are your plans after graduation?</li>
<li>Do you have family/friends in the destination country?</li>
</ul>

<h3>Required Documents</h3>
<p>Ensure you have all necessary documents organized:</p>
<ul>
<li>Passport and application forms</li>
<li>University acceptance letter</li>
<li>Financial documents</li>
<li>Academic transcripts</li>
<li>English proficiency test scores</li>
</ul>

<h3>Interview Day Tips</h3>
<ul>
<li>Dress professionally</li>
<li>Arrive early</li>
<li>Be confident and honest</li>
<li>Speak clearly and concisely</li>
<li>Maintain eye contact</li>
</ul>

<p>Our visa experts provide mock interviews and personalized coaching to help you succeed.</p>`,
      excerpt: 'Essential tips and strategies to help you prepare for and succeed in your student visa interview.',
      featured_image: '/news-4.jpg',
      author_id: adminUser.id,
      author_name: 'Visa Consultant',
      category_id: createdCategories.find(c => c.slug === 'visa-guide')?.id,
      status: 'PUBLISHED',
      published_at: new Date('2024-01-01'),
      seo_title: 'Student Visa Interview Tips - How to Succeed in 2024',
      seo_description: 'Master your student visa interview with expert tips. Learn common questions, required documents, and success strategies.',
      view_count: 890,
      read_time: 5,
      tags: ['Visa', 'Interview Tips', 'Study Abroad', 'Application Tips']
    },
    {
      title: 'Top Universities in the UK for International Students',
      slug: 'top-universities-uk-international-students',
      content: `<h2>Why Study in the UK?</h2>
<p>The United Kingdom remains one of the most popular destinations for international students, offering world-class education, rich cultural heritage, and excellent career prospects.</p>

<h3>Russell Group Universities</h3>
<p>The Russell Group represents 24 leading UK universities known for their research excellence:</p>
<ul>
<li><strong>University of Oxford</strong> - Oldest English-speaking university</li>
<li><strong>University of Cambridge</strong> - Historic institution with cutting-edge research</li>
<li><strong>Imperial College London</strong> - Leading science and technology university</li>
<li><strong>London School of Economics</strong> - Premier social sciences institution</li>
<li><strong>University College London</strong> - Diverse programs in central London</li>
</ul>

<h3>Application Requirements</h3>
<p>UK university applications typically require:</p>
<ul>
<li>Academic qualifications equivalent to UK standards</li>
<li>English language proficiency (IELTS/TOEFL)</li>
<li>Personal statement</li>
<li>References</li>
<li>Portfolio (for creative subjects)</li>
</ul>

<h3>Scholarships and Funding</h3>
<p>Various funding options are available:</p>
<ul>
<li>Chevening Scholarships</li>
<li>Commonwealth Scholarships</li>
<li>University-specific scholarships</li>
<li>Subject-specific funding</li>
</ul>`,
      excerpt: 'Explore the top universities in the UK for international students, including admission requirements and scholarship opportunities.',
      featured_image: '/news-5.jpg',
      author_id: adminUser.id,
      author_name: 'UK Education Expert',
      category_id: createdCategories.find(c => c.slug === 'study-abroad')?.id,
      status: 'PUBLISHED',
      published_at: new Date('2023-12-28'),
      seo_title: 'Top UK Universities for International Students 2024',
      seo_description: 'Discover the best UK universities for international students. Learn about Russell Group institutions, requirements, and scholarships.',
      view_count: 1340,
      read_time: 9,
      tags: ['UK', 'Universities', 'Study Abroad', 'International Students']
    },
    {
      title: 'Living Costs for Students in Australia: Budget Guide',
      slug: 'living-costs-students-australia-budget-guide',
      content: `<h2>Understanding Australian Student Living Costs</h2>
<p>Australia offers excellent education opportunities, but it's important to understand the living costs to plan your budget effectively.</p>

<h3>Accommodation Costs</h3>
<p>Housing is typically the largest expense for students:</p>
<ul>
<li><strong>University Accommodation:</strong> AUD $150-280 per week</li>
<li><strong>Shared Apartment:</strong> AUD $120-250 per week</li>
<li><strong>Homestay:</strong> AUD $200-300 per week</li>
<li><strong>Private Rental:</strong> AUD $200-400 per week</li>
</ul>

<h3>Daily Living Expenses</h3>
<ul>
<li><strong>Food and Groceries:</strong> AUD $80-120 per week</li>
<li><strong>Transportation:</strong> AUD $25-50 per week</li>
<li><strong>Phone and Internet:</strong> AUD $20-40 per week</li>
<li><strong>Entertainment:</strong> AUD $30-60 per week</li>
</ul>

<h3>Money-Saving Tips</h3>
<ul>
<li>Cook at home instead of eating out</li>
<li>Use student discounts</li>
<li>Share accommodation</li>
<li>Use public transportation</li>
<li>Buy second-hand textbooks</li>
</ul>

<h3>Part-Time Work</h3>
<p>International students can work up to 20 hours per week during studies, earning approximately AUD $20-25 per hour.</p>`,
      excerpt: 'Comprehensive guide to living costs for international students in Australia, including accommodation, food, and money-saving tips.',
      featured_image: '/news-6.jpg',
      author_id: adminUser.id,
      author_name: 'Australia Study Advisor',
      category_id: createdCategories.find(c => c.slug === 'university-life')?.id,
      status: 'PUBLISHED',
      published_at: new Date('2023-12-25'),
      seo_title: 'Student Living Costs in Australia 2024 - Complete Budget Guide',
      seo_description: 'Plan your budget for studying in Australia. Learn about accommodation costs, living expenses, and money-saving tips for students.',
      view_count: 745,
      read_time: 6,
      tags: ['Australia', 'University Life', 'Budget', 'Living Costs', 'Student Life']
    }
  ]

  // Create blog posts
  for (const post of blogPosts) {
    const createdPost = await prisma.blog_posts.create({
      data: {
        id: randomUUID(),
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featured_image: post.featured_image,
        author_id: post.author_id,
        author_name: post.author_name,
        category_id: post.category_id,
        status: post.status as any,
        published_at: post.published_at,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        view_count: post.view_count,
        read_time: post.read_time,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    // Connect tags to blog posts
    const postTags = createdTags.filter(tag =>
      post.tags.some(tagName => tag.name === tagName)
    )

    if (postTags.length > 0) {
      await prisma.blog_posts.update({
        where: { id: createdPost.id },
        data: {
          tags: {
            connect: postTags.map(tag => ({ id: tag.id }))
          }
        }
      })
    }
  }

  console.log('✅ Blog content seeding completed successfully!')
  console.log('Created:')
  console.log('📂 5 blog categories')
  console.log('🏷️  24 tags')
  console.log('📝 6 featured blog posts')
  console.log('')
  console.log('🚀 News section now has proper blog content!')
  console.log('🔗 All blog posts are connected to categories and tags.')
}

main()
  .catch((e) => {
    console.error('❌ Error during blog seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })