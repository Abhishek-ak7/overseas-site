import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const siteSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').optional(),
  siteTagline: z.string().optional(),
  siteDescription: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  linkColor: z.string().optional(),
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  fontSize: z.string().optional(),
  containerWidth: z.string().optional(),
  borderRadius: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  facebookUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  instagramUrl: z.string().url().optional(),
  youtubeUrl: z.string().url().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  enableCookieConsent: z.boolean().optional(),
  enableMaintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
})

// GET /api/settings/site - Get site settings
export async function GET(request: NextRequest) {
  try {
    // Get the first (and should be only) site settings record
    let settings = await prisma.siteSettings.findFirst()

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'BnOverseas',
          siteTagline: 'Your Gateway to Global Education',
          primaryColor: '#dc2626',
          secondaryColor: '#1f2937',
          accentColor: '#3b82f6',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          linkColor: '#3b82f6',
          headingFont: 'Inter',
          bodyFont: 'Inter',
          fontSize: '16px',
          containerWidth: '1200px',
          borderRadius: '8px',
          timezone: 'UTC',
          language: 'en',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          enableCookieConsent: true,
          enableMaintenanceMode: false,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/site - Update site settings (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = siteSettingsSchema.parse(body)

    // Get existing settings or create ID for new ones
    let existingSettings = await prisma.siteSettings.findFirst()

    let settings
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          ...validatedData,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new settings
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'BnOverseas',
          ...validatedData,
        },
      })
    }

    return NextResponse.json({
      settings,
      message: 'Site settings updated successfully'
    })

  } catch (error) {
    console.error('Settings update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}