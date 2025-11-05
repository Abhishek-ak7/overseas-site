'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { UniversityForm } from '@/components/admin/university-form'

export default function EditUniversityPage() {
  const params = useParams()
  const [university, setUniversity] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const response = await fetch(`/api/admin/universities/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setUniversity(data.university)
        }
      } catch (error) {
        console.error('Failed to fetch university:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUniversity()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!university) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">University Not Found</h1>
          <p className="text-gray-600">The requested university could not be found.</p>
        </div>
      </div>
    )
  }

  return <UniversityForm university={university} isEdit />
}
