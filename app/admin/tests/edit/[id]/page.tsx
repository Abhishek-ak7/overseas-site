'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"

interface TestFormData {
  title: string
  description: string
  type: string
  duration: number
  totalQuestions: number
  passingScore: number
  difficultyLevel: string
  price: number
  isFree: boolean
  isPublished: boolean
  instructions: string
  tags: string[]
}

export default function EditTestPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const testId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<TestFormData>({
    title: '',
    description: '',
    type: 'IELTS',
    duration: 180,
    totalQuestions: 40,
    passingScore: 65,
    difficultyLevel: 'MEDIUM',
    price: 0,
    isFree: true,
    isPublished: false,
    instructions: '',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (testId && testId !== 'new') {
      fetchTest()
    } else {
      setLoading(false)
    }
  }, [testId])

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}`)
      const data = await response.json()

      if (response.ok && data.test) {
        setFormData({
          title: data.test.title,
          description: data.test.description,
          type: data.test.type,
          duration: data.test.duration,
          totalQuestions: data.test.totalQuestions,
          passingScore: data.test.passingScore || 0,
          difficultyLevel: data.test.difficultyLevel,
          price: data.test.price,
          isFree: data.test.isFree,
          isPublished: data.test.isPublished,
          instructions: data.test.instructions || '',
          tags: data.test.tags || [],
        })
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      toast({
        title: "Error",
        description: "Failed to load test data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = testId === 'new' ? '/api/admin/tests/create' : `/api/admin/tests/${testId}`
      const method = testId === 'new' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Test ${testId === 'new' ? 'created' : 'updated'} successfully`,
        })
        router.push('/admin/tests')
      } else {
        throw new Error(data.error || 'Failed to save test')
      }
    } catch (error: any) {
      console.error('Error saving test:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save test",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/tests">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {testId === 'new' ? 'Create New Test' : 'Edit Test'}
        </h1>
        <p className="text-gray-600 mt-2">Configure test settings and content</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>General test details and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Test Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., IELTS Academic Practice Test"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                placeholder="Describe what this test covers..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Test Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IELTS">IELTS</SelectItem>
                    <SelectItem value="TOEFL">TOEFL</SelectItem>
                    <SelectItem value="PTE">PTE</SelectItem>
                    <SelectItem value="GRE">GRE</SelectItem>
                    <SelectItem value="GMAT">GMAT</SelectItem>
                    <SelectItem value="SAT">SAT</SelectItem>
                    <SelectItem value="ACT">ACT</SelectItem>
                    <SelectItem value="DUOLINGO">Duolingo</SelectItem>
                    <SelectItem value="CAEL">CAEL</SelectItem>
                    <SelectItem value="CELPIP">CELPIP</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty Level *</Label>
                <Select value={formData.difficultyLevel} onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  required
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="totalQuestions">Total Questions *</Label>
                <Input
                  id="totalQuestions"
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) || 0 })}
                  required
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="passingScore">Passing Score</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Status</CardTitle>
            <CardDescription>Configure test pricing and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isFree">Free Test</Label>
                <p className="text-sm text-gray-600">Make this test available for free</p>
              </div>
              <Switch
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
              />
            </div>

            {!formData.isFree && (
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPublished">Published</Label>
                <p className="text-sm text-gray-600">Make this test visible to users</p>
              </div>
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Add test instructions for students</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={6}
              placeholder="Enter instructions that will be shown to students before they start the test..."
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Add tags to help categorize this test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Enter a tag..."
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <div key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/tests">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Test
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}