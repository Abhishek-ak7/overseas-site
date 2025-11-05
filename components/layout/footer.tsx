'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Phone, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FooterMenu } from "@/components/navigation/main-menu"

interface SiteSettings {
  siteName?: string
  siteDescription?: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  facebookUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
}

interface Country {
  name: string
  slug: string
}

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    try {
      // Fetch site settings
      const settingsResponse = await fetch('/api/settings/site')
      const settingsData = await settingsResponse.json()
      if (settingsData.settings) {
        setSettings(settingsData.settings)
      }

      // Fetch featured countries for study destinations
      const countriesResponse = await fetch('/api/countries?featured=true&limit=6')
      const countriesData = await countriesResponse.json()
      if (countriesData.countries) {
        setCountries(countriesData.countries)
      }

    } catch (error) {
      console.error('Failed to fetch footer data:', error)
      // Set default fallback data
      setSettings({
        siteName: 'BnOverseass',
        siteDescription: 'Your trusted partner for international education.',
        contactPhone: '+1-800-123-4567',
        contactEmail: 'info@bnoverseas.com',
        contactAddress: 'Jalandhar, Punjab, India',
      })
    } finally {
      setLoading(false)
    }
  }

  const getSocialLinks = () => [
    { href: settings.facebookUrl, icon: Facebook, name: 'Facebook' },
    { href: settings.twitterUrl, icon: Twitter, name: 'Twitter' },
    { href: settings.instagramUrl, icon: Instagram, name: 'Instagram' },
    { href: settings.linkedinUrl, icon: Linkedin, name: 'LinkedIn' },
    { href: settings.youtubeUrl, icon: Youtube, name: 'YouTube' },
  ].filter(link => link.href)

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="text-3xl font-bold text-primary">
              {settings.siteName || 'BnOverseas'}
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              {settings.siteDescription || 'Your trusted partner for international education. We help students achieve their dreams of studying abroad with comprehensive guidance and support.'}
            </p>
            {getSocialLinks().length > 0 && (
              <div className="flex space-x-4">
                {getSocialLinks().map(({ href, icon: Icon, name }) => (
                  <Link
                    key={name}
                    href={href!}
                    className="w-12 h-12 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    aria-label={name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-6 w-6" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Footer Menu */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Quick Links</h3>
            <div className="text-lg">
              <FooterMenu className="space-y-4 text-gray-300 [&_a:hover]:text-primary [&_a]:transition-colors [&_a]:duration-300" />
            </div>
          </div>

          {/* Study Destinations */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Study Destinations</h3>
            <ul className="space-y-4 text-lg">
                  <li>
                    <Link href="/destinations/canada" className="text-gray-300 hover:text-primary transition-colors duration-300">
                      Study in Canada
                    </Link>
                  </li>
                  <li>
                    <Link href="/destinations/usa" className="text-gray-300 hover:text-primary transition-colors duration-300">
                      Study in USA
                    </Link>
                  </li>
                  <li>
                    <Link href="/destinations/uk" className="text-gray-300 hover:text-primary transition-colors duration-300">
                      Study in UK
                    </Link>
                  </li>
                  <li>
                    <Link href="/destinations/australia" className="text-gray-300 hover:text-primary transition-colors duration-300">
                      Study in Australia
                    </Link>
                  </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Get In Touch</h3>
            <div className="space-y-4 text-lg">
              {settings.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-gray-300">{settings.contactPhone}</span>
                </div>
              )}
              {settings.contactEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-gray-300">{settings.contactEmail}</span>
                </div>
              )}
              {settings.contactAddress && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-gray-300">{settings.contactAddress}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold">Newsletter</h4>
              <p className="text-gray-400">Subscribe for updates and study abroad tips</p>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 rounded-xl"
                />
                <Button className="bg-primary hover:bg-primary/90 rounded-xl px-6 font-semibold">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-lg text-gray-400">
            <div>© {new Date().getFullYear()} {settings.siteName || 'BnOverseas'}. All rights reserved.</div>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-primary transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors duration-300">
                Terms & Conditions
              </Link>
              <Link href="/sitemap" className="hover:text-primary transition-colors duration-300">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
