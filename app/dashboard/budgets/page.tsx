"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Budget, EXPENSE_CATEGORIES } from "@/lib/types";
import { addBudget, getBudgets, deleteBudget } from "@/lib/budgets";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiX, FiAlertTriangle } from "react-icons/fi";
import { TbMoneybag } from "react-icons/tb";
import { CURRENCY_SYMBOL } from "@/lib/currency";

export default function BudgetsPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getBudgets(user.uid);
      setBudgets(data);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteBudget(user.uid, id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      toast.success("Budget deleted");
    } catch {
      toast.error("Failed to delete budget");
    }
  };

  const periodLabel = (p: string) => {
    switch (p) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return p;
    }
  };

  const periodColor = (p: string) => {
    switch (p) {
      case "daily":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "weekly":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "monthly":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Budgets
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Set daily, weekly & monthly spending limits
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Budget
        </button>
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
      ) : budgets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
            <TbMoneybag className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-4 text-base font-medium text-gray-900 dark:text-white">
            No budgets yet
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create your first budget to start tracking spending limits
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const percentage =
              budget.amount > 0
                ? Math.min((budget.spent / budget.amount) * 100, 100)
                : 0;
            const isOver = budget.spent > budget.amount;
            return (
              <div
                key={budget.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {budget.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${periodColor(budget.period)}`}
                      >
                        {periodLabel(budget.period)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {budget.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => budget.id && handleDelete(budget.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {CURRENCY_SYMBOL} {budget.spent.toLocaleString("en-IN")}{" "}
                      spent
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {CURRENCY_SYMBOL} {budget.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        isOver
                          ? "bg-red-500"
                          : percentage > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {isOver && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <FiAlertTriangle className="h-3 w-3" />
                      Over budget by {CURRENCY_SYMBOL}{" "}
                      {(budget.spent - budget.amount).toLocaleString("en-IN")}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {CURRENCY_SYMBOL}{" "}
                    {Math.max(budget.amount - budget.spent, 0).toLocaleString(
                      "en-IN",
                    )}{" "}
                    remaining
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {modalOpen && (
        <AddBudgetModal
          onClose={() => setModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await addBudget({
                ...data,
                userId: user.uid,
                spent: 0,
                createdAt: new Date().toISOString(),
              });
              toast.success("Budget created!");
              await fetchBudgets();
            } catch {
              toast.error("Failed to create budget");
            }
          }}
        />
      )}
    </div>
  );
}

function AddBudgetModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    amount: number;
    period: "daily" | "weekly" | "monthly";
    category: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "monthly",
  );
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    setLoading(true);
    try {
      await onSubmit({ name, amount: parseFloat(amount), period, category });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Budget
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Budget Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Food"
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">
                {CURRENCY_SYMBOL}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-9 pr-4 text-lg font-semibold text-gray-900 placeholder:text-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Period
            </label>
            <div className="flex gap-2">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${period === p ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Budget"}
          </button>
        </form>
      </div>
    </div>
  );
}
