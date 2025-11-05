import { HeroSection } from "@/components/sections/hero-section"
import { DestinationsSection } from "@/components/sections/destinations-section"
import { StatsSection } from "@/components/sections/stats-section"
import { WhyChooseSection } from "@/components/sections/why-choose-section"
import { ServicesSection } from "@/components/sections/services-section"
import { ConsultationSection } from "@/components/sections/consultation-section"
import { JourneySection } from "@/components/sections/journey-section"
import { UniversitiesSection } from "@/components/sections/universities-section"
import { ProgramsSection } from "@/components/sections/programs-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { NewsSection } from "@/components/sections/news-section"
import { EventsSection } from "@/components/sections/events-section"
import { PartnersSection } from "@/components/sections/partners-section"
import { ContactFormSection } from "@/components/sections/contact-form-section"
import { ChatWidget } from "@/components/ui/chat-widget"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <DestinationsSection />
      <StatsSection />
      <WhyChooseSection />
      <ServicesSection />
      <ConsultationSection />
      <JourneySection />
      <UniversitiesSection />
      <ProgramsSection />
      <TestimonialsSection />
      <NewsSection />
      <EventsSection />
      <PartnersSection />
      <ContactFormSection />
      <ChatWidget />
    </div>
  )
}
