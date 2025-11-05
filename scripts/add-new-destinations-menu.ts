import { prisma } from '../lib/prisma'

async function main() {
  // Find the main header menu
  const headerMenu = await prisma.menus.findUnique({
    where: { slug: 'main-header' }
  })

  if (!headerMenu) {
    console.error('Main header menu not found')
    return
  }

  // Find the Study Destinations parent menu item
  const studyDestinationsItem = await prisma.menu_items.findFirst({
    where: {
      menu_id: headerMenu.id,
      label: 'Study Destinations',
      parent_id: null
    }
  })

  if (!studyDestinationsItem) {
    console.error('Study Destinations parent menu item not found')
    return
  }

  // New destination menu items to add
  const newDestinations = [
    {
      label: 'New Zealand',
      url: '/destinations/new-zealand',
      type: 'page',
      order_index: 8,
    },
    {
      label: 'Singapore',
      url: '/destinations/singapore',
      type: 'page',
      order_index: 9,
    },
    {
      label: 'UAE',
      url: '/destinations/uae',
      type: 'page',
      order_index: 10,
    }
  ]

  for (const destination of newDestinations) {
    // Check if item already exists
    const existingItem = await prisma.menu_items.findFirst({
      where: {
        menu_id: headerMenu.id,
        parent_id: studyDestinationsItem.id,
        label: destination.label
      }
    })

    if (!existingItem) {
      await prisma.menu_items.create({
        data: {
          menu_id: headerMenu.id,
          parent_id: studyDestinationsItem.id,
          label: destination.label,
          url: destination.url,
          type: destination.type,
          order_index: destination.order_index,
          is_active: true,
          target: '_self',
        }
      })
      console.log(`✓ Added destination menu item: ${destination.label}`)
    } else {
      console.log(`- Destination menu item already exists: ${destination.label}`)
    }
  }

  console.log('New destination menu items added!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })