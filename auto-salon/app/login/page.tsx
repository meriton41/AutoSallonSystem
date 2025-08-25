import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "../../components/login-form";

export const metadata: Metadata = {
  title: "Login | Nitron",
  description: "Login to your Nitron account",
};

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Please enter your credentials to access your account.
          </p>
        </div>

        <LoginForm />

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
