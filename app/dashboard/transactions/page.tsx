"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiTrash2,
  FiArrowLeft,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { getTransactions, deleteTransaction } from "@/lib/transactions";
import { Transaction } from "@/lib/types";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import toast from "react-hot-toast";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTransactions(user.uid);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteTransaction(id, user.uid);
      toast.success("Transaction deleted");
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  // Filter & search
  const filtered = transactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (tx.title || "").toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.transactionDescription || "").toLowerCase().includes(q) ||
        tx.amount.toString().includes(q)
      );
    }
    return true;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const dateKey = tx.date.toDate().toISOString().split("T")[0];

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);

    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <FiArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {transactions.length} total
          </p>
        </div>
        <Link
          href="/dashboard/transactions/new"
          className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Add
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by category, description, or amount..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? f === "income"
                    ? "bg-green-500 text-white shadow-sm"
                    : f === "expense"
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {f === "all" && <FiFilter className="h-3.5 w-3.5" />}
              {f === "income" && <FiArrowDownLeft className="h-3.5 w-3.5" />}
              {f === "expense" && <FiArrowUpRight className="h-3.5 w-3.5" />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      {loading ? (
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
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {search || filter !== "all"
              ? "No matching transactions"
              : "No transactions yet"}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || filter !== "all"
              ? "Try adjusting your filters"
              : "Add your first transaction to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              {/* Date Header */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {new Date(dateKey).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div className="space-y-2">
                {grouped[dateKey].map((tx) => (
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
                        {tx.category}
                        {tx.wallet && tx.wallet !== "Cash" ? ` · ${tx.wallet}` : ""}
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
                      {CURRENCY_SYMBOL}{" "}
                      {tx.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </p>

                    {/* Delete */}
                    <button
                      onClick={() => tx.id && handleDelete(tx.id)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
