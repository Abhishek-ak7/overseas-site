import { BookingForm } from "@/components/appointments/booking-form"
import { BookingSidebar } from "@/components/appointments/booking-sidebar"

export default function BookAppointmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Your Consultation</h1>
          <p className="text-gray-600 mt-2">Fill in your details and preferences to schedule your appointment.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BookingForm />
          </div>
          <div>
            <BookingSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
