"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

export interface AdminDropdownAction {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  className?: string
  separator?: boolean
}

interface AdminDropdownMenuProps {
  actions: AdminDropdownAction[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
  debugId?: string
}

export function AdminDropdownMenu({
  actions,
  size = 'md',
  className = '',
  debugId
}: AdminDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const buttonSize = {
    sm: 'h-6 w-6 p-0',
    md: 'h-8 w-8 p-0',
    lg: 'h-10 w-10 p-0'
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Try a simpler custom dropdown first to isolate the issue
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          className={`${buttonSize[size]} ${className}`}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setIsOpen(!isOpen)
            if (debugId) {
              console.log('AdminDropdownMenu trigger clicked:', debugId, 'isOpen will be:', !isOpen)
            }
          }}
        >
          <MoreHorizontal className={iconSize[size]} />
        </Button>

        {isOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[9999]"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              zIndex: 9999
            }}
          >
            <div className="py-1">
              {actions.map((action, index) => {
                const Icon = action.icon
                return (
                  <React.Fragment key={index}>
                    {action.separator && index > 0 && (
                      <hr className="my-1 border-gray-200" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (debugId) {
                          console.log('AdminDropdownMenu action clicked:', action.label, debugId)
                        }
                        setIsOpen(false)
                        action.onClick()
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${action.className || ''}`}
                    >
                      <Icon className={`mr-2 ${iconSize[size]}`} />
                      {action.label}
                    </button>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={setIsOpen}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`${buttonSize[size]} ${className}`}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setIsOpen(!isOpen)
            if (debugId) {
              console.log('AdminDropdownMenu trigger clicked:', debugId, 'isOpen:', !isOpen)
            }
          }}
        >
          <MoreHorizontal className={iconSize[size]} />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[9999] min-w-[160px] bg-white border shadow-md"
        side="bottom"
        sideOffset={4}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <React.Fragment key={index}>
              {action.separator && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  if (debugId) {
                    console.log('AdminDropdownMenu action clicked:', action.label, debugId)
                  }
                  setIsOpen(false)
                  action.onClick()
                }}
                className={`cursor-pointer ${action.className || ''}`}
              >
                <Icon className={`mr-2 ${iconSize[size]}`} />
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AdminDropdownMenu