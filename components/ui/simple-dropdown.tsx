'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'start' | 'end'
  className?: string
}

export function SimpleDropdown({ trigger, children, align = 'end', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute z-[9999] mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5',
            align === 'end' ? 'right-0' : 'left-0',
            className
          )}
        >
          <div className="py-1" role="menu">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'default' | 'destructive'
  disabled?: boolean
}

export function SimpleDropdownItem({ onClick, children, variant = 'default', disabled = false }: DropdownItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex items-center w-full px-4 py-2 text-sm text-left transition-colors',
        variant === 'default' && 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        variant === 'destructive' && 'text-red-600 hover:bg-red-50 hover:text-red-700',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      role="menuitem"
    >
      {children}
    </button>
  )
}

export function SimpleDropdownSeparator() {
  return <div className="my-1 h-px bg-gray-200" />
}
