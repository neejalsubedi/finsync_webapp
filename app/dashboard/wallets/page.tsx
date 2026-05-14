"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, WALLET_COLORS } from "@/lib/types";
import {
  addWallet,
  getWallets,
  deleteWallet,
  updateWallet,
  recalculateWalletBalances,
} from "@/lib/wallets";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiTrash2,
  FiX,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";
import { CURRENCY_SYMBOL } from "@/lib/currency";

const WALLET_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  digital: "📱",
};

const DEFAULT_WALLETS: Array<{
  name: string;
  type: "bank" | "cash" | "digital";
  balance: number;
  icon: string;
  color: string;
}> = [
  { name: "Cash", type: "cash", balance: 0, icon: "💵", color: "#10b981" },
  { name: "Bank", type: "bank", balance: 0, icon: "🏦", color: "#3b82f6" },
  { name: "Digital Wallet", type: "digital", balance: 0, icon: "📱", color: "#8b5cf6" },
];

export default function WalletsPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");

  const fetchWallets = useCallback(async () => {
    if (!user) return;
    try {
      let data = await getWallets(user.uid);
      if (data.length === 0) {
        // Seed the 3 default wallets for new users
        for (const w of DEFAULT_WALLETS) {
          await addWallet({
            ...w,
            userId: user.uid,
            createdAt: new Date().toISOString(),
          });
        }
      }
      // Always recalculate balances from transaction history on load
      await recalculateWalletBalances(user.uid);
      data = await getWallets(user.uid);
      setWallets(data);
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleDelete = async (id: string) => {
    try {
      await deleteWallet(id);
      setWallets((prev) => prev.filter((w) => w.id !== id));
      toast.success("Wallet deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateBalance = async (id: string) => {
    const val = parseFloat(editBalance);
    if (isNaN(val) || val <= 0) {
      toast.error("Balance must be greater than 0");
      return;
    }
    if (val > 1000000) {
      toast.error("Balance cannot exceed 1,000,000");
      return;
    }
    try {
      await updateWallet(id, { balance: val });
      setWallets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, balance: val } : w)),
      );
      toast.success("Balance updated");
      setEditId(null);
      setEditBalance("");
    } catch {
      toast.error("Failed to update");
    }
  };

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Wallets
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your bank, cash & digital wallets
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <FiPlus className="h-4 w-4" /> Add Wallet
        </button>
      </div>

      {/* Total Balance */}
      {wallets.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
          <p className="text-sm font-medium text-emerald-100">Total Balance</p>
          <p className="text-3xl font-bold mt-1">
            {CURRENCY_SYMBOL}{" "}
            {totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-emerald-200 mt-1">
            {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

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
      ) : wallets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 dark:bg-cyan-900/30">
            <FiCreditCard className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="mt-4 text-base font-medium text-gray-900 dark:text-white">
            No wallets yet
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add your first wallet to track your money across accounts
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] opacity-10"
                style={{ backgroundColor: wallet.color }}
              />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {wallet.icon || WALLET_ICONS[wallet.type]}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {wallet.name}
                    </h3>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                      style={{
                        backgroundColor: wallet.color + "20",
                        color: wallet.color,
                      }}
                    >
                      {wallet.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => wallet.id && handleDelete(wallet.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>

              {editId === wallet.id ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      {CURRENCY_SYMBOL}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => wallet.id && handleUpdateBalance(wallet.id)}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditId(null);
                      setEditBalance("");
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setEditId(wallet.id!);
                    setEditBalance(wallet.balance.toString());
                  }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <FiDollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Balance (tap to edit)
                    </span>
                  </div>
                  <p
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                    style={{ color: wallet.color }}
                  >
                    {CURRENCY_SYMBOL}{" "}
                    {wallet.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddWalletModal
          onClose={() => setModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await addWallet({
                ...data,
                userId: user.uid,
                createdAt: new Date().toISOString(),
              });
              toast.success("Wallet added!");
              await fetchWallets();
            } catch {
              toast.error("Failed to add wallet");
            }
          }}
        />
      )}
    </div>
  );
}

function AddWalletModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (d: {
    name: string;
    type: "bank" | "cash" | "digital";
    balance: number;
    icon: string;
    color: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"bank" | "cash" | "digital">("bank");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState<string>(WALLET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const numericBalance = parseFloat(balance);
    if (isNaN(numericBalance) || numericBalance <= 0) {
      toast.error("Balance must be greater than 0");
      return;
    }
    if (numericBalance > 1000000) {
      toast.error("Balance cannot exceed 1,000,000");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name,
        type,
        balance: numericBalance,
        icon: WALLET_ICONS[type],
        color,
      });
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
            Add Wallet
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
              Wallet Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., HDFC Savings"
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Type
            </label>
            <div className="flex gap-2">
              {(["bank", "cash", "digital"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${type === t ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"}`}
                >
                  <span>{WALLET_ICONS[t]}</span>{" "}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Initial Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">
                {CURRENCY_SYMBOL}
              </span>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-9 pr-4 text-lg font-semibold text-gray-900 placeholder:text-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Color
            </label>
            <div className="flex gap-2">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-600 py-3 text-base font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Wallet"}
          </button>
        </form>
      </div>
    </div>
  );
}
