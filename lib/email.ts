import nodemailer from 'nodemailer'
import { getEmailSettings } from './settings'

// Create transporter with dynamic settings
export async function createEmailTransporter() {
  try {
    const emailSettings = await getEmailSettings()

    const emailConfig = {
      host: emailSettings.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(emailSettings.smtpPort || process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailSettings.smtpUsername || process.env.SMTP_USER,
        pass: emailSettings.smtpPassword || process.env.SMTP_PASS,
      },
    }

    return nodemailer.createTransporter(emailConfig)
  } catch (error) {
    console.error('Failed to create email transporter with database settings, falling back to env vars:', error)

    // Fallback to environment variables
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }

    return nodemailer.createTransporter(emailConfig)
  }
}

// Legacy transporter for backward compatibility (deprecated)
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Email types
export enum EmailType {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  COURSE_ENROLLMENT = 'course_enrollment',
  COURSE_COMPLETION = 'course_completion',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  TEST_COMPLETED = 'test_completed',
  NEWSLETTER = 'newsletter',
}

// Email templates
export const emailTemplates = {
  [EmailType.WELCOME]: {
    subject: 'Welcome to BnOverseas!',
    template: 'welcome',
  },
  [EmailType.EMAIL_VERIFICATION]: {
    subject: 'Verify Your Email Address',
    template: 'email-verification',
  },
  [EmailType.PASSWORD_RESET]: {
    subject: 'Reset Your Password',
    template: 'password-reset',
  },
  [EmailType.COURSE_ENROLLMENT]: {
    subject: 'Course Enrollment Confirmation',
    template: 'course-enrollment',
  },
  [EmailType.COURSE_COMPLETION]: {
    subject: 'Congratulations on Completing Your Course!',
    template: 'course-completion',
  },
  [EmailType.APPOINTMENT_CONFIRMATION]: {
    subject: 'Appointment Confirmation',
    template: 'appointment-confirmation',
  },
  [EmailType.APPOINTMENT_REMINDER]: {
    subject: 'Appointment Reminder',
    template: 'appointment-reminder',
  },
  [EmailType.PAYMENT_SUCCESS]: {
    subject: 'Payment Confirmation',
    template: 'payment-success',
  },
  [EmailType.PAYMENT_FAILED]: {
    subject: 'Payment Failed',
    template: 'payment-failed',
  },
  [EmailType.TEST_COMPLETED]: {
    subject: 'Test Results Available',
    template: 'test-completed',
  },
  [EmailType.NEWSLETTER]: {
    subject: 'BnOverseas Newsletter',
    template: 'newsletter',
  },
}

