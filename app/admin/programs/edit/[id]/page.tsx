'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProgramForm } from '@/components/admin/program-form'

export default function EditProgramPage() {
  const params = useParams()
  const [program, setProgram] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/admin/programs/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProgram(data.program)
        }
      } catch (error) {
        console.error('Failed to fetch program:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgram()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Program Not Found</h1>
          <p className="text-gray-600">The requested program could not be found.</p>
        </div>
      </div>
    )
  }

  return <ProgramForm program={program} isEdit />
}
