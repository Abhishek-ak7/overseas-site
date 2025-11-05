"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react"
import Image from "next/image"

export function ContactFormSection() {
  const [formData, setFormData] = useState({
    question: "",
    interest: "",
    country: "",
    intake: "",
    name: "",
    email: "",
    mobile: "",
    termsAccepted: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        // Handle success
        alert('Thank you! We will contact you soon.')
        setFormData({
          question: "",
          interest: "",
          country: "",
          intake: "",
          name: "",
          email: "",
          mobile: "",
          termsAccepted: false,
        })
      }
    } catch (error) {
      console.error('Failed to submit form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Content & Info */}
          <div>
            {/* Header */}
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Confused About Your Options?
                <span className="text-primary block">Let us help you.</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Get personalized guidance from our expert counselors and take the first step
                towards your international education journey.
              </p>
            </div>

            {/* Visual Element */}
            <div className="relative h-80 rounded-3xl overflow-hidden mb-12 group">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                alt="Students getting consultation"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-gray-900/50 to-gray-900/90" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-2">Expert Guidance Available</p>
                    <p className="text-lg text-gray-200">24/7 counselor support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid gap-8">
              <div className="group flex items-start gap-6 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <div className="w-16 h-16 bg-primary/20 group-hover:bg-primary/30 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-white">Call Us</h4>
                  <p className="text-lg text-gray-200 mb-1">+1 (555) 123-4567</p>
                  <p className="text-lg text-gray-200">+91 98765 43210</p>
                </div>
              </div>

              <div className="group flex items-start gap-6 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <div className="w-16 h-16 bg-primary/20 group-hover:bg-primary/30 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-white">Email Us</h4>
                  <p className="text-lg text-gray-200 mb-1">info@bnoverseas.com</p>
                  <p className="text-lg text-gray-200">support@bnoverseas.com</p>
                </div>
              </div>

              <div className="group flex items-start gap-6 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <div className="w-16 h-16 bg-primary/20 group-hover:bg-primary/30 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-white">Office Hours</h4>
                  <p className="text-lg text-gray-200 mb-1">Monday - Friday: 9:00 AM - 7:00 PM</p>
                  <p className="text-lg text-gray-200">Saturday: 10:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 text-gray-900 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">Send us a Message</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Ask Your Question
                </label>
                <Textarea
                  placeholder="Tell us about your study abroad goals and any specific questions you have..."
                  className="min-h-[100px] resize-none"
                  rows={4}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Field of Interest
                  </label>
                  <Select
                    value={formData.interest}
                    onValueChange={(value) => setFormData({ ...formData, interest: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="business">Business & Management</SelectItem>
                      <SelectItem value="medicine">Medicine & Health</SelectItem>
                      <SelectItem value="arts">Arts & Humanities</SelectItem>
                      <SelectItem value="science">Science & Technology</SelectItem>
                      <SelectItem value="law">Law</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Study Level
                  </label>
                  <Select 
                    value={formData.intake} 
                    onValueChange={(value) => setFormData({ ...formData, intake: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="postgraduate">Postgraduate</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Preferred Country *
                </label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="usa">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="australia">Australia</SelectItem>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="new-zealand">New Zealand</SelectItem>
                    <SelectItem value="ireland">Ireland</SelectItem>
                    <SelectItem value="singapore">Singapore</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Full Name *
                </label>
                <Input
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, termsAccepted: checked as boolean })
                  }
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to BN Overseas{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  . I consent to being contacted by BN Overseas representatives via phone, email, or messages.
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !formData.termsAccepted}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-600 text-lg mb-4">
                Are you an institute looking for partnership?
              </p>
              <a
                href="/partnership"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-lg font-semibold transition-colors group"
              >
                Send Partnership Enquiry
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}