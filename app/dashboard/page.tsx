"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiPlus,
  FiPieChart,
  FiTarget,
  FiCreditCard,
  FiUsers,
  FiTrash2,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
} from "react-icons/fi";
import { TbMoneybag } from "react-icons/tb";
import { getRecentTransactions, deleteTransaction } from "@/lib/transactions";
import { getUserData, UserData } from "@/lib/users";
import { Transaction } from "@/lib/types";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import toast from "react-hot-toast";
import { Timestamp } from "firebase/firestore";
import {parseDate} from "@/lib/dateHelper";


export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingTx, setLoadingTx] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getRecentTransactions(user.uid, 5);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoadingTx(false);
    }
  }, [user]);

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserData(user.uid);
      setUserData(data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
    fetchUserData();
  }, [fetchTransactions, fetchUserData]);

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteTransaction(id, user.uid);
      toast.success("Transaction deleted");
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      await fetchUserData();
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  // Read totals from Users document (synced by addTransaction/deleteTransaction)
  const totalIncome = userData?.income ?? 0;
  const totalExpense = userData?.expense ?? 0;
  const balance = userData?.totalBalance ?? 0;

  // Feature buttons
  const features = [
    {
      label: "Budgets",
      icon: TbMoneybag,
      href: "/dashboard/budgets",
      color: "bg-amber-500",
    },
    {
      label: "Analytics",
      icon: FiPieChart,
      href: "/dashboard/analytics",
      color: "bg-blue-500",
    },
    {
      label: "Goals",
      icon: FiTarget,
      href: "/dashboard/goals",
      color: "bg-purple-500",
    },
    {
      label: "Wallets",
      icon: FiCreditCard,
      href: "/dashboard/wallets",
      color: "bg-cyan-500",
    },
    {
      label: "IOUs",
      icon: FiUsers,
      href: "/dashboard/ious",
      color: "bg-orange-500",
    },
  ];

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back{user.displayName ? `, ${user.displayName}` : ""}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s your financial overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Balance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <FiDollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Balance
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${balance >= 0 ? "text-gray-900 dark:text-white" : "text-red-500"}`}
          >
            {CURRENCY_SYMBOL}{" "}
            {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Income */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <FiTrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Income
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            +{CURRENCY_SYMBOL}
            {totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Expenses */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <FiTrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Expenses
            </span>
          </div>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400">
            -{CURRENCY_SYMBOL}
            {totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Add Income / Expense Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/transactions/new?type=income"
          className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-5 text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
            <FiPlus className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-base font-semibold">Add Income</p>
            <p className="text-xs opacity-70">Record money received</p>
          </div>
        </Link>

        <Link
          href="/dashboard/transactions/new?type=expense"
          className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-red-300 bg-red-50 p-5 text-red-700 transition-all hover:border-red-400 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
            <FiPlus className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-base font-semibold">Add Expense</p>
            <p className="text-xs opacity-70">Record money spent</p>
          </div>
        </Link>
      </div>

      {/* Quick Access Features */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {features.map((feature) => (
            <Link
              key={feature.label}
              href={feature.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} text-white`}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {feature.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
          {transactions.length > 0 && (
            <Link
              href="/dashboard/transactions"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              View All →
            </Link>
          )}
        </div>

        {loadingTx ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <svg
              className="mx-auto h-6 w-6 animate-spin text-emerald-600"
              viewBox="0 0 24 24"
            >
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
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <FiDollarSign className="h-7 w-7 text-gray-400" />
            </div>
            <p className="mt-4 text-base font-medium text-gray-900 dark:text-white">
              No transactions yet
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start by adding your first income or expense above
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    tx.type === "income"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {tx.type === "income" ? (
                    <FiArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <FiArrowUpRight className="h-5 w-5 text-red-500 dark:text-red-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {tx.title || tx.category}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {tx.category} ·{" "}
                    {parseDate(tx.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Amount */}
                <p
                  className={`text-sm font-bold whitespace-nowrap ${
                    tx.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {CURRENCY_SYMBOL}
                  {tx.amount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </p>

                {/* Delete */}
                <button
                  onClick={() => tx.id && handleDeleteTransaction(tx.id)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  title="Delete"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
