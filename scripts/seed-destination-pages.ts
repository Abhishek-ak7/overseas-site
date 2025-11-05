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

  const destinationPages = [
    {
      title: 'Study in Australia',
      slug: 'destinations/australia',
      content: `
        <div class="max-w-6xl mx-auto py-12 px-6">
          <div class="text-center mb-12">
            <div class="flex justify-center items-center gap-4 mb-6">
              <img src="/flags/australia.png" alt="Australia Flag" class="w-16 h-12 object-contain rounded shadow-lg" />
              <h1 class="text-4xl font-bold text-gray-900">Study in Australia</h1>
            </div>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">Discover world-class education, diverse culture, and incredible opportunities in the land down under.</p>
          </div>

          <div class="grid md:grid-cols-2 gap-12 mb-16">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
              <h2 class="text-2xl font-bold mb-6 text-blue-900">Why Choose Australia?</h2>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">World-renowned universities with 7 in top 100 globally</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Post-study work visa opportunities up to 4 years</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Multicultural environment with students from 140+ countries</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Strong economy with excellent career prospects</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Beautiful lifestyle with world-class cities and nature</p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="bg-white p-6 rounded-xl shadow-lg border">
                <h3 class="text-xl font-semibold mb-4 text-gray-900">Popular Study Programs</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="font-semibold text-blue-900">Engineering</div>
                    <div class="text-sm text-blue-700">High demand fields</div>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="font-semibold text-green-900">Business</div>
                    <div class="text-sm text-green-700">MBA & Management</div>
                  </div>
                  <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="font-semibold text-purple-900">Healthcare</div>
                    <div class="text-sm text-purple-700">Medicine & Nursing</div>
                  </div>
                  <div class="text-center p-4 bg-orange-50 rounded-lg">
                    <div class="font-semibold text-orange-900">IT</div>
                    <div class="text-sm text-orange-700">Tech & Innovation</div>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-xl shadow-lg border">
                <h3 class="text-xl font-semibold mb-4 text-gray-900">Key Facts</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Academic Year:</span>
                    <span class="font-semibold">February & July intakes</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Study Duration:</span>
                    <span class="font-semibold">1-4 years</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Work Rights:</span>
                    <span class="font-semibold">40 hours/fortnight</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">English Test:</span>
                    <span class="font-semibold">IELTS/PTE/TOEFL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-8 mb-16">
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">AUD 25,000 - 45,000</div>
              <div class="text-gray-600">Annual Tuition Fees</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">AUD 20,000 - 25,000</div>
              <div class="text-gray-600">Annual Living Cost</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="text-3xl font-bold text-purple-600 mb-2">2-4 Years</div>
              <div class="text-gray-600">Post-Study Work Visa</div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl text-center">
            <h2 class="text-3xl font-bold mb-4">Ready to Study in Australia?</h2>
            <p class="text-xl mb-6 opacity-90">Get personalized guidance from our Australia education experts</p>
            <div class="flex flex-wrap justify-center gap-4">
              <a href="/contact" class="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Get Free Consultation
              </a>
              <a href="/destinations" class="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Explore All Destinations
              </a>
            </div>
          </div>
        </div>
      `,
      excerpt: 'Discover world-class education opportunities in Australia with top universities, post-study work visas, and multicultural environment.',
      meta_title: 'Study in Australia - Top Universities & Education Opportunities | BnOverseas',
      meta_description: 'Study in Australia with BnOverseas. Explore top universities, scholarships, work opportunities, and get expert guidance for your Australian education journey.',
      meta_keywords: 'study in australia, australian universities, student visa australia, education in australia',
      template: 'default',
      is_published: true,
    },
    {
      title: 'Study in Canada',
      slug: 'destinations/canada',
      content: `
        <div class="max-w-6xl mx-auto py-12 px-6">
          <div class="text-center mb-12">
            <div class="flex justify-center items-center gap-4 mb-6">
              <img src="/flags/canada.png" alt="Canada Flag" class="w-16 h-12 object-contain rounded shadow-lg" />
              <h1 class="text-4xl font-bold text-gray-900">Study in Canada</h1>
            </div>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">Experience world-class education, friendly communities, and excellent immigration opportunities in Canada.</p>
          </div>

          <div class="grid md:grid-cols-2 gap-12 mb-16">
            <div class="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl">
              <h2 class="text-2xl font-bold mb-6 text-red-900">Why Choose Canada?</h2>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Globally recognized education system with affordable tuition</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Post-graduation work permit up to 3 years</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Pathway to permanent residence and citizenship</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Safe, welcoming, and multicultural environment</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Two official languages: English and French</p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="bg-white p-6 rounded-xl shadow-lg border">
                <h3 class="text-xl font-semibold mb-4 text-gray-900">Top Study Destinations</h3>
                <div class="space-y-3">
                  <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span class="font-medium">Toronto - Business & Tech Hub</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div class="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span class="font-medium">Vancouver - Coastal Beauty</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div class="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span class="font-medium">Montreal - French Culture</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div class="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <span class="font-medium">Calgary - Energy Sector</span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-xl shadow-lg border">
                <h3 class="text-xl font-semibold mb-4 text-gray-900">Key Information</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Academic Year:</span>
                    <span class="font-semibold">September & January</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Study Duration:</span>
                    <span class="font-semibold">1-4 years</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Work Rights:</span>
                    <span class="font-semibold">20 hours/week</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Language Tests:</span>
                    <span class="font-semibold">IELTS/TOEFL/PTE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-8 mb-16">
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="text-3xl font-bold text-red-600 mb-2">CAD 15,000 - 40,000</div>
              <div class="text-gray-600">Annual Tuition Fees</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">CAD 12,000 - 18,000</div>
              <div class="text-gray-600">Annual Living Cost</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">Up to 3 Years</div>
              <div class="text-gray-600">Post-Graduation Work Permit</div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-red-600 to-blue-600 text-white p-8 rounded-2xl text-center">
            <h2 class="text-3xl font-bold mb-4">Start Your Canadian Journey</h2>
            <p class="text-xl mb-6 opacity-90">Connect with our Canada education specialists for personalized guidance</p>
            <div class="flex flex-wrap justify-center gap-4">
              <a href="/contact" class="bg-white text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Get Free Consultation
              </a>
              <a href="/destinations" class="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-red-600 transition-colors">
                Compare Destinations
              </a>
            </div>
          </div>
        </div>
      `,
      excerpt: 'Study in Canada with affordable tuition, post-graduation work opportunities, and pathway to permanent residence.',
      meta_title: 'Study in Canada - Universities, Immigration & Education Guide | BnOverseas',
      meta_description: 'Study in Canada with BnOverseas. Discover top Canadian universities, student visa process, work opportunities, and pathway to permanent residence.',
      meta_keywords: 'study in canada, canadian universities, student visa canada, immigration canada',
      template: 'default',
      is_published: true,
    },
    {
      title: 'Study in United States',
      slug: 'destinations/united-states',
      content: `
        <div class="max-w-6xl mx-auto py-12 px-6">
          <div class="text-center mb-12">
            <div class="flex justify-center items-center gap-4 mb-6">
              <img src="/flags/usa.png" alt="USA Flag" class="w-16 h-12 object-contain rounded shadow-lg" />
              <h1 class="text-4xl font-bold text-gray-900">Study in United States</h1>
            </div>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">Access world's top universities, cutting-edge research opportunities, and diverse academic programs in the USA.</p>
          </div>

          <div class="grid md:grid-cols-2 gap-12 mb-16">
            <div class="bg-gradient-to-br from-blue-50 to-red-50 p-8 rounded-2xl">
              <h2 class="text-2xl font-bold mb-6 text-blue-900">Why Choose USA?</h2>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Home to world's top-ranked universities (MIT, Harvard, Stanford)</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Diverse academic programs and flexible curriculum</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Optional Practical Training (OPT) for work experience</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Hub for innovation, technology, and entrepreneurship</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p class="text-gray-700">Extensive scholarship and funding opportunities</p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="bg-white p-6 rounded-xl shadow-lg border">
                <h3 class="text-xl font-semibold mb-4 text-gray-900">Popular States for Students</h3>
                <div class="space-y-3">
                  <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span class="font-medium">California - Tech & Innovation</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div class="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span class="font-medium">New York - Business & Arts</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div class="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span class="font-medium">Massachusetts - Research Hub</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div class="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <span class="font-medium">Texas - Engineering & Energy</span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-xl shadow-lg border">
                <h3 class="text-xl font-semibold mb-4 text-gray-900">Study Details</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Academic Year:</span>
                    <span class="font-semibold">Fall & Spring</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Study Duration:</span>
                    <span class="font-semibold">2-6 years</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Work Rights:</span>
                    <span class="font-semibold">On-campus only</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tests Required:</span>
                    <span class="font-semibold">SAT/GRE/GMAT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-8 mb-16">
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">$25,000 - $70,000</div>
              <div class="text-gray-600">Annual Tuition Fees</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">$15,000 - $25,000</div>
              <div class="text-gray-600">Annual Living Cost</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="text-3xl font-bold text-purple-600 mb-2">1-3 Years</div>
              <div class="text-gray-600">Optional Practical Training</div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-700 to-red-600 text-white p-8 rounded-2xl text-center">
            <h2 class="text-3xl font-bold mb-4">Achieve Your American Dream</h2>
            <p class="text-xl mb-6 opacity-90">Get expert guidance for studying at top US universities</p>
            <div class="flex flex-wrap justify-center gap-4">
              <a href="/contact" class="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Get Free Consultation
              </a>
              <a href="/test-preparation" class="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                SAT/GRE Preparation
              </a>
            </div>
          </div>
        </div>
      `,
      excerpt: 'Study in the USA at world\'s top universities with diverse programs, OPT opportunities, and access to cutting-edge research.',
      meta_title: 'Study in USA - Top Universities & Student Visa Guide | BnOverseas',
      meta_description: 'Study in USA with BnOverseas. Get admission to top US universities, student visa guidance, SAT/GRE preparation, and scholarship opportunities.',
      meta_keywords: 'study in usa, american universities, f1 visa, sat preparation, gre preparation',
      template: 'default',
      is_published: true,
    }
  ]

  // Create the rest of the destination pages
  const moreDestinations = [
    {
      title: 'Study in United Kingdom',
      slug: 'destinations/united-kingdom',
      flag: 'uk.png',
      gradient: 'from-blue-600 to-red-600',
      tuition: '£15,000 - £35,000',
      living: '£12,000 - £18,000',
      work: '2 Years',
      workLabel: 'Post-Study Work Visa'
    },
    {
      title: 'Study in Germany',
      slug: 'destinations/germany',
      flag: 'germany.png',
      gradient: 'from-black to-red-600',
      tuition: '€0 - €20,000',
      living: '€8,000 - €12,000',
      work: '18 Months',
      workLabel: 'Job Search Visa'
    },
    {
      title: 'Study in France',
      slug: 'destinations/france',
      flag: 'france.png',
      gradient: 'from-blue-600 to-red-600',
      tuition: '€3,000 - €15,000',
      living: '€9,000 - €15,000',
      work: '2 Years',
      workLabel: 'Post-Study Stay'
    },
    {
      title: 'Study in Ireland',
      slug: 'destinations/ireland',
      flag: 'ireland.png',
      gradient: 'from-green-600 to-orange-500',
      tuition: '€10,000 - €25,000',
      living: '€10,000 - €15,000',
      work: '2 Years',
      workLabel: 'Graduate Stay Back'
    },
    {
      title: 'Study in Cyprus',
      slug: 'destinations/cyprus',
      flag: 'cyprus.png',
      gradient: 'from-blue-500 to-orange-400',
      tuition: '€8,000 - €15,000',
      living: '€6,000 - €10,000',
      work: '1 Year',
      workLabel: 'Work Permit'
    },
    {
      title: 'Study in New Zealand',
      slug: 'destinations/new-zealand',
      flag: 'new-zealand.png',
      gradient: 'from-blue-600 to-green-500',
      tuition: 'NZ$22,000 - $35,000',
      living: 'NZ$15,000 - $20,000',
      work: '3 Years',
      workLabel: 'Post-Study Work Visa'
    },
    {
      title: 'Study in Singapore',
      slug: 'destinations/singapore',
      flag: 'singapore.png',
      gradient: 'from-red-500 to-blue-500',
      tuition: 'S$25,000 - $40,000',
      living: 'S$12,000 - $18,000',
      work: '6 Months',
      workLabel: 'Job Search Period'
    },
    {
      title: 'Study in UAE',
      slug: 'destinations/uae',
      flag: 'uae.png',
      gradient: 'from-green-600 to-red-500',
      tuition: 'AED 40,000 - 80,000',
      living: 'AED 30,000 - 50,000',
      work: '1 Year',
      workLabel: 'Graduate Visa'
    }
  ]

  // Generate content for remaining destinations
  for (const dest of moreDestinations) {
    const country = dest.title.replace('Study in ', '')
    const content = `
      <div class="max-w-6xl mx-auto py-12 px-6">
        <div class="text-center mb-12">
          <div class="flex justify-center items-center gap-4 mb-6">
            <img src="/flags/${dest.flag}" alt="${country} Flag" class="w-16 h-12 object-contain rounded shadow-lg" />
            <h1 class="text-4xl font-bold text-gray-900">${dest.title}</h1>
          </div>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">Discover exceptional education opportunities and cultural experiences in ${country}.</p>
        </div>

        <div class="grid md:grid-cols-2 gap-12 mb-16">
          <div class="bg-gradient-to-br from-blue-50 to-purple-100 p-8 rounded-2xl">
            <h2 class="text-2xl font-bold mb-6 text-blue-900">Why Choose ${country}?</h2>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-gray-700">High-quality education system with international recognition</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-gray-700">Multicultural environment with global networking opportunities</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-gray-700">Strong industry connections and career prospects</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-gray-700">Rich cultural heritage and modern lifestyle</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-gray-700">Post-study work opportunities for international graduates</p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white p-6 rounded-xl shadow-lg border">
              <h3 class="text-xl font-semibold mb-4 text-gray-900">Popular Study Fields</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <div class="font-semibold text-blue-900">Business</div>
                  <div class="text-sm text-blue-700">Management & Finance</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <div class="font-semibold text-green-900">Engineering</div>
                  <div class="text-sm text-green-700">Technology & Innovation</div>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                  <div class="font-semibold text-purple-900">Sciences</div>
                  <div class="text-sm text-purple-700">Research & Development</div>
                </div>
                <div class="text-center p-4 bg-orange-50 rounded-lg">
                  <div class="font-semibold text-orange-900">Arts</div>
                  <div class="text-sm text-orange-700">Creative & Design</div>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-lg border">
              <h3 class="text-xl font-semibold mb-4 text-gray-900">Key Information</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Academic Year:</span>
                  <span class="font-semibold">September & February</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Study Duration:</span>
                  <span class="font-semibold">1-4 years</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Work Rights:</span>
                  <span class="font-semibold">Part-time allowed</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Language Test:</span>
                  <span class="font-semibold">IELTS/TOEFL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <div class="bg-white p-6 rounded-xl shadow-lg text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">${dest.tuition}</div>
            <div class="text-gray-600">Annual Tuition Fees</div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-lg text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">${dest.living}</div>
            <div class="text-gray-600">Annual Living Cost</div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-lg text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">${dest.work}</div>
            <div class="text-gray-600">${dest.workLabel}</div>
          </div>
        </div>

        <div class="bg-gradient-to-r ${dest.gradient} text-white p-8 rounded-2xl text-center">
          <h2 class="text-3xl font-bold mb-4">Start Your Journey to ${country}</h2>
          <p class="text-xl mb-6 opacity-90">Connect with our education experts for personalized guidance</p>
          <div class="flex flex-wrap justify-center gap-4">
            <a href="/contact" class="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Get Free Consultation
            </a>
            <a href="/destinations" class="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Compare Destinations
            </a>
          </div>
        </div>
      </div>
    `

    destinationPages.push({
      title: dest.title,
      slug: dest.slug,
      content,
      excerpt: `Explore world-class education opportunities in ${country} with top universities, scholarships, and excellent career prospects.`,
      meta_title: `${dest.title} - Universities & Education Guide | BnOverseas`,
      meta_description: `${dest.title} with BnOverseas. Discover top universities, student visa process, scholarships, and career opportunities in ${country}.`,
      meta_keywords: `study in ${country.toLowerCase()}, ${country.toLowerCase()} universities, student visa ${country.toLowerCase()}, education in ${country.toLowerCase()}`,
      template: 'default',
      is_published: true,
    })
  }

  for (const pageData of destinationPages) {
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

  console.log('Destination pages seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })