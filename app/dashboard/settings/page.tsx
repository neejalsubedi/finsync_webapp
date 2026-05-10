"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiShield, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateName = async () => {
    if (!user || !displayName.trim()) return;

    if (displayName.trim().length > 50) {
      toast.error("Display name cannot be longer than 50 characters");
      return;
    }

    if (!/^[a-zA-Z]/.test(displayName.trim())) {
      toast.error("Display name must start with a letter");
      return;
    }

    setSavingName(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      toast.success("Name updated!");
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Password changed!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (
        msg.includes("wrong-password") ||
        msg.includes("invalid-credential")
      ) {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out");
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <FiUser className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile
          </h2>
        </div>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              {user.displayName?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {user.displayName || "User"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 px-4 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={handleUpdateName}
                disabled={savingName || displayName === user.displayName}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingName ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 dark:border-gray-700 dark:bg-gray-800/50">
              <FiMail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <FiShield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Security
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={
              savingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-gray-900">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
            <FiLogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Sign out of your FinSync account on this device.
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <FiLogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
