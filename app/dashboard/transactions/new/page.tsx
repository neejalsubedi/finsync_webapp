"use client";
import {Timestamp} from "firebase/firestore";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { addTransaction } from "@/lib/transactions";
import { getWallets } from "@/lib/wallets";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import { Wallet } from "@/lib/types";
import CategorySelect from "@/components/dashboard/CategorySelect";
import toast from "react-hot-toast";

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
const formatToDDMMYYYY = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};
export default function NewTransactionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryType = searchParams.get("type");
  const [type, setType] = useState<"income" | "expense">(
    queryType === "income" ? "income" : "expense",
  );
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [date, setDate] = useState<Timestamp>(
      Timestamp.fromDate(new Date())
  );
  const [wallet, setWallet] = useState("Cash");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queryType === "income" || queryType === "expense") {
      setType(queryType);
    }
  }, [queryType]);

  useEffect(() => {
    setCategory("");
  }, [type]);

  useEffect(() => {
    const fetchWallets = async () => {
      if (!user) return;
      try {
        const data = await getWallets(user.uid);
        setWallets(data);
      } catch (error) {
        console.error("Failed to fetch wallets:", error);
      }
    };

    fetchWallets();
  }, [user]);



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to add transactions");
      return;
    }

    if (!amount || !title || !category || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    if (numericAmount > 1000000) {
      toast.error("Amount cannot exceed 1,000,000");
      return;
    }

    const selectedDate = date.toDate();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      toast.error("Date cannot be in the future");
      return;
    }

    setLoading(true);
    try {
      await addTransaction({
        userId: user.uid,
        type,
        amount: numericAmount,
        title,
        category,
        transactionDescription,
        date: date,
        wallet,
        createdAt: new Date().toISOString(),
      });

      toast.success(`${type === "income" ? "Income" : "Expense"} added!`);
      router.push("/dashboard/transactions");
    } catch {
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <FiArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Transaction
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Record a new income or expense
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="mb-5 flex gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
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
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Monthly Salary"
              required
              maxLength={150}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{title.length} / 150</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <CategorySelect
              type={type}
              value={category}
              onChange={setCategory}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={transactionDescription}
              onChange={(e) => setTransactionDescription(e.target.value)}
              placeholder="e.g., Lunch at restaurant"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          {/* Wallet Selector — 3-col card grid, always visible */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Wallet
            </label>
            <div className="grid grid-cols-3 gap-3">
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
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-4 text-center transition-all ${
                      isSelected
                        ? "shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                    }`}
                    style={
                      isSelected
                        ? { borderColor: accentColor, backgroundColor: accentColor + "18" }
                        : {}
                    }
                  >
                    <span className="text-3xl leading-none">{w.icon || WALLET_ICONS[w.type]}</span>
                    <span
                      className="text-sm font-semibold leading-tight"
                      style={{ color: isSelected ? accentColor : undefined }}
                    >
                      {w.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {CURRENCY_SYMBOL}{w.balance.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </span>
                    {isSelected && (
                      <span
                        className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px] font-bold"
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <input
                type="date"
                value={date.toDate().toISOString().split("T")[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    setDate(
                        Timestamp.fromDate(new Date(e.target.value))
                    );
                  }
                }}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                type === "expense"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading
                ? "Saving..."
                : `Add ${type === "income" ? "Income" : "Expense"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
