"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Goal } from "@/lib/types";
import { addGoal, getGoals, updateGoal, deleteGoal } from "@/lib/goals";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiX, FiTarget, FiCheck } from "react-icons/fi";
import { CURRENCY_SYMBOL } from "@/lib/currency";

const GOAL_ICONS = [
  "🏠",
  "🚗",
  "✈️",
  "📱",
  "💻",
  "🎓",
  "💍",
  "🏥",
  "🎯",
  "💰",
  "📈",
  "🛡️",
];

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addMoneyGoalId, setAddMoneyGoalId] = useState<string | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    try {
      setGoals(await getGoals(user.uid));
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddMoney = async (goalId: string) => {
    const amt = parseFloat(addMoneyAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    if (amt > 1000000) {
      toast.error("Amount cannot exceed 1,000,000");
      return;
    }
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    try {
      const newSaved = goal.savedAmount + amt;
      await updateGoal(goalId, { savedAmount: newSaved });
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId ? { ...g, savedAmount: newSaved } : g,
        ),
      );
      toast.success(`${CURRENCY_SYMBOL} ${amt.toLocaleString("en-IN")} added!`);
      setAddMoneyGoalId(null);
      setAddMoneyAmount("");
    } catch {
      toast.error("Failed to update");
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Goals
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your savings goals
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <FiPlus className="h-4 w-4" /> Add Goal
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
      ) : goals.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
            <FiTarget className="h-7 w-7 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-4 text-base font-medium text-gray-900 dark:text-white">
            No goals yet
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start by creating your first savings goal
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct =
              goal.targetAmount > 0
                ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
                : 0;
            const completed = goal.savedAmount >= goal.targetAmount;
            const daysLeft = Math.max(
              Math.ceil(
                (new Date(goal.deadline).getTime() - Date.now()) / 86400000,
              ),
              0,
            );
            return (
              <div
                key={goal.id}
                className={`rounded-2xl border bg-white p-5 dark:bg-gray-900 ${completed ? "border-emerald-300 dark:border-emerald-800" : "border-gray-200 dark:border-gray-800"}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {goal.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {completed ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <FiCheck className="h-3 w-3" /> Completed!
                          </span>
                        ) : (
                          `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => goal.id && handleDelete(goal.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {CURRENCY_SYMBOL}{" "}
                      {goal.savedAmount.toLocaleString("en-IN")}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {CURRENCY_SYMBOL}{" "}
                      {goal.targetAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-3 rounded-full transition-all ${completed ? "bg-emerald-500" : "bg-purple-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {pct.toFixed(1)}%
                  </p>
                </div>

                {!completed &&
                  (addMoneyGoalId === goal.id ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          {CURRENCY_SYMBOL}
                        </span>
                        <input
                          type="number"
                          value={addMoneyAmount}
                          onChange={(e) => setAddMoneyAmount(e.target.value)}
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => goal.id && handleAddMoney(goal.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setAddMoneyGoalId(null);
                          setAddMoneyAmount("");
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddMoneyGoalId(goal.id!)}
                      className="w-full rounded-xl border border-dashed border-purple-300 bg-purple-50 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/20 dark:text-purple-400 dark:hover:bg-purple-950/40"
                    >
                      + Add Money
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <AddGoalModal
          onClose={() => setModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await addGoal({
                ...data,
                userId: user.uid,
                savedAmount: 0,
                createdAt: new Date().toISOString(),
              });
              toast.success("Goal created!");
              await fetchGoals();
            } catch {
              toast.error("Failed to create goal");
            }
          }}
        />
      )}
    </div>
  );
}

function AddGoalModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (d: {
    name: string;
    targetAmount: number;
    deadline: string;
    icon: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !deadline) return;

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
        name,
        targetAmount: numericAmount,
        deadline,
        icon,
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
            Add Goal
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
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${icon === ic ? "bg-purple-100 ring-2 ring-purple-500 dark:bg-purple-900/40" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800"}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Goal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Car"
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Target Amount
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
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 py-3 text-base font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Goal"}
          </button>
        </form>
      </div>
    </div>
  );
}
