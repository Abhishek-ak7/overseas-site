import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function ViewAllServices() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <Link
          href="/services"
          className="inline-flex items-center text-red-600 hover:text-red-700 font-semibold text-lg group"
        >
          View All Services
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
