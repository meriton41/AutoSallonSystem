"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import axios from "axios";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { login, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }
    setLoading(true);
    try {
      const url = "https://localhost:7234/api/Account/register";
      const data = {
        userName: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      };
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token || ""}`,
      };
      const response = await axios.post(url, data, { headers });
      router.push("/verify-email/notice");
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
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
      {error && (
        <p className="text-sm text-red-600 text-center font-medium bg-red-50 dark:bg-red-900 rounded p-2">{error}</p>
      )}
      <div>
        <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
          Name
        </label>
        <input
          id="firstName"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-3 text-base bg-gray-50 dark:bg-zinc-800 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 transition"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-3 text-base bg-gray-50 dark:bg-zinc-800 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 transition"
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
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-3 text-base bg-gray-50 dark:bg-zinc-800 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 transition"
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
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-3 text-base bg-gray-50 dark:bg-zinc-800 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 transition"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary"
            tabIndex={-1}
            onClick={() => setShowConfirm((v) => !v)}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input
          id="terms"
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          required
          className="accent-primary w-4 h-4 rounded border border-gray-300 dark:border-zinc-700"
        />
        <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-200">
          I agree to the {" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and {" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </label>
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-black px-4 py-3 text-base font-bold text-white hover:bg-zinc-800 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}
