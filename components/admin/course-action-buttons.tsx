'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  Archive
} from 'lucide-react'

interface Course {
  id: string
  title: string
  status: 'published' | 'draft' | 'archived'
}

interface CourseActionButtonsProps {
  course: Course
  onStatusChange: (courseId: string, status: 'published' | 'draft' | 'archived') => Promise<void>
  onDelete: (courseId: string) => Promise<void>
}

export function CourseActionButtons({ course, onStatusChange, onDelete }: CourseActionButtonsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleEdit = () => {
    setIsPopoverOpen(false)
    router.push(`/admin/courses/edit/${course.id}`)
  }

  const handleViewContent = () => {
    setIsPopoverOpen(false)
    router.push(`/admin/courses/${course.id}/content`)
  }

  const handleViewEnrollments = () => {
    setIsPopoverOpen(false)
    router.push(`/admin/courses/${course.id}/enrollments`)
  }

  const handlePreview = () => {
    setIsPopoverOpen(false)
    window.open(`/courses/${course.id}`, '_blank')
  }

  const handleStatusChange = async (newStatus: 'published' | 'draft' | 'archived') => {
    if (newStatus === course.status) return

    setIsPopoverOpen(false)
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
    setIsPopoverOpen(false)
    setIsDeleteDialogOpen(true)
  }

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="end">
          <div className="grid gap-1">
            {/* Primary Actions */}
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 text-sm"
              onClick={handleEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Course
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 text-sm"
              onClick={handleViewContent}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Manage Content
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 text-sm"
              onClick={handleViewEnrollments}
            >
              <Users className="mr-2 h-4 w-4" />
              View Enrollments
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 text-sm"
              onClick={handlePreview}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Course
            </Button>

            <div className="h-px bg-gray-200 my-1" />

            {/* Status Actions */}
            {course.status !== 'published' && (
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2 text-sm"
                onClick={() => handleStatusChange('published')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Publish Course
              </Button>
            )}

            {course.status !== 'draft' && (
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2 text-sm"
                onClick={() => handleStatusChange('draft')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Move to Draft
              </Button>
            )}

            {course.status !== 'archived' && (
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2 text-sm"
                onClick={() => handleStatusChange('archived')}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive Course
              </Button>
            )}

            <div className="h-px bg-gray-200 my-1" />

            {/* Danger Zone */}
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 text-sm text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={showDeleteDialog}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Course
            </Button>
          </div>
        </PopoverContent>
      </Popover>

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