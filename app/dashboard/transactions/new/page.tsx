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
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Wallet } from "@/lib/types";
import toast from "react-hot-toast";

const WALLET_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  digital: "📱",
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

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

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

    setLoading(true);
    try {
      await addTransaction({
        userId: user.uid,
        type,
        amount: parseFloat(amount),
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
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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

          {wallets.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Wallet <span className="text-gray-400">(optional)</span>
              </label>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
