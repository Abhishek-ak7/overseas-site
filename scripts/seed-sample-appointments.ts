import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSampleAppointments() {
  try {
    console.log('🌱 Creating sample users and appointments...')

    // First, let's get existing appointment types and consultants
    const appointmentTypes = await prisma.appointment_types.findMany({
      where: { is_active: true }
    })

    const consultants = await prisma.consultants.findMany({
      where: { is_active: true }
    })

    if (appointmentTypes.length === 0 || consultants.length === 0) {
      console.log('❌ No appointment types or consultants found. Please run seed-appointments.ts first.')
      return
    }

    // Create sample users with all required fields
    const sampleUsers = [
      {
        id: `user_${Date.now()}_1`,
        email: 'john.smith@example.com',
        password_hash: '$2b$10$K7L/8Y7t5I2NBOJ2hSdCBOv9V4HQ5z9P1z0p2i3o4p5z6q7r8s9t0u',
        first_name: 'John',
        last_name: 'Smith',
        phone: '+1-555-0101',
        country: 'United States',
        study_level: 'Bachelor',
        role: 'STUDENT',
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `user_${Date.now()}_2`,
        email: 'jane.doe@example.com',
        password_hash: '$2b$10$L8M/9Z8u6J3OCPK3iTdDCPw0W5IR6z0Q2z1q3j4o5q6z7r8s9t0v1w',
        first_name: 'Jane',
        last_name: 'Doe',
        phone: '+1-555-0202',
        country: 'Canada',
        study_level: 'Master',
        role: 'STUDENT',
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `user_${Date.now()}_3`,
        email: 'mike.wilson@example.com',
        password_hash: '$2b$10$M9N/0A9v7K4PDQL4jUeEDQx1X6JS7z1R3z2r4k5p6r7z8s9t0u1w2x',
        first_name: 'Mike',
        last_name: 'Wilson',
        phone: '+44-20-7946-0303',
        country: 'United Kingdom',
        study_level: 'MBA',
        role: 'STUDENT',
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `user_${Date.now()}_4`,
        email: 'sarah.johnson@example.com',
        password_hash: '$2b$10$N0O/1B0w8L5QERM5kVfFERy2Y7KT8z2S4z3s5l6q7s8z9t0u1v2w3y',
        first_name: 'Sarah',
        last_name: 'Johnson',
        phone: '+61-2-9000-0404',
        country: 'Australia',
        study_level: 'PhD',
        role: 'STUDENT',
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    // Create users and their profiles
    for (let i = 0; i < sampleUsers.length; i++) {
      const user = sampleUsers[i]
      await prisma.users.upsert({
        where: { email: user.email },
        update: user,
        create: user
      })

      // Create user profiles with correct schema
      const profile = {
        id: `profile_${Date.now()}_${i + 1}`,
        user_id: user.id,
        city: ['New York', 'Toronto', 'London', 'Sydney'][i],
        address: ['123 Main St', '456 Oak Ave', '789 Park Rd', '321 Beach Dr'][i],
        bio: `Student interested in studying abroad. Looking for ${['Bachelor', 'Master', 'MBA', 'PhD'][i]} programs.`,
        field_of_interest: ['Engineering', 'Business', 'Computer Science', 'Medicine'][i],
        budget_range: ['$20,000-$30,000', '$30,000-$50,000', '$50,000-$70,000', '$40,000-$60,000'][i],
        interested_countries: [['United States', 'Canada'], ['Canada', 'UK'], ['UK', 'Europe'], ['Australia', 'New Zealand']][i]
      }

      await prisma.user_profiles.upsert({
        where: { user_id: user.id },
        update: profile,
        create: profile
      })
    }

    // Create sample appointments
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const sampleAppointments = [
      {
        id: `apt_${Date.now()}_1`,
        user_id: sampleUsers[0].id,
        consultant_id: consultants[0].id,
        type_id: appointmentTypes[0].id, // Free consultation
        title: 'Initial Study Abroad Consultation',
        description: 'Student wants to explore options for studying in Canada',
        scheduled_date: today,
        scheduled_time: new Date(`${today.toISOString().split('T')[0]}T14:00:00`),
        duration: 30,
        status: 'SCHEDULED',
        meeting_link: 'https://meet.google.com/abc-def-ghi',
        notes: 'Student interested in engineering programs',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `apt_${Date.now()}_2`,
        user_id: sampleUsers[1].id,
        consultant_id: consultants[1].id,
        type_id: appointmentTypes[1].id, // University selection
        title: 'University Selection Consultation',
        description: 'PhD program guidance and university selection',
        scheduled_date: tomorrow,
        scheduled_time: new Date(`${tomorrow.toISOString().split('T')[0]}T10:00:00`),
        duration: 60,
        status: 'CONFIRMED',
        meeting_link: 'https://zoom.us/j/123456789',
        notes: 'Student has strong research background',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `apt_${Date.now()}_3`,
        user_id: sampleUsers[2].id,
        consultant_id: consultants[2].id,
        type_id: appointmentTypes[2].id, // Application review
        title: 'MBA Application Review',
        description: 'Review MBA application for UK business schools',
        scheduled_date: nextWeek,
        scheduled_time: new Date(`${nextWeek.toISOString().split('T')[0]}T16:00:00`),
        duration: 90,
        status: 'SCHEDULED',
        meeting_link: 'https://teams.microsoft.com/l/meetup-join/...',
        notes: 'Application deadline approaching',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `apt_${Date.now()}_4`,
        user_id: sampleUsers[3].id,
        consultant_id: consultants[0].id,
        type_id: appointmentTypes[3].id, // Visa consultation
        title: 'Student Visa Consultation',
        description: 'Guidance on Australian student visa application',
        scheduled_date: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        scheduled_time: new Date(`${new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T11:00:00`),
        duration: 60,
        status: 'COMPLETED',
        meeting_link: 'https://meet.google.com/xyz-abc-def',
        notes: 'Student has all required documents',
        feedback: 'Very helpful session, all questions answered clearly',
        rating: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `apt_${Date.now()}_5`,
        user_id: sampleUsers[0].id,
        consultant_id: consultants[1].id,
        type_id: appointmentTypes[4].id, // Scholarship guidance
        title: 'Scholarship Application Guidance',
        description: 'Help with scholarship applications for US universities',
        scheduled_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        scheduled_time: new Date(`${new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T15:30:00`),
        duration: 45,
        status: 'SCHEDULED',
        meeting_link: null,
        notes: 'Student has strong academic record',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    // Insert appointments
    for (const appointment of sampleAppointments) {
      await prisma.appointments.upsert({
        where: { id: appointment.id },
        update: appointment,
        create: appointment
      })
    }

    console.log('✅ Successfully created sample appointments!')
    console.log(`👥 Created ${sampleUsers.length} sample users`)
    console.log(`📅 Created ${sampleAppointments.length} sample appointments`)
    console.log('📊 Appointment statuses:')
    console.log('  - SCHEDULED: 3')
    console.log('  - CONFIRMED: 1')
    console.log('  - COMPLETED: 1')

  } catch (error) {
    console.error('❌ Error creating sample data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedSampleAppointments()
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })