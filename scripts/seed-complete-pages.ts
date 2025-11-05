import { prisma } from '../lib/prisma'
import { randomUUID } from 'crypto'

async function main() {
  // Get admin user
  const adminUser = await prisma.users.findFirst({
    where: { email: 'admin@bnoverseas.com' }
  })

  if (!adminUser) {
    console.error('Admin user not found')
    return
  }

  const completePages = [
    {
      title: 'Cost of Studying Abroad',
      slug: 'cost-of-studying-abroad',
      content: `
        <div class="max-w-4xl mx-auto py-12 px-6">
          <h1 class="text-4xl font-bold text-center mb-8">Cost of Studying Abroad</h1>

          <div class="prose prose-lg mx-auto">
            <p class="text-xl text-gray-600 mb-8">Understanding the financial investment required for international education and how to plan your budget effectively.</p>

            <h2>Tuition Fees by Country</h2>
            <div class="grid md:grid-cols-2 gap-6 mb-8">
              <div class="bg-blue-50 p-6 rounded-lg">
                <h3>United States</h3>
                <ul>
                  <li>Public Universities: $25,000 - $50,000/year</li>
                  <li>Private Universities: $35,000 - $70,000/year</li>
                  <li>Community Colleges: $8,000 - $15,000/year</li>
                </ul>
              </div>
              <div class="bg-green-50 p-6 rounded-lg">
                <h3>Canada</h3>
                <ul>
                  <li>Undergraduate: $15,000 - $40,000/year</li>
                  <li>Graduate: $20,000 - $45,000/year</li>
                  <li>MBA Programs: $35,000 - $80,000/year</li>
                </ul>
              </div>
              <div class="bg-purple-50 p-6 rounded-lg">
                <h3>United Kingdom</h3>
                <ul>
                  <li>Undergraduate: £15,000 - £35,000/year</li>
                  <li>Graduate: £18,000 - £45,000/year</li>
                  <li>MBA Programs: £30,000 - £90,000/year</li>
                </ul>
              </div>
              <div class="bg-orange-50 p-6 rounded-lg">
                <h3>Australia</h3>
                <ul>
                  <li>Undergraduate: AUD 25,000 - 45,000/year</li>
                  <li>Graduate: AUD 30,000 - 55,000/year</li>
                  <li>Vocational Training: AUD 8,000 - 25,000/year</li>
                </ul>
              </div>
            </div>

            <h2>Living Expenses</h2>
            <p>Living costs vary significantly by location and lifestyle:</p>
            <ul>
              <li><strong>Accommodation:</strong> $800 - $2,500/month</li>
              <li><strong>Food & Groceries:</strong> $400 - $800/month</li>
              <li><strong>Transportation:</strong> $100 - $300/month</li>
              <li><strong>Books & Supplies:</strong> $1,000 - $2,000/year</li>
              <li><strong>Health Insurance:</strong> $500 - $2,000/year</li>
              <li><strong>Personal Expenses:</strong> $200 - $500/month</li>
            </ul>

            <h2>Funding Options</h2>
            <div class="bg-yellow-50 p-6 rounded-lg">
              <h3>Scholarships & Financial Aid</h3>
              <ul>
                <li>Merit-based scholarships</li>
                <li>Need-based financial aid</li>
                <li>Government scholarships</li>
                <li>University-specific grants</li>
              </ul>
            </div>

            <h2>Cost Planning Tips</h2>
            <ol>
              <li>Research all associated costs early</li>
              <li>Compare living costs between cities</li>
              <li>Apply for scholarships well in advance</li>
              <li>Consider part-time work opportunities</li>
              <li>Budget for unexpected expenses</li>
            </ol>

            <div class="bg-blue-100 p-6 rounded-lg mt-8">
              <h3>Ready to Plan Your Budget?</h3>
              <p>Contact our education consultants for personalized cost planning and scholarship guidance.</p>
              <a href="/contact" class="btn btn-primary">Get Cost Analysis</a>
            </div>
          </div>
        </div>
      `,
      excerpt: 'Complete breakdown of costs for studying abroad including tuition, living expenses, and funding options.',
      meta_title: 'Cost of Studying Abroad - Complete Financial Guide | BnOverseas',
      meta_description: 'Comprehensive guide to studying abroad costs including tuition fees, living expenses, and funding options for international students.',
      meta_keywords: 'study abroad costs, international education fees, student budget, education financing',
      template: 'default',
      is_published: true,
    },
    {
      title: 'Our Services',
      slug: 'our-services',
      content: `
        <div class="max-w-6xl mx-auto py-12 px-6">
          <h1 class="text-4xl font-bold text-center mb-8">Our Services</h1>
          <p class="text-xl text-gray-600 text-center mb-12">Comprehensive support for your international education journey</p>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div class="service-card bg-white p-6 rounded-lg shadow-lg">
              <div class="icon mb-4">
                <svg class="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-3">Career Counselling</h3>
              <p>Expert guidance to help you choose the right career path and educational program aligned with your goals.</p>
            </div>

            <div class="service-card bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-xl font-semibold mb-3">University Selection</h3>
              <p>Personalized university recommendations based on your academic profile, preferences, and career objectives.</p>
            </div>

            <div class="service-card bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-xl font-semibold mb-3">Application Support</h3>
              <p>End-to-end assistance with university applications, essays, and documentation requirements.</p>
            </div>

            <div class="service-card bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-xl font-semibold mb-3">Test Preparation</h3>
              <p>Comprehensive coaching for IELTS, TOEFL, PTE, GRE, GMAT and other standardized tests.</p>
            </div>

            <div class="service-card bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-xl font-semibold mb-3">Visa Assistance</h3>
              <p>Expert guidance through visa application processes with high success rates.</p>
            </div>

            <div class="service-card bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-xl font-semibold mb-3">Financial Planning</h3>
              <p>Education loan assistance and financial planning for your international education investment.</p>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">End-to-End Support</h2>
            <p class="mb-6">From initial counselling to landing in your destination country, we provide complete support throughout your journey.</p>
            <a href="/contact" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">Start Your Journey</a>
          </div>
        </div>
      `,
      excerpt: 'Comprehensive education consulting services for international students including counselling, applications, test prep, and visa assistance.',
      meta_title: 'Our Services - Complete Study Abroad Support | BnOverseas',
      meta_description: 'Comprehensive study abroad services including career counselling, university selection, application support, test preparation, and visa assistance.',
      meta_keywords: 'study abroad services, education consulting, university applications, visa assistance',
      template: 'default',
      is_published: true,
    },
    {
      title: 'Guide to Study Abroad',
      slug: 'guide-to-study-abroad',
      content: `
        <div class="max-w-4xl mx-auto py-12 px-6">
          <h1 class="text-4xl font-bold text-center mb-8">Complete Guide to Study Abroad</h1>
          <p class="text-xl text-gray-600 text-center mb-12">Your step-by-step roadmap to international education success</p>

          <div class="space-y-8">
            <div class="step bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">1</span>
                <h2 class="text-2xl font-semibold">Self Assessment & Goal Setting</h2>
              </div>
              <ul class="list-disc ml-12 text-gray-600">
                <li>Evaluate your academic background and career goals</li>
                <li>Assess your financial capacity</li>
                <li>Determine preferred study destinations</li>
                <li>Choose field of study and program level</li>
              </ul>
            </div>

            <div class="step bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">2</span>
                <h2 class="text-2xl font-semibold">Research & University Selection</h2>
              </div>
              <ul class="list-disc ml-12 text-gray-600">
                <li>Research universities and programs</li>
                <li>Check admission requirements</li>
                <li>Compare tuition fees and living costs</li>
                <li>Review application deadlines</li>
              </ul>
            </div>

            <div class="step bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">3</span>
                <h2 class="text-2xl font-semibold">Test Preparation</h2>
              </div>
              <ul class="list-disc ml-12 text-gray-600">
                <li>English proficiency tests (IELTS, TOEFL, PTE)</li>
                <li>Standardized tests (GRE, GMAT, SAT)</li>
                <li>Subject-specific tests if required</li>
                <li>Allow 3-6 months for preparation</li>
              </ul>
            </div>

            <div class="step bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">4</span>
                <h2 class="text-2xl font-semibold">Application Process</h2>
              </div>
              <ul class="list-disc ml-12 text-gray-600">
                <li>Prepare application documents</li>
                <li>Write compelling essays and SOP</li>
                <li>Gather recommendation letters</li>
                <li>Submit applications before deadlines</li>
              </ul>
            </div>

            <div class="step bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">5</span>
                <h2 class="text-2xl font-semibold">Funding & Financial Planning</h2>
              </div>
              <ul class="list-disc ml-12 text-gray-600">
                <li>Apply for scholarships and grants</li>
                <li>Explore education loan options</li>
                <li>Prepare financial documents</li>
                <li>Plan for living expenses</li>
              </ul>
            </div>

            <div class="step bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">6</span>
                <h2 class="text-2xl font-semibold">Visa Application</h2>
              </div>
              <ul class="list-disc ml-12 text-gray-600">
                <li>Receive admission offer and I-20/CAS</li>
                <li>Prepare visa application documents</li>
                <li>Schedule and attend visa interview</li>
                <li>Receive visa approval</li>
              </ul>
            </div>

            <div class="step bg-white p-6 rounded-lg shadow">
              <div class="flex items-center mb-4">
                <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">7</span>
                <h2 class="text-2xl font-semibold">Pre-Departure Preparation</h2>
              </div>
              <ul class="list-disc ml-12 text-gray-600">
                <li>Book flights and accommodation</li>
                <li>Arrange health insurance</li>
                <li>Prepare for cultural adjustment</li>
                <li>Complete pre-departure checklist</li>
              </ul>
            </div>
          </div>

          <div class="bg-green-50 p-8 rounded-lg mt-12">
            <h3 class="text-2xl font-bold mb-4">Need Expert Guidance?</h3>
            <p class="mb-6">Our experienced consultants can help you navigate every step of this journey with personalized support.</p>
            <a href="/contact" class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">Get Expert Help</a>
          </div>
        </div>
      `,
      excerpt: 'Complete step-by-step guide for studying abroad covering everything from planning to departure.',
      meta_title: 'Complete Guide to Study Abroad - Step by Step Process | BnOverseas',
      meta_description: 'Comprehensive step-by-step guide to studying abroad covering planning, applications, visa process, and pre-departure preparation.',
      meta_keywords: 'study abroad guide, international education process, study abroad steps',
      template: 'default',
      is_published: true,
    },
    {
      title: 'Pre-departure Assistance',
      slug: 'pre-departure-assistance',
      content: `
        <div class="max-w-4xl mx-auto py-12 px-6">
          <h1 class="text-4xl font-bold text-center mb-8">Pre-departure Assistance</h1>
          <p class="text-xl text-gray-600 text-center mb-12">Comprehensive support to ensure you're fully prepared for your international education journey</p>

          <div class="grid md:grid-cols-2 gap-8 mb-12">
            <div class="bg-blue-50 p-6 rounded-lg">
              <h2 class="text-2xl font-semibold mb-4">Documentation Support</h2>
              <ul class="space-y-2">
                <li>✓ Visa document verification</li>
                <li>✓ Academic transcript preparation</li>
                <li>✓ Travel document checklist</li>
                <li>✓ Medical examination guidance</li>
                <li>✓ Insurance documentation</li>
              </ul>
            </div>

            <div class="bg-green-50 p-6 rounded-lg">
              <h2 class="text-2xl font-semibold mb-4">Travel Arrangements</h2>
              <ul class="space-y-2">
                <li>✓ Flight booking assistance</li>
                <li>✓ Airport pickup coordination</li>
                <li>✓ Luggage guidelines</li>
                <li>✓ Travel insurance options</li>
                <li>✓ Currency exchange guidance</li>
              </ul>
            </div>
          </div>

          <div class="bg-white p-8 rounded-lg shadow-lg mb-8">
            <h2 class="text-2xl font-semibold mb-6">Accommodation Support</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="text-center">
                <h3 class="font-semibold mb-2">On-Campus Housing</h3>
                <p class="text-sm text-gray-600">Dormitory and residence hall applications</p>
              </div>
              <div class="text-center">
                <h3 class="font-semibold mb-2">Off-Campus Options</h3>
                <p class="text-sm text-gray-600">Private apartments and shared housing</p>
              </div>
              <div class="text-center">
                <h3 class="font-semibold mb-2">Homestay Programs</h3>
                <p class="text-sm text-gray-600">Living with local families</p>
              </div>
            </div>
          </div>

          <div class="bg-purple-50 p-8 rounded-lg mb-8">
            <h2 class="text-2xl font-semibold mb-4">Cultural Orientation</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-2">Academic Culture</h3>
                <ul class="text-sm space-y-1">
                  <li>• Classroom expectations</li>
                  <li>• Academic integrity policies</li>
                  <li>• Professor interaction norms</li>
                  <li>• Study group dynamics</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-2">Social Integration</h3>
                <ul class="text-sm space-y-1">
                  <li>• Cultural differences awareness</li>
                  <li>• Social etiquette guidelines</li>
                  <li>• Networking opportunities</li>
                  <li>• Student organizations</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-orange-50 p-8 rounded-lg mb-8">
            <h2 class="text-2xl font-semibold mb-4">Practical Preparation</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-3">Essential Services Setup</h3>
                <ul class="space-y-2 text-sm">
                  <li>• Bank account opening guidance</li>
                  <li>• Phone plan recommendations</li>
                  <li>• Public transport information</li>
                  <li>• Healthcare system overview</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-3">Emergency Preparedness</h3>
                <ul class="space-y-2 text-sm">
                  <li>• Emergency contact lists</li>
                  <li>• Important phone numbers</li>
                  <li>• Embassy/consulate information</li>
                  <li>• Safety guidelines</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">Pre-departure Checklist</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-2">Documents</h3>
                <ul class="text-sm space-y-1">
                  <li>☐ Passport with visa</li>
                  <li>☐ I-20/CAS document</li>
                  <li>☐ Academic transcripts</li>
                  <li>☐ Medical records</li>
                  <li>☐ Insurance policies</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-2">Essentials</h3>
                <ul class="text-sm space-y-1">
                  <li>☐ Flight tickets</li>
                  <li>☐ Accommodation confirmation</li>
                  <li>☐ Financial statements</li>
                  <li>☐ Emergency contacts</li>
                  <li>☐ Prescription medications</li>
                </ul>
              </div>
            </div>
            <div class="mt-6">
              <a href="/contact" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">Schedule Pre-departure Session</a>
            </div>
          </div>
        </div>
      `,
      excerpt: 'Comprehensive pre-departure support including documentation, travel arrangements, accommodation, and cultural orientation.',
      meta_title: 'Pre-departure Assistance - Complete Support | BnOverseas',
      meta_description: 'Comprehensive pre-departure assistance for international students including documentation, travel, accommodation, and cultural preparation.',
      meta_keywords: 'pre-departure assistance, study abroad preparation, international student support',
      template: 'default',
      is_published: true,
    },
    {
      title: 'Express Loans',
      slug: 'express-loans',
      content: `
        <div class="max-w-4xl mx-auto py-12 px-6">
          <h1 class="text-4xl font-bold text-center mb-8">Express Education Loans</h1>
          <p class="text-xl text-gray-600 text-center mb-12">Fast-track financing solutions for your international education dreams</p>

          <div class="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 rounded-lg mb-12">
            <h2 class="text-2xl font-bold mb-4">Why Choose Express Loans?</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl mb-2">⚡</div>
                <h3 class="font-semibold">Fast Approval</h3>
                <p class="text-sm">Get approval in 48 hours</p>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-2">💰</div>
                <h3 class="font-semibold">Competitive Rates</h3>
                <p class="text-sm">Starting from 9.5% per annum</p>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-2">📋</div>
                <h3 class="font-semibold">Minimal Documentation</h3>
                <p class="text-sm">Streamlined application process</p>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8 mb-12">
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <h2 class="text-2xl font-semibold mb-4">Loan Features</h2>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Up to ₹1.5 Crore loan amount</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>100% financing available</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>No collateral required up to ₹7.5 Lakh</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Flexible repayment options</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Tax benefits under Section 80E</span>
                </li>
              </ul>
            </div>

            <div class="bg-blue-50 p-6 rounded-lg">
              <h2 class="text-2xl font-semibold mb-4">Coverage</h2>
              <ul class="space-y-2">
                <li>• Tuition fees</li>
                <li>• Living expenses</li>
                <li>• Travel expenses</li>
                <li>• Books and supplies</li>
                <li>• Computer/laptop</li>
                <li>• Study materials</li>
                <li>• Examination fees</li>
                <li>• Thesis preparation</li>
              </ul>
            </div>
          </div>

          <div class="bg-yellow-50 p-8 rounded-lg mb-8">
            <h2 class="text-2xl font-semibold mb-4">Eligibility Criteria</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-2">Student Requirements</h3>
                <ul class="space-y-1 text-sm">
                  <li>• Indian citizen</li>
                  <li>• Secured admission to recognized institution</li>
                  <li>• Good academic record</li>
                  <li>• Age between 18-35 years</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-2">Co-applicant Requirements</h3>
                <ul class="space-y-1 text-sm">
                  <li>• Parent/Guardian/Spouse</li>
                  <li>• Stable income source</li>
                  <li>• Good credit history</li>
                  <li>• KYC documents</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white p-8 rounded-lg shadow-lg mb-8">
            <h2 class="text-2xl font-semibold mb-6">Application Process</h2>
            <div class="grid md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span class="font-bold text-blue-600">1</span>
                </div>
                <h3 class="font-semibold text-sm">Submit Application</h3>
                <p class="text-xs text-gray-600">Online application with documents</p>
              </div>
              <div class="text-center">
                <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span class="font-bold text-blue-600">2</span>
                </div>
                <h3 class="font-semibold text-sm">Document Verification</h3>
                <p class="text-xs text-gray-600">Bank verifies submitted documents</p>
              </div>
              <div class="text-center">
                <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span class="font-bold text-blue-600">3</span>
                </div>
                <h3 class="font-semibold text-sm">Approval & Sanction</h3>
                <p class="text-xs text-gray-600">Loan approval within 48 hours</p>
              </div>
              <div class="text-center">
                <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span class="font-bold text-blue-600">4</span>
                </div>
                <h3 class="font-semibold text-sm">Loan Disbursement</h3>
                <p class="text-xs text-gray-600">Funds transferred as per schedule</p>
              </div>
            </div>
          </div>

          <div class="bg-red-50 p-8 rounded-lg mb-8">
            <h2 class="text-2xl font-semibold mb-4">Required Documents</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-2">Student Documents</h3>
                <ul class="text-sm space-y-1">
                  <li>• Passport & Visa</li>
                  <li>• Academic transcripts</li>
                  <li>• Admission letter</li>
                  <li>• IELTS/TOEFL scores</li>
                  <li>• Fee structure</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-2">Financial Documents</h3>
                <ul class="text-sm space-y-1">
                  <li>• Income proof of co-applicant</li>
                  <li>• Bank statements (6 months)</li>
                  <li>• ITR for last 2 years</li>
                  <li>• Asset documents (if any)</li>
                  <li>• KYC documents</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">Ready to Apply?</h2>
            <p class="mb-6">Get started with your education loan application today and secure your future.</p>
            <div class="flex flex-wrap gap-4">
              <a href="/contact" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">Apply Now</a>
              <a href="/contact" class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">Get Consultation</a>
            </div>
          </div>
        </div>
      `,
      excerpt: 'Fast-track education loan solutions with competitive rates, minimal documentation, and quick approval process.',
      meta_title: 'Express Education Loans - Fast Approval | BnOverseas',
      meta_description: 'Get express education loans with fast approval, competitive rates, and minimal documentation for your study abroad dreams.',
      meta_keywords: 'education loans, study abroad loans, fast approval loans, student financing',
      template: 'default',
      is_published: true,
    },
  ]

  for (const pageData of completePages) {
    try {
      await prisma.pages.upsert({
        where: { slug: pageData.slug },
        update: {
          title: pageData.title,
          content: pageData.content,
          excerpt: pageData.excerpt,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          meta_keywords: pageData.meta_keywords,
          template: pageData.template,
          is_published: pageData.is_published,
          updated_at: new Date(),
        },
        create: {
          id: randomUUID(),
          title: pageData.title,
          slug: pageData.slug,
          content: pageData.content,
          excerpt: pageData.excerpt,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          meta_keywords: pageData.meta_keywords,
          template: pageData.template,
          is_published: pageData.is_published,
          author_id: adminUser.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      console.log(`✓ Created/updated page: ${pageData.title}`)
    } catch (error) {
      console.error(`Error creating page ${pageData.title}:`, error)
    }
  }

  console.log('Complete pages seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })