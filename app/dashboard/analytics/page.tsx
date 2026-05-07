"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/lib/types";
import { getTransactions } from "@/lib/transactions";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import { CURRENCY_SYMBOL } from "@/lib/currency";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTransactions(user.uid);
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = t.date.toDate();
      if (period === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      } else if (period === "month") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      } else {
        return d.getFullYear() === now.getFullYear();
      }
    });
  }, [transactions, period]);

  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // Category breakdown for expenses
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: totalExpense > 0 ? (amt / totalExpense) * 100 : 0,
      }));
  }, [filtered, totalExpense]);

  // Category breakdown for income
  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered
      .filter((t) => t.type === "income")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: totalIncome > 0 ? (amt / totalIncome) * 100 : 0,
      }));
  }, [filtered, totalIncome]);

  // Daily spending for last 7 days
  const dailySpending = useMemo(() => {
    const days: { label: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayTotal = transactions
          .filter((t) => {
            const d = t.date.toDate().toISOString().split("T")[0];
            return t.type === "expense" && d === dateStr;
          })
        .reduce((s, t) => s + t.amount, 0);
      days.push({
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        amount: dayTotal,
      });
    }
    return days;
  }, [transactions]);

  const maxDaily = Math.max(...dailySpending.map((d) => d.amount), 1);

  const catColors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-red-500",
    "bg-cyan-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-lime-500",
    "bg-rose-500",
  ];

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Visualize your spending habits
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {(["week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                period === p
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {p === "week"
                ? "This Week"
                : p === "month"
                  ? "This Month"
                  : "This Year"}
            </button>
          ))}
        </div>
      </div>

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
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <FiTrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Income
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {"+"}
                {CURRENCY_SYMBOL}{" "}
                {totalIncome.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {filtered.filter((t) => t.type === "income").length}{" "}
                transactions
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                  <FiTrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Expenses
                </span>
              </div>
              <p className="text-2xl font-bold text-red-500 dark:text-red-400">
                {"-"}
                {CURRENCY_SYMBOL}{" "}
                {totalExpense.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {filtered.filter((t) => t.type === "expense").length}{" "}
                transactions
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <FiDollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Net Savings
                </span>
              </div>
              <p
                className={`text-2xl font-bold ${netSavings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
              >
                {netSavings >= 0 ? "+" : ""}
                {CURRENCY_SYMBOL}{" "}
                {netSavings.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {netSavings >= 0
                  ? "You&apos;re saving!"
                  : "Spending more than earning"}
              </p>
            </div>
          </div>

          {/* Daily Spending Bar Chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-4">
              <FiCalendar className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daily Spending (Last 7 Days)
              </h2>
            </div>
            <div className="flex items-end gap-3 h-40">
              {dailySpending.map((day, i) => (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {CURRENCY_SYMBOL}{" "}
                    {day.amount > 0 ? day.amount.toLocaleString("en-IN") : "0"}
                  </span>
                  <div
                    className="w-full flex items-end"
                    style={{ height: "100px" }}
                  >
                    <div
                      className="w-full rounded-t-lg bg-emerald-500 dark:bg-emerald-600 transition-all"
                      style={{
                        height: `${day.amount > 0 ? (day.amount / maxDaily) * 100 : 4}%`,
                        minHeight: "4px",
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Expense Breakdown */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-4">
                <FiArrowUpRight className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Expense Breakdown
                </h2>
              </div>
              {expenseByCategory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                  No expenses in this period
                </p>
              ) : (
                <div className="space-y-3">
                  {expenseByCategory.map((cat, i) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">
                          {cat.category}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {CURRENCY_SYMBOL} {cat.amount.toLocaleString("en-IN")}{" "}
                          ({cat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-2 rounded-full ${catColors[i % catColors.length]}`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Income Breakdown */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-4">
                <FiArrowDownLeft className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Income Breakdown
                </h2>
              </div>
              {incomeByCategory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                  No income in this period
                </p>
              ) : (
                <div className="space-y-3">
                  {incomeByCategory.map((cat, i) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">
                          {cat.category}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {CURRENCY_SYMBOL} {cat.amount.toLocaleString("en-IN")}{" "}
                          ({cat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-2 rounded-full ${catColors[i % catColors.length]}`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Transactions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Expenses
            </h2>
            {filtered.filter((t) => t.type === "expense").length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                No expenses in this period
              </p>
            ) : (
              <div className="space-y-2">
                {filtered
                  .filter((t) => t.type === "expense")
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((tx, i) => (
                    <div
                      key={tx.id || i}
                      className="flex items-center gap-4 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {tx.title || tx.category}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {tx.category}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-red-500">
                        {"-"}
                        {CURRENCY_SYMBOL} {tx.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
