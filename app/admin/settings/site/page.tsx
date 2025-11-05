"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, Save, Upload } from "lucide-react"

interface SiteSettings {
  id: string
  siteName: string
  siteTagline?: string
  siteDescription?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  linkColor: string
  headingFont: string
  bodyFont: string
  fontSize: string
  containerWidth: string
  borderRadius: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  facebookUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  metaTitle?: string
  metaDescription?: string
  googleAnalyticsId?: string
  facebookPixelId?: string
  enableCookieConsent: boolean
  enableMaintenanceMode: boolean
  maintenanceMessage?: string
  timezone: string
  language: string
  currency: string
  dateFormat: string
  timeFormat: string
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/site')
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load site settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch('/api/settings/site', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Site settings saved successfully')
        setSettings(data.settings)
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (field: keyof SiteSettings, value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      [field]: value,
    })
  }

  const handleLogoUpload = async (file: File) => {
    // TODO: Implement file upload to S3 or local storage
    toast.info('File upload functionality to be implemented')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No site settings found. Creating default settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-gray-600">Manage your website's basic configuration and appearance</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Identity</CardTitle>
              <CardDescription>Basic information about your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSettings('siteName', e.target.value)}
                    placeholder="Your Site Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteTagline">Site Tagline</Label>
                  <Input
                    id="siteTagline"
                    value={settings.siteTagline || ''}
                    onChange={(e) => updateSettings('siteTagline', e.target.value)}
                    placeholder="Your site's tagline"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription || ''}
                  onChange={(e) => updateSettings('siteDescription', e.target.value)}
                  placeholder="Brief description of your website"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={settings.timezone}
                    onChange={(e) => updateSettings('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Kolkata">India</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={settings.language}
                    onChange={(e) => updateSettings('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={settings.currency}
                    onChange={(e) => updateSettings('currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding</CardTitle>
              <CardDescription>Upload and manage your site's visual identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoUrl"
                      value={settings.logoUrl || ''}
                      onChange={(e) => updateSettings('logoUrl', e.target.value)}
                      placeholder="/logo.png"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {settings.logoUrl && (
                    <div className="mt-2">
                      <img src={settings.logoUrl} alt="Logo" className="h-12 object-contain" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="faviconUrl"
                      value={settings.faviconUrl || ''}
                      onChange={(e) => updateSettings('faviconUrl', e.target.value)}
                      placeholder="/favicon.ico"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize your site's color palette</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings('secondaryColor', e.target.value)}
                      placeholder="#64748B"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateSettings('accentColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => updateSettings('accentColor', e.target.value)}
                      placeholder="#EF4444"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Configure fonts and text styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="headingFont">Heading Font</Label>
                  <select
                    id="headingFont"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={settings.headingFont}
                    onChange={(e) => updateSettings('headingFont', e.target.value)}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFont">Body Font</Label>
                  <select
                    id="bodyFont"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={settings.bodyFont}
                    onChange={(e) => updateSettings('bodyFont', e.target.value)}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Source Sans Pro">Source Sans Pro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Base Font Size</Label>
                  <select
                    id="fontSize"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings('fontSize', e.target.value)}
                  >
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Your business contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail || ''}
                    onChange={(e) => updateSettings('contactEmail', e.target.value)}
                    placeholder="info@yoursite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone || ''}
                    onChange={(e) => updateSettings('contactPhone', e.target.value)}
                    placeholder="+1-234-567-8900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactAddress">Contact Address</Label>
                <Textarea
                  id="contactAddress"
                  value={settings.contactAddress || ''}
                  onChange={(e) => updateSettings('contactAddress', e.target.value)}
                  placeholder="Your business address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    value={settings.facebookUrl || ''}
                    onChange={(e) => updateSettings('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter URL</Label>
                  <Input
                    id="twitterUrl"
                    value={settings.twitterUrl || ''}
                    onChange={(e) => updateSettings('twitterUrl', e.target.value)}
                    placeholder="https://twitter.com/youraccount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={settings.linkedinUrl || ''}
                    onChange={(e) => updateSettings('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={settings.instagramUrl || ''}
                    onChange={(e) => updateSettings('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/youraccount"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Search engine optimization configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Default Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={settings.metaTitle || ''}
                    onChange={(e) => updateSettings('metaTitle', e.target.value)}
                    placeholder="Your Site - Tagline"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Default Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={settings.metaDescription || ''}
                    onChange={(e) => updateSettings('metaDescription', e.target.value)}
                    placeholder="Description that appears in search results"
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.googleAnalyticsId || ''}
                    onChange={(e) => updateSettings('googleAnalyticsId', e.target.value)}
                    placeholder="GA-XXXXXXXXX-X"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixelId"
                    value={settings.facebookPixelId || ''}
                    onChange={(e) => updateSettings('facebookPixelId', e.target.value)}
                    placeholder="1234567890123456"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}