import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const settingsUpdateSchema = z.object({
  category: z.string(),
  settings: z.record(z.any()).optional(),
  data: z.record(z.any()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Verify admin access
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Fetch all settings
    const settings = await prisma.settings.findMany({
      orderBy: { key: 'asc' }
    })

    // Group settings by category
    const groupedSettings = {
      general: {
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        contactPhone: '',
        businessAddress: '',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        language: 'en'
      },
      branding: {
        logo: '',
        favicon: '',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        customCSS: ''
      },
      email: {
        smtpHost: '',
        smtpPort: '587',
        smtpUsername: '',
        smtpPassword: '',
        fromName: '',
        fromEmail: '',
        enableEmailNotifications: true
      },
      payments: {
        razorpayKeyId: '',
        razorpayKeySecret: '',
        stripePublicKey: '',
        stripeSecretKey: '',
        paypalClientId: '',
        defaultCurrency: 'INR',
        enableRazorpay: true,
        enableStripe: false,
        enablePaypal: false
      },
      security: {
        enableTwoFactor: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        enableCaptcha: false,
        maintenanceMode: false,
        allowRegistration: true
      },
      notifications: {
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        enablePushNotifications: false,
        adminEmail: '',
        notifyOnNewUser: true,
        notifyOnNewOrder: true,
        notifyOnAppointment: true
      },
      integrations: {
        googleAnalyticsId: '',
        facebookPixelId: '',
        zoomApiKey: '',
        zoomApiSecret: '',
        twilioAccountSid: '',
        twilioAuthToken: ''
      },
      storage: {
        provider: 'aws_s3',
        awsAccessKeyId: '',
        awsSecretAccessKey: '',
        awsRegion: 'us-east-1',
        awsS3Bucket: '',
        maxFileSize: 10, // in MB
        allowedFileTypes: 'image,video,document,audio'
      }
    }

    // Populate with actual settings from database
    settings.forEach(setting => {
      const categories = Object.keys(groupedSettings)
      for (const category of categories) {
        if (setting.key.startsWith(category)) {
          const keyWithoutPrefix = setting.key.replace(`${category}_`, '')
          if (keyWithoutPrefix in groupedSettings[category as keyof typeof groupedSettings]) {
            (groupedSettings[category as keyof typeof groupedSettings] as any)[keyWithoutPrefix] =
              typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
          }
        }
      }
    })

    return NextResponse.json({ settings: groupedSettings })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Verify admin access
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = settingsUpdateSchema.parse(body)

    const { category, settings, data } = validatedData
    const settingsData = settings || data

    if (!settingsData) {
      return NextResponse.json(
        { error: 'No settings data provided' },
        { status: 400 }
      )
    }

    // Update settings in database
    const updatePromises = Object.entries(settingsData).map(([key, value]) => {
      const settingKey = `${category}_${key}`
      return prisma.settings.upsert({
        where: { key: settingKey },
        update: {
          value: JSON.stringify(value),
          updated_at: new Date()
        },
        create: {
          id: `setting-${category}-${key}-${Date.now()}`,
          key: settingKey,
          value: JSON.stringify(value),
          description: `${category} setting: ${key}`,
          is_public: ['general', 'branding'].includes(category),
          updated_at: new Date()
        }
      })
    })

    await Promise.all(updatePromises)

    // Log the settings update
    console.log(`Settings updated by ${user.email}: ${category}`)

    return NextResponse.json({
      success: true,
      message: `${category} settings updated successfully`
    })

  } catch (error) {
    console.error('Settings update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// PUT handler (same as POST for backward compatibility)
export async function PUT(request: NextRequest) {
  return POST(request)
}