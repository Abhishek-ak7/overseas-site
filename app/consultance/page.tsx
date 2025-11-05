import { ConsultationForm } from "@/components/forms/consultation-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Users, Globe } from "lucide-react"

export default function ConsultancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Expert Study Abroad Consultation
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Get personalized guidance from experienced counselors who have helped thousands of students achieve their international education dreams.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Form Section */}
          <div>
            <ConsultationForm
              source="consultation_page"
              title="Book Your Free Consultation"
              description="Fill out the form and our expert counselors will contact you within 24 hours to discuss your study abroad plans."
            />
          </div>

          {/* Information Section */}
          <div className="space-y-8">
            {/* Why Choose Us */}
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Our Consultation?</CardTitle>
                <CardDescription>
                  Our experienced team provides comprehensive guidance tailored to your unique goals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Personalized Approach</h4>
                    <p className="text-gray-600">Customized advice based on your academic background, career goals, and preferences.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Expert Counselors</h4>
                    <p className="text-gray-600">Our team has 29+ years of combined experience in international education.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">End-to-End Support</h4>
                    <p className="text-gray-600">From university selection to visa approval, we support you throughout the entire process.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">No Hidden Charges</h4>
                    <p className="text-gray-600">Transparent pricing with no surprise fees. Initial consultation is completely free.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Services */}
            <Card>
              <CardHeader>
                <CardTitle>Our Consultation Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">University Selection</h4>
                    <p className="text-sm text-gray-600 mt-1">Find the best universities that match your profile</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Visa Guidance</h4>
                    <p className="text-sm text-gray-600 mt-1">Complete visa application and interview support</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Document Help</h4>
                    <p className="text-sm text-gray-600 mt-1">Assistance with all required documentation</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Timeline Planning</h4>
                    <p className="text-sm text-gray-600 mt-1">Strategic planning for application deadlines</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Our Track Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary">50,000+</div>
                    <div className="text-sm text-gray-600">Students Guided</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">1,000+</div>
                    <div className="text-sm text-gray-600">Universities</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">29+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}