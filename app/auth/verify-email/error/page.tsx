import { XCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerificationErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Verification Failed</CardTitle>
          <CardDescription>
            We couldn't verify your email address. The verification link may be invalid or expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              This could happen if:
            </p>
            <ul className="text-xs text-gray-500 text-left space-y-1">
              <li>• The verification link has expired</li>
              <li>• The link has already been used</li>
              <li>• The email is already verified</li>
            </ul>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/resend-verification">
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Verification Email
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/login">
                Try Signing In
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/">
                Back to Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}