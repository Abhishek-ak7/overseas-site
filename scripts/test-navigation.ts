// Test script to check if navigation data is being fetched correctly
async function testNavigation() {
  try {
    const response = await fetch('http://localhost:3001/api/menus?location=HEADER&includeItems=true')
    const data = await response.json()

    console.log('Navigation API Test Results:')
    console.log('=================================')

    if (data.menus && data.menus.length > 0) {
      const menu = data.menus[0]
      console.log(`✓ Menu found: ${menu.name}`)
      console.log(`✓ Location: ${menu.location}`)
      console.log(`✓ Active: ${menu.isActive}`)
      console.log(`✓ Total menu items: ${menu.items.length}`)

      // Find Study Abroad menu item
      const studyAbroadItem = menu.items.find((item: any) => item.label === 'Study Abroad')
      if (studyAbroadItem) {
        console.log(`✓ Study Abroad menu item found`)

        // Count child items
        const childItems = menu.items.filter((item: any) => item.parentId === studyAbroadItem.id)
        console.log(`✓ Study Abroad has ${childItems.length} child items:`)

        childItems.slice(0, 5).forEach((child: any) => {
          console.log(`  - ${child.label} (${child.url})`)
        })

        if (childItems.length > 5) {
          console.log(`  ... and ${childItems.length - 5} more items`)
        }

        console.log('\n✅ Navigation is working correctly!')
      } else {
        console.log('❌ Study Abroad menu item not found')
      }
    } else {
      console.log('❌ No menus found')
    }
  } catch (error) {
    console.error('❌ Navigation test failed:', error)
  }
}

testNavigation()