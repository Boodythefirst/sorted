// src/app/(auth)/register/page.tsx
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <RegisterForm />
    </div>
  )
}