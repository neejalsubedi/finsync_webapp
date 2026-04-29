"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { FiDollarSign } from "react-icons/fi";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white flex-col justify-between p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <FiDollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FinSync</span>
          </Link>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Take control of your <br />
            <span className="text-emerald-200">finances</span>
          </h1>
          <p className="text-lg text-emerald-100/80 max-w-md">
            Track expenses, manage budgets, and achieve your financial goals —
            all in one place.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-emerald-200">Free to use</p>
            </div>
            <div>
              <p className="text-3xl font-bold">256-bit</p>
              <p className="text-sm text-emerald-200">Encryption</p>
            </div>
            <div>
              <p className="text-3xl font-bold">Real-time</p>
              <p className="text-sm text-emerald-200">Sync</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-emerald-200/60">
          © {new Date().getFullYear()} FinSync. All rights reserved.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
              <FiDollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              FinSync
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
