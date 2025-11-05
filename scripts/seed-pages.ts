import { prisma } from '../lib/prisma'

async function main() {
  // Get or create an admin user for authorship
  let admin = await prisma.users.findFirst({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] }
    }
  })

  if (!admin) {
    // Try to find any existing admin by email
    admin = await prisma.users.findFirst({
      where: {
        email: 'admin@bnoverseas.com'
      }
    })

    if (!admin) {
      // Create a default admin user if none exists
      admin = await prisma.users.create({
        data: {
          id: `admin_${Date.now()}`,
          email: 'admin@bnoverseas.com',
          password_hash: 'temp', // This should be properly hashed in production
          first_name: 'Admin',
          last_name: 'User',
          role: 'ADMIN',
          is_verified: true,
          created_at: new Date(),
          updated_at: new Date(),
        }
      })
    }
  }

  const pages = [
    {
      title: 'About BNOverseasWork',
      slug: 'about-us',
      content: `
        <div class="max-w-6xl mx-auto space-y-12">
          <section class="text-center space-y-6">
            <h1 class="text-4xl font-bold text-gray-900">About BNOverseasWork</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted partner in international education, guiding students towards their dreams of studying abroad with personalized counseling and comprehensive support.
            </p>
          </section>

          <section class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p class="text-lg text-gray-600 mb-6">
                To democratize access to quality international education by providing expert guidance, personalized counseling, and end-to-end support to students pursuing their academic dreams overseas.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3">✓</span>
                  <span>Expert guidance from certified counselors</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3">✓</span>
                  <span>Personalized study abroad solutions</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-600 mr-3">✓</span>
                  <span>End-to-end application support</span>
                </li>
              </ul>
            </div>
            <div class="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <span class="text-gray-500">Mission Image</span>
            </div>
          </section>

          <section class="bg-blue-50 rounded-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">Our Team</h2>
            <p class="text-center text-gray-600 mb-8">
              Meet our dedicated team of education consultants and counselors
            </p>
            <div class="grid md:grid-cols-3 gap-8">
              <div class="text-center">
                <div class="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 class="font-semibold">John Smith</h3>
                <p class="text-sm text-gray-600">Senior Education Consultant</p>
              </div>
              <div class="text-center">
                <div class="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 class="font-semibold">Sarah Johnson</h3>
                <p class="text-sm text-gray-600">Study Abroad Counselor</p>
              </div>
              <div class="text-center">
                <div class="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 class="font-semibold">Michael Chen</h3>
                <p class="text-sm text-gray-600">Visa Specialist</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">Awards & Recognition</h2>
            <div class="grid md:grid-cols-4 gap-6 text-center">
              <div class="bg-white p-6 rounded-lg border">
                <div class="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span class="text-yellow-600 text-2xl">🏆</span>
                </div>
                <h3 class="font-semibold mb-2">Best Education Consultant 2023</h3>
                <p class="text-sm text-gray-600">International Education Awards</p>
              </div>
              <div class="bg-white p-6 rounded-lg border">
                <div class="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span class="text-blue-600 text-2xl">⭐</span>
                </div>
                <h3 class="font-semibold mb-2">5-Star Rating</h3>
                <p class="text-sm text-gray-600">Student Satisfaction Survey</p>
              </div>
              <div class="bg-white p-6 rounded-lg border">
                <div class="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span class="text-green-600 text-2xl">📈</span>
                </div>
                <h3 class="font-semibold mb-2">10,000+ Students</h3>
                <p class="text-sm text-gray-600">Successfully Placed</p>
              </div>
              <div class="bg-white p-6 rounded-lg border">
                <div class="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span class="text-purple-600 text-2xl">🌍</span>
                </div>
                <h3 class="font-semibold mb-2">25+ Countries</h3>
                <p class="text-sm text-gray-600">Global Reach</p>
              </div>
            </div>
          </section>
        </div>
      `,
      excerpt: 'Learn about BNOverseasWork\'s mission, team, awards and commitment to helping students achieve their study abroad dreams.',
      template: 'about',
      meta_title: 'About BNOverseasWork - Your Trusted Study Abroad Partner',
      meta_description: 'Discover BNOverseasWork\'s mission, meet our expert team, and learn about our awards in helping students achieve their international education goals.',
      is_published: true,
    },
    {
      title: 'Studying Abroad',
      slug: 'studying-abroad',
      content: `
        <div class="max-w-6xl mx-auto space-y-12">
          <section class="text-center space-y-6">
            <h1 class="text-4xl font-bold text-gray-900">Studying Abroad</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              If the question is education abroad, answer's here. Comprehensive guide to international education opportunities worldwide.
            </p>
          </section>

          <section class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg border-l-4 border-blue-600">
              <h3 class="text-xl font-semibold mb-4">Why Study Abroad?</h3>
              <ul class="space-y-3 text-gray-600">
                <li>• World-class education system</li>
                <li>• Global career opportunities</li>
                <li>• Cultural exposure and diversity</li>
                <li>• Advanced research facilities</li>
                <li>• International networking</li>
              </ul>
            </div>
            <div class="bg-white p-6 rounded-lg border-l-4 border-green-600">
              <h3 class="text-xl font-semibold mb-4">Popular Destinations</h3>
              <ul class="space-y-3 text-gray-600">
                <li>• United States</li>
                <li>• Canada</li>
                <li>• United Kingdom</li>
                <li>• Australia</li>
                <li>• Germany</li>
              </ul>
            </div>
            <div class="bg-white p-6 rounded-lg border-l-4 border-purple-600">
              <h3 class="text-xl font-semibold mb-4">Study Levels</h3>
              <ul class="space-y-3 text-gray-600">
                <li>• Undergraduate Programs</li>
                <li>• Graduate Programs</li>
                <li>• MBA Programs</li>
                <li>• PhD & Research</li>
                <li>• Diploma Courses</li>
              </ul>
            </div>
          </section>

          <section class="bg-gray-50 p-8 rounded-lg">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Application Process</h2>
            <div class="grid md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl">1</div>
                <h3 class="font-semibold mb-2">Profile Assessment</h3>
                <p class="text-sm text-gray-600">Evaluate your academic background and goals</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl">2</div>
                <h3 class="font-semibold mb-2">University Selection</h3>
                <p class="text-sm text-gray-600">Choose the best universities for your profile</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl">3</div>
                <h3 class="font-semibold mb-2">Application Support</h3>
                <p class="text-sm text-gray-600">Complete documentation and submission</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl">4</div>
                <h3 class="font-semibold mb-2">Visa Guidance</h3>
                <p class="text-sm text-gray-600">Navigate visa requirements and processes</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Requirements & Documents</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-xl font-semibold mb-4">Academic Requirements</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• Academic transcripts</li>
                  <li>• Standardized test scores (SAT, GRE, GMAT)</li>
                  <li>• English proficiency tests (IELTS, TOEFL)</li>
                  <li>• Letters of recommendation</li>
                  <li>• Statement of purpose</li>
                </ul>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-4">Financial Documents</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• Bank statements</li>
                  <li>• Scholarship letters</li>
                  <li>• Loan approval documents</li>
                  <li>• Sponsor affidavit</li>
                  <li>• Tax returns</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      `,
      excerpt: 'Comprehensive guide to studying abroad including destinations, requirements, application process and everything you need to know.',
      template: 'study-abroad',
      meta_title: 'Study Abroad Guide - Complete Information for International Education',
      meta_description: 'Everything about studying abroad: destinations, requirements, application process, and expert guidance for international students.',
      is_published: true,
    },
    {
      title: 'How Can We Help?',
      slug: 'how-we-help',
      content: `
        <div class="max-w-6xl mx-auto space-y-12">
          <section class="text-center space-y-6">
            <h1 class="text-4xl font-bold text-gray-900">How Can We Help?</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Know about BNOverseas's extent of services and comprehensive support throughout your study abroad journey.
            </p>
          </section>

          <section class="grid md:grid-cols-3 gap-8">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg">
              <div class="w-16 h-16 bg-blue-600 text-white rounded-lg mb-4 flex items-center justify-center">
                <span class="text-2xl">🎓</span>
              </div>
              <h3 class="text-xl font-semibold mb-4">Career Counseling</h3>
              <p class="text-gray-600 mb-4">Expert guidance to align your career goals with the right academic programs and universities.</p>
              <ul class="space-y-2 text-sm text-gray-600">
                <li>• Personalized career assessment</li>
                <li>• Industry trend analysis</li>
                <li>• Program recommendations</li>
              </ul>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg">
              <div class="w-16 h-16 bg-green-600 text-white rounded-lg mb-4 flex items-center justify-center">
                <span class="text-2xl">🏛️</span>
              </div>
              <h3 class="text-xl font-semibold mb-4">University Selection</h3>
              <p class="text-gray-600 mb-4">Find the perfect match among thousands of universities based on your profile and preferences.</p>
              <ul class="space-y-2 text-sm text-gray-600">
                <li>• Profile-based matching</li>
                <li>• Ranking & reputation analysis</li>
                <li>• Location preferences</li>
              </ul>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-lg">
              <div class="w-16 h-16 bg-purple-600 text-white rounded-lg mb-4 flex items-center justify-center">
                <span class="text-2xl">📋</span>
              </div>
              <h3 class="text-xl font-semibold mb-4">Application Support</h3>
              <p class="text-gray-600 mb-4">Complete assistance with applications, essays, and documentation to maximize your chances.</p>
              <ul class="space-y-2 text-sm text-gray-600">
                <li>• Document preparation</li>
                <li>• Essay writing support</li>
                <li>• Application reviews</li>
              </ul>
            </div>
          </section>

          <section class="bg-gray-50 p-8 rounded-lg">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Our Service Process</h2>
            <div class="grid md:grid-cols-5 gap-4">
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-3 flex items-center justify-center font-bold">1</div>
                <h4 class="font-semibold mb-2 text-sm">Initial Consultation</h4>
                <p class="text-xs text-gray-600">Free assessment of your profile and goals</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-3 flex items-center justify-center font-bold">2</div>
                <h4 class="font-semibold mb-2 text-sm">Strategy Planning</h4>
                <p class="text-xs text-gray-600">Customized roadmap for your journey</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-3 flex items-center justify-center font-bold">3</div>
                <h4 class="font-semibold mb-2 text-sm">Application Process</h4>
                <p class="text-xs text-gray-600">Complete support throughout applications</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-3 flex items-center justify-center font-bold">4</div>
                <h4 class="font-semibold mb-2 text-sm">Visa Assistance</h4>
                <p class="text-xs text-gray-600">End-to-end visa guidance</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-3 flex items-center justify-center font-bold">5</div>
                <h4 class="font-semibold mb-2 text-sm">Pre-departure</h4>
                <p class="text-xs text-gray-600">Preparation for your new journey</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Specialized Services</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div class="bg-white p-6 rounded-lg border">
                <h3 class="text-xl font-semibold mb-4 text-blue-600">Test Preparation</h3>
                <p class="text-gray-600 mb-4">Comprehensive preparation for standardized tests</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• IELTS & TOEFL coaching</li>
                  <li>• GRE & GMAT preparation</li>
                  <li>• SAT & ACT training</li>
                  <li>• PTE & Duolingo support</li>
                </ul>
              </div>
              <div class="bg-white p-6 rounded-lg border">
                <h3 class="text-xl font-semibold mb-4 text-green-600">Financial Planning</h3>
                <p class="text-gray-600 mb-4">Complete financial assistance and planning</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Education loan guidance</li>
                  <li>• Scholarship identification</li>
                  <li>• Cost estimation</li>
                  <li>• Financial documentation</li>
                </ul>
              </div>
              <div class="bg-white p-6 rounded-lg border">
                <h3 class="text-xl font-semibold mb-4 text-purple-600">Post-Arrival Support</h3>
                <p class="text-gray-600 mb-4">Assistance even after you reach your destination</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Airport pickup assistance</li>
                  <li>• Accommodation support</li>
                  <li>• Bank account opening</li>
                  <li>• Local orientation</li>
                </ul>
              </div>
              <div class="bg-white p-6 rounded-lg border">
                <h3 class="text-xl font-semibold mb-4 text-orange-600">Career Services</h3>
                <p class="text-gray-600 mb-4">Support for your career development</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Resume building</li>
                  <li>• Interview preparation</li>
                  <li>• Internship guidance</li>
                  <li>• Job placement support</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      `,
      excerpt: 'Discover the comprehensive range of services we offer to support your study abroad journey from start to finish.',
      template: 'services',
      meta_title: 'Our Services - Comprehensive Study Abroad Support',
      meta_description: 'Explore our complete range of study abroad services including counseling, applications, visa support, and post-arrival assistance.',
      is_published: true,
    }
  ]

  for (const pageData of pages) {
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

  console.log('Pages seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })