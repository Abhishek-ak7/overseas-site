'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Menu as MenuIcon,
  Navigation,
  Link,
  ExternalLink,
  Home,
  FileText,
  Globe,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { AdminDropdownMenu } from '@/components/admin/admin-dropdown-menu'

interface MenuLocation {
  value: 'HEADER' | 'FOOTER' | 'SIDEBAR' | 'MOBILE' | 'CUSTOM'
  label: string
  description: string
}

interface MenuItem {
  id: string
  label: string
  url: string
  type: string
  orderIndex: number
  isActive: boolean
  parentId?: string
  menuId: string
  category?: string
  description?: string
  target: string
  cssClass?: string
  createdAt: string
  updatedAt: string
}

interface Menu {
  id: string
  name: string
  slug: string
  description?: string
  location: string
  isActive: boolean
  items?: MenuItem[]
  createdAt: string
  updatedAt: string
}

interface MenuFormData {
  name: string
  slug: string
  description: string
  location: string
  isActive: boolean
}

interface MenuItemFormData {
  label: string
  url: string
  type: string
  orderIndex: number
  isActive: boolean
  parentId: string
  category: string
  description: string
  target: string
  cssClass: string
}

const defaultMenuFormData: MenuFormData = {
  name: '',
  slug: '',
  description: '',
  location: 'HEADER',
  isActive: true,
}

const defaultMenuItemFormData: MenuItemFormData = {
  label: '',
  url: '',
  type: 'custom',
  orderIndex: 0,
  isActive: true,
  parentId: '',
  category: '',
  description: '',
  target: '_self',
  cssClass: '',
}

const menuLocations: MenuLocation[] = [
  {
    value: 'HEADER',
    label: 'Header Navigation',
    description: 'Main navigation menu in the site header'
  },
  {
    value: 'FOOTER',
    label: 'Footer Menu',
    description: 'Links displayed in the site footer'
  },
  {
    value: 'SIDEBAR',
    label: 'Sidebar Menu',
    description: 'Navigation menu for sidebar areas'
  },
  {
    value: 'MOBILE',
    label: 'Mobile Menu',
    description: 'Mobile-specific navigation menu'
  },
  {
    value: 'CUSTOM',
    label: 'Custom Location',
    description: 'Custom menu for specific locations'
  },
]

// SortableMenuItem component for drag-and-drop
interface SortableMenuItemProps {
  item: MenuItem
  menu: Menu
  onEdit: (item: MenuItem) => void
  onDelete: (menuId: string, itemId: string) => void
}

function SortableMenuItem({ item, menu, onEdit, onDelete }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const TypeIcon = getTypeIcon(item.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 bg-gray-50 rounded text-sm ${
        isDragging ? 'shadow-lg z-10' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200"
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </div>
        <TypeIcon className="h-3 w-3 text-gray-500" />
        <span className="font-medium">{item.label}</span>
        <span className="text-gray-500">→ {item.url}</span>
      </div>
      <div
        className="flex items-center gap-1"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {!item.isActive && (
          <Badge variant="secondary" className="text-xs">Inactive</Badge>
        )}
        <div style={{ pointerEvents: 'auto' }}>
          <AdminDropdownMenu
            size="sm"
            debugId={`menu-item-${item.id}`}
            actions={[
              {
                label: 'Edit',
                icon: Edit,
                onClick: () => onEdit(item)
              },
              {
                label: 'Delete',
                icon: Trash2,
                onClick: () => onDelete(menu.id, item.id),
                className: 'text-red-600',
                separator: true
              }
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// Helper function to get type icon (moved up so SortableMenuItem can use it)
const getTypeIcon = (type: string) => {
  const typeInfo = menuItemTypes.find(t => t.value === type)
  return typeInfo ? typeInfo.icon : Link
}

const menuItemTypes = [
  { value: 'custom', label: 'Custom Link', icon: Link },
  { value: 'page', label: 'Page', icon: FileText },
  { value: 'post', label: 'Blog Post', icon: FileText },
  { value: 'category', label: 'Category', icon: Globe },
  { value: 'home', label: 'Home Page', icon: Home },
  { value: 'external', label: 'External Link', icon: ExternalLink },
]

export default function MenusManagement() {
  const router = useRouter()
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [menuFormData, setMenuFormData] = useState<MenuFormData>(defaultMenuFormData)
  const [menuItemFormData, setMenuItemFormData] = useState<MenuItemFormData>(defaultMenuItemFormData)
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false)
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menus?includeInactive=true&includeItems=true', {
        credentials: 'include'
      })
      const data = await response.json()
      setMenus(data.menus || [])
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end for menu items
  const handleDragEnd = async (event: DragEndEvent, menuId: string) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      const menu = menus.find(m => m.id === menuId)
      if (!menu || !menu.items) return

      const oldIndex = menu.items.findIndex(item => item.id === active.id)
      const newIndex = menu.items.findIndex(item => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      // Optimistically update UI
      const newItems = arrayMove(menu.items, oldIndex, newIndex)
      const updatedMenus = menus.map(m => 
        m.id === menuId ? { ...m, items: newItems } : m
      )
      setMenus(updatedMenus)

      try {
        // Send reorder request to API
        const reorderedIds = newItems.map(item => item.id)
        const response = await fetch(`/api/menus/${menuId}/items/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ itemIds: reorderedIds }),
        })

        if (!response.ok) {
          throw new Error('Failed to reorder items')
        }
      } catch (error) {
        console.error('Failed to reorder menu items:', error)
        // Revert optimistic update on error
        await fetchMenus()
        alert('Failed to reorder menu items')
      }
    }
  }

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const submitData = {
        ...menuFormData,
        slug: menuFormData.slug || generateSlug(menuFormData.name),
      }

      const url = editingMenu
        ? `/api/menus/${editingMenu.id}`
        : '/api/menus'

      const method = editingMenu ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        await fetchMenus()
        setIsMenuDialogOpen(false)
        setEditingMenu(null)
        setMenuFormData(defaultMenuFormData)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save menu')
      }
    } catch (error) {
      console.error('Failed to save menu:', error)
      alert('Failed to save menu')
    } finally {
      setSaving(false)
    }
  }

  const handleMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMenu) {
      alert('Please select a menu first')
      return
    }

    setSaving(true)

    try {
      const submitData = {
        label: menuItemFormData.label,
        url: menuItemFormData.url,
        type: menuItemFormData.type,
        orderIndex: menuItemFormData.orderIndex,
        isActive: menuItemFormData.isActive,
        parentId: menuItemFormData.parentId || null,
        category: menuItemFormData.category || null,
        description: menuItemFormData.description || null,
        target: menuItemFormData.target,
        cssClass: menuItemFormData.cssClass || null,
      }

      const url = editingMenuItem
        ? `/api/menus/${selectedMenu.id}/items/${editingMenuItem.id}`
        : `/api/menus/${selectedMenu.id}/items`

      const method = editingMenuItem ? 'PUT' : 'POST'

      console.log('Submitting menu item:', { url, method, submitData })

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      })

      const responseData = await response.json()
      console.log('Response:', responseData)

      if (response.ok) {
        await fetchMenus()
        setIsMenuItemDialogOpen(false)
        setEditingMenuItem(null)
        setSelectedMenu(null)
        setMenuItemFormData(defaultMenuItemFormData)
        alert(editingMenuItem ? 'Menu item updated successfully' : 'Menu item added successfully')
      } else {
        alert(responseData.error || 'Failed to save menu item')
      }
    } catch (error) {
      console.error('Failed to save menu item:', error)
      alert('Failed to save menu item: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu)
    setMenuFormData({
      name: menu.name,
      slug: menu.slug,
      description: menu.description || '',
      location: menu.location,
      isActive: menu.isActive,
    })
    setIsMenuDialogOpen(true)
  }

  const handleEditMenuItem = (item: MenuItem) => {
    // Find the menu that contains this item
    const menu = menus.find(m => m.id === item.menuId)
    if (menu) {
      setSelectedMenu(menu)
    }
    
    setEditingMenuItem(item)
    setMenuItemFormData({
      label: item.label,
      url: item.url,
      type: item.type,
      orderIndex: item.orderIndex,
      isActive: item.isActive,
      parentId: item.parentId || '',
      category: item.category || '',
      description: item.description || '',
      target: item.target,
      cssClass: item.cssClass || '',
    })
    setIsMenuItemDialogOpen(true)
  }

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu and all its items?')) return

    try {
      const response = await fetch(`/api/menus/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        await fetchMenus()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete menu')
      }
    } catch (error) {
      console.error('Failed to delete menu:', error)
      alert('Failed to delete menu')
    }
  }

  const handleDeleteMenuItem = async (menuId: string, itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      const response = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        await fetchMenus()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete menu item')
      }
    } catch (error) {
      console.error('Failed to delete menu item:', error)
      alert('Failed to delete menu item')
    }
  }

  const handleNewMenu = () => {
    setEditingMenu(null)
    setMenuFormData(defaultMenuFormData)
    setIsMenuDialogOpen(true)
  }

  const handleNewMenuItem = (menu: Menu) => {
    setSelectedMenu(menu)
    setEditingMenuItem(null)
    setMenuItemFormData(defaultMenuItemFormData)
    setIsMenuItemDialogOpen(true)
  }

  const handleCloseMenuItemDialog = () => {
    setIsMenuItemDialogOpen(false)
    setEditingMenuItem(null)
    setSelectedMenu(null)
    setMenuItemFormData(defaultMenuItemFormData)
  }

  const addPresetItems = async (menu: Menu, preset: 'main' | 'footer') => {
    const presets = {
      main: [
        { label: 'Home', url: '/', type: 'home', orderIndex: 0 },
        { label: 'About Us', url: '/about', type: 'page', orderIndex: 1 },
        { label: 'Courses', url: '/courses', type: 'page', orderIndex: 2 },
        { label: 'Blog', url: '/blog', type: 'page', orderIndex: 3 },
        { label: 'Contact', url: '/contact', type: 'page', orderIndex: 4 },
      ],
      footer: [
        { label: 'Privacy Policy', url: '/privacy-policy', type: 'page', orderIndex: 0 },
        { label: 'Terms of Service', url: '/terms-of-service', type: 'page', orderIndex: 1 },
        { label: 'Support', url: '/support', type: 'page', orderIndex: 2 },
        { label: 'About', url: '/about', type: 'page', orderIndex: 3 },
      ]
    }

    try {
      setSaving(true)
      const items = presets[preset]

      for (const item of items) {
        await fetch(`/api/menus/${menu.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...item,
            isActive: true,
            target: '_self',
            menuId: menu.id,
          }),
        })
      }

      await fetchMenus() // Refresh the menu list
    } catch (error) {
      console.error('Failed to add preset items:', error)
      alert('Failed to add preset items')
    } finally {
      setSaving(false)
    }
  }

  const getLocationBadge = (location: string) => {
    const locationInfo = menuLocations.find(l => l.value === location)
    return locationInfo ? locationInfo.label : location
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/appearance')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600">Create and manage navigation menus</p>
          </div>
        </div>
        <Button onClick={handleNewMenu}>
          <Plus className="h-4 w-4 mr-2" />
          Create Menu
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Menus ({menus.length})</TabsTrigger>
          <TabsTrigger value="locations">Menu Locations</TabsTrigger>
        </TabsList>

        {/* Menus List */}
        <TabsContent value="list">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {menus.map((menu) => (
              <Card key={menu.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MenuIcon className="h-5 w-5" />
                        {menu.name}
                      </CardTitle>
                      <CardDescription>
                        {menu.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getLocationBadge(menu.location)}
                      </Badge>
                      <Badge
                        variant={menu.isActive ? 'default' : 'secondary'}
                        className={menu.isActive ? 'bg-green-100 text-green-800' : ''}
                      >
                        {menu.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <AdminDropdownMenu
                        size="md"
                        debugId={`menu-${menu.id}`}
                        actions={[
                          {
                            label: 'Edit Menu',
                            icon: Edit,
                            onClick: () => handleEditMenu(menu)
                          },
                          {
                            label: 'Add Item',
                            icon: Plus,
                            onClick: () => handleNewMenuItem(menu)
                          },
                          {
                            label: 'Delete Menu',
                            icon: Trash2,
                            onClick: () => handleDeleteMenu(menu.id),
                            className: 'text-red-600',
                            separator: true
                          }
                        ]}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Menu Items:</span>
                      <span className="font-medium">{menu.items?.length || 0}</span>
                    </div>
                    {menu.items && menu.items.length > 0 ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, menu.id)}
                        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                      >
                        <SortableContext
                          items={menu.items.map(item => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {menu.items.map((item) => (
                              <SortableMenuItem
                                key={item.id}
                                item={item}
                                menu={menu}
                                onEdit={handleEditMenuItem}
                                onDelete={handleDeleteMenuItem}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No menu items yet</p>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNewMenuItem(menu)}
                          >
                            Add First Item
                          </Button>
                          <div className="grid grid-cols-2 gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addPresetItems(menu, 'main')}
                              className="text-xs"
                            >
                              📋 Main Menu
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addPresetItems(menu, 'footer')}
                              className="text-xs"
                            >
                              📄 Footer Items
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {menus.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <MenuIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No menus created</h3>
                <p className="text-gray-600 mb-4">Create your first navigation menu to get started.</p>
                <Button onClick={handleNewMenu}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Menu
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Menu Locations */}
        <TabsContent value="locations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuLocations.map((location) => {
              const assignedMenus = menus.filter(m => m.location === location.value && m.isActive)
              return (
                <Card key={location.value}>
                  <CardHeader>
                    <CardTitle>{location.label}</CardTitle>
                    <CardDescription>{location.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assignedMenus.length > 0 ? (
                      <div className="space-y-2">
                        {assignedMenus.map((menu) => (
                          <div
                            key={menu.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="font-medium">{menu.name}</span>
                            <Badge variant="outline">{menu.items?.length || 0} items</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No menu assigned</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setMenuFormData({
                              ...defaultMenuFormData,
                              location: location.value,
                              name: location.label
                            })
                            setIsMenuDialogOpen(true)
                          }}
                        >
                          Create Menu
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Menu Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? 'Edit Menu' : 'Create New Menu'}
            </DialogTitle>
            <DialogDescription>
              {editingMenu ? 'Update the menu details' : 'Create a new navigation menu'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMenuSubmit} className="space-y-4">
            <div>
              <Label htmlFor="menuName">Menu Name *</Label>
              <Input
                id="menuName"
                value={menuFormData.name}
                onChange={(e) => {
                  const value = e.target.value
                  setMenuFormData(prev => ({
                    ...prev,
                    name: value,
                    slug: prev.slug || generateSlug(value)
                  }))
                }}
                placeholder="e.g., Main Navigation"
                required
              />
            </div>

            <div>
              <Label htmlFor="menuSlug">Slug *</Label>
              <Input
                id="menuSlug"
                value={menuFormData.slug}
                onChange={(e) => setMenuFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., main-navigation"
                required
              />
            </div>

            <div>
              <Label htmlFor="menuLocation">Location</Label>
              <Select
                value={menuFormData.location}
                onValueChange={(value) => setMenuFormData(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {menuLocations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="menuDescription">Description</Label>
              <Textarea
                id="menuDescription"
                value={menuFormData.description}
                onChange={(e) => setMenuFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for this menu"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="menuActive">Active</Label>
                  <p className="text-sm text-gray-500">Display this menu on the site</p>
                </div>
                <Switch
                  id="menuActive"
                  checked={menuFormData.isActive}
                  onCheckedChange={(checked) => setMenuFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div>
                <Label>Menu Templates</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMenuFormData(prev => ({
                        ...prev,
                        name: 'Main Navigation',
                        slug: 'main-navigation',
                        location: 'HEADER'
                      }))
                    }}
                    className="justify-start"
                  >
                    🏠 Main Navigation Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMenuFormData(prev => ({
                        ...prev,
                        name: 'Footer Links',
                        slug: 'footer-links',
                        location: 'FOOTER'
                      }))
                    }}
                    className="justify-start"
                  >
                    📄 Footer Links Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMenuFormData(prev => ({
                        ...prev,
                        name: 'Mobile Menu',
                        slug: 'mobile-menu',
                        location: 'MOBILE'
                      }))
                    }}
                    className="justify-start"
                  >
                    📱 Mobile Menu Template
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMenuDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingMenu ? 'Update Menu' : 'Create Menu'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={isMenuItemDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseMenuItemDialog()
        } else {
          setIsMenuItemDialogOpen(true)
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
            <DialogDescription>
              {editingMenuItem ? 'Update the menu item details' : `Add a new item to ${selectedMenu?.name}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMenuItemSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemLabel">Label *</Label>
                <Input
                  id="itemLabel"
                  value={menuItemFormData.label}
                  onChange={(e) => setMenuItemFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., About Us"
                  required
                />
              </div>
              <div>
                <Label htmlFor="itemType">Type</Label>
                <Select
                  value={menuItemFormData.type}
                  onValueChange={(value) => setMenuItemFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItemTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="itemUrl">URL *</Label>
              <Input
                id="itemUrl"
                value={menuItemFormData.url}
                onChange={(e) => setMenuItemFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="e.g., /about or https://example.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemTarget">Target</Label>
                <Select
                  value={menuItemFormData.target}
                  onValueChange={(value) => setMenuItemFormData(prev => ({ ...prev, target: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same Window</SelectItem>
                    <SelectItem value="_blank">New Window</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="itemOrder">Order</Label>
                <Input
                  id="itemOrder"
                  type="number"
                  value={menuItemFormData.orderIndex}
                  onChange={(e) => setMenuItemFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea
                id="itemDescription"
                value={menuItemFormData.description}
                onChange={(e) => setMenuItemFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for this menu item"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="itemCssClass">CSS Classes</Label>
              <Input
                id="itemCssClass"
                value={menuItemFormData.cssClass}
                onChange={(e) => setMenuItemFormData(prev => ({ ...prev, cssClass: e.target.value }))}
                placeholder="e.g., highlight-menu custom-style"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add custom CSS classes for styling (space-separated)
              </p>
            </div>

            <div>
              <Label>Quick Style Options</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMenuItemFormData(prev => ({
                    ...prev,
                    cssClass: 'text-red-600 font-semibold'
                  }))}
                >
                  🔴 Highlight Red
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMenuItemFormData(prev => ({
                    ...prev,
                    cssClass: 'text-blue-600 font-semibold'
                  }))}
                >
                  🔵 Highlight Blue
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMenuItemFormData(prev => ({
                    ...prev,
                    cssClass: 'bg-yellow-100 px-2 py-1 rounded'
                  }))}
                >
                  ⭐ Badge Style
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMenuItemFormData(prev => ({
                    ...prev,
                    cssClass: 'border-2 border-green-500 px-2 py-1 rounded'
                  }))}
                >
                  💚 CTA Button
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="itemActive">Active</Label>
                <p className="text-sm text-gray-500">Display this item in the menu</p>
              </div>
              <Switch
                id="itemActive"
                checked={menuItemFormData.isActive}
                onCheckedChange={(checked) => setMenuItemFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseMenuItemDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingMenuItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}