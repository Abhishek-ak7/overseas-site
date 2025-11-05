import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: {
    location: string
  }
}

// GET /api/menus/by-location/[location] - Get menu by location (header, footer, etc.)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const location = params.location.toUpperCase() as 'HEADER' | 'FOOTER' | 'SIDEBAR' | 'MOBILE' | 'CUSTOM'

    // Validate location
    if (!['HEADER', 'FOOTER', 'SIDEBAR', 'MOBILE', 'CUSTOM'].includes(location)) {
      return NextResponse.json(
        { error: 'Invalid menu location' },
        { status: 400 }
      )
    }

    // Mock menu data since Menu table doesn't exist in database
    const mockMenuData = {
      'HEADER': {
        id: 'header-menu',
        name: 'Header Menu',
        slug: 'header-menu',
        description: 'Main navigation menu',
        location: 'HEADER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            id: 'header-1',
            title: 'Home',
            url: '/',
            targetBlank: false,
            orderIndex: 0,
            isActive: true,
            menuId: 'header-menu',
            parentId: null,
            children: []
          },
          {
            id: 'header-2',
            title: 'About',
            url: '/about',
            targetBlank: false,
            orderIndex: 1,
            isActive: true,
            menuId: 'header-menu',
            parentId: null,
            children: []
          },
          {
            id: 'header-3',
            title: 'Courses',
            url: '/courses',
            targetBlank: false,
            orderIndex: 2,
            isActive: true,
            menuId: 'header-menu',
            parentId: null,
            children: []
          },
          {
            id: 'header-4',
            title: 'Test Prep',
            url: '/test-prep',
            targetBlank: false,
            orderIndex: 3,
            isActive: true,
            menuId: 'header-menu',
            parentId: null,
            children: []
          },
          {
            id: 'header-5',
            title: 'Services',
            url: '/services',
            targetBlank: false,
            orderIndex: 4,
            isActive: true,
            menuId: 'header-menu',
            parentId: null,
            children: []
          },
          {
            id: 'header-6',
            title: 'Blog',
            url: '/blog',
            targetBlank: false,
            orderIndex: 5,
            isActive: true,
            menuId: 'header-menu',
            parentId: null,
            children: []
          },
          {
            id: 'header-7',
            title: 'Contact',
            url: '/contact',
            targetBlank: false,
            orderIndex: 6,
            isActive: true,
            menuId: 'header-menu',
            parentId: null,
            children: []
          }
        ]
      },
      'FOOTER': {
        id: 'footer-menu',
        name: 'Footer Menu',
        slug: 'footer-menu',
        description: 'Footer navigation menu',
        location: 'FOOTER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            id: 'footer-1',
            title: 'Privacy Policy',
            url: '/privacy',
            targetBlank: false,
            orderIndex: 0,
            isActive: true,
            menuId: 'footer-menu',
            parentId: null,
            children: []
          },
          {
            id: 'footer-2',
            title: 'Terms of Service',
            url: '/terms',
            targetBlank: false,
            orderIndex: 1,
            isActive: true,
            menuId: 'footer-menu',
            parentId: null,
            children: []
          },
          {
            id: 'footer-3',
            title: 'Support',
            url: '/support',
            targetBlank: false,
            orderIndex: 2,
            isActive: true,
            menuId: 'footer-menu',
            parentId: null,
            children: []
          }
        ]
      }
    }

    const menu = mockMenuData[location as keyof typeof mockMenuData] || null

    return NextResponse.json({
      menu
    })
  } catch (error) {
    console.error('Menu by location fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}