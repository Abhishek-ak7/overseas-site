'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Database,
  Palette,
  Bell,
  Users,
  CheckCircle,
  AlertCircle,
  Save,
  Upload,
  Download
} from 'lucide-react'

interface SettingsData {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    contactPhone: string
    businessAddress: string
    currency: string
    timezone: string
    language: string
  }
  branding: {
    logo: string
    favicon: string
    primaryColor: string
    secondaryColor: string
    customCSS: string
  }
  email: {
    smtpHost: string
    smtpPort: string
    smtpUsername: string
    smtpPassword: string
    fromName: string
    fromEmail: string
    enableEmailNotifications: boolean
  }
  payments: {
    razorpayKeyId: string
    razorpayKeySecret: string
    stripePublicKey: string
    stripeSecretKey: string
    paypalClientId: string
    defaultCurrency: string
    enableRazorpay: boolean
    enableStripe: boolean
    enablePaypal: boolean
  }
  security: {
    enableTwoFactor: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    enableCaptcha: boolean
    maintenanceMode: boolean
    allowRegistration: boolean
  }
  notifications: {
    enableEmailNotifications: boolean
    enableSMSNotifications: boolean
    enablePushNotifications: boolean
    adminEmail: string
    notifyOnNewUser: boolean
    notifyOnNewOrder: boolean
    notifyOnAppointment: boolean
  }
  integrations: {
    googleAnalyticsId: string
    facebookPixelId: string
    zoomApiKey: string
    zoomApiSecret: string
    twilioAccountSid: string
    twilioAuthToken: string
  }
  storage: {
    provider: string
    awsAccessKeyId: string
    awsSecretAccessKey: string
    awsRegion: string
    awsS3Bucket: string
    maxFileSize: number
    allowedFileTypes: string
  }
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (category: string, data: any) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, data })
      })

      if (response.ok) {
        setSuccess(`${category} settings saved successfully`)
        fetchSettings() // Refresh settings
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    if (!settings) return

    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof SettingsData],
        [key]: value
      }
    })
  }

  const testEmailSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST'
      })

      if (response.ok) {
        setSuccess('Test email sent successfully')
      } else {
        throw new Error('Failed to send test email')
      }
    } catch (error) {
      setError('Failed to send test email')
    }
  }

  const testConnection = async (service: string) => {
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/settings/test-${service}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settings?.[service as keyof SettingsData] })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(result.message || `${service} connection tested successfully`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to test ${service} connection`)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : `Failed to test ${service} connection`)
    }
  }

  const testPaymentGateway = async (gateway: 'razorpay' | 'stripe') => {
    try {
      const response = await fetch(`/api/admin/settings/test-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateway })
      })

      if (response.ok) {
        setSuccess(`${gateway} connection tested successfully`)
      } else {
        throw new Error(`Failed to test ${gateway} connection`)
      }
    } catch (error) {
      setError(`Failed to test ${gateway} connection`)
    }
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

  if (!settings) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load settings</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your website and application settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Settings
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="storage">
            <Database className="h-4 w-4 mr-2" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Settings className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic site configuration and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) => updateSetting('general', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={settings.general.contactPhone}
                    onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  value={settings.general.businessAddress}
                  onChange={(e) => updateSetting('general', 'businessAddress', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => saveSettings('general', settings.general)}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for sending emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSetting('email', 'smtpPort', e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.email.smtpUsername}
                    onChange={(e) => updateSetting('email', 'smtpUsername', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.email.fromName}
                    onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableEmailNotifications"
                  checked={settings.email.enableEmailNotifications}
                  onCheckedChange={(checked) => updateSetting('email', 'enableEmailNotifications', checked)}
                />
                <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => saveSettings('email', settings.email)}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Email Settings'}
                </Button>
                <Button
                  variant="outline"
                  onClick={testEmailSettings}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Configuration</CardTitle>
              <CardDescription>Configure payment gateways for processing transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Razorpay */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Razorpay Settings</h3>
                  <Switch
                    checked={settings.payments.enableRazorpay}
                    onCheckedChange={(checked) => updateSetting('payments', 'enableRazorpay', checked)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                    <Input
                      id="razorpayKeyId"
                      value={settings.payments.razorpayKeyId}
                      onChange={(e) => updateSetting('payments', 'razorpayKeyId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                    <Input
                      id="razorpayKeySecret"
                      type="password"
                      value={settings.payments.razorpayKeySecret}
                      onChange={(e) => updateSetting('payments', 'razorpayKeySecret', e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => testPaymentGateway('razorpay')}
                >
                  Test Razorpay Connection
                </Button>
              </div>

              {/* Stripe */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Stripe Settings</h3>
                  <Switch
                    checked={settings.payments.enableStripe}
                    onCheckedChange={(checked) => updateSetting('payments', 'enableStripe', checked)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                    <Input
                      id="stripePublicKey"
                      value={settings.payments.stripePublicKey}
                      onChange={(e) => updateSetting('payments', 'stripePublicKey', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                    <Input
                      id="stripeSecretKey"
                      type="password"
                      value={settings.payments.stripeSecretKey}
                      onChange={(e) => updateSetting('payments', 'stripeSecretKey', e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => testPaymentGateway('stripe')}
                >
                  Test Stripe Connection
                </Button>
              </div>

              <Button
                onClick={() => saveSettings('payments', settings.payments)}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                  </div>
                  <Switch
                    id="enableTwoFactor"
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Put site in maintenance mode</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.security.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting('security', 'maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRegistration">Allow User Registration</Label>
                    <p className="text-sm text-gray-600">Allow new users to register</p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={settings.security.allowRegistration}
                    onCheckedChange={(checked) => updateSetting('security', 'allowRegistration', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button
                onClick={() => saveSettings('security', settings.security)}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage & File Management</CardTitle>
              <CardDescription>Configure file storage, uploads, and media management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storageProvider">Storage Provider</Label>
                <Select
                  value={settings.storage.provider}
                  onValueChange={(value) => updateSetting('storage', 'provider', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select storage provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S3">Amazon S3</SelectItem>
                    <SelectItem value="LOCAL">Local Storage</SelectItem>
                    <SelectItem value="CLOUDINARY">Cloudinary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.storage.provider === 'S3' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="awsAccessKeyId">AWS Access Key ID</Label>
                      <Input
                        id="awsAccessKeyId"
                        type="password"
                        value={settings.storage.awsAccessKeyId}
                        onChange={(e) => updateSetting('storage', 'awsAccessKeyId', e.target.value)}
                        placeholder="AKIA..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="awsSecretAccessKey">AWS Secret Access Key</Label>
                      <Input
                        id="awsSecretAccessKey"
                        type="password"
                        value={settings.storage.awsSecretAccessKey}
                        onChange={(e) => updateSetting('storage', 'awsSecretAccessKey', e.target.value)}
                        placeholder="Your secret key"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="awsRegion">AWS Region</Label>
                      <Select
                        value={settings.storage.awsRegion}
                        onValueChange={(value) => updateSetting('storage', 'awsRegion', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select AWS region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                          <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                          <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                          <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                          <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="awsS3Bucket">S3 Bucket Name</Label>
                      <Input
                        id="awsS3Bucket"
                        value={settings.storage.awsS3Bucket}
                        onChange={(e) => updateSetting('storage', 'awsS3Bucket', e.target.value)}
                        placeholder="your-bucket-name"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.storage.maxFileSize}
                    onChange={(e) => updateSetting('storage', 'maxFileSize', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-600">Maximum file size for uploads</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.storage.allowedFileTypes}
                    onChange={(e) => updateSetting('storage', 'allowedFileTypes', e.target.value)}
                    placeholder="image,video,document,audio"
                  />
                  <p className="text-sm text-gray-600">Comma-separated list of allowed file types</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => saveSettings('storage', settings.storage)}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Storage Settings'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testConnection('storage')}
                  disabled={saving}
                >
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}