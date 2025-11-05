import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const setupData = await request.json()

    // Initialize Prisma with the provided database URL
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: setupData.database.url
        }
      }
    })

    try {
      // Push database schema
      const { execSync } = require('child_process')
      process.env.DATABASE_URL = setupData.database.url

      try {
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' })
      } catch (error) {
        console.error('Database migration error:', error)
        // Continue anyway as the database might already be set up
      }

      // Create admin user
      const hashedPassword = await hash(setupData.admin.password, 12)

      const adminUser = await prisma.user.create({
        data: {
          email: setupData.admin.email,
          passwordHash: hashedPassword,
          firstName: setupData.admin.firstName,
          lastName: setupData.admin.lastName,
          role: 'SUPER_ADMIN',
          isVerified: true,
          profile: {
            create: {
              bio: 'System Administrator',
              notificationSettings: {
                email: true,
                sms: false,
                push: true
              }
            }
          }
        },
        include: {
          profile: true
        }
      })

      // Create initial site settings
      const settings = [
        {
          key: 'site_name',
          value: setupData.site.name,
          description: 'Website name',
          isPublic: true
        },
        {
          key: 'site_description',
          value: setupData.site.description,
          description: 'Website description',
          isPublic: true
        },
        {
          key: 'contact_email',
          value: setupData.site.contactEmail,
          description: 'Contact email address',
          isPublic: true
        },
        {
          key: 'contact_phone',
          value: setupData.site.contactPhone,
          description: 'Contact phone number',
          isPublic: true
        },
        {
          key: 'business_address',
          value: setupData.site.address,
          description: 'Business address',
          isPublic: true
        },
        {
          key: 'smtp_host',
          value: setupData.email.host,
          description: 'SMTP host for email sending',
          isPublic: false
        },
        {
          key: 'smtp_port',
          value: setupData.email.port,
          description: 'SMTP port',
          isPublic: false
        },
        {
          key: 'smtp_username',
          value: setupData.email.username,
          description: 'SMTP username',
          isPublic: false
        },
        {
          key: 'smtp_password',
          value: setupData.email.password,
          description: 'SMTP password',
          isPublic: false
        },
        {
          key: 'razorpay_key_id',
          value: setupData.payment.razorpayKeyId,
          description: 'Razorpay public key',
          isPublic: false
        },
        {
          key: 'razorpay_key_secret',
          value: setupData.payment.razorpayKeySecret,
          description: 'Razorpay secret key',
          isPublic: false
        },
        {
          key: 'stripe_public_key',
          value: setupData.payment.stripePublicKey,
          description: 'Stripe public key',
          isPublic: false
        },
        {
          key: 'stripe_secret_key',
          value: setupData.payment.stripeSecretKey,
          description: 'Stripe secret key',
          isPublic: false
        },
        {
          key: 'jwt_secret',
          value: setupData.security.jwtSecret,
          description: 'JWT secret for token signing',
          isPublic: false
        },
        {
          key: 'encryption_key',
          value: setupData.security.encryptionKey,
          description: 'Encryption key for sensitive data',
          isPublic: false
        },
        {
          key: 'session_timeout',
          value: setupData.security.sessionTimeout.toString(),
          description: 'Session timeout in hours',
          isPublic: false
        },
        {
          key: 'setup_completed',
          value: 'true',
          description: 'Setup completion status',
          isPublic: false
        }
      ]

      // Insert settings
      for (const setting of settings) {
        if (setting.value) {
          await prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting
          })
        }
      }

      // Create default course categories
      const defaultCategories = [
        'Study Abroad Preparation',
        'Test Preparation',
        'Language Courses',
        'University Application',
        'Visa Guidance',
        'Career Counseling'
      ]

      // Create default appointment types
      const defaultAppointmentTypes = [
        {
          name: 'Initial Consultation',
          description: 'First consultation to understand student needs',
          price: 0,
          duration: 30,
          meetingType: 'VIDEO',
          features: ['Needs Assessment', 'Country Guidance', 'Initial Roadmap']
        },
        {
          name: 'University Selection',
          description: 'Detailed university and course selection guidance',
          price: 2500,
          duration: 60,
          meetingType: 'VIDEO',
          features: ['University Research', 'Course Matching', 'Application Strategy']
        },
        {
          name: 'Application Review',
          description: 'Review and feedback on university applications',
          price: 1500,
          duration: 45,
          meetingType: 'VIDEO',
          features: ['Document Review', 'Application Feedback', 'Submission Guidance']
        },
        {
          name: 'Visa Consultation',
          description: 'Visa application guidance and documentation',
          price: 3000,
          duration: 60,
          meetingType: 'VIDEO',
          features: ['Visa Requirements', 'Document Preparation', 'Interview Prep']
        }
      ]

      for (const appointmentType of defaultAppointmentTypes) {
        await prisma.appointmentType.create({
          data: appointmentType
        })
      }

      // Create default countries
      const defaultCountries = [
        {
          name: 'Canada',
          code: 'CA',
          description: 'Study in Canada with world-class education and immigration opportunities',
          isPopular: true,
          universities: ['University of Toronto', 'McGill University', 'University of British Columbia'],
          programs: ['Engineering', 'Business', 'Computer Science', 'Medicine'],
          requirements: {
            language: 'IELTS 6.5+ or TOEFL 90+',
            academic: '75%+ in previous education',
            documents: ['Transcripts', 'SOP', 'LOR', 'Financial Proof']
          }
        },
        {
          name: 'United Kingdom',
          code: 'GB',
          description: 'Experience traditional British education and rich cultural heritage',
          isPopular: true,
          universities: ['Oxford University', 'Cambridge University', 'Imperial College London'],
          programs: ['Law', 'Business', 'Engineering', 'Arts'],
          requirements: {
            language: 'IELTS 6.0+ or TOEFL 80+',
            academic: '70%+ in previous education',
            documents: ['Transcripts', 'Personal Statement', 'References']
          }
        },
        {
          name: 'United States',
          code: 'US',
          description: 'Access world-renowned universities and cutting-edge research',
          isPopular: true,
          universities: ['Harvard University', 'MIT', 'Stanford University'],
          programs: ['Technology', 'Business', 'Medicine', 'Research'],
          requirements: {
            language: 'TOEFL 100+ or IELTS 7.0+',
            academic: '80%+ in previous education',
            documents: ['Transcripts', 'SOP', 'LOR', 'Financial Documents']
          }
        },
        {
          name: 'Australia',
          code: 'AU',
          description: 'Study in Australia with excellent climate and lifestyle',
          isPopular: true,
          universities: ['University of Melbourne', 'Australian National University', 'University of Sydney'],
          programs: ['Mining', 'Agriculture', 'Tourism', 'Engineering'],
          requirements: {
            language: 'IELTS 6.5+ or TOEFL 85+',
            academic: '75%+ in previous education',
            documents: ['Academic Records', 'English Proficiency', 'Financial Proof']
          }
        },
        {
          name: 'Germany',
          code: 'DE',
          description: 'Study in Germany with low tuition fees and strong engineering programs',
          isPopular: false,
          universities: ['Technical University of Munich', 'University of Heidelberg', 'Humboldt University'],
          programs: ['Engineering', 'Automotive', 'Technology', 'Research'],
          requirements: {
            language: 'German B2 or IELTS 6.0+',
            academic: '70%+ in previous education',
            documents: ['Transcripts', 'Language Certificate', 'Motivation Letter']
          }
        }
      ]

      for (const country of defaultCountries) {
        await prisma.country.create({
          data: country
        })
      }

      // Update environment file
      const envPath = path.join(process.cwd(), '.env.local')
      const envContent = `
# Database
DATABASE_URL="${setupData.database.url}"

# Authentication
JWT_SECRET="${setupData.security.jwtSecret}"
NEXTAUTH_SECRET="${setupData.security.encryptionKey}"
NEXTAUTH_URL="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}"

# Email Configuration
SMTP_HOST="${setupData.email.host}"
SMTP_PORT="${setupData.email.port}"
SMTP_USER="${setupData.email.username}"
SMTP_PASS="${setupData.email.password}"
FROM_EMAIL="${setupData.site.contactEmail}"

# Payment Gateways
RAZORPAY_KEY_ID="${setupData.payment.razorpayKeyId}"
RAZORPAY_KEY_SECRET="${setupData.payment.razorpayKeySecret}"
STRIPE_PUBLIC_KEY="${setupData.payment.stripePublicKey}"
STRIPE_SECRET_KEY="${setupData.payment.stripeSecretKey}"

# App Configuration
NEXT_PUBLIC_APP_URL="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}"
NEXT_PUBLIC_APP_NAME="${setupData.site.name}"
NODE_ENV="development"

# Setup
SETUP_COMPLETED="true"
`.trim()

      await fs.writeFile(envPath, envContent)

      // Clean up setup files
      const setupDir = path.join(process.cwd(), '.setup')
      try {
        await fs.rmdir(setupDir, { recursive: true })
      } catch (error) {
        // Setup directory might not exist
      }

      return NextResponse.json({
        success: true,
        message: 'Setup completed successfully',
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: `${adminUser.firstName} ${adminUser.lastName}`
        }
      })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error('Setup completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete setup' },
      { status: 500 }
    )
  }
}