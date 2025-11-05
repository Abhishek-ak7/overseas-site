"use client"

import { ConsultationForm } from "@/components/forms/consultation-form"
import { GraduationCap, FileText, Plane, MessageCircle } from "lucide-react"

export function ConsultationSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Need Expert Guidance?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get personalized consultation from our experienced counselors.
            We're here to help you navigate your study abroad journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ConsultationForm
            source="homepage_consultation"
            title="Request Free Consultation"
            description="Our expert counselors will analyze your profile and provide personalized guidance for your study abroad journey."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="group text-center bg-gray-50 hover:bg-white rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-primary/20 hover:-translate-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 group-hover:bg-primary/20 rounded-2xl mx-auto mb-6 transition-colors duration-300">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">University Selection</h3>
            <p className="text-gray-600 leading-relaxed">Get personalized university recommendations based on your profile and preferences.</p>
          </div>
          <div className="group text-center bg-gray-50 hover:bg-white rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-primary/20 hover:-translate-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 group-hover:bg-primary/20 rounded-2xl mx-auto mb-6 transition-colors duration-300">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">Document Guidance</h3>
            <p className="text-gray-600 leading-relaxed">Complete assistance with document preparation and application processes.</p>
          </div>
          <div className="group text-center bg-gray-50 hover:bg-white rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-primary/20 hover:-translate-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 group-hover:bg-primary/20 rounded-2xl mx-auto mb-6 transition-colors duration-300">
              <Plane className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">Visa Support</h3>
            <p className="text-gray-600 leading-relaxed">Expert guidance through visa application and interview preparation.</p>
          </div>
        </div>
      </div>
    </section>
  )
}