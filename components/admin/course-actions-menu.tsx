'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Settings,
  CheckCircle,
  FileText,
  Archive
} from 'lucide-react'

interface Course {
  id: string
  title: string
  status: 'published' | 'draft' | 'archived'
}

interface CourseActionsMenuProps {
  course: Course
  onStatusChange: (courseId: string, status: 'published' | 'draft' | 'archived') => Promise<void>
  onDelete: (courseId: string) => Promise<void>
}

export function CourseActionsMenu({ course, onStatusChange, onDelete }: CourseActionsMenuProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    router.push(`/admin/courses/edit/${course.id}`)
  }

  const handleViewContent = () => {
    router.push(`/admin/courses/${course.id}/content`)
  }

  const handleViewEnrollments = () => {
    router.push(`/admin/courses/${course.id}/enrollments`)
  }

  const handlePreview = () => {
    window.open(`/courses/${course.id}`, '_blank')
  }

  const handleStatusChange = async (newStatus: 'published' | 'draft' | 'archived') => {
    if (newStatus === course.status) return

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

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 z-50">
          {/* Primary Actions */}
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Course
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleViewContent}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Manage Content
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleViewEnrollments}>
            <Users className="mr-2 h-4 w-4" />
            View Enrollments
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview Course
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Status Actions */}
          {course.status !== 'published' && (
            <DropdownMenuItem onClick={() => handleStatusChange('published')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Publish Course
            </DropdownMenuItem>
          )}

          {course.status !== 'draft' && (
            <DropdownMenuItem onClick={() => handleStatusChange('draft')}>
              <FileText className="mr-2 h-4 w-4" />
              Move to Draft
            </DropdownMenuItem>
          )}

          {course.status !== 'archived' && (
            <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Course
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Danger Zone */}
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Course
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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