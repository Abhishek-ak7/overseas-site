import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerificationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Email Verified!</CardTitle>
          <CardDescription>
            Your email has been successfully verified. You can now access all features of your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Welcome to BnOverseas! Your account is now fully activated and ready to use.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Sign In to Your Account
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
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