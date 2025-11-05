'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  Mail,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'

interface EmailSettings {
  smtpHost: string
  smtpPort: string
  smtpUsername: string
  smtpPassword: string
  fromName: string
  fromEmail: string
  enableEmailNotifications: boolean
}

export default function EmailSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromName: '',
    fromEmail: '',
    enableEmailNotifications: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings?.email) {
          setSettings(data.settings.email)
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
          category: 'email',
          settings: settings,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Email settings saved successfully',
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save email settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter a test email address',
        variant: 'destructive',
      })
      return
    }

    setTesting(true)
    try {
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Test email sent successfully! Check your inbox.',
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send test email')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send test email',
        variant: 'destructive',
      })
    } finally {
      setTesting(false)
    }
  }

  const updateSetting = (key: keyof EmailSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
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

  const isConfigured = settings.smtpHost && settings.smtpUsername && settings.smtpPassword

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
          <p className="text-gray-600 mt-2">Configure SMTP settings for email notifications</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Status Alert */}
      {isConfigured ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Email is configured and ready. Email verification will be automatically enabled for new registrations.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Email is not configured. Please configure SMTP settings below to enable email notifications and email verification for registrations.
          </AlertDescription>
        </Alert>
      )}

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP server for sending emails
              </CardDescription>
            </div>
            <Switch
              checked={settings.enableEmailNotifications}
              onCheckedChange={(checked) => updateSetting('enableEmailNotifications', checked)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Use your email provider's SMTP settings. For Gmail, enable "App Passwords" in your Google Account settings.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                placeholder="smtp.gmail.com"
                value={settings.smtpHost}
                onChange={(e) => updateSetting('smtpHost', e.target.value)}
                disabled={!settings.enableEmailNotifications}
              />
              <p className="text-xs text-gray-500">
                Your SMTP server hostname
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                placeholder="587"
                value={settings.smtpPort}
                onChange={(e) => updateSetting('smtpPort', e.target.value)}
                disabled={!settings.enableEmailNotifications}
              />
              <p className="text-xs text-gray-500">
                Usually 587 (TLS) or 465 (SSL)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUsername">SMTP Username</Label>
              <Input
                id="smtpUsername"
                type="email"
                placeholder="your-email@gmail.com"
                value={settings.smtpUsername}
                onChange={(e) => updateSetting('smtpUsername', e.target.value)}
                disabled={!settings.enableEmailNotifications}
              />
              <p className="text-xs text-gray-500">
                Your email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                placeholder="Enter SMTP password or app password"
                value={settings.smtpPassword}
                onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                disabled={!settings.enableEmailNotifications}
              />
              <p className="text-xs text-gray-500">
                Your email password or app-specific password
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                placeholder="BnOverseas"
                value={settings.fromName}
                onChange={(e) => updateSetting('fromName', e.target.value)}
                disabled={!settings.enableEmailNotifications}
              />
              <p className="text-xs text-gray-500">
                Name shown in emails
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="noreply@bnoverseas.com"
                value={settings.fromEmail}
                onChange={(e) => updateSetting('fromEmail', e.target.value)}
                disabled={!settings.enableEmailNotifications}
              />
              <p className="text-xs text-gray-500">
                Email address shown as sender
              </p>
            </div>
          </div>

          {/* Test Email */}
          <div className="pt-6 border-t">
            <h4 className="font-medium mb-4">Test Email Configuration</h4>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter email to send test message"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={testing || !isConfigured}
              />
              <Button
                onClick={handleTestEmail}
                disabled={testing || !isConfigured}
                variant="outline"
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Send a test email to verify your SMTP configuration
            </p>
          </div>

          {/* Common Providers */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Common SMTP Providers</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div><strong>Gmail:</strong> smtp.gmail.com (Port: 587)</div>
              <div><strong>Outlook:</strong> smtp.office365.com (Port: 587)</div>
              <div><strong>Yahoo:</strong> smtp.mail.yahoo.com (Port: 587)</div>
              <div><strong>SendGrid:</strong> smtp.sendgrid.net (Port: 587)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Email Verification:</strong> When SMTP is configured and enabled, new user registrations will automatically receive an OTP verification email. Users must verify their email before accessing the platform.
            </div>
          </div>
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Appointment Notifications:</strong> Appointment confirmation and reminder emails will be sent through this configured SMTP server.
            </div>
          </div>
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Course Enrollments:</strong> Course enrollment confirmation emails will be sent to users when they purchase or enroll in courses.
            </div>
          </div>
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Gmail Users:</strong> If using Gmail, you must enable 2-Step Verification and create an App Password. Regular passwords won't work with SMTP.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
