"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      if (message.includes("email-not-verified")) {
        toast.error("Please verify your email address to sign in.");
      } else if (
        message.includes("user-not-found") ||
        message.includes("invalid-credential")
      ) {
        toast.error("Invalid email or password");
      } else if (message.includes("too-many-requests")) {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to sign in with Google";
      if (!message.includes("popup-closed-by-user")) {
        toast.error("Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your FinSync account">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <FiEyeOff className="h-5 w-5" />
              ) : (
                <FiEye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="mt-6 flex items-center justify-center">
        <div className="h-px w-full bg-gray-200 dark:bg-gray-800"></div>
        <span className="bg-gray-50 px-4 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">
          OR
        </span>
        <div className="h-px w-full bg-gray-200 dark:bg-gray-800"></div>
      </div>

      {/* Google Sign In */}
      <div className="mt-6">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <FcGoogle className="h-5 w-5" />
          Sign in with Google
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
