import { prisma } from '../lib/prisma'

async function main() {
  // Get or create an admin user for authorship
  let admin = await prisma.users.findFirst({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] }
    }
  })

  if (!admin) {
    console.error('No admin user found. Please create an admin user first.')
    return
  }

  const additionalPages = [
    {
      title: 'Guide for Parents',
      slug: 'guide-for-parents',
      content: `
        <div class="max-w-6xl mx-auto space-y-12">
          <section class="text-center space-y-6">
            <h1 class="text-4xl font-bold text-gray-900">Guide for Parents</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              International education procedures for guardians - Everything parents need to know about supporting their child's study abroad journey.
            </p>
          </section>

          <section class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-6">Your Role as a Parent</h2>
              <p class="text-lg text-gray-600 mb-6">
                As a parent, you play a crucial role in your child's international education journey. From initial planning to post-arrival support, your guidance and involvement can make all the difference.
              </p>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3">✓</span>
                  <div>
                    <strong>Financial Planning:</strong> Understanding costs and planning finances
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3">✓</span>
                  <div>
                    <strong>Documentation Support:</strong> Helping with paperwork and applications
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3">✓</span>
                  <div>
                    <strong>Emotional Support:</strong> Being there through challenges and successes
                  </div>
                </li>
              </ul>
            </div>
            <div class="bg-blue-50 p-8 rounded-lg">
              <h3 class="text-xl font-semibold mb-4">Key Parent Responsibilities</h3>
              <ul class="space-y-3 text-gray-700">
                <li>• Assist with financial documentation</li>
                <li>• Support visa application process</li>
                <li>• Help with accommodation arrangements</li>
                <li>• Provide emotional encouragement</li>
                <li>• Stay connected during studies</li>
              </ul>
            </div>
          </section>

          <section class="bg-gray-50 p-8 rounded-lg">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Financial Planning Checklist</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-xl font-semibold mb-4">Before Application</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>□ Research total education costs</li>
                  <li>□ Calculate living expenses</li>
                  <li>□ Explore scholarship opportunities</li>
                  <li>□ Consider education loans</li>
                  <li>□ Plan for emergency funds</li>
                </ul>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-4">During Process</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>□ Prepare bank statements</li>
                  <li>□ Get financial sponsorship documents</li>
                  <li>□ Submit loan approval letters</li>
                  <li>□ Arrange foreign exchange</li>
                  <li>□ Set up international banking</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Common Parent Concerns</h2>
            <div class="grid md:grid-cols-3 gap-8">
              <div class="bg-white p-6 rounded-lg border">
                <h3 class="text-lg font-semibold mb-4 text-red-600">Safety & Security</h3>
                <p class="text-gray-600 text-sm mb-4">Concerns about your child's safety in a foreign country.</p>
                <p class="text-gray-600 text-sm"><strong>Solution:</strong> Research destination safety, connect with local communities, and maintain regular communication.</p>
              </div>
              <div class="bg-white p-6 rounded-lg border">
                <h3 class="text-lg font-semibold mb-4 text-orange-600">Financial Burden</h3>
                <p class="text-gray-600 text-sm mb-4">Worries about the high costs of international education.</p>
                <p class="text-gray-600 text-sm"><strong>Solution:</strong> Explore scholarships, education loans, and part-time work opportunities for students.</p>
              </div>
              <div class="bg-white p-6 rounded-lg border">
                <h3 class="text-lg font-semibold mb-4 text-purple-600">Cultural Adjustment</h3>
                <p class="text-gray-600 text-sm mb-4">Concerns about your child adapting to a new culture.</p>
                <p class="text-gray-600 text-sm"><strong>Solution:</strong> Encourage cultural awareness, connect with student communities, and provide emotional support.</p>
              </div>
            </div>
          </section>
        </div>
      `,
      excerpt: 'Complete guide for parents on supporting their child\'s international education journey, from financial planning to emotional support.',
      template: 'guide',
      meta_title: 'Parent\'s Guide to Study Abroad - Supporting Your Child\'s International Education',
      meta_description: 'Essential guide for parents on supporting their child\'s study abroad journey. Learn about financial planning, visa process, and providing the right support.',
      is_published: true,
    },
    {
      title: 'How to Choose a Course',
      slug: 'how-to-choose-course',
      content: `
        <div class="max-w-6xl mx-auto space-y-12">
          <section class="text-center space-y-6">
            <h1 class="text-4xl font-bold text-gray-900">How to Choose a Course</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Your guide to making an efficient course selection that aligns with your career goals and personal interests.
            </p>
          </section>

          <section class="bg-blue-50 p-8 rounded-lg">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Course Selection Framework</h2>
            <div class="grid md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl">1</div>
                <h3 class="font-semibold mb-2">Self Assessment</h3>
                <p class="text-sm text-gray-600">Identify your interests, strengths, and career goals</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl">2</div>
                <h3 class="font-semibold mb-2">Market Research</h3>
                <p class="text-sm text-gray-600">Analyze job market trends and industry demands</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl">3</div>
                <h3 class="font-semibold mb-2">Course Comparison</h3>
                <p class="text-sm text-gray-600">Compare different programs and their outcomes</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl">4</div>
                <h3 class="font-semibold mb-2">Final Decision</h3>
                <p class="text-sm text-gray-600">Make an informed choice based on all factors</p>
              </div>
            </div>
          </section>

          <section class="grid md:grid-cols-2 gap-12">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-6">Popular Course Categories</h2>
              <div class="space-y-4">
                <div class="border-l-4 border-blue-600 pl-4">
                  <h3 class="text-lg font-semibold">Business & Management</h3>
                  <p class="text-gray-600 text-sm">MBA, Business Administration, Finance, Marketing</p>
                </div>
                <div class="border-l-4 border-green-600 pl-4">
                  <h3 class="text-lg font-semibold">Engineering & Technology</h3>
                  <p class="text-gray-600 text-sm">Computer Science, Mechanical, Electrical, Civil Engineering</p>
                </div>
                <div class="border-l-4 border-purple-600 pl-4">
                  <h3 class="text-lg font-semibold">Healthcare & Medicine</h3>
                  <p class="text-gray-600 text-sm">Medicine, Nursing, Pharmacy, Public Health</p>
                </div>
                <div class="border-l-4 border-orange-600 pl-4">
                  <h3 class="text-lg font-semibold">Arts & Humanities</h3>
                  <p class="text-gray-600 text-sm">Literature, History, Philosophy, Fine Arts</p>
                </div>
              </div>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-6">Key Factors to Consider</h2>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3 mt-1">•</span>
                  <div>
                    <strong>Career Prospects:</strong> Future job opportunities and salary potential
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3 mt-1">•</span>
                  <div>
                    <strong>Personal Interest:</strong> Your passion and natural inclination
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3 mt-1">•</span>
                  <div>
                    <strong>Academic Requirements:</strong> Entry requirements and prerequisites
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3 mt-1">•</span>
                  <div>
                    <strong>Course Duration:</strong> Time commitment and program length
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3 mt-1">•</span>
                  <div>
                    <strong>Cost & ROI:</strong> Tuition fees versus expected returns
                  </div>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3 mt-1">•</span>
                  <div>
                    <strong>Location:</strong> Country, city, and university location
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>
      `,
      excerpt: 'Comprehensive guide to selecting the right course for your international education based on interests, market trends, and career prospects.',
      template: 'guide',
      meta_title: 'How to Choose the Right Course for Study Abroad',
      meta_description: 'Learn how to select the perfect course for your international education. Explore course categories, key factors, and decision-making frameworks.',
      is_published: true,
    },
    {
      title: 'Why Choose Us',
      slug: 'why-choose-us',
      content: `
        <div class="max-w-6xl mx-auto space-y-12">
          <section class="text-center space-y-6">
            <h1 class="text-4xl font-bold text-gray-900">Why Choose Us</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything about BNOverseas's strong suits and why thousands of students trust us with their international education dreams.
            </p>
          </section>

          <section class="grid md:grid-cols-3 gap-8">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg text-center">
              <div class="w-20 h-20 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                15+
              </div>
              <h3 class="text-xl font-semibold mb-2">Years of Experience</h3>
              <p class="text-gray-600">Trusted expertise in international education consulting</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg text-center">
              <div class="w-20 h-20 bg-green-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                10K+
              </div>
              <h3 class="text-xl font-semibold mb-2">Students Placed</h3>
              <p class="text-gray-600">Successfully guided students to top universities</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-lg text-center">
              <div class="w-20 h-20 bg-purple-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                25+
              </div>
              <h3 class="text-xl font-semibold mb-2">Countries</h3>
              <p class="text-gray-600">Global reach with destination expertise</p>
            </div>
          </section>

          <section class="bg-gray-50 p-8 rounded-lg">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Our Unique Advantages</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-xl font-semibold mb-4 text-blue-600">🎯 Personalized Approach</h3>
                <p class="text-gray-600 mb-4">Every student is unique, and so is their path to success. We provide personalized counseling based on individual profiles, interests, and career goals.</p>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• One-on-one counseling sessions</li>
                  <li>• Customized university shortlisting</li>
                  <li>• Tailored application strategies</li>
                </ul>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-4 text-green-600">🏆 Proven Success Rate</h3>
                <p class="text-gray-600 mb-4">Our track record speaks for itself. With a 95% visa success rate and placements in top-tier universities worldwide.</p>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• 95% visa approval rate</li>
                  <li>• 100+ partner universities</li>
                  <li>• Top-ranked institution placements</li>
                </ul>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-4 text-orange-600">💰 Scholarship Expertise</h3>
                <p class="text-gray-600 mb-4">We help students secure millions in scholarships annually through our extensive knowledge of funding opportunities.</p>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• $50M+ in scholarships secured</li>
                  <li>• Merit & need-based funding</li>
                  <li>• University partnership benefits</li>
                </ul>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-4 text-purple-600">🌟 End-to-End Support</h3>
                <p class="text-gray-600 mb-4">From initial counseling to post-arrival support, we're with you every step of your international education journey.</p>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Pre-departure orientation</li>
                  <li>• Airport pickup assistance</li>
                  <li>• Post-arrival support services</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">What Students Say</h2>
            <div class="grid md:grid-cols-3 gap-8">
              <div class="bg-white p-6 rounded-lg border shadow-sm">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-blue-600 font-bold">AK</span>
                  </div>
                  <div>
                    <h4 class="font-semibold">Amit Kumar</h4>
                    <p class="text-sm text-gray-600">MS Computer Science, Stanford</p>
                  </div>
                </div>
                <p class="text-gray-600 text-sm italic">"BNOverseas's guidance was instrumental in securing my admission to Stanford. Their personalized approach made all the difference."</p>
              </div>
              <div class="bg-white p-6 rounded-lg border shadow-sm">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-green-600 font-bold">PS</span>
                  </div>
                  <div>
                    <h4 class="font-semibold">Priya Sharma</h4>
                    <p class="text-sm text-gray-600">MBA, London Business School</p>
                  </div>
                </div>
                <p class="text-gray-600 text-sm italic">"The team helped me secure a substantial scholarship and navigate the complex application process with ease."</p>
              </div>
              <div class="bg-white p-6 rounded-lg border shadow-sm">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-purple-600 font-bold">RG</span>
                  </div>
                  <div>
                    <h4 class="font-semibold">Rahul Gupta</h4>
                    <p class="text-sm text-gray-600">Engineering, University of Toronto</p>
                  </div>
                </div>
                <p class="text-gray-600 text-sm italic">"From counseling to visa approval, the entire process was smooth. Highly recommend their services!"</p>
              </div>
            </div>
          </section>
        </div>
      `,
      excerpt: 'Discover what makes us the preferred choice for international education counseling - proven results, personalized approach, and comprehensive support.',
      template: 'about',
      meta_title: 'Why Choose Us - Leading Study Abroad Consultants',
      meta_description: 'Learn why thousands of students choose us for their international education journey. Proven success rate, personalized approach, and comprehensive support.',
      is_published: true,
    },
    {
      title: 'Study Abroad Benefits',
      slug: 'study-abroad-benefits',
      content: `
        <div class="max-w-6xl mx-auto space-y-12">
          <section class="text-center space-y-6">
            <h1 class="text-4xl font-bold text-gray-900">Study Abroad Benefits</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Advantages of global education drawn from experience - Discover how international education can transform your career and personal growth.
            </p>
          </section>

          <section class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-6">Life-Changing Benefits</h2>
              <p class="text-lg text-gray-600 mb-6">
                Studying abroad is more than just education - it's a transformative experience that shapes your future in ways you never imagined.
              </p>
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span class="text-blue-600 text-xl">🌍</span>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">Global Perspective</h3>
                    <p class="text-gray-600 text-sm">Develop a broader worldview and cultural understanding</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span class="text-green-600 text-xl">💼</span>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">Career Advancement</h3>
                    <p class="text-gray-600 text-sm">Access to international job markets and better opportunities</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span class="text-purple-600 text-xl">🧠</span>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">Personal Growth</h3>
                    <p class="text-gray-600 text-sm">Build independence, confidence, and problem-solving skills</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg">
              <h3 class="text-xl font-semibold mb-6 text-center">Top Benefits at a Glance</h3>
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-blue-600">85%</div>
                  <div class="text-sm text-gray-600">Higher Salary</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-green-600">92%</div>
                  <div class="text-sm text-gray-600">Job Placement</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-purple-600">78%</div>
                  <div class="text-sm text-gray-600">Leadership Roles</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-orange-600">100%</div>
                  <div class="text-sm text-gray-600">Life Satisfaction</div>
                </div>
              </div>
            </div>
          </section>

          <section class="bg-gray-50 p-8 rounded-lg">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Academic Excellence</h2>
            <div class="grid md:grid-cols-3 gap-8">
              <div class="text-center">
                <h3 class="text-xl font-semibold mb-4 text-blue-600">World-Class Universities</h3>
                <p class="text-gray-600 mb-4">Access to top-ranked institutions with cutting-edge facilities and renowned faculty.</p>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• QS Top 100 universities</li>
                  <li>• Research opportunities</li>
                  <li>• Industry collaborations</li>
                </ul>
              </div>
              <div class="text-center">
                <h3 class="text-xl font-semibold mb-4 text-green-600">Diverse Learning</h3>
                <p class="text-gray-600 mb-4">Experience diverse teaching methods and learn alongside students from around the world.</p>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Interactive learning methods</li>
                  <li>• Multicultural classrooms</li>
                  <li>• Global case studies</li>
                </ul>
              </div>
              <div class="text-center">
                <h3 class="text-xl font-semibold mb-4 text-purple-600">Specialized Programs</h3>
                <p class="text-gray-600 mb-4">Access to specialized courses and programs not available in your home country.</p>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Cutting-edge curricula</li>
                  <li>• Industry partnerships</li>
                  <li>• Practical training</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Career Impact</h2>
            <div class="grid md:grid-cols-2 gap-12">
              <div>
                <h3 class="text-2xl font-semibold mb-6 text-blue-600">Professional Advantages</h3>
                <div class="space-y-4">
                  <div class="border-l-4 border-blue-600 pl-4">
                    <h4 class="font-semibold">Higher Earning Potential</h4>
                    <p class="text-gray-600 text-sm">International graduates earn 40-60% more than domestic graduates</p>
                  </div>
                  <div class="border-l-4 border-green-600 pl-4">
                    <h4 class="font-semibold">Global Network</h4>
                    <p class="text-gray-600 text-sm">Build professional connections across continents</p>
                  </div>
                  <div class="border-l-4 border-purple-600 pl-4">
                    <h4 class="font-semibold">Multinational Experience</h4>
                    <p class="text-gray-600 text-sm">Preferred by employers for international roles</p>
                  </div>
                  <div class="border-l-4 border-orange-600 pl-4">
                    <h4 class="font-semibold">Leadership Skills</h4>
                    <p class="text-gray-600 text-sm">Develop skills valued in management positions</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-2xl font-semibold mb-6 text-green-600">Personal Development</h3>
                <div class="space-y-4">
                  <div class="border-l-4 border-blue-600 pl-4">
                    <h4 class="font-semibold">Cultural Intelligence</h4>
                    <p class="text-gray-600 text-sm">Navigate and work effectively in diverse environments</p>
                  </div>
                  <div class="border-l-4 border-green-600 pl-4">
                    <h4 class="font-semibold">Independence</h4>
                    <p class="text-gray-600 text-sm">Develop self-reliance and problem-solving abilities</p>
                  </div>
                  <div class="border-l-4 border-purple-600 pl-4">
                    <h4 class="font-semibold">Language Skills</h4>
                    <p class="text-gray-600 text-sm">Master new languages and communication styles</p>
                  </div>
                  <div class="border-l-4 border-orange-600 pl-4">
                    <h4 class="font-semibold">Confidence</h4>
                    <p class="text-gray-600 text-sm">Build confidence through overcoming challenges</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      `,
      excerpt: 'Explore the comprehensive benefits of studying abroad including career advancement, personal growth, and academic excellence.',
      template: 'study-abroad',
      meta_title: 'Benefits of Studying Abroad - Transform Your Future',
      meta_description: 'Discover the life-changing benefits of international education including career advancement, personal growth, and global opportunities.',
      is_published: true,
    }
  ]

  for (const pageData of additionalPages) {
    try {
      await prisma.pages.upsert({
        where: { slug: pageData.slug },
        update: {
          ...pageData,
          author_id: admin.id,
          updated_at: new Date(),
        },
        create: {
          id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...pageData,
          author_id: admin.id,
          published_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
      console.log(`✓ Created/updated page: ${pageData.title}`)
    } catch (error) {
      console.error(`✗ Error creating page ${pageData.title}:`, error)
    }
  }

  console.log('Additional pages seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })