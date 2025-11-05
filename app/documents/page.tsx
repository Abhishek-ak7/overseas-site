"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  Eye, 
  Download, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Globe
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentCategory {
  id: string
  name: string
  description: string
  required: boolean
  documents: DocumentRequirement[]
}

interface DocumentRequirement {
  id: string
  name: string
  description: string
  required: boolean
  acceptedFormats: string[]
  maxSize: number // in MB
  examples?: string[]
  notes?: string
  isUploaded?: boolean
  status?: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  uploadedFile?: {
    name: string
    size: number
    uploadedAt: string
    url: string
  }
  reviewNotes?: string
}

interface DocumentSubmission {
  id: string
  studentName: string
  email: string
  phone: string
  country: string
  studyLevel: string
  fieldOfInterest: string
  targetCountries: string[]
  submissionDate: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision'
  completionPercentage: number
  assignedReviewer?: string
  reviewNotes?: string
  categories: DocumentCategory[]
}

const defaultCategories: DocumentCategory[] = [
  {
    id: 'academic',
    name: 'Academic Documents',
    description: 'All academic records and transcripts',
    required: true,
    documents: [
      {
        id: 'transcripts',
        name: 'Official Transcripts',
        description: 'Official transcripts from all institutions attended',
        required: true,
        acceptedFormats: ['PDF'],
        maxSize: 10,
        examples: ['High school transcripts', 'University transcripts'],
        notes: 'Must be official and sealed by the institution'
      },
      {
        id: 'diploma',
        name: 'Diploma/Degree Certificate',
        description: 'Official diploma or degree certificate',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5,
        notes: 'Must be original or certified copy'
      },
      {
        id: 'grades_explanation',
        name: 'Grading System Explanation',
        description: 'Document explaining your institution\'s grading system',
        required: false,
        acceptedFormats: ['PDF', 'DOC', 'DOCX'],
        maxSize: 2
      }
    ]
  },
  {
    id: 'language',
    name: 'Language Proficiency',
    description: 'English language test scores',
    required: true,
    documents: [
      {
        id: 'ielts',
        name: 'IELTS Score Report',
        description: 'Official IELTS score report',
        required: false,
        acceptedFormats: ['PDF'],
        maxSize: 5,
        notes: 'Must be within 2 years'
      },
      {
        id: 'toefl',
        name: 'TOEFL Score Report',
        description: 'Official TOEFL score report',
        required: false,
        acceptedFormats: ['PDF'],
        maxSize: 5,
        notes: 'Must be within 2 years'
      },
      {
        id: 'pte',
        name: 'PTE Academic Score Report',
        description: 'Official PTE Academic score report',
        required: false,
        acceptedFormats: ['PDF'],
        maxSize: 5,
        notes: 'Must be within 2 years'
      }
    ]
  },
  {
    id: 'personal',
    name: 'Personal Documents',
    description: 'Identity and personal documents',
    required: true,
    documents: [
      {
        id: 'passport',
        name: 'Passport Copy',
        description: 'Clear copy of passport bio page',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5,
        notes: 'Passport must be valid for at least 6 months'
      },
      {
        id: 'photos',
        name: 'Passport Photos',
        description: 'Recent passport-sized photographs',
        required: true,
        acceptedFormats: ['JPG', 'PNG'],
        maxSize: 2,
        notes: 'Follow specific country requirements for photo specifications'
      },
      {
        id: 'birth_certificate',
        name: 'Birth Certificate',
        description: 'Official birth certificate',
        required: false,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Documents',
    description: 'Proof of financial support',
    required: true,
    documents: [
      {
        id: 'bank_statements',
        name: 'Bank Statements',
        description: 'Recent bank statements (last 3-6 months)',
        required: true,
        acceptedFormats: ['PDF'],
        maxSize: 10,
        notes: 'Must show sufficient funds for tuition and living expenses'
      },
      {
        id: 'sponsor_letter',
        name: 'Sponsorship Letter',
        description: 'Letter from sponsor if applicable',
        required: false,
        acceptedFormats: ['PDF', 'DOC', 'DOCX'],
        maxSize: 5
      },
      {
        id: 'scholarship_letter',
        name: 'Scholarship Award Letter',
        description: 'Official scholarship award letter if applicable',
        required: false,
        acceptedFormats: ['PDF'],
        maxSize: 5
      }
    ]
  },
  {
    id: 'additional',
    name: 'Additional Documents',
    description: 'Supporting documents',
    required: false,
    documents: [
      {
        id: 'sop',
        name: 'Statement of Purpose',
        description: 'Personal statement or statement of purpose',
        required: false,
        acceptedFormats: ['PDF', 'DOC', 'DOCX'],
        maxSize: 5,
        notes: 'Should be 1-2 pages explaining your goals and motivations'
      },
      {
        id: 'lor',
        name: 'Letters of Recommendation',
        description: 'Letters of recommendation from teachers/employers',
        required: false,
        acceptedFormats: ['PDF'],
        maxSize: 5,
        notes: 'Usually 2-3 letters required'
      },
      {
        id: 'cv',
        name: 'Curriculum Vitae',
        description: 'Updated CV/Resume',
        required: false,
        acceptedFormats: ['PDF', 'DOC', 'DOCX'],
        maxSize: 2
      },
      {
        id: 'portfolio',
        name: 'Portfolio',
        description: 'Portfolio for creative/design programs',
        required: false,
        acceptedFormats: ['PDF', 'ZIP'],
        maxSize: 50,
        notes: 'Required for art, design, and architecture programs'
      }
    ]
  }
]

export default function DocumentPreparationPage() {
  const [submission, setSubmission] = useState<DocumentSubmission | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('checklist')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [showGuidelines, setShowGuidelines] = useState(false)

  useEffect(() => {
    // Initialize or load existing submission
    initializeSubmission()
  }, [])

  const initializeSubmission = () => {
    const newSubmission: DocumentSubmission = {
      id: 'draft-' + Date.now(),
      studentName: '',
      email: '',
      phone: '',
      country: '',
      studyLevel: '',
      fieldOfInterest: '',
      targetCountries: [],
      submissionDate: new Date().toISOString(),
      status: 'draft',
      completionPercentage: 0,
      categories: defaultCategories
    }
    setSubmission(newSubmission)
  }

  const calculateCompletionPercentage = (categories: DocumentCategory[]) => {
    const requiredDocs = categories.flatMap(cat => 
      cat.documents.filter(doc => doc.required)
    )
    const uploadedDocs = requiredDocs.filter(doc => doc.isUploaded)
    return requiredDocs.length > 0 ? (uploadedDocs.length / requiredDocs.length) * 100 : 0
  }

  const handleFileUpload = async (categoryId: string, documentId: string, file: File) => {
    if (!submission) return

    // Simulate file upload
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const updatedCategories = submission.categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          documents: category.documents.map(doc => {
            if (doc.id === documentId) {
              return {
                ...doc,
                isUploaded: true,
                status: 'pending' as const,
                uploadedFile: {
                  name: file.name,
                  size: file.size,
                  uploadedAt: new Date().toISOString(),
                  url: URL.createObjectURL(file)
                }
              }
            }
            return doc
          })
        }
      }
      return category
    })

    const newSubmission = {
      ...submission,
      categories: updatedCategories,
      completionPercentage: calculateCompletionPercentage(updatedCategories)
    }

    setSubmission(newSubmission)
    setLoading(false)
  }

  const handleSubmitForReview = async () => {
    if (!submission) return

    setLoading(true)
    try {
      const response = await fetch('/api/document-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submission,
          status: 'submitted'
        })
      })

      if (response.ok) {
        setSubmission(prev => prev ? { ...prev, status: 'submitted' } : null)
        alert('Documents submitted for review successfully!')
      }
    } catch (error) {
      console.error('Failed to submit documents:', error)
      alert('Failed to submit documents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      case 'needs_revision': return 'bg-yellow-500'
      case 'pending': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved': return <Check className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      case 'needs_revision': return <AlertCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Upload className="w-4 h-4" />
    }
  }

  if (!submission) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Document Preparation
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Prepare and organize all required documents for your study abroad application
            </p>
            
            {/* Progress Bar */}
            <div className="bg-white/10 rounded-lg p-6 mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completion Progress</span>
                <span className="text-sm font-medium">{Math.round(submission.completionPercentage)}%</span>
              </div>
              <Progress value={submission.completionPercentage} className="h-3" />
              <p className="text-sm text-primary-100 mt-2">
                Complete all required documents to submit for review
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Dialog open={showGuidelines} onOpenChange={setShowGuidelines}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Guidelines
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Document Preparation Guidelines</DialogTitle>
                <DialogDescription>
                  Important guidelines for preparing your documents
                </DialogDescription>
              </DialogHeader>
              <DocumentGuidelines />
            </DialogContent>
          </Dialog>
          
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Target Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="canada">Canada</SelectItem>
              <SelectItem value="usa">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="australia">Australia</SelectItem>
              <SelectItem value="germany">Germany</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Study Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
              <SelectItem value="diploma">Diploma</SelectItem>
            </SelectContent>
          </Select>
          
          {submission.completionPercentage >= 80 && (
            <Button onClick={handleSubmitForReview} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          )}
        </div>

        {/* Status Alert */}
        {submission.status === 'submitted' && (
          <Alert className="mb-6">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your documents have been submitted for review. We'll contact you within 2-3 business days.
            </AlertDescription>
          </Alert>
        )}

        {submission.status === 'needs_revision' && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some documents need revision. Please check the comments and resubmit the required documents.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="checklist">Document Checklist</TabsTrigger>
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="review">Review & Submit</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {submission.categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {category.name}
                            {category.required && <Badge variant="destructive">Required</Badge>}
                          </CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {category.documents.filter(d => d.isUploaded).length} / {category.documents.length}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {category.documents.map((document) => (
                          <div key={document.id} className="flex items-start gap-3 p-4 border rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                              document.isUploaded 
                                ? getStatusColor(document.status)
                                : 'bg-gray-300'
                            }`}>
                              {getStatusIcon(document.status)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{document.name}</h4>
                                {document.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                                {document.status && (
                                  <Badge variant="secondary" className="text-xs">
                                    {document.status.replace('_', ' ')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                              
                              <div className="text-xs text-gray-500 space-y-1">
                                <div>Accepted formats: {document.acceptedFormats.join(', ')}</div>
                                <div>Max size: {document.maxSize}MB</div>
                                {document.notes && <div className="text-blue-600">Note: {document.notes}</div>}
                              </div>
                              
                              {document.uploadedFile && (
                                <div className="mt-3 p-2 bg-gray-50 rounded flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    <div>
                                      <div className="text-sm font-medium">{document.uploadedFile.name}</div>
                                      <div className="text-xs text-gray-600">
                                        Uploaded {new Date(document.uploadedFile.uploadedAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="outline">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              {document.reviewNotes && (
                                <Alert className="mt-3" variant={document.status === 'needs_revision' ? 'destructive' : 'default'}>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{document.reviewNotes}</AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Documents</span>
                      <Badge variant="outline">
                        {submission.categories.flatMap(c => c.documents).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Required</span>
                      <Badge variant="destructive">
                        {submission.categories.flatMap(c => c.documents.filter(d => d.required)).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uploaded</span>
                      <Badge variant="default">
                        {submission.categories.flatMap(c => c.documents.filter(d => d.isUploaded)).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Approved</span>
                      <Badge variant="secondary">
                        {submission.categories.flatMap(c => c.documents.filter(d => d.status === 'approved')).length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <p>Scan documents at 300 DPI for best quality</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <p>Use PDF format for official documents</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <p>Ensure documents are clearly readable</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <p>Keep original documents safe</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="grid lg:grid-cols-2 gap-6">
              {submission.categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {category.name}
                      {category.required && <Badge variant="destructive">Required</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.documents.map((document) => (
                      <div key={document.id}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">{document.name}</label>
                          {document.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                        </div>
                        
                        {document.isUploaded ? (
                          <div className="border-2 border-dashed border-green-300 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(document.status)}`}>
                                {getStatusIcon(document.status)}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{document.uploadedFile?.name}</p>
                                <p className="text-sm text-gray-600">
                                  Status: {document.status?.replace('_', ' ') || 'Uploaded'}
                                </p>
                              </div>
                              <Button size="sm" variant="outline">Replace</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Drop files here or click to upload
                            </p>
                            <p className="text-xs text-gray-500">
                              {document.acceptedFormats.join(', ')} up to {document.maxSize}MB
                            </p>
                            <input
                              type="file"
                              className="hidden"
                              accept={document.acceptedFormats.map(f => `.${f.toLowerCase()}`).join(',')}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleFileUpload(category.id, document.id, file)
                                }
                              }}
                              id={`upload-${category.id}-${document.id}`}
                            />
                            <Button
                              variant="outline"
                              className="mt-2"
                              onClick={() => document.getElementById(`upload-${category.id}-${document.id}`)?.click()}
                            >
                              Choose File
                            </Button>
                          </div>
                        )}
                        
                        {document.description && (
                          <p className="text-xs text-gray-600 mt-1">{document.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="review">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Submission</CardTitle>
                  <CardDescription>
                    Review all uploaded documents before submitting for review
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold mb-4">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                          value={submission.studentName}
                          onChange={(e) => setSubmission({...submission, studentName: e.target.value})}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          value={submission.email}
                          onChange={(e) => setSubmission({...submission, email: e.target.value})}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={submission.phone}
                          onChange={(e) => setSubmission({...submission, phone: e.target.value})}
                          placeholder="Your phone number"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Country</label>
                        <Select value={submission.country} onValueChange={(value) => setSubmission({...submission, country: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="pakistan">Pakistan</SelectItem>
                            <SelectItem value="bangladesh">Bangladesh</SelectItem>
                            <SelectItem value="nepal">Nepal</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Study Level</label>
                        <Select value={submission.studyLevel} onValueChange={(value) => setSubmission({...submission, studyLevel: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select study level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Field of Interest</label>
                        <Input
                          value={submission.fieldOfInterest}
                          onChange={(e) => setSubmission({...submission, fieldOfInterest: e.target.value})}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Summary */}
                  <div>
                    <h3 className="font-semibold mb-4">Document Summary</h3>
                    <div className="space-y-4">
                      {submission.categories.map((category) => {
                        const uploadedDocs = category.documents.filter(d => d.isUploaded)
                        const requiredDocs = category.documents.filter(d => d.required)
                        const missingRequired = requiredDocs.filter(d => !d.isUploaded)
                        
                        return (
                          <div key={category.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{category.name}</h4>
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  {uploadedDocs.length}/{category.documents.length} uploaded
                                </Badge>
                                {missingRequired.length > 0 && (
                                  <Badge variant="destructive">
                                    {missingRequired.length} required missing
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-2 text-sm">
                              {category.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                    doc.isUploaded ? 'bg-green-500' : 'bg-gray-300'
                                  }`}>
                                    {doc.isUploaded ? (
                                      <Check className="w-2 h-2 text-white" />
                                    ) : (
                                      <X className="w-2 h-2 text-white" />
                                    )}
                                  </div>
                                  <span className={doc.isUploaded ? 'text-green-700' : 'text-gray-600'}>
                                    {doc.name} {doc.required && '*'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6">
                    {submission.completionPercentage >= 80 ? (
                      <Button
                        onClick={handleSubmitForReview}
                        disabled={loading}
                        className="px-8 py-3"
                        size="lg"
                      >
                        {loading ? 'Submitting...' : 'Submit for Review'}
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">
                          Please complete at least 80% of required documents to submit for review
                        </p>
                        <Button variant="outline" disabled>
                          Complete Required Documents First
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function DocumentGuidelines() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">General Guidelines</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5" />
            All documents must be clear and readable
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5" />
            Use official documents whenever possible
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5" />
            Ensure all documents are current and valid
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5" />
            Translation required for non-English documents
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3">File Format Guidelines</h3>
        <ul className="space-y-2 text-sm">
          <li><strong>PDF:</strong> Preferred for official documents, transcripts, certificates</li>
          <li><strong>JPEG/PNG:</strong> Acceptable for photos, scanned documents</li>
          <li><strong>DOC/DOCX:</strong> For personal statements, essays</li>
          <li><strong>File Size:</strong> Keep files under specified limits for faster processing</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Common Mistakes to Avoid</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 mt-0.5" />
            Blurry or low-quality scans
          </li>
          <li className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 mt-0.5" />
            Expired or outdated documents
          </li>
          <li className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 mt-0.5" />
            Missing required signatures or seals
          </li>
          <li className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 mt-0.5" />
            Incomplete or cut-off documents
          </li>
        </ul>
      </div>
    </div>
  )
}