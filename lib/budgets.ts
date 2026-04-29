import {
  collection,
  addDoc,
  query,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  getDoc,
  setDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Budget } from "./types";

type BudgetPeriod = "daily" | "weekly" | "monthly";

function budgetCollection(userId: string) {
  return collection(db, "Budgets", userId, "budgets");
}

function budgetDoc(userId: string, budgetId: string) {
  return doc(db, "Budgets", userId, "budgets", budgetId);
}

function getStartAndEndDate(period: BudgetPeriod) {
  const now = new Date();

  if (period === "monthly") {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate, endDate };
  }

  if (period === "weekly") {
    const day = now.getDay();
    const mondayOffset = day === 0 ? 6 : day - 1;
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(now.getDate() - mondayOffset);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return { startDate, endDate };
  }

  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { startDate, endDate: startDate };
}

function normalizePeriod(value: unknown): BudgetPeriod {
  const raw = String(value || "").toLowerCase();
  if (raw === "daily") return "daily";
  if (raw === "weekly") return "weekly";
  return "monthly";
}

function mapBudgetDoc(
  userId: string,
  id: string,
  data: Record<string, unknown>,
): Budget {
  const period = normalizePeriod(data.period ?? data.type);
  const amount = Number(data.amount ?? 0);

  return {
    id,
    userId,
    name: String(
      data.name ?? `${period.charAt(0).toUpperCase()}${period.slice(1)} Budget`,
    ),
    amount,
    spent: Number(data.spent ?? 0),
    period,
    category: String(data.category ?? "All"),
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : String(data.createdAt ?? new Date().toISOString()),
  };
}

export async function addBudget(budget: Omit<Budget, "id">): Promise<string> {
  const { startDate, endDate } = getStartAndEndDate(budget.period);

  const docRef = await addDoc(budgetCollection(budget.userId), {
    ...budget,
    type: budget.period.toUpperCase(),
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  await setDoc(docRef, { budgetId: docRef.id, id: docRef.id }, { merge: true });

  return docRef.id;
}

export async function getBudgets(userId: string): Promise<Budget[]> {
  const q = query(budgetCollection(userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) =>
    mapBudgetDoc(userId, d.id, d.data() as Record<string, unknown>),
  );
}

export async function updateBudget(
  userId: string,
  id: string,
  data: Partial<Omit<Budget, "id">>,
): Promise<void> {
  const updates: Partial<Omit<Budget, "id">> & {
    type?: string;
    startDate?: Timestamp;
    endDate?: Timestamp;
    updatedAt?: Timestamp;
  } = {
    ...data,
  };

  if (data.period) {
    const { startDate, endDate } = getStartAndEndDate(data.period);
    updates.type = data.period.toUpperCase();
    updates.startDate = Timestamp.fromDate(startDate);
    updates.endDate = Timestamp.fromDate(endDate);
  }

  updates.updatedAt = Timestamp.now();

  await updateDoc(budgetDoc(userId, id), updates);
}

export async function deleteBudget(userId: string, id: string): Promise<void> {
  const ref = budgetDoc(userId, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  await deleteDoc(ref);
}
