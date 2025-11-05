'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Save,
  Wallet,
  DollarSign,
} from 'lucide-react'

interface PaymentSettings {
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

export default function PaymentSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<PaymentSettings>({
    razorpayKeyId: '',
    razorpayKeySecret: '',
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    defaultCurrency: 'INR',
    enableRazorpay: false,
    enableStripe: false,
    enablePaypal: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings?.payments) {
          setSettings(data.settings.payments)
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
          category: 'payments',
          settings: settings,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment settings saved successfully',
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save payment settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof PaymentSettings, value: any) => {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-2">Configure payment gateways and options</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="razorpay">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        {/* Razorpay Settings */}
        <TabsContent value="razorpay">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Razorpay Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure Razorpay payment gateway for Indian payments (INR)
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.enableRazorpay}
                  onCheckedChange={(checked) => updateSetting('enableRazorpay', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Get your Razorpay API keys from{' '}
                  <a
                    href="https://dashboard.razorpay.com/app/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    Razorpay Dashboard
                  </a>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                  <Input
                    id="razorpayKeyId"
                    placeholder="rzp_test_xxxxxxxxxxxxxxxx or rzp_live_xxxxxxxxxxxxxxxx"
                    value={settings.razorpayKeyId}
                    onChange={(e) => updateSetting('razorpayKeyId', e.target.value)}
                    disabled={!settings.enableRazorpay}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your Razorpay API Key ID (starts with rzp_test_ or rzp_live_)
                  </p>
                </div>

                <div>
                  <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                  <Input
                    id="razorpayKeySecret"
                    type="password"
                    placeholder="Enter your Razorpay key secret"
                    value={settings.razorpayKeySecret}
                    onChange={(e) => updateSetting('razorpayKeySecret', e.target.value)}
                    disabled={!settings.enableRazorpay}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your Razorpay API Key Secret (keep this secure)
                  </p>
                </div>
              </div>

              {settings.enableRazorpay && settings.razorpayKeyId && settings.razorpayKeySecret && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Razorpay is configured and ready to accept payments
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stripe Settings */}
        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Stripe Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure Stripe payment gateway for international payments
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.enableStripe}
                  onCheckedChange={(checked) => updateSetting('enableStripe', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Get your Stripe API keys from{' '}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    Stripe Dashboard
                  </a>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripePublicKey">Stripe Publishable Key</Label>
                  <Input
                    id="stripePublicKey"
                    placeholder="pk_test_xxxxxxxxxxxxxxxx or pk_live_xxxxxxxxxxxxxxxx"
                    value={settings.stripePublicKey}
                    onChange={(e) => updateSetting('stripePublicKey', e.target.value)}
                    disabled={!settings.enableStripe}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your Stripe Publishable Key (starts with pk_test_ or pk_live_)
                  </p>
                </div>

                <div>
                  <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                  <Input
                    id="stripeSecretKey"
                    type="password"
                    placeholder="sk_test_xxxxxxxxxxxxxxxx or sk_live_xxxxxxxxxxxxxxxx"
                    value={settings.stripeSecretKey}
                    onChange={(e) => updateSetting('stripeSecretKey', e.target.value)}
                    disabled={!settings.enableStripe}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your Stripe Secret Key (starts with sk_test_ or sk_live_)
                  </p>
                </div>
              </div>

              {settings.enableStripe && settings.stripePublicKey && settings.stripeSecretKey && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Stripe is configured and ready to accept payments
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PayPal Settings */}
        <TabsContent value="paypal">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>PayPal Configuration</CardTitle>
                  <CardDescription>Configure PayPal payment gateway</CardDescription>
                </div>
                <Switch
                  checked={settings.enablePaypal}
                  onCheckedChange={(checked) => updateSetting('enablePaypal', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Get your PayPal Client ID from{' '}
                  <a
                    href="https://developer.paypal.com/dashboard/applications/live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    PayPal Developer Dashboard
                  </a>
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                <Input
                  id="paypalClientId"
                  placeholder="Enter your PayPal Client ID"
                  value={settings.paypalClientId}
                  onChange={(e) => updateSetting('paypalClientId', e.target.value)}
                  disabled={!settings.enablePaypal}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your PayPal REST API Client ID
                </p>
              </div>

              {settings.enablePaypal && settings.paypalClientId && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    PayPal is configured and ready to accept payments
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                General Payment Settings
              </CardTitle>
              <CardDescription>Configure default payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select
                  value={settings.defaultCurrency}
                  onValueChange={(value) => updateSetting('defaultCurrency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Default currency for courses and services
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Payment Gateway Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Razorpay</span>
                    <Badge variant={settings.enableRazorpay ? 'default' : 'secondary'}>
                      {settings.enableRazorpay ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stripe</span>
                    <Badge variant={settings.enableStripe ? 'default' : 'secondary'}>
                      {settings.enableStripe ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PayPal</span>
                    <Badge variant={settings.enablePaypal ? 'default' : 'secondary'}>
                      {settings.enablePaypal ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
