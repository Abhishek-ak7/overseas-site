import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const updateMessageSchema = z.object({
  status: z.enum(['new', 'read', 'replied', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigned_to: z.string().optional(),
  admin_notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const message = await prisma.messages.findUnique({
      where: { id: params.id }
    })

    if (!message) {
      return NextResponse.json({
        success: false,
        message: 'Message not found'
      }, { status: 404 })
    }

    const response = {
      id: message.id,
      fullName: message.full_name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      source: message.source,
      status: message.status,
      priority: message.priority,
      assignedTo: message.assigned_to,
      adminNotes: message.admin_notes,
      repliedAt: message.replied_at,
      closedAt: message.closed_at,
      createdAt: message.created_at,
      updatedAt: message.updated_at
    }

    return NextResponse.json({
      success: true,
      message: response
    })

  } catch (error) {
    console.error('Error fetching message:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch message'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateMessageSchema.parse(body)

    // Prepare update data
    const updateData: any = {}
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
      if (validatedData.status === 'replied') {
        const message = await prisma.messages.findUnique({
          where: { id: params.id },
          select: { replied_at: true }
        })
        if (!message?.replied_at) {
          updateData.replied_at = new Date()
        }
      }
      if (validatedData.status === 'closed') {
        const message = await prisma.messages.findUnique({
          where: { id: params.id },
          select: { closed_at: true }
        })
        if (!message?.closed_at) {
          updateData.closed_at = new Date()
        }
      }
    }
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.assigned_to !== undefined) updateData.assigned_to = validatedData.assigned_to
    if (validatedData.admin_notes !== undefined) updateData.admin_notes = validatedData.admin_notes

    const updatedMessage = await prisma.messages.update({
      where: { id: params.id },
      data: updateData
    })

    const response = {
      id: updatedMessage.id,
      fullName: updatedMessage.full_name,
      email: updatedMessage.email,
      phone: updatedMessage.phone,
      subject: updatedMessage.subject,
      message: updatedMessage.message,
      source: updatedMessage.source,
      status: updatedMessage.status,
      priority: updatedMessage.priority,
      assignedTo: updatedMessage.assigned_to,
      adminNotes: updatedMessage.admin_notes,
      repliedAt: updatedMessage.replied_at,
      closedAt: updatedMessage.closed_at,
      createdAt: updatedMessage.created_at,
      updatedAt: updatedMessage.updated_at
    }

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
      data: response
    })

  } catch (error) {
    console.error('Error updating message:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update message'
    }, { status: 500 })
  }
}