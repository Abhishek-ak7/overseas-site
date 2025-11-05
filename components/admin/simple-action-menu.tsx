'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  PlayCircle,
  CheckCircle,
  FileText,
  Archive,
  X
} from 'lucide-react'

interface Course {
  id: string
  title: string
  status: 'published' | 'draft' | 'archived'
}

interface SimpleActionMenuProps {
  course: Course
  onStatusChange: (courseId: string, status: 'published' | 'draft' | 'archived') => Promise<void>
  onDelete: (courseId: string) => Promise<void>
}

export function SimpleActionMenu({ course, onStatusChange, onDelete }: SimpleActionMenuProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    setIsMenuOpen(false)
    router.push(`/admin/courses/edit/${course.id}`)
  }

  const handleViewContent = () => {
    setIsMenuOpen(false)
    router.push(`/admin/courses/${course.id}/content`)
  }

  const handleViewEnrollments = () => {
    setIsMenuOpen(false)
    router.push(`/admin/courses/${course.id}/enrollments`)
  }

  const handlePreview = () => {
    setIsMenuOpen(false)
    window.open(`/courses/${course.id}`, '_blank')
  }

  const handleStatusChange = async (newStatus: 'published' | 'draft' | 'archived') => {
    if (newStatus === course.status) return

    setIsMenuOpen(false)
    setIsLoading(true)
    try {
      await onStatusChange(course.id, newStatus)
    } catch (error) {
      console.error('Failed to change status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(course.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete course:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const showDeleteDialog = () => {
    setIsMenuOpen(false)
    setIsDeleteDialogOpen(true)
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={isLoading}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-900">Actions</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Primary Actions */}
                <button
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={handleEdit}
                >
                  <Edit className="mr-3 h-4 w-4" />
                  Edit Course
                </button>

                <button
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={handleViewContent}
                >
                  <PlayCircle className="mr-3 h-4 w-4" />
                  Manage Content
                </button>

                <button
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={handleViewEnrollments}
                >
                  <Users className="mr-3 h-4 w-4" />
                  View Enrollments
                </button>

                <button
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={handlePreview}
                >
                  <Eye className="mr-3 h-4 w-4" />
                  Preview Course
                </button>

                <div className="border-t border-gray-100 my-1" />

                {/* Status Actions */}
                {course.status !== 'published' && (
                  <button
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => handleStatusChange('published')}
                  >
                    <CheckCircle className="mr-3 h-4 w-4" />
                    Publish Course
                  </button>
                )}

                {course.status !== 'draft' && (
                  <button
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => handleStatusChange('draft')}
                  >
                    <FileText className="mr-3 h-4 w-4" />
                    Move to Draft
                  </button>
                )}

                {course.status !== 'archived' && (
                  <button
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => handleStatusChange('archived')}
                  >
                    <Archive className="mr-3 h-4 w-4" />
                    Archive Course
                  </button>
                )}

                <div className="border-t border-gray-100 my-1" />

                {/* Danger Zone */}
                <button
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={showDeleteDialog}
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  Delete Course
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
              All course content, enrollments, and reviews will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}