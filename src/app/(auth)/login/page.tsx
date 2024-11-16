// src/app/(auth)/login/page.tsx
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <LoginForm />
    </div>
  )
}