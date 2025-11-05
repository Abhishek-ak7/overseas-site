"use client"

import { SessionProvider } from "next-auth/react"

interface NextAuthProviderProps {
  children: React.ReactNode
  session?: any
}

export function NextAuthProvider({ children, session }: NextAuthProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}