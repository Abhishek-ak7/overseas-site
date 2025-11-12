"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, Search, User, BookOpen, Calendar, Settings, LogOut } from "lucide-react"
import { HeaderMenu, MobileMenu } from "@/components/navigation/main-menu"
import { SearchDialog } from "@/components/search/search-dialog"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export function Header() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug logging
  console.log('Header - Session:', session)
  console.log('Header - Status:', status)
  console.log('Header - Dropdown Open:', dropdownOpen)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await signOut({ redirect: false })
    router.push('/')
    router.refresh()
  }

  const getUserInitials = () => {
    if (!session?.user) return 'U'
    return `${session.user.firstName?.[0] || ''}${session.user.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <header className="w-full bg-white shadow-lg sticky top-0 z-50">
      {/* Top Search Bar */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="text-white text-sm font-medium hidden lg:block">
              {/* Fulfill your dream to Study Abroad */}
              hi devops
            </div>
            <div className="flex-1 lg:flex-initial lg:w-96 ml-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search discipline, institutes or programs"
                  readOnly
                  onClick={() => setSearchOpen(true)}
                  className="w-full pl-4 pr-10 py-2 rounded-full bg-white text-sm border-0 focus-visible:ring-1 focus-visible:ring-white cursor-pointer"
                />
                <button
                  onClick={() => setSearchOpen(true)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-2 transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            {/* Logo - Fixed width to prevent shifting */}
            <Link href="/" className="flex items-center group flex-shrink-0">
              <img
                src="/bnoverseas-logo.webp"
                alt="BN Overseas - Your Gateway to International Education"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                style={{ minWidth: '150px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzM1OEZGRiI+Qk4gT3ZlcnNlYXM8L3RleHQ+PC9zdmc+';
                }}
              />
            </Link>

            {/* Desktop Navigation - Using Dynamic Menu System */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <HeaderMenu />
            </div>

            {/* Search & Auth/CTA Button - Fixed width to prevent shifting */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="hover:bg-primary/10 transition-colors duration-300"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </Button>

              {session?.user ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                    onClick={() => {
                      console.log('Avatar clicked!')
                      setDropdownOpen(!dropdownOpen)
                    }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.firstName} />
                      <AvatarFallback className="bg-primary text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>

                  {/* Native Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-[9999]"
                      style={{
                        display: 'block',
                        visibility: 'visible',
                        opacity: 1
                      }}
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user.firstName} {session.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {session.user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            console.log('Profile clicked')
                            setDropdownOpen(false)
                            router.push('/profile')
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </button>

                        <button
                          onClick={() => {
                            console.log('Courses clicked')
                            setDropdownOpen(false)
                            router.push('/dashboard/courses')
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <BookOpen className="mr-3 h-4 w-4" />
                          My Courses
                        </button>

                        <button
                          onClick={() => {
                            console.log('Appointments clicked')
                            setDropdownOpen(false)
                            router.push('/dashboard/appointments')
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Calendar className="mr-3 h-4 w-4" />
                          My Appointments
                        </button>

                        {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                          <button
                            onClick={() => {
                              console.log('Admin clicked')
                              setDropdownOpen(false)
                              router.push('/admin')
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Settings className="mr-3 h-4 w-4" />
                            Admin Panel
                          </button>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200 py-1">
                        <button
                          onClick={() => {
                            console.log('Logout clicked')
                            handleLogout()
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {status !== 'loading' && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => router.push('/auth/login')}
                        className="text-sm"
                      >
                        Login
                      </Button>
                      <Button asChild className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-sm whitespace-nowrap">
                        <Link href="/auth/register">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile search & menu buttons */}
            <div className="flex lg:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="hover:bg-primary/10 transition-colors duration-300"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </Button>
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors duration-300">
                    <Menu className="h-6 w-6 text-gray-700" />
                  </Button>
                </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Mobile Navigation - Using Dynamic Menu System */}
                  <MobileMenu className="space-y-6" />
                  <div className="pt-6 border-t border-gray-200">
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold w-full shadow-lg hover:shadow-xl transition-all duration-300">
                      <Link href="/contact">Get Free Counselling</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
