import type { Metadata } from "next"
import Link from "next/link"
import RegisterForm from "@/components/register-form"

export const metadata: Metadata = {
  title: "Register | Nitron",
  description: "Create a new account at Nitron",
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground mt-2">
            Join Nitron to save your favorite vehicles and get personalized recommendations.
          </p>
        </div>

        <RegisterForm />

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

