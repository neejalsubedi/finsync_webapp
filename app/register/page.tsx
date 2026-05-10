"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import toast from "react-hot-toast";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiPhone,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+977");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (name.length > 50) {
      toast.error("Name cannot be longer than 50 characters");
      return;
    }

    if (!/^[a-zA-Z]/.test(name)) {
      toast.error("Name must start with a letter");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[0-9\W_]/.test(password)) {
      toast.error("Password must contain at least one number or symbol");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone ? `${countryCode}${phone}` : "";
      await register(email, password, name, fullPhone);
      toast.success("Account created successfully! Please verify your email to login.");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create account";
      if (message.includes("email-already-in-use")) {
        toast.error("An account with this email already exists");
      } else if (message.includes("weak-password")) {
        toast.error("Password is too weak. Use at least 6 characters.");
      } else if (message.includes("invalid-email")) {
        toast.error("Please enter a valid email address");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success("Signed in successfully!");
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
    <AuthLayout
      title="Create account"
      subtitle="Start tracking your finances with FinSync"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Full name
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
        </div>

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

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Phone number <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative flex">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center z-10">
              <FiPhone className="h-5 w-5 text-gray-400 mr-1" />
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-transparent border-none text-gray-900 dark:text-white focus:ring-0 text-base py-0 pl-1 pr-2 cursor-pointer outline-none"
                style={{ WebkitAppearance: 'none', appearance: 'none' }}
              >
                <option className="text-gray-900 bg-white dark:bg-gray-900 dark:text-white" value="+977">+977 (NP)</option>
                <option className="text-gray-900 bg-white dark:bg-gray-900 dark:text-white" value="+1">+1 (US)</option>
                <option className="text-gray-900 bg-white dark:bg-gray-900 dark:text-white" value="+44">+44 (UK)</option>
                <option className="text-gray-900 bg-white dark:bg-gray-900 dark:text-white" value="+91">+91 (IN)</option>
                <option className="text-gray-900 bg-white dark:bg-gray-900 dark:text-white" value="+61">+61 (AU)</option>
              </select>
            </div>
            <input
              id="phone"
              type="tel"
              value={phone}
              maxLength={15}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 15) setPhone(val);
              }}
              placeholder="98XXXXXXXX"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-[145px] pr-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 chars, 1 uppercase, 1 number/symbol"
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

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Confirm password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            />
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
              Creating account...
            </span>
          ) : (
            "Create account"
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
          Sign up with Google
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
