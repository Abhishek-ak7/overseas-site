import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAppointmentData() {
  try {
    console.log('🌱 Seeding appointment types and consultants...')

    // Create simplified appointment types (all free)
    const appointmentTypes = [
      {
        id: `apt_type_${Date.now()}_1`,
        name: 'General Consultation',
        description: 'General discussion about your study abroad goals and questions',
        price: 0,
        duration: 30,
        meeting_type: 'VIDEO',
        features: ['General guidance', 'Q&A session'],
        currency: 'USD',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `apt_type_${Date.now()}_2`,
        name: 'University Selection',
        description: 'Help with choosing universities and programs',
        price: 0,
        duration: 45,
        meeting_type: 'VIDEO',
        features: ['University recommendations', 'Program guidance'],
        currency: 'USD',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `apt_type_${Date.now()}_3`,
        name: 'Application Support',
        description: 'Assistance with application process and documentation',
        price: 0,
        duration: 60,
        meeting_type: 'VIDEO',
        features: ['Application guidance', 'Document review'],
        currency: 'USD',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    for (const type of appointmentTypes) {
      await prisma.appointment_types.upsert({
        where: { name: type.name },
        update: type,
        create: type
      })
    }

    // Create simplified consultants
    const consultants = [
      {
        id: `consultant_${Date.now()}_1`,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@bnoverseas.com',
        phone: '+1-555-0101',
        bio: 'Education consultant helping students with study abroad applications and university selection.',
        specialties: ['Canada', 'USA', 'UK', 'University Selection'],
        experience: '5+ years',
        education: 'MBA from University of Toronto',
        certifications: ['Education Consultant'],
        languages: ['English'],
        hourly_rate: 0,
        currency: 'USD',
        avatar_url: null,
        is_active: true,
        rating: 0,
        total_reviews: 0,
        availability: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' }
        },
        time_zone: 'America/Toronto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `consultant_${Date.now()}_2`,
        name: 'Michael Chen',
        email: 'michael.chen@bnoverseas.com',
        phone: '+1-555-0102',
        bio: 'Academic advisor specializing in graduate programs and research opportunities.',
        specialties: ['Graduate School', 'Research Programs', 'USA', 'Canada'],
        experience: '4+ years',
        education: 'PhD in Computer Science',
        certifications: ['Academic Advisor'],
        languages: ['English', 'Mandarin'],
        hourly_rate: 0,
        currency: 'USD',
        avatar_url: null,
        is_active: true,
        rating: 0,
        total_reviews: 0,
        availability: {
          monday: { start: '10:00', end: '16:00' },
          tuesday: { start: '10:00', end: '16:00' },
          wednesday: { start: '10:00', end: '16:00' },
          thursday: { start: '10:00', end: '16:00' },
          friday: { start: '10:00', end: '16:00' }
        },
        time_zone: 'America/Los_Angeles',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `consultant_${Date.now()}_3`,
        name: 'Emma Thompson',
        email: 'emma.thompson@bnoverseas.com',
        phone: '+44-20-7946-0958',
        bio: 'UK education specialist helping with university applications and admissions process.',
        specialties: ['UK', 'Europe', 'Business Programs'],
        experience: '3+ years',
        education: 'MBA from London Business School',
        certifications: ['UK Education Specialist'],
        languages: ['English'],
        hourly_rate: 0,
        currency: 'USD',
        avatar_url: null,
        is_active: true,
        rating: 0,
        total_reviews: 0,
        availability: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' }
        },
        time_zone: 'Europe/London',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    for (const consultant of consultants) {
      await prisma.consultants.upsert({
        where: { email: consultant.email },
        update: consultant,
        create: consultant
      })
    }

    console.log('✅ Successfully seeded appointment types and consultants!')
    console.log(`📋 Created ${appointmentTypes.length} appointment types`)
    console.log(`👥 Created ${consultants.length} consultants`)

  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedAppointmentData()
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })