"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Consultant {
  id: string
  name: string
  title: string
  bio: string
  specializations: string[]
  experience: number
  rating: number
  totalAppointments: number
  profileImage?: string
  isAvailable: boolean
}

interface AppointmentType {
  id: string
  name: string
  description: string
  duration: number
  price: number
  currency: string
  isActive: boolean
}

interface Appointment {
  id: string
  scheduledDate: string
  status: string
  notes?: string
  consultant: {
    id: string
    name: string
    title: string
    profileImage?: string
  }
  type: {
    id: string
    name: string
    duration: number
    price: number
  }
  createdAt: string
}

interface TimeSlot {
  time: string
  available: boolean
}

export function useConsultants() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/consultants')

        if (!response.ok) {
          // Use fallback mock data if API doesn't exist
          setConsultants([
            {
              id: "1",
              name: "Sarah Wilson",
              title: "Senior Education Consultant",
              bio: "Specialized in Canadian and US university admissions with expertise in engineering and business programs.",
              specializations: ["Canada", "USA", "UK"],
              experience: 12,
              rating: 4.9,
              totalAppointments: 1200,
              profileImage: "/consultant-1.jpg",
              isAvailable: true
            },
            {
              id: "2",
              name: "Dr. Michael Chen",
              title: "PhD Admissions Specialist",
              bio: "Former university admissions officer with deep knowledge of PhD and research programs.",
              specializations: ["USA", "Germany", "Australia"],
              experience: 15,
              rating: 4.8,
              totalAppointments: 890,
              profileImage: "/consultant-2.jpg",
              isAvailable: true
            },
            {
              id: "3",
              name: "Emma Thompson",
              title: "UK & Europe Specialist",
              bio: "Expert in UK universities and European education systems with focus on undergraduate programs.",
              specializations: ["UK", "Germany", "Netherlands"],
              experience: 10,
              rating: 4.9,
              totalAppointments: 756,
              profileImage: "/consultant-3.jpg",
              isAvailable: true
            }
          ])
          return
        }

        const result = await response.json()
        setConsultants(result.consultants)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        // Use fallback data on error
        setConsultants([
          {
            id: "1",
            name: "Sarah Wilson",
            title: "Senior Education Consultant",
            bio: "Specialized in Canadian and US university admissions with expertise in engineering and business programs.",
            specializations: ["Canada", "USA", "UK"],
            experience: 12,
            rating: 4.9,
            totalAppointments: 1200,
            profileImage: "/consultant-1.jpg",
            isAvailable: true
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchConsultants()
  }, [])

  return { consultants, loading, error }
}

export function useAppointmentTypes() {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/appointment-types')

        if (!response.ok) {
          // Use fallback mock data if API doesn't exist
          setAppointmentTypes([
            {
              id: "1",
              name: "University Selection",
              description: "Get personalized university recommendations based on your profile",
              duration: 60,
              price: 5000,
              currency: "INR",
              isActive: true
            },
            {
              id: "2",
              name: "Visa Consultation",
              description: "Complete guidance on visa application and documentation",
              duration: 45,
              price: 3500,
              currency: "INR",
              isActive: true
            },
            {
              id: "3",
              name: "Application Review",
              description: "Review your university applications before submission",
              duration: 90,
              price: 7500,
              currency: "INR",
              isActive: true
            },
            {
              id: "4",
              name: "SOP & Essay Review",
              description: "Get your SOP and essays reviewed by experts",
              duration: 30,
              price: 2500,
              currency: "INR",
              isActive: true
            }
          ])
          return
        }

        const result = await response.json()
        setAppointmentTypes(result.appointmentTypes)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        // Use fallback data on error
        setAppointmentTypes([
          {
            id: "1",
            name: "University Selection",
            description: "Get personalized university recommendations based on your profile",
            duration: 60,
            price: 5000,
            currency: "INR",
            isActive: true
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAppointmentTypes()
  }, [])

  return { appointmentTypes, loading, error }
}

export function useConsultantAvailability(consultantId: string, date: string) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!consultantId || !date) return

    const fetchAvailability = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/consultants/${consultantId}/availability?date=${date}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch availability')
        }

        const result = await response.json()
        setTimeSlots(result.timeSlots)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [consultantId, date])

  return { timeSlots, loading, error }
}

export function useBookAppointment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const bookAppointment = async (appointmentData: {
    consultantId: string
    typeId: string
    scheduledDate: string
    scheduledTime: string
    meetingType?: string
    notes?: string
    title?: string
    description?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      if (!session?.user) {
        throw new Error('Please login to book an appointment')
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to book appointment')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { bookAppointment, loading, error }
}

export function useUserAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      if (status === 'loading') {
        return
      }

      if (!session?.user) {
        setAppointments([])
        return
      }

      const response = await fetch('/api/appointments')

      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const result = await response.json()
      setAppointments(result.appointments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status !== 'loading') {
      fetchAppointments()
    }
  }, [session, status])

  const refetch = () => {
    fetchAppointments()
  }

  return { appointments, loading, error, refetch }
}