import { NextAuthRegisterForm } from "@/components/auth/nextauth-register-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
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
      title="Create Your Account"
      subtitle="Join thousands of students achieving their study abroad dreams"
      showBackToHome={true}
    >
      <NextAuthRegisterForm />
    </AuthLayout>
  )
}
