'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  Menu as MenuIcon,
  X,
  Home,
  MapPin,
  Briefcase,
  GraduationCap,
  BookOpen,
  Users,
  Phone,
  Globe,
  FileText,
  Award,
  Building,
  User,
  Flag
} from 'lucide-react'

// Icon mapping for menu items based on label
const iconMap: Record<string, any> = {
  'Home': Home,
  'Study Destinations': MapPin,
  'Destinations': MapPin,
  'Services': Briefcase,
  'Universities': GraduationCap,
  'University': GraduationCap,
  'Test Preparation': BookOpen,
  'Test Prep': BookOpen,
  'About Us': Users,
  'About': Users,
  'Contact': Phone,
  'Countries': Globe,
  'Courses': FileText,
  'Scholarships': Award,
  'Visa': Building,
  'Profile': User,
}

interface MenuItem {
  id: string
  title: string
  label?: string
  url?: string
  targetBlank: boolean
  target?: string
  orderIndex: number
  isActive: boolean
  menuId: string
  parentId?: string | null
  children?: MenuItem[]
}

interface Menu {
  id: string
  name: string
  slug: string
  description?: string
  location: string
  isActive: boolean
  items: MenuItem[]
}

interface MainMenuProps {
  location?: 'HEADER' | 'FOOTER' | 'SIDEBAR' | 'MOBILE' | 'CUSTOM'
  className?: string
  orientation?: 'horizontal' | 'vertical'
  showToggle?: boolean
}

