import { prisma } from '@/lib/prisma'

// Settings cache to avoid repeated database queries
const settingsCache: Record<string, any> = {}
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export interface Settings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    contactPhone: string
    businessAddress: string
    currency: string
    timezone: string
    language: string
  }
  branding: {
    logo: string
    favicon: string
    primaryColor: string
    secondaryColor: string
    customCSS: string
  }
  email: {
    smtpHost: string
    smtpPort: string
    smtpUsername: string
    smtpPassword: string
    fromName: string
    fromEmail: string
    enableEmailNotifications: boolean
  }
  payments: {
    razorpayKeyId: string
    razorpayKeySecret: string
    stripePublicKey: string
    stripeSecretKey: string
    paypalClientId: string
    defaultCurrency: string
    enableRazorpay: boolean
    enableStripe: boolean
    enablePaypal: boolean
  }
  storage: {
    provider: string
    awsAccessKeyId: string
    awsSecretAccessKey: string
    awsRegion: string
    awsS3Bucket: string
    maxFileSize: number
    allowedFileTypes: string
  }
  security: {
    enableTwoFactor: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    enableCaptcha: boolean
    maintenanceMode: boolean
    allowRegistration: boolean
  }
  notifications: {
    enableEmailNotifications: boolean
    enableSMSNotifications: boolean
    enablePushNotifications: boolean
    adminEmail: string
    notifyOnNewUser: boolean
    notifyOnNewOrder: boolean
    notifyOnAppointment: boolean
  }
  integrations: {
    googleAnalyticsId: string
    facebookPixelId: string
    zoomApiKey: string
    zoomApiSecret: string
    twilioAccountSid: string
    twilioAuthToken: string
  }
}

// Fetch all settings from database
export async function getSettings(): Promise<Settings> {
  const now = Date.now()

  // Return cached settings if they're still fresh
  if (settingsCache.settings && (now - cacheTimestamp) < CACHE_DURATION) {
    return settingsCache.settings
  }

  try {
    const settings = await prisma.settings.findMany()

    // Default settings structure
    const defaultSettings: Settings = {
      general: {
        siteName: 'BnOverseas',
        siteDescription: 'Your Study Abroad Partner',
        contactEmail: 'info@bnoverseas.com',
        contactPhone: '+91 1234567890',
        businessAddress: 'India',
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
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUsername: process.env.SMTP_USER || '',
        smtpPassword: process.env.SMTP_PASS || '',
        fromName: 'BnOverseas',
        fromEmail: process.env.FROM_EMAIL || 'noreply@bnoverseas.com',
        enableEmailNotifications: true
      },
      payments: {
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
        razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
        paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
        defaultCurrency: 'INR',
        enableRazorpay: true,
        enableStripe: false,
        enablePaypal: false
      },
      storage: {
        provider: 'aws_s3',
        awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        awsRegion: process.env.AWS_REGION || 'us-east-1',
        awsS3Bucket: process.env.AWS_S3_BUCKET || '',
        maxFileSize: 10,
        allowedFileTypes: 'image,video,document,audio'
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
        adminEmail: process.env.ADMIN_EMAIL || 'admin@bnoverseas.com',
        notifyOnNewUser: true,
        notifyOnNewOrder: true,
        notifyOnAppointment: true
      },
      integrations: {
        googleAnalyticsId: process.env.GA_TRACKING_ID || '',
        facebookPixelId: process.env.FB_PIXEL_ID || '',
        zoomApiKey: process.env.ZOOM_API_KEY || '',
        zoomApiSecret: process.env.ZOOM_API_SECRET || '',
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || ''
      }
    }

    // Merge database settings with defaults
    settings.forEach(setting => {
      const keyParts = setting.key.split('_')
      if (keyParts.length >= 2) {
        const category = keyParts[0] as keyof Settings
        const key = keyParts.slice(1).join('_')

        if (defaultSettings[category] && key in defaultSettings[category]) {
          try {
            const value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
            ;(defaultSettings[category] as any)[key] = value
          } catch {
            // If JSON.parse fails, use the raw value
            ;(defaultSettings[category] as any)[key] = setting.value
          }
        }
      }
    })

    // Cache the settings
    settingsCache.settings = defaultSettings
    cacheTimestamp = now

    return defaultSettings
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    // Return defaults with environment variables as fallback
    throw error
  }
}

// Get specific setting category
export async function getSettingCategory<K extends keyof Settings>(category: K): Promise<Settings[K]> {
  const settings = await getSettings()
  return settings[category]
}

// Get specific setting value
export async function getSetting<K extends keyof Settings>(
  category: K,
  key: keyof Settings[K]
): Promise<Settings[K][keyof Settings[K]]> {
  const categorySettings = await getSettingCategory(category)
  return categorySettings[key]
}

// Clear settings cache (useful after updates)
export function clearSettingsCache() {
  settingsCache.settings = undefined
  cacheTimestamp = 0
}

// Helper functions for specific settings
export async function getEmailSettings() {
  return getSettingCategory('email')
}

export async function getPaymentSettings() {
  return getSettingCategory('payments')
}

export async function getStorageSettings() {
  return getSettingCategory('storage')
}

export async function getSecuritySettings() {
  return getSettingCategory('security')
}

// Test configuration helpers
export async function testEmailConfiguration() {
  try {
    const emailSettings = await getEmailSettings()

    // Basic validation
    if (!emailSettings.smtpHost || !emailSettings.smtpPort) {
      return { success: false, error: 'SMTP host and port are required' }
    }

    if (!emailSettings.smtpUsername || !emailSettings.smtpPassword) {
      return { success: false, error: 'SMTP username and password are required' }
    }

    return { success: true, message: 'Email configuration appears valid' }
  } catch (error) {
    return { success: false, error: 'Failed to test email configuration' }
  }
}

export async function testStorageConfiguration() {
  try {
    const storageSettings = await getStorageSettings()

    if (storageSettings.provider === 'aws_s3') {
      if (!storageSettings.awsAccessKeyId || !storageSettings.awsSecretAccessKey) {
        return { success: false, error: 'AWS credentials are required' }
      }

      if (!storageSettings.awsS3Bucket) {
        return { success: false, error: 'S3 bucket name is required' }
      }
    }

    return { success: true, message: 'Storage configuration appears valid' }
  } catch (error) {
    return { success: false, error: 'Failed to test storage configuration' }
  }
}

export async function testPaymentConfiguration(provider: 'razorpay' | 'stripe' | 'paypal') {
  try {
    const paymentSettings = await getPaymentSettings()

    switch (provider) {
      case 'razorpay':
        if (!paymentSettings.razorpayKeyId || !paymentSettings.razorpayKeySecret) {
          return { success: false, error: 'Razorpay credentials are required' }
        }
        break
      case 'stripe':
        if (!paymentSettings.stripePublicKey || !paymentSettings.stripeSecretKey) {
          return { success: false, error: 'Stripe credentials are required' }
        }
        break
      case 'paypal':
        if (!paymentSettings.paypalClientId) {
          return { success: false, error: 'PayPal client ID is required' }
        }
        break
    }

    return { success: true, message: `${provider} configuration appears valid` }
  } catch (error) {
    return { success: false, error: `Failed to test ${provider} configuration` }
  }
}