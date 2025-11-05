"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, BookOpen, Calendar, Settings, LogOut } from "lucide-react"

export default function TestDropdownPage() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  console.log('Test Page - Session:', session)
  console.log('Test Page - Status:', status)
  console.log('Test Page - Dropdown Open:', isOpen)

  const getUserInitials = () => {
    if (!session?.user) return 'U'
    return `${session.user.firstName?.[0] || ''}${session.user.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">Dropdown Menu Test Page</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Session Status:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify({ status, session }, null, 2)}
          </pre>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Simple Dropdown Test:</h2>

          <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Open Simple Dropdown
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Simple Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Item 1 clicked')}>
                Item 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Item 2 clicked')}>
                Item 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Item 3 clicked')}>
                Item 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="mt-4 text-sm text-gray-600">
            Dropdown is: <span className="font-bold">{isOpen ? 'OPEN' : 'CLOSED'}</span>
          </p>
        </div>

        {session?.user && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">User Avatar Dropdown (Like Header):</h2>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.firstName} />
                    <AvatarFallback className="bg-primary text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.firstName} {session.user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log('Profile clicked')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Courses clicked')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>My Courses</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Appointments clicked')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>My Appointments</span>
                </DropdownMenuItem>
                {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                  <DropdownMenuItem onClick={() => console.log('Admin clicked')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log('Logout clicked')}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">Debugging Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Open browser DevTools (F12) and go to Console tab</li>
            <li>Click on the dropdown buttons above</li>
            <li>Check console for click events and state changes</li>
            <li>Inspect the dropdown element when it's supposed to be open</li>
            <li>Check if [data-state="open"] attribute is present</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
