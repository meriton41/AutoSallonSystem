"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      if (err.message) {
        if (err.message.includes("Please verify your email")) {
          setError(
            "Your email is not verified. Please check your inbox for the verification link."
          );
        } else if (err.message.includes("Invalid email/password")) {
          setError("Incorrect email or password. Please try again.");
        } else if (err.message.includes("User not found")) {
          setError("No account found with this email. Please register first.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 shadow-lg rounded-xl p-8 space-y-6 border border-gray-200 dark:border-zinc-800"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-3 text-base bg-gray-50 dark:bg-zinc-800 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 transition"
          disabled={loading}
          placeholder="you@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-3 text-base bg-gray-50 dark:bg-zinc-800 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 transition"
            disabled={loading}
            placeholder="********"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 text-center font-medium bg-red-50 dark:bg-red-900 rounded p-2">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black px-4 py-3 text-base font-bold text-white hover:bg-zinc-800 transition disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
