"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MessageCircle, Send } from "lucide-react"

export function CTASection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    fieldOfInterest: "",
    preferredCountry: "",
    studyLevel: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        fieldOfInterest: "",
        preferredCountry: "",
        studyLevel: "",
        message: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - CTA Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">Confused About Your Options? <span className="text-primary">Let us help you.</span></h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Our expert counselors are here to guide you through every step of your study abroad journey. Get
                personalized advice tailored to your academic goals and career aspirations.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <div className="flex-shrink-0 w-16 h-16 bg-primary/20 hover:bg-primary/30 rounded-2xl flex items-center justify-center transition-colors duration-300">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold mb-1">Call us directly</p>
                  <p className="text-lg text-gray-200">+1-800-123-4567</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <div className="flex-shrink-0 w-16 h-16 bg-primary/20 hover:bg-primary/30 rounded-2xl flex items-center justify-center transition-colors duration-300">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold mb-1">Email us</p>
                  <p className="text-lg text-gray-200">info@bnoverseas.com</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-400 mb-4">
                By submitting this form, you agree to BnOverseas's Terms & Conditions and Privacy Policy. You agree to
                be contacted by BnOverseas via phone, e-mail, or messages.
              </p>
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 text-gray-900 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">Ask Your Question</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Fill out the form and we'll get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name*"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email Address*"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  placeholder="Phone Number*"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
                <Select onValueChange={(value) => handleInputChange("fieldOfInterest", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Field of Interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="business">Business & Management</SelectItem>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="medicine">Medicine & Healthcare</SelectItem>
                    <SelectItem value="arts">Arts & Humanities</SelectItem>
                    <SelectItem value="science">Science & Research</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select onValueChange={(value) => handleInputChange("preferredCountry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Preferred Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="usa">USA</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="australia">Australia</SelectItem>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="new-zealand">New Zealand</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleInputChange("studyLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Preferred Study Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate/Masters</SelectItem>
                    <SelectItem value="phd">PhD/Doctorate</SelectItem>
                    <SelectItem value="diploma">Diploma/Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Your Message (Optional)"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                rows={4}
              />

              {error && (
                <div className="text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-400 text-sm text-center">
                  Thank you! Your enquiry has been sent successfully.
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Enquiry
                    <Send className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
