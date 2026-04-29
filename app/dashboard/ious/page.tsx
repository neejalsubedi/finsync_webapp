"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { IOU } from "@/lib/types";
import { addIOU, getIOUs, updateIOU, deleteIOU } from "@/lib/ious";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiTrash2,
  FiX,
  FiUsers,
  FiCheck,
  FiArrowUpRight,
  FiArrowDownLeft,
} from "react-icons/fi";
import { CURRENCY_SYMBOL } from "@/lib/currency";

export default function IOUsPage() {
  const { user } = useAuth();
  const [ious, setIous] = useState<IOU[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "owe" | "owed" | "settled">(
    "all",
  );

  const fetchIOUs = useCallback(async () => {
    if (!user) return;
    try {
      setIous(await getIOUs(user.uid));
    } catch (err) {
      console.error("Failed to fetch IOUs:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIOUs();
  }, [fetchIOUs]);

  const handleSettle = async (id: string) => {
    if (!user) return;
    try {
      await updateIOU(user.uid, id, { settled: true });
      setIous((prev) =>
        prev.map((i) => (i.id === id ? { ...i, settled: true } : i)),
      );
      toast.success("Marked as settled!");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteIOU(user.uid, id);
      setIous((prev) => prev.filter((i) => i.id !== id));
      toast.success("IOU deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = ious.filter((i) => {
    if (filter === "owe") return i.direction === "owe" && !i.settled;
    if (filter === "owed") return i.direction === "owed" && !i.settled;
    if (filter === "settled") return i.settled;
    return true;
  });

  const totalIOwe = ious
    .filter((i) => i.direction === "owe" && !i.settled)
    .reduce((s, i) => s + i.amount, 0);
  const totalOwedToMe = ious
    .filter((i) => i.direction === "owed" && !i.settled)
    .reduce((s, i) => s + i.amount, 0);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            IOUs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track money you owe and money owed to you
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <FiPlus className="h-4 w-4" /> Add IOU
        </button>
      </div>

      {/* Summary */}
      {ious.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                <FiArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                I Owe
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {CURRENCY_SYMBOL}{" "}
              {totalIOwe.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-red-500 dark:text-red-400/70 mt-1">
              {ious.filter((i) => i.direction === "owe" && !i.settled).length}{" "}
              pending
            </p>
          </div>
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/40">
                <FiArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Owed to Me
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {CURRENCY_SYMBOL}{" "}
              {totalOwedToMe.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-green-500 dark:text-green-400/70 mt-1">
              {ious.filter((i) => i.direction === "owed" && !i.settled).length}{" "}
              pending
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {(["all", "owe", "owed", "settled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${filter === f ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
          >
            {f === "all"
              ? "All"
              : f === "owe"
                ? "I Owe"
                : f === "owed"
                  ? "Owed to Me"
                  : "Settled"}
          </button>
        ))}
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
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">
            <FiUsers className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="mt-4 text-base font-medium text-gray-900 dark:text-white">
            {ious.length === 0 ? "No IOUs yet" : "No matching IOUs"}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {ious.length === 0
              ? "Track who owes you and who you owe"
              : "Try a different filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((iou) => (
            <div
              key={iou.id}
              className={`flex items-center gap-4 rounded-xl border bg-white px-4 py-3 dark:bg-gray-900 ${iou.settled ? "border-gray-200 opacity-60 dark:border-gray-800" : iou.direction === "owe" ? "border-red-200 dark:border-red-900/50" : "border-green-200 dark:border-green-900/50"}`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iou.direction === "owe" ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"}`}
              >
                {iou.direction === "owe" ? (
                  <FiArrowUpRight className="h-5 w-5 text-red-500" />
                ) : (
                  <FiArrowDownLeft className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {iou.direction === "owe"
                    ? `I owe ${iou.personName}`
                    : `${iou.personName} owes me`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {iou.reason || "No reason"} ·{" "}
                  {new Date(iou.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                  {iou.settled && " · Settled ✓"}
                </p>
              </div>
              <p
                className={`text-sm font-bold whitespace-nowrap ${iou.direction === "owe" ? "text-red-500" : "text-green-600 dark:text-green-400"}`}
              >
                {CURRENCY_SYMBOL}{" "}
                {iou.amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <div className="flex shrink-0 gap-1">
                {!iou.settled && (
                  <button
                    onClick={() => iou.id && handleSettle(iou.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                    title="Mark as settled"
                  >
                    <FiCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => iou.id && handleDelete(iou.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  title="Delete"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddIOUModal
          onClose={() => setModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await addIOU({
                ...data,
                userId: user.uid,
                settled: false,
                createdAt: new Date().toISOString(),
              });
              toast.success("IOU added!");
              await fetchIOUs();
            } catch {
              toast.error("Failed to add IOU");
            }
          }}
        />
      )}
    </div>
  );
}

function AddIOUModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (d: {
    personName: string;
    amount: number;
    direction: "owe" | "owed";
    reason: string;
    date: string;
  }) => Promise<void>;
}) {
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"owe" | "owed">("owe");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!personName || !amount) return;
    setLoading(true);
    try {
      await onSubmit({
        personName,
        amount: parseFloat(amount),
        direction,
        reason,
        date,
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
            Add IOU
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setDirection("owe")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${direction === "owe" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
            >
              <FiArrowUpRight className="h-4 w-4" /> I Owe
            </button>
            <button
              type="button"
              onClick={() => setDirection("owed")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${direction === "owed" ? "bg-green-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
            >
              <FiArrowDownLeft className="h-4 w-4" /> They Owe Me
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Person Name
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g., John"
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
              Reason <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Dinner"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
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
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-3 text-base font-semibold text-white shadow-sm disabled:opacity-50 ${direction === "owe" ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
          >
            {loading ? "Adding..." : "Add IOU"}
          </button>
        </form>
      </div>
    </div>
  );
}
