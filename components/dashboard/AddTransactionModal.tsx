"use client";

import { useState, FormEvent, useEffect } from "react";
import { FiX, FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { Wallet } from "@/lib/types";
import CategorySelect from "@/components/dashboard/CategorySelect";
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

const WALLET_COLORS: Record<string, string> = {
  bank: "#3b82f6",
  cash: "#10b981",
  digital: "#8b5cf6",
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
              maxLength={150}
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{title.length} / 150</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Category
            </label>
            <CategorySelect
              type={type}
              value={category}
              onChange={setCategory}
            />
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

          {/* Wallet Selector — always visible, 3-col card grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wallet
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(wallets.length > 0
                ? wallets
                : [
                    { id: "cash-d", name: "Cash", type: "cash" as const, balance: 0, icon: "💵", color: "#10b981", userId: "", createdAt: "" },
                    { id: "bank-d", name: "Bank", type: "bank" as const, balance: 0, icon: "🏦", color: "#3b82f6", userId: "", createdAt: "" },
                    { id: "digital-d", name: "Digital Wallet", type: "digital" as const, balance: 0, icon: "📱", color: "#8b5cf6", userId: "", createdAt: "" },
                  ]
              ).map((w) => {
                const isSelected = wallet === w.name;
                const accentColor = w.color || WALLET_COLORS[w.type] || "#10b981";
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWallet(w.name)}
                    className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all ${
                      isSelected
                        ? "shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: accentColor,
                            backgroundColor: accentColor + "18",
                          }
                        : {}
                    }
                  >
                    <span className="text-2xl leading-none">{w.icon || WALLET_ICONS[w.type]}</span>
                    <span
                      className="text-xs font-semibold leading-tight"
                      style={{ color: isSelected ? accentColor : undefined }}
                    >
                      {w.name}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {CURRENCY_SYMBOL}{w.balance.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </span>
                    {isSelected && (
                      <span
                        className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-white text-[8px]"
                        style={{ backgroundColor: accentColor }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

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
