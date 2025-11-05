import { prisma } from '../lib/prisma'

async function main() {
  console.log('Testing destination page data...')

  // Test a few destination pages
  const testSlugs = [
    'destinations/australia',
    'destinations/canada',
    'destinations/united-states'
  ]

  for (const slug of testSlugs) {
    const page = await prisma.pages.findUnique({
      where: { slug, is_published: true }
    })

    if (page) {
      console.log(`✓ Found page: ${page.title} (slug: ${page.slug})`)
    } else {
      console.log(`❌ Page not found: ${slug}`)
    }
  }

  // Also check total destination pages
  const destPages = await prisma.pages.findMany({
    where: {
      slug: { startsWith: 'destinations/' },
      is_published: true
    }
  })

  console.log(`\nTotal destination pages: ${destPages.length}`)
  destPages.forEach(page => {
    console.log(`- ${page.title} (${page.slug})`)
  })
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })