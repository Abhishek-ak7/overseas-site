'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  onSuccess: () => void
}

export function AppointmentConfirmModal({ open, onOpenChange, appointmentId, onSuccess }: ConfirmModalProps) {
  const [meetingLink, setMeetingLink] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CONFIRMED',
          meeting_link: meetingLink || undefined,
          notes: notes || undefined,
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Appointment confirmed successfully. Email sent to user.',
        })
        setMeetingLink('')
        setNotes('')
        onOpenChange(false)
        onSuccess()
      } else {
        throw new Error('Failed to confirm')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to confirm appointment',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="meeting-link">Meeting Link</Label>
            <Input
              id="meeting-link"
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
            <p className="text-xs text-gray-500">Google Meet, Zoom, or any meeting platform link</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes for Student</Label>
            <Textarea
              id="notes"
              placeholder="Any preparation needed, documents to bring, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Confirming...' : 'Confirm & Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
