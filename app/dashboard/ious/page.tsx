"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { IOU, IOU_CATEGORIES } from "@/lib/types";
import { addIOU, getIOUs, updateIOU, deleteIOU } from "@/lib/ious";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiX,
  FiUsers,
  FiCheck,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiEye,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";
import { CURRENCY_SYMBOL } from "@/lib/currency";

export default function IOUsPage() {
  const { user } = useAuth();
  const [ious, setIous] = useState<IOU[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewIOU, setViewIOU] = useState<IOU | null>(null);
  const [editIOU, setEditIOU] = useState<IOU | null>(null);
  const [partialSettleIOU, setPartialSettleIOU] = useState<IOU | null>(null);
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
  console.log("ious", ious)

  const handleSettle = async (id: string) => {
    if (!user) return;
    try {
      await updateIOU(user.uid, id, { settled: true });
      setIous((prev) =>
        prev.map((i) => (i.id === id ? { ...i, settled: true } : i)),
      );
      toast.success("Marked as settled!");
      if (viewIOU?.id === id) setViewIOU(null);
    } catch {
      toast.error("Failed to update");
    }
  };

  const handlePartialSettle = async (amountToAdd: number) => {
    if (!user || !partialSettleIOU || !partialSettleIOU.id) return;
    const id = partialSettleIOU.id;
    try {
      const currentSettled = partialSettleIOU.settledAmount || 0;
      const newSettledAmount = currentSettled + amountToAdd;

      if (newSettledAmount >= partialSettleIOU.amount) {
        await updateIOU(user.uid, id, { settledAmount: partialSettleIOU.amount, settled: true });
        setIous((prev) =>
          prev.map((i) => (i.id === id ? { ...i, settledAmount: partialSettleIOU.amount, settled: true } : i)),
        );
      } else {
        await updateIOU(user.uid, id, { settledAmount: newSettledAmount });
        setIous((prev) =>
          prev.map((i) => (i.id === id ? { ...i, settledAmount: newSettledAmount } : i)),
        );
      }
      toast.success("Partially settled!");
      setPartialSettleIOU(null);
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleEdit = async (data: Partial<IOU>) => {
    if (!user || !editIOU || !editIOU.id) return;
    const id = editIOU.id;
    try {
      await updateIOU(user.uid, id, data);
      setIous((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i)),
      );
      toast.success("IOU updated!");
      setEditIOU(null);
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
      setViewIOU(null);
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
                  {iou.category || "Personal"} ·{" "}
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
                  onClick={() => setViewIOU(iou)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                  title="View Details"
                >
                  <FiEye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <IOUModal
          title="Add IOU"
          submitText="Add IOU"
          onClose={() => setModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await addIOU({
                ...data,
                userId: user.uid,
                settled: false,
                settledAmount: 0,
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

      {viewIOU && (
        <ViewIOUModal
          iou={viewIOU}
          onClose={() => setViewIOU(null)}
          onSettle={(id) => handleSettle(id)}
          onDelete={(id) => handleDelete(id)}
          onEdit={() => {
            setEditIOU(viewIOU);
            setViewIOU(null);
          }}
          onPartialSettle={() => {
            setPartialSettleIOU(viewIOU);
            setViewIOU(null);
          }}
        />
      )}

      {editIOU && (
        <IOUModal
          title="Edit IOU"
          submitText="Save Changes"
          initialData={editIOU}
          onClose={() => setEditIOU(null)}
          onSubmit={handleEdit}
        />
      )}

      {partialSettleIOU && (
        <PartialSettleModal
          iou={partialSettleIOU}
          onClose={() => setPartialSettleIOU(null)}
          onSubmit={handlePartialSettle}
        />
      )}
    </div>
  );
}

function IOUModal({
  title = "Add IOU",
  submitText = "Add IOU",
  onClose,
  onSubmit,
  initialData,
}: {
  title?: string;
  submitText?: string;
  onClose: () => void;
  onSubmit: (d: {
    personName: string;
    amount: number;
    category: string;
    direction: "owe" | "owed";
    description: string;
    date: string;
    dueDate: string | null;
  }) => Promise<void>;
  initialData?: IOU;
}) {
  const [personName, setPersonName] = useState(initialData?.personName || "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [category, setCategory] = useState(initialData?.category || "Personal");
  const [direction, setDirection] = useState<"owe" | "owed">(initialData?.direction || "owe");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);
  const [showDueDate, setShowDueDate] = useState(!!initialData?.dueDate);
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!personName || !amount) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    if (numericAmount > 1000000) {
      toast.error("Amount cannot exceed 1,000,000");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        personName,
        amount: numericAmount,
        category,
        direction,
        description,
        date,
        dueDate: showDueDate && dueDate ? dueDate : null,
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
            {title}
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
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
          <div className="flex items-center gap-2 mb-2 mt-2">
            <input
              type="checkbox"
              id="showDueDate"
              checked={showDueDate}
              onChange={(e) => setShowDueDate(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="showDueDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Set Due Date
            </label>
          </div>
          {showDueDate && (
            <div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {IOU_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-3 text-base font-semibold text-white shadow-sm disabled:opacity-50 ${direction === "owe" ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
          >
            {loading ? "Saving..." : submitText}
          </button>
        </form>
      </div>
    </div>
  );
}

function ViewIOUModal({
  iou,
  onClose,
  onSettle,
  onEdit,
  onDelete,
  onPartialSettle,
}: {
  iou: IOU;
  onClose: () => void;
  onSettle: (id: string) => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onPartialSettle: () => void;
}) {
  const isSettled = iou.settled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[16px] bg-white p-6 shadow-xl dark:bg-gray-900">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-[22px] font-bold text-[#1A1A1A] dark:text-white truncate ${isSettled ? "line-through opacity-70" : ""}`}>
            {iou.personName}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Amount */}
        <div
          className={`flex items-center justify-between rounded-xl p-4 mb-4 ${iou.direction === "owe" ? "bg-[#E63946]/5" : "bg-[#06D6A0]/5"
            }`}
        >
          <span className="text-[15px] text-[#666666] dark:text-gray-400">Amount</span>
          <span
            className={`text-xl font-bold ${iou.direction === "owe" ? "text-[#E63946]" : "text-orange-400"
              } ${isSettled ? "line-through opacity-70" : ""}`}
          >
            {CURRENCY_SYMBOL} {iou.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Type Badge */}
        <div className="mb-6 inline-block">
          <div
            className={`rounded-lg px-3 py-1.5 ${iou.direction === "owe" ? "bg-[#E63946]/10 text-[#E63946]" : "bg-[#06D6A0]/10 text-[#06D6A0]"
              } text-sm font-semibold`}
          >
            {iou.direction === "owe" ? "I Owe" : "Owes Me"}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-8">
          <div className="flex">
            <span className="w-1/4 text-sm text-[#999999]">Category</span>
            <span className="w-3/4 text-sm font-medium text-[#333333] dark:text-gray-200">
              {iou.category || "Personal"}
            </span>
          </div>
          <div className="flex">
            <span className="w-1/4 text-sm text-[#999999]">Description</span>
            <span className="w-3/4 text-sm font-medium text-[#333333] dark:text-gray-200">{iou.description || "No description"}</span>
          </div>
          <div className="flex">
            <span className="w-1/4 text-sm text-[#999999]">Date</span>
            <span className="w-3/4 text-sm font-medium text-[#333333] dark:text-gray-200">
              {new Date(iou.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </span>
          </div>
          {iou.dueDate && (
            <div className="flex">
              <span className="w-1/4 text-sm text-[#999999]">Due Date</span>
              <span className={`w-3/4 text-sm font-medium ${new Date(iou.dueDate) < new Date() && !isSettled ? "text-[#F57C00]" : "text-[#333333] dark:text-gray-200"}`}>
                {new Date(iou.dueDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </span>
            </div>
          )}
          <div className="flex">
            <span className="w-1/4 text-sm text-[#999999]">Status</span>
            <span className={`w-3/4 text-sm font-medium ${isSettled ? "text-[#06D6A0]" : "text-[#F57C00]"}`}>
              {isSettled ? "Settled" : "Pending"}
            </span>
          </div>
          <div className="flex">
            <span className="w-1/4 text-sm text-[#999999]">Settled Amount</span>
            <span className={`w-3/4 text-sm font-medium ${isSettled ? "text-[#06D6A0]" : "text-[#F57C00]"}`}>
              {CURRENCY_SYMBOL} {(iou.settledAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex gap-3">
            {!isSettled && (
              <button
                onClick={onEdit}
                className="flex-1 flex justify-center items-center gap-2 rounded-xl border border-[#999999] py-3 text-sm font-semibold text-[#666666] hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <FiEdit2 className="h-4 w-4" /> Edit
              </button>
            )}
            <button
              onClick={() => iou.id && onDelete(iou.id)}
              className="flex-1 flex justify-center items-center gap-2 rounded-xl border border-[#E63946] py-3 text-sm font-semibold text-[#E63946] hover:bg-[#E63946]/10"
            >
              <FiTrash2 className="h-4 w-4" /> Delete
            </button>
          </div>

          {!isSettled && (
            <>
              <button
                onClick={onPartialSettle}
                className="w-full flex justify-center items-center gap-2 rounded-xl border border-[#06D6A0] bg-white py-3 text-sm font-semibold text-[#06D6A0] hover:bg-[#06D6A0]/5 dark:bg-gray-900"
              >
                <FiCheckCircle className="h-5 w-5" /> Settle Partially
              </button>
              <button
                onClick={() => iou.id && onSettle(iou.id)}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#06D6A0] py-3 text-sm font-semibold text-white hover:bg-[#05b889]"
              >
                <FiCheckCircle className="h-5 w-5" /> Mark as Settled
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PartialSettleModal({
  iou,
  onClose,
  onSubmit,
}: {
  iou: IOU;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const remaining = iou.amount - (iou.settledAmount || 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    if (val > 1000000) {
      toast.error("Amount cannot exceed 1,000,000");
      return;
    }
    if (val > remaining) return;
    setLoading(true);
    try {
      await onSubmit(val);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[20px] bg-white p-6 shadow-xl dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="rounded-xl bg-[#06D6A0]/10 p-3 mr-3">
              <FiDollarSign className="h-6 w-6 text-[#06D6A0]" />
            </div>
            <div className="flex-1">
              <h2 className="text-[20px] font-bold text-[#1A1A1A] leading-tight dark:text-white">
                Partial Settlement
              </h2>
              <p className="text-[14px] text-[#999999]">
                Settle with {iou.personName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Amount Summary */}
          <div className="rounded-2xl bg-gradient-to-br from-[#4A90E2] to-[#06D6A0] p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-[14px] text-white/70">Total Amount</span>
              <span className="text-[16px] font-semibold text-white">
                {CURRENCY_SYMBOL} {iou.amount.toFixed(0)}
              </span>
            </div>
            <div className="h-[1px] w-full bg-white/30 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-[16px] font-semibold text-white">Remaining</span>
              <span className="text-[22px] font-bold text-white">
                {CURRENCY_SYMBOL} {remaining.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <p className="text-[14px] font-semibold text-[#666666] mb-3 dark:text-gray-400">
            Quick Select
          </p>
          <div className="flex gap-2 mb-6">
            {[0.25, 0.5, 0.75, 1.0].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setAmount((remaining * pct).toFixed(0))}
                className="flex-1 rounded-lg border border-[#4A90E2] py-2 text-[14px] font-semibold text-[#4A90E2] hover:bg-[#4A90E2]/10 transition-colors"
              >
                {pct === 1.0 ? "100%" : `${pct * 100}%`}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <p className="text-[14px] font-semibold text-[#666666] mb-2 dark:text-gray-400">
            Settlement Amount
          </p>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-semibold text-[#CCCCCC]">
              {CURRENCY_SYMBOL}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full rounded-xl border border-[#E5E5E5] bg-[#F8F8FA] py-4 pl-12 pr-4 text-[18px] font-semibold text-[#1A1A1A] placeholder:text-[#CCCCCC] focus:border-[#06D6A0] focus:ring-1 focus:ring-[#06D6A0] outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E5E5E5] py-4 text-[16px] font-semibold text-[#666666] hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] rounded-xl bg-[#06D6A0] py-4 text-[16px] font-semibold text-white hover:bg-[#05b889] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Confirm Settlement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