export default function MainMenu({
  location = 'HEADER',
  className = '',
  orientation = 'horizontal',
  showToggle = false
}: MainMenuProps) {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])
  const pathname = usePathname()

  useEffect(() => {
    fetchMenus()
  }, [location])

  const fetchMenus = async () => {
    try {
      const response = await fetch(`/api/menus?location=${location}&includeItems=true`)
      const data = await response.json()

      if (data.menus) {
        // Transform API data to match component interface
        const transformedMenus = data.menus.map((menu: any) => ({
          ...menu,
          items: menu.items?.map((item: any) => ({
            id: item.id,
            title: item.label, // API returns 'label', component expects 'title'
            url: item.url,
            targetBlank: item.target === '_blank',
            orderIndex: item.orderIndex,
            isActive: item.isActive,
            menuId: item.menuId,
            parentId: item.parentId,
          })) || []
        }))

        // Remove duplicate menu items based on title and url
        const deduplicatedMenus = transformedMenus.map((menu: any) => ({
          ...menu,
          items: menu.items.filter((item: MenuItem, index: number, array: MenuItem[]) => {
            const firstIndex = array.findIndex(i =>
              i.title === item.title && i.url === item.url && i.parentId === item.parentId
            )
            return firstIndex === index
          })
        }))

        // Process menus to build hierarchy
        const processedMenus = deduplicatedMenus.map(buildMenuHierarchy)
        setMenus(processedMenus)
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error)
      // Fallback to default menu structure
      setMenus([{
        id: 'fallback-menu',
        name: 'Main Menu',
        slug: 'main-menu',
        location: location,
        isActive: true,
        items: [
          { id: '1', title: 'Home', url: '/', targetBlank: false, orderIndex: 0, isActive: true, menuId: 'fallback-menu' },
          { id: '2', title: 'About', url: '/about', targetBlank: false, orderIndex: 1, isActive: true, menuId: 'fallback-menu' },
          { id: '3', title: 'Courses', url: '/courses', targetBlank: false, orderIndex: 2, isActive: true, menuId: 'fallback-menu' },
          { id: '4', title: 'Contact', url: '/contact', targetBlank: false, orderIndex: 3, isActive: true, menuId: 'fallback-menu' }
        ]
      }])
    } finally {
      setLoading(false)
    }
  }

  const buildMenuHierarchy = (menu: Menu): Menu => {
    const itemsMap = new Map<string, MenuItem>()
    const rootItems: MenuItem[] = []

    // First pass: create a map of all items
    menu.items.forEach(item => {
      itemsMap.set(item.id, { ...item, children: [] })
    })

    // Second pass: build hierarchy
    menu.items.forEach(item => {
      const menuItem = itemsMap.get(item.id)!

      if (item.parentId && itemsMap.has(item.parentId)) {
        const parent = itemsMap.get(item.parentId)!
        if (!parent.children) parent.children = []
        parent.children.push(menuItem)
      } else {
        rootItems.push(menuItem)
      }
    })

    // Sort items by orderIndex
    const sortItems = (items: MenuItem[]): MenuItem[] => {
      return items.sort((a, b) => a.orderIndex - b.orderIndex).map(item => ({
        ...item,
        children: item.children ? sortItems(item.children) : []
      }))
    }

    return {
      ...menu,
      items: sortItems(rootItems)
    }
  }

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (url?: string) => {
    if (!url) return false
    return pathname === url || (url !== '/' && pathname.startsWith(url))
  }

  const renderMegaMenu = (item: MenuItem) => {
    if (!item.children || item.children.length === 0) return null

    // Create 3 columns for Study Abroad mega menu
    const itemsPerColumn = Math.ceil(item.children.length / 3)
    const columns = [
      item.children.slice(0, itemsPerColumn),
      item.children.slice(itemsPerColumn, itemsPerColumn * 2),
      item.children.slice(itemsPerColumn * 2)
    ]

    return (
      <div
        className="absolute left-0 top-full mt-2 w-[800px] bg-white border border-gray-100 rounded-xl shadow-2xl z-50 p-8"
        onMouseLeave={() => setTimeout(() => setOpenDropdowns([]), 100)}
      >
        <div className="grid grid-cols-3 gap-8">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-3">
              {column.map(child => (
                <Link
                  key={child.id}
                  href={child.url || '#'}
                  className="group block p-3 rounded-lg hover:bg-primary/5 transition-all duration-200 border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <Flag className="w-4 h-4 text-primary group-hover:text-primary/80 transition-colors flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors text-sm">
                        {child.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Call to action footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Ready to Start Your Journey?</h4>
              <p className="text-xs text-gray-600 mt-1">Get personalized guidance from our experts</p>
            </div>
            <Link
              href="/contact"
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Get Free Consultation
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isDropdownOpen = openDropdowns.includes(item.id)
    const active = isActive(item.url)
    const isStudyAbroad = item.title === 'Study Abroad' && hasChildren && location === 'HEADER'

    // Get icon for menu item (only for mobile/sidebar menus)
    const IconComponent = iconMap[item.title] || Briefcase
    const showIcons = location !== 'HEADER' || orientation !== 'horizontal'

    // Different styling for header vs other menus
    const linkClass = location === 'HEADER' && orientation === 'horizontal'
      ? `
        flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200
        ${active
          ? 'text-primary border-b-2 border-primary'
          : 'text-gray-700 hover:text-primary'
        }
      `
      : `
        flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg
        ${active
          ? 'text-primary bg-primary/10 border border-primary/20'
          : 'text-gray-700 hover:text-primary hover:bg-primary/5'
        }
        ${level > 0 ? 'ml-4 border-l-2 border-gray-200 pl-6' : ''}
      `

    const content = (
      <>
        <div className="flex items-center gap-2 flex-1">
          {showIcons && <IconComponent className="w-4 h-4 flex-shrink-0" />}
          <span className={location === 'HEADER' && orientation === 'horizontal' ? 'whitespace-nowrap' : 'truncate'}>
            {item.title}
          </span>
        </div>
        {hasChildren && (
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </>
    )

    return (
      <div key={item.id} className="relative group">
        {item.url ? (
          <Link
            href={item.url}
            target={item.targetBlank ? '_blank' : '_self'}
            className={linkClass}
            onMouseEnter={() => hasChildren && location === 'HEADER' && setOpenDropdowns([item.id])}
            onMouseLeave={() => hasChildren && location === 'HEADER' && setTimeout(() => {
              if (!document.querySelector('.group:hover')) {
                setOpenDropdowns([])
              }
            }, 100)}
            onClick={hasChildren ? (e) => {
              e.preventDefault()
              toggleDropdown(item.id)
            } : undefined}
          >
            {content}
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleDropdown(item.id)}
            onMouseEnter={() => hasChildren && location === 'HEADER' && setOpenDropdowns([item.id])}
            className={linkClass}
          >
            {content}
          </button>
        )}

        {hasChildren && isDropdownOpen && (
          isStudyAbroad ? (
            renderMegaMenu(item)
          ) : (
            <div className={`
              ${orientation === 'horizontal'
                ? 'absolute left-0 top-full mt-2 min-w-48 max-w-64 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-2'
                : 'ml-4 mt-2 space-y-1'
              }
            `}>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </div>
          )
        )}
      </div>
    )
  }

  const renderHorizontalMenu = (menu: Menu) => (
    <nav className={`relative ${className}`}>
      <div className="flex items-center space-x-6">
        {menu.items.map(item => renderMenuItem(item))}
      </div>
    </nav>
  )

  const renderVerticalMenu = (menu: Menu) => (
    <nav className={`space-y-1 ${className}`}>
      {menu.items.map(item => renderMenuItem(item))}
    </nav>
  )

  const renderMobileMenu = (menu: Menu) => (
    <div className="relative">
      {showToggle && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      )}

      {(mobileOpen || !showToggle) && (
        <div className={`
          ${showToggle
            ? 'absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50'
            : 'w-full'
          }
        `}>
          <div className="py-2">
            {menu.items.map(item => renderMenuItem(item))}
          </div>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!menus.length) {
    return null
  }

  const menu = menus[0] // Use first menu for the location

  // Render based on orientation and location
  if (location === 'MOBILE' || (showToggle && orientation === 'horizontal')) {
    return renderMobileMenu(menu)
  }

  if (orientation === 'vertical') {
    return renderVerticalMenu(menu)
  }

  return renderHorizontalMenu(menu)
}

// Convenience components for different menu types
export const HeaderMenu = (props: Omit<MainMenuProps, 'location' | 'orientation'>) => (
  <MainMenu {...props} location="HEADER" orientation="horizontal" />
)

export const FooterMenu = (props: Omit<MainMenuProps, 'location' | 'orientation'>) => (
  <MainMenu {...props} location="FOOTER" orientation="horizontal" />
)

export const SidebarMenu = (props: Omit<MainMenuProps, 'location' | 'orientation'>) => (
  <MainMenu {...props} location="SIDEBAR" orientation="vertical" />
)

export const MobileMenu = (props: Omit<MainMenuProps, 'location'>) => (
  <MainMenu {...props} location="MOBILE" showToggle />
)