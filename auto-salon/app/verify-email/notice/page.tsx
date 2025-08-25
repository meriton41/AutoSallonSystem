"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyNotice() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 60000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">📩 Check Your Email</h1>
      <p className="text-lg text-center max-w-md">
        We've sent a verification link to your email. Please click the link in
        your inbox to verify your account before logging in.
      </p>
      <p className="mt-4 text-center text-sm text-gray-500">
        You will be redirected to the homepage shortly...
      </p>
    </div>
  );
}
