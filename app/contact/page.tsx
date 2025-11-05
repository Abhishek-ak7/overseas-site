import { ContactFormSection } from "@/components/sections/contact-form-section"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | BnOverseas",
  description: "Get in touch with our expert counselors for personalized guidance on your international education journey.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <ContactFormSection />
    </div>
  )
}