// Send email function
export async function sendEmail({
  to,
  type,
  data = {},
  attachments = [],
}: {
  to: string | string[]
  type: EmailType
  data?: Record<string, any>
  attachments?: any[]
}) {
  try {
    const template = emailTemplates[type]
    if (!template) {
      throw new Error(`Email template not found for type: ${type}`)
    }

    // Get email settings and create transporter
    const emailSettings = await getEmailSettings()
    const emailTransporter = await createEmailTransporter()

    const { subject, html } = await generateEmailContent(template.template, data)

    const fromName = emailSettings.fromName || 'BnOverseas'
    const fromEmail = emailSettings.fromEmail || process.env.FROM_EMAIL || 'noreply@bnoverseas.com'

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: data.subject || subject,
      html,
      attachments,
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error('Email sending failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Generate email content from template
async function generateEmailContent(templateName: string, data: Record<string, any>) {
  // This is a simple template system. In production, you might want to use
  // a more sophisticated template engine like Handlebars, Mustache, or React Email

  const templates: Record<string, (data: any) => { subject: string; html: string }> = {
    'welcome': (data) => ({
      subject: `Welcome to BnOverseas, ${data.firstName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to BnOverseas</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BnOverseas!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${data.firstName},</h2>
            <p>Welcome to BnOverseas! We're excited to help you on your journey to study abroad.</p>
            <p>Your account has been successfully created. Here's what you can do next:</p>
            <ul>
              <li>🌍 Explore our study abroad programs</li>
              <li>📚 Browse our course offerings</li>
              <li>📝 Take practice tests to prepare for your exams</li>
              <li>👥 Book consultations with our experts</li>
            </ul>
            ${data.verificationRequired ? `
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Action Required:</strong> Please verify your email address to access all features.</p>
                <a href="${data.verificationUrl}" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Verify Email</a>
              </div>
            ` : ''}
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The BnOverseas Team</p>
          </div>
        </body>
        </html>
      `
    }),

    'email-verification': (data) => ({
      subject: 'Verify Your Email Address - BnOverseas',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #667eea; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${data.firstName},</h2>
            <p>Thank you for registering with BnOverseas. To complete your registration, please verify your email address using the OTP below.</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fff; border: 2px dashed #667eea; padding: 20px; border-radius: 10px; display: inline-block;">
                <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Your Verification Code</p>
                <p style="margin: 0; font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${data.otp}</p>
              </div>
            </div>
            <p style="text-align: center;"><strong>This OTP will expire in 10 minutes.</strong></p>
            <p style="text-align: center;">Enter this code on the verification page to activate your account.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${data.verificationUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 14px;">Open Verification Page</a>
            </div>
            <p style="color: #666; font-size: 13px;">If you didn't create an account with BnOverseas, please ignore this email.</p>
          </div>
        </body>
        </html>
      `
    }),

    'password-reset': (data) => ({
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #e74c3c; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello,</h2>
            <p>We received a request to reset your password for your BnOverseas account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" style="display: inline-block; background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${data.resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
        </body>
        </html>
      `
    }),

    'course-enrollment': (data) => ({
      subject: `Welcome to ${data.courseName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Course Enrollment Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #27ae60; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Enrollment Confirmed!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Congratulations ${data.firstName}!</h2>
            <p>You have successfully enrolled in <strong>${data.courseName}</strong>.</p>

            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #27ae60;">Course Details:</h3>
              <p><strong>Course:</strong> ${data.courseName}</p>
              <p><strong>Instructor:</strong> ${data.instructorName || 'TBD'}</p>
              <p><strong>Duration:</strong> ${data.duration || 'TBD'}</p>
              <p><strong>Enrolled on:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.courseUrl}" style="display: inline-block; background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Start Learning</a>
            </div>

            <p>You can access your course anytime from your student dashboard.</p>
            <p>Happy learning!</p>
            <p>Best regards,<br>The BnOverseas Team</p>
          </div>
        </body>
        </html>
      `
    }),

    'appointment-confirmation': (data) => ({
      subject: `Appointment Confirmed with ${data.consultantName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #3498db; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Confirmed</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${data.firstName},</h2>
            <p>Your appointment has been confirmed!</p>

            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #3498db;">Appointment Details:</h3>
              <p><strong>Consultant:</strong> ${data.consultantName}</p>
              <p><strong>Type:</strong> ${data.appointmentType}</p>
              <p><strong>Date:</strong> ${data.appointmentDate}</p>
              <p><strong>Time:</strong> ${data.appointmentTime}</p>
              <p><strong>Duration:</strong> ${data.duration} minutes</p>
              ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
            </div>

            <p>We'll send you a reminder 24 hours before your appointment.</p>

            ${data.preparationTips ? `
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Preparation Tips:</h4>
                <p>${data.preparationTips}</p>
              </div>
            ` : ''}

            <p>If you need to reschedule or have any questions, please contact us.</p>
            <p>Best regards,<br>The BnOverseas Team</p>
          </div>
        </body>
        </html>
      `
    }),

    'payment-success': (data) => ({
      subject: 'Payment Confirmation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #27ae60; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Thank you ${data.firstName}!</h2>
            <p>Your payment has been processed successfully.</p>

            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #27ae60;">Payment Details:</h3>
              <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Item:</strong> ${data.itemName}</p>
            </div>

            <p>You will receive access to your purchase shortly.</p>
            <p>Thank you for choosing BnOverseas!</p>
            <p>Best regards,<br>The BnOverseas Team</p>
          </div>
        </body>
        </html>
      `
    }),

    'test-completed': (data) => ({
      subject: 'Your Test Results Are Ready',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Results</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #9b59b6; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Test Results Ready</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Great job ${data.firstName}!</h2>
            <p>You have completed the <strong>${data.testName}</strong> test.</p>

            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #9b59b6;">Your Results:</h3>
              <p><strong>Score:</strong> ${data.score}/${data.totalScore} (${data.percentage}%)</p>
              <p><strong>Test:</strong> ${data.testName}</p>
              <p><strong>Completed on:</strong> ${new Date().toLocaleDateString()}</p>
              ${data.passed ? '<p style="color: #27ae60;"><strong>✓ Congratulations! You passed!</strong></p>' : '<p style="color: #e74c3c;"><strong>Keep practicing! You can retake the test.</strong></p>'}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resultsUrl}" style="display: inline-block; background: #9b59b6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">View Detailed Results</a>
            </div>

            <p>Keep up the great work on your study abroad journey!</p>
            <p>Best regards,<br>The BnOverseas Team</p>
          </div>
        </body>
        </html>
      `
    }),
  }

  const templateFunction = templates[templateName]
  if (!templateFunction) {
    throw new Error(`Template not found: ${templateName}`)
  }

  return templateFunction(data)
}

// Bulk email sending
export async function sendBulkEmail({
  recipients,
  type,
  data = {},
}: {
  recipients: string[]
  type: EmailType
  data?: Record<string, any>
}) {
  const results = []

  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient,
      type,
      data,
    })
    results.push({ recipient, ...result })
  }

  return results
}

// Email queue for bulk operations (in production, use a proper queue like Bull/Redis)
export class EmailQueue {
  private queue: Array<{
    to: string | string[]
    type: EmailType
    data: Record<string, any>
    attachments?: any[]
  }> = []

  add(emailData: {
    to: string | string[]
    type: EmailType
    data?: Record<string, any>
    attachments?: any[]
  }) {
    this.queue.push({
      data: {},
      ...emailData,
    })
  }

  async process() {
    const results = []

    for (const email of this.queue) {
      const result = await sendEmail(email)
      results.push(result)
    }

    this.queue = [] // Clear queue after processing
    return results
  }

  size() {
    return this.queue.length
  }
}

// Global email queue instance
export const emailQueue = new EmailQueue()

// Test email configuration
export async function testEmailConfiguration() {
  try {
    await transporter.verify()
    return { success: true, message: 'Email configuration is valid' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}