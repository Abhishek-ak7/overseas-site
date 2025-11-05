'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Database, User, Settings, Mail, CreditCard, Shield } from 'lucide-react'

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  completed: boolean
}

interface SetupData {
  database: {
    url: string
    testConnection: boolean
  }
  admin: {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
  }
  site: {
    name: string
    description: string
    logo: string
    contactEmail: string
    contactPhone: string
    address: string
  }
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses'
    host: string
    port: string
    username: string
    password: string
  }
  payment: {
    razorpayKeyId: string
    razorpayKeySecret: string
    stripePublicKey: string
    stripeSecretKey: string
  }
  security: {
    jwtSecret: string
    encryptionKey: string
    enableTwoFactor: boolean
    sessionTimeout: number
  }
}

export default function SetupWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [setupData, setSetupData] = useState<SetupData>({
    database: { url: '', testConnection: false },
    admin: { email: '', password: '', confirmPassword: '', firstName: '', lastName: '' },
    site: { name: 'BnOverseas', description: '', logo: '', contactEmail: '', contactPhone: '', address: '' },
    email: { provider: 'smtp', host: '', port: '587', username: '', password: '' },
    payment: { razorpayKeyId: '', razorpayKeySecret: '', stripePublicKey: '', stripeSecretKey: '' },
    security: { jwtSecret: '', encryptionKey: '', enableTwoFactor: false, sessionTimeout: 24 }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [systemCheck, setSystemCheck] = useState<any>({})

  const steps: SetupStep[] = [
    {
      id: 'requirements',
      title: 'System Requirements',
      description: 'Check system requirements and dependencies',
      icon: CheckCircle,
      completed: false
    },
    {
      id: 'database',
      title: 'Database Configuration',
      description: 'Configure PostgreSQL database connection',
      icon: Database,
      completed: false
    },
    {
      id: 'admin',
      title: 'Admin Account',
      description: 'Create initial administrator account',
      icon: User,
      completed: false
    },
    {
      id: 'site',
      title: 'Site Configuration',
      description: 'Basic site settings and information',
      icon: Settings,
      completed: false
    },
    {
      id: 'email',
      title: 'Email Configuration',
      description: 'Configure email service for notifications',
      icon: Mail,
      completed: false
    },
    {
      id: 'payment',
      title: 'Payment Gateways',
      description: 'Configure Razorpay and Stripe (optional)',
      icon: CreditCard,
      completed: false
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Configure security and encryption settings',
      icon: Shield,
      completed: false
    }
  ]

  useEffect(() => {
    checkSystemRequirements()
  }, [])

  const checkSystemRequirements = async () => {
    try {
      const response = await fetch('/api/setup/check-requirements')
      const data = await response.json()
      setSystemCheck(data)
    } catch (error) {
      console.error('Failed to check requirements:', error)
    }
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup/test-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: setupData.database.url })
      })
      const data = await response.json()

      if (data.success) {
        setSetupData(prev => ({
          ...prev,
          database: { ...prev.database, testConnection: true }
        }))
        setError('')
      } else {
        setError(data.error || 'Database connection failed')
      }
    } catch (error) {
      setError('Failed to test database connection')
    } finally {
      setLoading(false)
    }
  }

  const saveStepData = async (stepId: string, data: any) => {
    try {
      const response = await fetch('/api/setup/save-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepId, data })
      })
      return await response.json()
    } catch (error) {
      throw new Error('Failed to save setup data')
    }
  }

  const completeSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupData)
      })

      const data = await response.json()
      if (data.success) {
        router.push('/admin/dashboard?setup=complete')
      } else {
        setError(data.error || 'Setup completion failed')
      }
    } catch (error) {
      setError('Failed to complete setup')
    } finally {
      setLoading(false)
    }
  }

  const generateSecureKey = (length: number = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  const renderStep = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case 'requirements':
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${systemCheck.node ? 'text-green-500' : 'text-red-500'}`} />
                  <span>Node.js (v18+)</span>
                </div>
                <span className={systemCheck.node ? 'text-green-600' : 'text-red-600'}>
                  {systemCheck.nodeVersion || 'Not detected'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${systemCheck.nextjs ? 'text-green-500' : 'text-red-500'}`} />
                  <span>Next.js Framework</span>
                </div>
                <span className={systemCheck.nextjs ? 'text-green-600' : 'text-red-600'}>
                  {systemCheck.nextjsVersion || 'Not detected'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${systemCheck.prisma ? 'text-green-500' : 'text-yellow-500'}`} />
                  <span>Prisma ORM</span>
                </div>
                <span className={systemCheck.prisma ? 'text-green-600' : 'text-yellow-600'}>
                  {systemCheck.prismaVersion || 'Will be installed'}
                </span>
              </div>
            </div>

            {Object.values(systemCheck).some(check => check === false) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some requirements are not met. Please install the missing dependencies before proceeding.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 'database':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dbUrl">Database URL</Label>
              <Input
                id="dbUrl"
                placeholder="postgresql://username:password@localhost:5432/bnoverseas"
                value={setupData.database.url}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  database: { ...prev.database, url: e.target.value, testConnection: false }
                }))}
              />
            </div>

            <Button
              onClick={testDatabaseConnection}
              disabled={!setupData.database.url || loading}
              className="w-full"
            >
              {loading ? 'Testing Connection...' : 'Test Database Connection'}
            </Button>

            {setupData.database.testConnection && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Database connection successful!</AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-gray-600">
              <p>Make sure your PostgreSQL database is running and accessible.</p>
              <p>The setup will automatically create the required tables.</p>
            </div>
          </div>
        )

      case 'admin':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={setupData.admin.firstName}
                  onChange={(e) => setSetupData(prev => ({
                    ...prev,
                    admin: { ...prev.admin, firstName: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={setupData.admin.lastName}
                  onChange={(e) => setSetupData(prev => ({
                    ...prev,
                    admin: { ...prev.admin, lastName: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email Address</Label>
              <Input
                id="adminEmail"
                type="email"
                value={setupData.admin.email}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  admin: { ...prev.admin, email: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={setupData.admin.password}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  admin: { ...prev.admin, password: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={setupData.admin.confirmPassword}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  admin: { ...prev.admin, confirmPassword: e.target.value }
                }))}
              />
            </div>

            {setupData.admin.password !== setupData.admin.confirmPassword && setupData.admin.confirmPassword && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Passwords do not match</AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 'site':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={setupData.site.name}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  site: { ...prev.site, name: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={setupData.site.description}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  site: { ...prev.site, description: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={setupData.site.contactEmail}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  site: { ...prev.site, contactEmail: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={setupData.site.contactPhone}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  site: { ...prev.site, contactPhone: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={setupData.site.address}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  site: { ...prev.site, address: e.target.value }
                }))}
              />
            </div>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailHost">SMTP Host</Label>
              <Input
                id="emailHost"
                placeholder="smtp.gmail.com"
                value={setupData.email.host}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  email: { ...prev.email, host: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailPort">SMTP Port</Label>
              <Input
                id="emailPort"
                placeholder="587"
                value={setupData.email.port}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  email: { ...prev.email, port: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailUsername">Email Username</Label>
              <Input
                id="emailUsername"
                value={setupData.email.username}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  email: { ...prev.email, username: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailPassword">Email Password</Label>
              <Input
                id="emailPassword"
                type="password"
                value={setupData.email.password}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  email: { ...prev.email, password: e.target.value }
                }))}
              />
            </div>

            <div className="text-sm text-gray-600">
              <p>Email configuration is optional but recommended for user notifications.</p>
              <p>You can configure this later in the admin panel.</p>
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Razorpay (Recommended for India)</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                  <Input
                    id="razorpayKeyId"
                    value={setupData.payment.razorpayKeyId}
                    onChange={(e) => setSetupData(prev => ({
                      ...prev,
                      payment: { ...prev.payment, razorpayKeyId: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                  <Input
                    id="razorpayKeySecret"
                    type="password"
                    value={setupData.payment.razorpayKeySecret}
                    onChange={(e) => setSetupData(prev => ({
                      ...prev,
                      payment: { ...prev.payment, razorpayKeySecret: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Stripe (International)</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                  <Input
                    id="stripePublicKey"
                    value={setupData.payment.stripePublicKey}
                    onChange={(e) => setSetupData(prev => ({
                      ...prev,
                      payment: { ...prev.payment, stripePublicKey: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                  <Input
                    id="stripeSecretKey"
                    type="password"
                    value={setupData.payment.stripeSecretKey}
                    onChange={(e) => setSetupData(prev => ({
                      ...prev,
                      payment: { ...prev.payment, stripeSecretKey: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>Payment gateway configuration is optional during setup.</p>
              <p>You can configure payment methods later in the admin panel.</p>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jwtSecret">JWT Secret Key</Label>
              <div className="flex gap-2">
                <Input
                  id="jwtSecret"
                  value={setupData.security.jwtSecret}
                  onChange={(e) => setSetupData(prev => ({
                    ...prev,
                    security: { ...prev.security, jwtSecret: e.target.value }
                  }))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSetupData(prev => ({
                    ...prev,
                    security: { ...prev.security, jwtSecret: generateSecureKey(64) }
                  }))}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="encryptionKey">Encryption Key</Label>
              <div className="flex gap-2">
                <Input
                  id="encryptionKey"
                  value={setupData.security.encryptionKey}
                  onChange={(e) => setSetupData(prev => ({
                    ...prev,
                    security: { ...prev.security, encryptionKey: e.target.value }
                  }))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSetupData(prev => ({
                    ...prev,
                    security: { ...prev.security, encryptionKey: generateSecureKey(32) }
                  }))}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="1"
                max="168"
                value={setupData.security.sessionTimeout}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                }))}
              />
            </div>

            <div className="text-sm text-gray-600">
              <p>These security keys will be used to encrypt sensitive data and user sessions.</p>
              <p>Keep these keys secure and don't share them publicly.</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case 'requirements':
        return Object.values(systemCheck).every(check => check !== false)
      case 'database':
        return setupData.database.url && setupData.database.testConnection
      case 'admin':
        return setupData.admin.email &&
               setupData.admin.password &&
               setupData.admin.firstName &&
               setupData.admin.lastName &&
               setupData.admin.password === setupData.admin.confirmPassword
      case 'site':
        return setupData.site.name && setupData.site.contactEmail
      case 'email':
        return true // Optional step
      case 'payment':
        return true // Optional step
      case 'security':
        return setupData.security.jwtSecret && setupData.security.encryptionKey
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BnOverseas Setup Wizard</h1>
          <p className="text-gray-600">Complete the initial setup to get your educational platform ready</p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="w-full" />
          <div className="mt-2 text-sm text-gray-600 text-center">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              {React.createElement(steps[currentStep].icon, { className: "h-6 w-6 text-blue-600" })}
              <div>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}

            {error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={completeSetup}
              disabled={!canProceed() || loading}
            >
              {loading ? 'Completing Setup...' : 'Complete Setup'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}