"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HelpCircle, Settings } from "lucide-react"

interface TestSidebarProps {
  test: any
}

export function TestSidebar({ test }: TestSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
      {/* Test Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{test.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Test Type:</span>
            <Badge variant="outline">{test.type}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duration:</span>
            <span className="text-sm font-semibold">{test.duration} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sections:</span>
            <span className="text-sm font-semibold">{test.sections.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Test Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {test.sections.map((section: any, index: number) => (
            <div key={section.id}>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-900">{section.name}</div>
                  <div className="text-sm text-gray-600">{section.questions} questions</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{section.duration} min</div>
                  <Badge variant="outline" className="text-xs">
                    Not Started
                  </Badge>
                </div>
              </div>
              {index < test.sections.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>• Read all questions carefully before answering</p>
          <p>• You can flag questions for review later</p>
          <p>• Use the navigation panel to jump between questions</p>
          <p>• Submit your test before time runs out</p>
          <p>• You cannot return to previous sections once completed</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <Settings className="h-4 w-4 mr-2" />
          Test Settings
        </Button>
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help & Support
        </Button>
      </div>
    </div>
  )
}
