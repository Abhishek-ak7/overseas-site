"use client"

import { useState } from "react"
import { MessageCircle, X, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg animate-pulse"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Need Help?</h3>
              <p className="text-sm opacity-90">We're here to assist you</p>
            </div>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm" className="text-white hover:bg-red-700">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-center space-y-4">
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-2">How can we help you today?</h4>
              <p className="text-sm text-gray-600 mb-6">Choose your preferred way to connect with us</p>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </Button>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Call Now: +1-800-123-4567</span>
              </Button>

              <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50 bg-transparent">
                Schedule a Callback
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t text-center">
            <p className="text-xs text-gray-500">Available 24/7 for your assistance</p>
          </div>
        </div>
      )}
    </div>
  )
}
