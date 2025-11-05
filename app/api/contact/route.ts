import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail, EmailType } from '@/lib/email'
import { prisma } from '@/lib/prisma'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  fieldOfInterest: z.string().optional(),
  interest: z.string().optional(),
  preferredCountry: z.string().optional(),
  country: z.string().optional(),
  studyLevel: z.string().optional(),
  intake: z.string().optional(),
  message: z.string().optional(),
  question: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    // Normalize field names from different form versions
    const phone = validatedData.phone || validatedData.mobile || null
    const fieldOfInterest = validatedData.fieldOfInterest || validatedData.interest || null
    const preferredCountry = validatedData.preferredCountry || validatedData.country || null
    const studyLevel = validatedData.studyLevel || validatedData.intake || null
    const messageText = validatedData.message || validatedData.question || ''

    // Save to messages table for admin panel
    const message = await prisma.messages.create({
      data: {
        full_name: validatedData.name,
        email: validatedData.email,
        phone: phone,
        subject: `Contact Form - ${fieldOfInterest || 'General Inquiry'}`,
        message: messageText,
        source: 'contact_form',
        status: 'new',
        priority: 'medium'
      },
    })

    // Also save to consultation_inquiries database for backward compatibility
    const consultationInquiry = await prisma.consultation_inquiries.create({
      data: {
        full_name: validatedData.name,
        email: validatedData.email,
        phone: phone,
        query_type: fieldOfInterest || 'general_inquiry',
        study_destination: preferredCountry,
        current_education: studyLevel,
        message: messageText,
        source: 'consultation_form',
        status: 'new',
        priority: 'medium'
      },
    })

    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@bnoverseas.com',
        type: EmailType.NEWSLETTER, // Using newsletter template for admin notification
        data: {
          subject: 'New Contact Form Submission',
          firstName: 'Admin',
          content: `
            <h3>New contact form submission received:</h3>
            <p><strong>Name:</strong> ${validatedData.name}</p>
            <p><strong>Email:</strong> ${validatedData.email}</p>
            ${validatedData.phone ? `<p><strong>Phone:</strong> ${validatedData.phone}</p>` : ''}
            ${validatedData.fieldOfInterest ? `<p><strong>Field of Interest:</strong> ${validatedData.fieldOfInterest}</p>` : ''}
            ${validatedData.preferredCountry ? `<p><strong>Preferred Country:</strong> ${validatedData.preferredCountry}</p>` : ''}
            ${validatedData.studyLevel ? `<p><strong>Study Level:</strong> ${validatedData.studyLevel}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${validatedData.message}</p>
            <p><strong>Inquiry ID:</strong> ${consultationInquiry.id}</p>
            <p>Please log into the admin panel to manage this inquiry.</p>
          `,
        },
      })
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: validatedData.email,
        type: EmailType.NEWSLETTER, // Using newsletter template for confirmation
        data: {
          subject: 'Thank you for contacting BnOverseas',
          firstName: validatedData.name.split(' ')[0],
          content: `
            <h3>Thank you for reaching out to us!</h3>
            <p>We have received your consultation request and our expert team will get back to you within 24 hours.</p>
            <p>Your consultation reference number is: <strong>${consultationInquiry.id}</strong></p>
            <p>In the meantime, feel free to explore our courses and university partnerships on our website.</p>
            <p>Best regards,<br>The BnOverseas Team</p>
          `,
        },
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json(
      {
        message: 'Contact form submitted successfully',
        inquiryId: consultationInquiry.id
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}