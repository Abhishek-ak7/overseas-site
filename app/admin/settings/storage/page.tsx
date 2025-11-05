'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Cloud,
  CheckCircle,
  AlertCircle,
  Save,
  HardDrive,
  Upload,
} from 'lucide-react'

interface StorageSettings {
  provider: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
  awsRegion: string
  awsS3Bucket: string
  maxFileSize: number
  allowedFileTypes: string
}

export default function StorageSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<StorageSettings>({
    provider: 'LOCAL',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
    awsRegion: 'us-east-1',
    awsS3Bucket: '',
    maxFileSize: 10485760, // 10MB in bytes
    allowedFileTypes: 'image/jpeg,image/png,image/gif,video/mp4,application/pdf',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings?.storage) {
          setSettings(data.settings.storage)
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'storage',
          settings: settings,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Storage settings saved successfully',
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save storage settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof StorageSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const formatFileSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Storage Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure file storage and AWS S3 integration for course videos and materials
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Storage Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Provider
          </CardTitle>
          <CardDescription>
            Choose where to store uploaded files (course videos, images, documents)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="storageProvider">Storage Provider</Label>
            <Select
              value={settings.provider}
              onValueChange={(value) => updateSetting('provider', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select storage provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOCAL">Local Storage</SelectItem>
                <SelectItem value="S3">Amazon S3 (AWS)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {settings.provider === 'S3'
                ? 'Files will be stored on Amazon S3 (recommended for production)'
                : 'Files will be stored locally on the server'}
            </p>
          </div>

          {settings.provider === 'LOCAL' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Local storage is suitable for development and testing. For production, we recommend using Amazon S3 for better scalability and reliability.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AWS S3 Configuration */}
      {settings.provider === 'S3' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              AWS S3 Configuration
            </CardTitle>
            <CardDescription>
              Configure Amazon S3 credentials and bucket for file storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Create an S3 bucket and IAM user with appropriate permissions from{' '}
                <a
                  href="https://console.aws.amazon.com/s3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  AWS Console
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="awsAccessKeyId">AWS Access Key ID</Label>
                <Input
                  id="awsAccessKeyId"
                  placeholder="AKIA****************"
                  value={settings.awsAccessKeyId}
                  onChange={(e) => updateSetting('awsAccessKeyId', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your AWS IAM user Access Key ID
                </p>
              </div>

              <div>
                <Label htmlFor="awsSecretAccessKey">AWS Secret Access Key</Label>
                <Input
                  id="awsSecretAccessKey"
                  type="password"
                  placeholder="Enter your AWS secret key"
                  value={settings.awsSecretAccessKey}
                  onChange={(e) => updateSetting('awsSecretAccessKey', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your AWS IAM user Secret Access Key (keep this secure)
                </p>
              </div>

              <div>
                <Label htmlFor="awsRegion">AWS Region</Label>
                <Select
                  value={settings.awsRegion}
                  onValueChange={(value) => updateSetting('awsRegion', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-1">US West (N. California)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                    <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                    <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  AWS region where your S3 bucket is located
                </p>
              </div>

              <div>
                <Label htmlFor="awsS3Bucket">S3 Bucket Name</Label>
                <Input
                  id="awsS3Bucket"
                  placeholder="my-app-bucket"
                  value={settings.awsS3Bucket}
                  onChange={(e) => updateSetting('awsS3Bucket', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name of your S3 bucket (must be globally unique)
                </p>
              </div>
            </div>

            {settings.awsAccessKeyId && settings.awsSecretAccessKey && settings.awsS3Bucket && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  AWS S3 is configured. Make sure your bucket has the correct CORS policy and IAM permissions.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Required IAM Permissions</h4>
              <p className="text-sm text-blue-800 mb-2">
                Your IAM user should have these permissions:
              </p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>s3:PutObject - Upload files</li>
                <li>s3:GetObject - Download files</li>
                <li>s3:DeleteObject - Delete files</li>
                <li>s3:ListBucket - List bucket contents</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload Settings
          </CardTitle>
          <CardDescription>Configure file size limits and allowed file types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
            <Select
              value={settings.maxFileSize.toString()}
              onValueChange={(value) => updateSetting('maxFileSize', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5242880">5 MB</SelectItem>
                <SelectItem value="10485760">10 MB</SelectItem>
                <SelectItem value="26214400">25 MB</SelectItem>
                <SelectItem value="52428800">50 MB</SelectItem>
                <SelectItem value="104857600">100 MB</SelectItem>
                <SelectItem value="524288000">500 MB</SelectItem>
                <SelectItem value="1073741824">1 GB</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Current limit: {formatFileSize(settings.maxFileSize)}
            </p>
          </div>

          <div>
            <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
            <Input
              id="allowedFileTypes"
              placeholder="image/jpeg,image/png,video/mp4,application/pdf"
              value={settings.allowedFileTypes}
              onChange={(e) => updateSetting('allowedFileTypes', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated list of allowed MIME types
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Common File Types</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <strong>Images:</strong> image/jpeg, image/png, image/gif, image/webp
              </div>
              <div>
                <strong>Videos:</strong> video/mp4, video/webm, video/ogg
              </div>
              <div>
                <strong>Documents:</strong> application/pdf, text/plain
              </div>
              <div>
                <strong>Archives:</strong> application/zip, application/x-rar
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
