import { NextAuthLoginForm } from "@/components/auth/nextauth-login-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  // If user is already logged in, redirect them
  if (session?.user) {
    if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
      redirect('/admin')
    } else {
      redirect('/')
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue your learning journey"
      showBackToHome={true}
    >
      <NextAuthLoginForm />
    </AuthLayout>
  )
}
