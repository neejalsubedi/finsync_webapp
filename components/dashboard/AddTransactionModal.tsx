"use client";

import { useState, FormEvent, useEffect } from "react";
import { FiX, FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, Wallet } from "@/lib/types";
import { CURRENCY_SYMBOL } from "@/lib/currency";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: "income" | "expense";
    amount: number;
    title: string;
    category: string;
    transactionDescription: string;
    date: string;
    wallet: string;
  }) => Promise<void>;
  defaultType?: "income" | "expense";
  wallets?: Wallet[];
}

const WALLET_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  digital: "📱",
};

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  defaultType = "expense",
  wallets = [],
}: AddTransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [wallet, setWallet] = useState("Cash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  useEffect(() => {
    setCategory("");
  }, [type]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !title || !category || !date) return;
    setLoading(true);
    try {
      await onSubmit({
        type,
        amount: parseFloat(amount),
        title,
        category,
        transactionDescription,
        date,
        wallet,
      });
      // Reset form
      setAmount("");
      setTitle("");
      setCategory("");
      setTransactionDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setWallet("Cash");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === "expense"
                ? "bg-red-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <FiArrowUpRight className="h-4 w-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === "income"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <FiArrowDownLeft className="h-4 w-4" />
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
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
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-9 pr-4 text-lg font-semibold text-gray-900 placeholder:text-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Monthly Salary"
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={transactionDescription}
              onChange={(e) => setTransactionDescription(e.target.value)}
              placeholder="e.g., Lunch at restaurant"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          {/* Wallet */}
          {wallets.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Wallet <span className="text-gray-400">(optional)</span>
              </label>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="Cash">Cash</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.name}>
                    {WALLET_ICONS[w.type] || "💰"} {w.name} ({CURRENCY_SYMBOL}{" "}
                    {w.balance.toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-3 text-base font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              type === "expense"
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
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
                Adding...
              </span>
            ) : (
              `Add ${type === "income" ? "Income" : "Expense"}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
