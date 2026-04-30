"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LandingPage from "./landing/page";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // Show a spinner while we check auth; then show landing for guests
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <svg className="h-8 w-8 animate-spin text-emerald-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Authenticated users are being redirected above; render landing for everyone else
  if (user) return null;

  return <LandingPage />;
}
