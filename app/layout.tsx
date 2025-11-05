import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { NextAuthProvider } from "@/components/providers/nextauth-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { ConditionalLayout } from "@/components/layout/conditional-layout"
import "./globals.css"

export const metadata: Metadata = {
  title: "BnOverseas - Your Gateway to International Education",
  description:
    "Leading study abroad consultancy helping students achieve their dreams of international education with comprehensive guidance and support.",
  generator: "BnOverseas Platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <NextAuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Analytics />
            <Toaster />
          </Suspense>
        </NextAuthProvider>
      </body>
    </html>
  )
}
