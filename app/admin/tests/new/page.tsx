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
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import {
  ArrowLeft,
  Save,
  Brain,
  Clock,
  Target,
  Plus,
  Trash2,
  GripVertical,
  FileQuestion,
  Settings,
  Globe
} from 'lucide-react'

interface TestData {
  title: string
  description: string
  type: 'IELTS' | 'TOEFL' | 'PTE' | 'GRE' | 'GMAT' | 'SAT' | 'ACT' | 'DUOLINGO' | 'CAEL' | 'CELPIP' | 'CUSTOM'
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'
  duration: number
  totalQuestions: number
  passingScore: number
  price: number
  isFree: boolean
  isPublished: boolean
  instructions: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  sections: TestSection[]
}

interface TestSection {
  id: string
  sectionName: string
  description: string
  questionCount: number
  timeLimit: number
  orderIndex: number
  instructions: string
}

interface Question {
  id: string
  sectionId: string
  questionText: string
  questionType: 'MCQ' | 'ESSAY' | 'SPEAKING' | 'LISTENING' | 'READING' | 'FILL_BLANK' | 'TRUE_FALSE'
  options: string[]
  correctAnswer: string | number
  explanation: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  points: number
  timeLimit?: number
  attachments: string[]
}

export default function NewTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [testData, setTestData] = useState<TestData>({
    title: '',
    description: '',
    type: 'IELTS',
    difficultyLevel: 'MEDIUM',
    duration: 120,
    totalQuestions: 40,
    passingScore: 70,
    price: 999,
    isFree: false,
    isPublished: false,
    instructions: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    sections: []
  })

  const handleInputChange = (field: keyof TestData, value: any) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSection = () => {
    const newSection: TestSection = {
      id: `section-${Date.now()}`,
      sectionName: '',
      description: '',
      questionCount: 10,
      timeLimit: 30,
      orderIndex: testData.sections.length,
      instructions: ''
    }
    setTestData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const updateSection = (sectionId: string, field: keyof TestSection, value: any) => {
    setTestData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }))
  }

  const removeSection = (sectionId: string) => {
    setTestData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }))
  }

  const handleSave = async (status: 'draft' | 'published') => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testData,
          isPublished: status === 'published'
        }),
      })

      if (response.ok) {
        router.push('/admin/tests?success=created')
      } else {
        throw new Error('Failed to save test')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const testTypes = [
    { value: 'IELTS', label: 'IELTS' },
    { value: 'TOEFL', label: 'TOEFL' },
    { value: 'PTE', label: 'PTE' },
    { value: 'GRE', label: 'GRE' },
    { value: 'GMAT', label: 'GMAT' },
    { value: 'SAT', label: 'SAT' },
    { value: 'ACT', label: 'ACT' },
    { value: 'DUOLINGO', label: 'Duolingo English Test' },
    { value: 'CAEL', label: 'CAEL' },
    { value: 'CELPIP', label: 'CELPIP' },
    { value: 'CUSTOM', label: 'Custom Test' }
  ]

  const difficultyLevels = [
    { value: 'EASY', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'HARD', label: 'Hard', color: 'bg-orange-100 text-orange-800' },
    { value: 'EXPERT', label: 'Expert', color: 'bg-red-100 text-red-800' }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Test</h1>
            <p className="text-gray-600">Build comprehensive test preparation exams</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={loading || !testData.title}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={loading || !testData.title || testData.sections.length === 0}
          >
            <Brain className="h-4 w-4 mr-2" />
            Publish Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="sections">Test Sections</TabsTrigger>
              <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Test Information
                  </CardTitle>
                  <CardDescription>
                    Basic information about your test preparation exam
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Test Title</Label>
                      <Input
                        id="title"
                        value={testData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., IELTS Academic Full Mock Test"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Test Type</Label>
                      <Select value={testData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {testTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={testData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Detailed description of the test and what it covers..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Test Instructions</Label>
                    <RichTextEditor
                      value={testData.instructions}
                      onChange={(value) => handleInputChange('instructions', value)}
                      placeholder="Detailed instructions for test takers..."
                      minHeight={300}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={testData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalQuestions">Total Questions</Label>
                      <Input
                        id="totalQuestions"
                        type="number"
                        value={testData.totalQuestions}
                        onChange={(e) => handleInputChange('totalQuestions', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        value={testData.passingScore}
                        onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={testData.difficultyLevel} onValueChange={(value: any) => handleInputChange('difficultyLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={level.color}>
                                {level.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5" />
                    Test Sections
                  </CardTitle>
                  <CardDescription>
                    Configure sections for your test (e.g., Listening, Reading, Writing, Speaking)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testData.sections.map((section, index) => (
                    <div key={section.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <h4 className="font-medium">Section {index + 1}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Section Name</Label>
                          <Input
                            value={section.sectionName}
                            onChange={(e) => updateSection(section.id, 'sectionName', e.target.value)}
                            placeholder="e.g., Listening, Reading, Writing"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Question Count</Label>
                          <Input
                            type="number"
                            value={section.questionCount}
                            onChange={(e) => updateSection(section.id, 'questionCount', parseInt(e.target.value))}
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Section Description</Label>
                        <Textarea
                          value={section.description}
                          onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                          placeholder="Brief description of what this section covers..."
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Time Limit (minutes)</Label>
                          <Input
                            type="number"
                            value={section.timeLimit}
                            onChange={(e) => updateSection(section.id, 'timeLimit', parseInt(e.target.value))}
                            min="1"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Order Index</Label>
                          <Input
                            type="number"
                            value={section.orderIndex}
                            onChange={(e) => updateSection(section.id, 'orderIndex', parseInt(e.target.value))}
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Section Instructions</Label>
                        <Textarea
                          value={section.instructions}
                          onChange={(e) => updateSection(section.id, 'instructions', e.target.value)}
                          placeholder="Specific instructions for this section..."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSection}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    SEO & Meta Information
                  </CardTitle>
                  <CardDescription>
                    Optimize your test for search engines and social media
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={testData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      placeholder="SEO title (max 60 characters)"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500">
                      {testData.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={testData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      placeholder="SEO description (max 160 characters)"
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      {testData.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={testData.metaKeywords}
                      onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Test Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={testData.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                      min="0"
                      disabled={testData.isFree}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Free Test</Label>
                      <p className="text-sm text-gray-600">
                        Make this test available for free
                      </p>
                    </div>
                    <Switch
                      checked={testData.isFree}
                      onCheckedChange={(checked) => handleInputChange('isFree', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Published</Label>
                      <p className="text-sm text-gray-600">
                        Make test visible to students
                      </p>
                    </div>
                    <Switch
                      checked={testData.isPublished}
                      onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{testData.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{testData.totalQuestions} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{testData.passingScore}% to pass</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Sections ({testData.sections.length})</h4>
                <div className="space-y-2">
                  {testData.sections.map((section, index) => (
                    <div key={section.id} className="text-sm">
                      <div className="font-medium">{section.sectionName || `Section ${index + 1}`}</div>
                      <div className="text-gray-600">
                        {section.questionCount} questions, {section.timeLimit} min
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Status</h4>
                <div className="space-y-2">
                  <Badge variant={testData.isPublished ? "default" : "secondary"}>
                    {testData.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  {testData.isFree && (
                    <Badge variant="outline" className="ml-2">Free</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}