import { prisma } from '../lib/prisma'

async function main() {
  // Create or update main header menu
  const headerMenu = await prisma.menus.upsert({
    where: { slug: 'main-header' },
    update: {
      name: 'Main Header Menu',
      description: 'Primary navigation menu for header',
      location: 'HEADER_PRIMARY',
      is_active: true,
    },
    create: {
      name: 'Main Header Menu',
      slug: 'main-header',
      description: 'Primary navigation menu for header',
      location: 'HEADER_PRIMARY',
      is_active: true,
    },
  })

  console.log('✓ Created/updated header menu:', headerMenu.name)

  // Delete existing menu items for this menu
  await prisma.menu_items.deleteMany({
    where: { menu_id: headerMenu.id }
  })

  // Create new menu items based on BNOverseas structure
  const menuItems = [
    {
      label: 'Study Abroad',
      url: '/studying-abroad',
      type: 'page',
      order_index: 1,
      is_active: true,
      children: [
        {
          label: 'About BNOverseasWork',
          url: '/about-us',
          type: 'page',
          order_index: 0,
        },
        {
          label: 'Studying Abroad',
          url: '/studying-abroad',
          type: 'page',
          order_index: 1,
        },
        {
          label: 'How We Can Help',
          url: '/how-we-help',
          type: 'page',
          order_index: 2,
        },
        {
          label: 'Guide for Parents',
          url: '/guide-for-parents',
          type: 'page',
          order_index: 3,
        },
        {
          label: 'How to Choose a Course',
          url: '/how-to-choose-course',
          type: 'page',
          order_index: 4,
        },
        {
          label: 'Why Choose Us',
          url: '/why-choose-us',
          type: 'page',
          order_index: 5,
        },
        {
          label: 'Study Abroad Benefits',
          url: '/study-abroad-benefits',
          type: 'page',
          order_index: 6,
        },
        {
          label: 'Cost of Studying Abroad',
          url: '/cost-of-studying-abroad',
          type: 'page',
          order_index: 7,
        },
        {
          label: 'Our Services',
          url: '/our-services',
          type: 'page',
          order_index: 8,
        },
        {
          label: 'Guide to Study Abroad',
          url: '/guide-to-study-abroad',
          type: 'page',
          order_index: 9,
        },
        {
          label: 'Pre-departure Assistance',
          url: '/pre-departure-assistance',
          type: 'page',
          order_index: 10,
        },
        {
          label: 'Express Loans',
          url: '/express-loans',
          type: 'page',
          order_index: 11,
        },
      ]
    },
    {
      label: 'Study Destinations',
      url: '/destinations',
      type: 'page',
      order_index: 2,
      is_active: true,
      children: [
        {
          label: 'United States',
          url: '/destinations/united-states',
          type: 'page',
          order_index: 0,
        },
        {
          label: 'Canada',
          url: '/destinations/canada',
          type: 'page',
          order_index: 1,
        },
        {
          label: 'United Kingdom',
          url: '/destinations/united-kingdom',
          type: 'page',
          order_index: 2,
        },
        {
          label: 'Australia',
          url: '/destinations/australia',
          type: 'page',
          order_index: 3,
        },
        {
          label: 'Germany',
          url: '/destinations/germany',
          type: 'page',
          order_index: 4,
        },
        {
          label: 'France',
          url: '/destinations/france',
          type: 'page',
          order_index: 5,
        },
        {
          label: 'Ireland',
          url: '/destinations/ireland',
          type: 'page',
          order_index: 6,
        },
        {
          label: 'Cyprus',
          url: '/destinations/cyprus',
          type: 'page',
          order_index: 7,
        },
      ]
    },
    {
      label: 'Explore Programs',
      url: '/programs',
      type: 'page',
      order_index: 3,
      is_active: true,
      children: [
        {
          label: 'Express Admissions',
          url: '/programs/express-admissions',
          type: 'page',
          order_index: 0,
        },
        {
          label: 'Health Skills Programs',
          url: '/programs/health-skills',
          type: 'page',
          order_index: 1,
        },
        {
          label: 'Business Programs',
          url: '/programs/business',
          type: 'page',
          order_index: 2,
        },
        {
          label: 'Engineering Programs',
          url: '/programs/engineering',
          type: 'page',
          order_index: 3,
        },
      ]
    },
    {
      label: 'TestPrep',
      url: '/test-preparation',
      type: 'page',
      order_index: 4,
      is_active: true,
      children: [
        {
          label: 'IELTS Preparation',
          url: '/test-prep/ielts',
          type: 'page',
          order_index: 0,
        },
        {
          label: 'TOEFL Preparation',
          url: '/test-prep/toefl',
          type: 'page',
          order_index: 1,
        },
        {
          label: 'PTE Preparation',
          url: '/test-prep/pte',
          type: 'page',
          order_index: 2,
        },
        {
          label: 'GRE Preparation',
          url: '/test-prep/gre',
          type: 'page',
          order_index: 3,
        },
        {
          label: 'GMAT Preparation',
          url: '/test-prep/gmat',
          type: 'page',
          order_index: 4,
        },
      ]
    },
    {
      label: 'All Events',
      url: '/events',
      type: 'page',
      order_index: 5,
      is_active: true,
    },
    {
      label: 'Blog',
      url: '/blog',
      type: 'page',
      order_index: 6,
      is_active: true,
    },
    {
      label: 'Contact Us',
      url: '/contact',
      type: 'page',
      order_index: 7,
      is_active: true,
    },
  ]

  // Create parent menu items and their children
  for (const item of menuItems) {
    const parentItem = await prisma.menu_items.create({
      data: {
        menu_id: headerMenu.id,
        label: item.label,
        url: item.url,
        type: item.type,
        order_index: item.order_index,
        is_active: item.is_active,
        target: '_self',
      },
    })

    console.log(`✓ Created parent menu item: ${item.label}`)

    // Create children if they exist
    if (item.children) {
      for (const child of item.children) {
        await prisma.menu_items.create({
          data: {
            menu_id: headerMenu.id,
            parent_id: parentItem.id,
            label: child.label,
            url: child.url,
            type: child.type,
            order_index: child.order_index,
            is_active: true,
            target: '_self',
          },
        })
        console.log(`  ✓ Created child menu item: ${child.label}`)
      }
    }
  }

  console.log('Menu seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })