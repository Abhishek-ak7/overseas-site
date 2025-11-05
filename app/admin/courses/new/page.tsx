'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  BookOpen,
  Video,
  FileText,
  Users,
  Star,
  DollarSign,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react'

interface CourseModule {
  id: string
  title: string
  description: string
  orderIndex: number
  lessons: CourseLesson[]
}

interface CourseLesson {
  id: string
  title: string
  description: string
  type: 'video' | 'text' | 'quiz' | 'assignment'
  contentUrl?: string
  duration?: number
  orderIndex: number
}

interface CourseData {
  // Basic Info
  title: string
  slug: string
  description: string
  shortDescription: string
  instructorName: string
  category: string
  tags: string[]
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  language: string

  // Pricing
  price: number
  originalPrice?: number
  currency: string

  // Media
  thumbnailUrl: string
  videoUrl: string

  // Course Structure
  modules: CourseModule[]

  // Settings
  maxStudents?: number
  duration: number // in hours
  requirements: string[]
  learningObjectives: string[]
  isPublished: boolean
  isFeatured: boolean
}

export default function NewCoursePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    instructorName: '',
    category: '',
    tags: [],
    level: 'BEGINNER',
    language: 'English',
    price: 0,
    currency: 'USD',
    thumbnailUrl: '',
    videoUrl: '',
    modules: [],
    maxStudents: undefined,
    duration: 0,
    requirements: [''],
    learningObjectives: [''],
    isPublished: false,
    isFeatured: false
  })

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: BookOpen },
    { id: 'content', title: 'Course Content', icon: Video },
    { id: 'curriculum', title: 'Curriculum Builder', icon: FileText },
    { id: 'pricing', title: 'Pricing & Publishing', icon: DollarSign }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleInputChange = (field: keyof CourseData, value: any) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setCourseData(prev => ({ ...prev, slug }))
    }
  }

  const handleArrayFieldChange = (field: 'requirements' | 'learningObjectives', index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field: 'requirements' | 'learningObjectives') => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (field: 'requirements' | 'learningObjectives', index: number) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const addModule = () => {
    const newModule: CourseModule = {
      id: Date.now().toString(),
      title: '',
      description: '',
      orderIndex: courseData.modules.length,
      lessons: []
    }
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }))
  }

  const updateModule = (moduleId: string, field: keyof CourseModule, value: any) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId ? { ...module, [field]: value } : module
      )
    }))
  }

  const removeModule = (moduleId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }))
  }

  const addLesson = (moduleId: string) => {
    const newLesson: CourseLesson = {
      id: Date.now().toString(),
      title: '',
      description: '',
      type: 'video',
      orderIndex: 0,
    }

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: [...module.lessons, { ...newLesson, orderIndex: module.lessons.length }]
            }
          : module
      )
    }))
  }

  const updateLesson = (moduleId: string, lessonId: string, field: keyof CourseLesson, value: any) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map(lesson =>
                lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
              )
            }
          : module
      )
    }))
  }

  const removeLesson = (moduleId: string, lessonId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
            }
          : module
      )
    }))
  }

  const handleSave = async (publish: boolean = false) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...courseData,
          isPublished: publish
        }),
      })

      if (response.ok) {
        router.push('/admin/courses?success=created')
      } else {
        throw new Error('Failed to save course')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Basic information about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={courseData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter course title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={courseData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-friendly-slug"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={courseData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Brief description for course cards..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructorName">Instructor Name</Label>
                    <Input
                      id="instructorName"
                      value={courseData.instructorName}
                      onChange={(e) => handleInputChange('instructorName', e.target.value)}
                      placeholder="Course instructor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={courseData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test-prep">Test Preparation</SelectItem>
                        <SelectItem value="language">Language Learning</SelectItem>
                        <SelectItem value="academic">Academic Skills</SelectItem>
                        <SelectItem value="study-abroad">Study Abroad</SelectItem>
                        <SelectItem value="career">Career Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Difficulty Level</Label>
                    <Select
                      value={courseData.level}
                      onValueChange={(value: any) => handleInputChange('level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 1: // Course Content
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>Detailed course description and media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Description</Label>
                  <RichTextEditor
                    value={courseData.description}
                    onChange={(value) => handleInputChange('description', value)}
                    placeholder="Write a detailed course description..."
                    minHeight={300}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ImageUpload
                      value={courseData.thumbnailUrl}
                      onChange={(url) => handleInputChange('thumbnailUrl', url)}
                      label="Course Thumbnail"
                      maxSize={5}
                      accept="image/*"
                      context="course-thumbnail"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Preview Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={courseData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Course Requirements</Label>
                    {courseData.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={req}
                          onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                          placeholder="Enter requirement..."
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayField('requirements', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayField('requirements')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Requirement
                    </Button>
                  </div>

                  <div>
                    <Label>Learning Objectives</Label>
                    {courseData.learningObjectives.map((obj, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={obj}
                          onChange={(e) => handleArrayFieldChange('learningObjectives', index, e.target.value)}
                          placeholder="Enter learning objective..."
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayField('learningObjectives', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayField('learningObjectives')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Objective
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2: // Curriculum Builder
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Curriculum Builder</CardTitle>
                <CardDescription>Create modules and lessons for your course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {courseData.modules.map((module, moduleIndex) => (
                    <Card key={module.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">Module {moduleIndex + 1}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            value={module.title}
                            onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                            placeholder="Module title..."
                          />
                          <Input
                            value={module.description}
                            onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                            placeholder="Module description..."
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Lessons</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addLesson(module.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Lesson
                            </Button>
                          </div>

                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="secondary">Lesson {lessonIndex + 1}</Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLesson(module.id, lesson.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                                  placeholder="Lesson title..."
                                />
                                <Select
                                  value={lesson.type}
                                  onValueChange={(value: any) => updateLesson(module.id, lesson.id, 'type', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="text">Text/Reading</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="assignment">Assignment</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={lesson.contentUrl || ''}
                                  onChange={(e) => updateLesson(module.id, lesson.id, 'contentUrl', e.target.value)}
                                  placeholder="Content URL..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addModule}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3: // Pricing & Publishing
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Settings</CardTitle>
                <CardDescription>Set pricing and publishing options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Course Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={courseData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={courseData.originalPrice || ''}
                      onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || undefined)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={courseData.currency}
                      onValueChange={(value) => handleInputChange('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={courseData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students (Optional)</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={courseData.maxStudents || ''}
                      onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || undefined)}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Featured Course</Label>
                      <p className="text-sm text-gray-600">Display prominently on homepage</p>
                    </div>
                    <Switch
                      checked={courseData.isFeatured}
                      onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Publish Course</Label>
                      <p className="text-sm text-gray-600">Make course available to students</p>
                    </div>
                    <Switch
                      checked={courseData.isPublished}
                      onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600">Build a comprehensive course with modules and lessons</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={loading || !courseData.title}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={loading || !courseData.title}
          >
            Publish Course
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Steps Navigation */}
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              index === currentStep
                ? 'bg-blue-100 text-blue-800'
                : index < currentStep
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <step.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}