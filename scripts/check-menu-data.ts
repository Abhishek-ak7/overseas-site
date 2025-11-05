import { prisma } from '../lib/prisma'

async function main() {
  console.log('Checking menus...')

  const menus = await prisma.menus.findMany({
    include: {
      items: true
    }
  })

  console.log('All menus:')
  menus.forEach(menu => {
    console.log(`- ${menu.name} (location: ${menu.location}, active: ${menu.is_active}, items: ${menu.items.length})`)
  })

  console.log('\nMenu items:')
  const menuItems = await prisma.menu_items.findMany({
    where: {
      is_active: true
    },
    orderBy: {
      order_index: 'asc'
    }
  })

  console.log(`Found ${menuItems.length} active menu items`)
  menuItems.slice(0, 10).forEach(item => {
    console.log(`- ${item.label} (${item.url}) - menu_id: ${item.menu_id}`)
  })
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })