import {
  collection,
  addDoc,
  query,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  Timestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { IOU } from "./types";

function iouCollection(userId: string) {
  return collection(db, "IOUs", userId, "iou");
}

function iouDoc(userId: string, iouId: string) {
  return doc(db, "IOUs", userId, "iou", iouId);
}

function normalizeDirection(value: unknown): "owe" | "owed" {
  if (value === "owe" || value === "owed") return value;
  const raw = String(value || "").toLowerCase();
  if (raw.includes("owed") || raw.includes("lend") || raw.includes("receive")) {
    return "owed";
  }
  return "owe";
}

function normalizeDate(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString().split("T")[0];
  }

  if (
    value &&
    typeof value === "object" &&
    "seconds" in (value as Record<string, unknown>)
  ) {
    const ts = value as { seconds: number };
    return new Date(ts.seconds * 1000).toISOString().split("T")[0];
  }

  if (typeof value === "string" && value) {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? value : parsed.toISOString().split("T")[0];
  }

  return new Date().toISOString().split("T")[0];
}

function mapIouDoc(
  userId: string,
  id: string,
  data: Record<string, unknown>,
): IOU {
  const amount = Number(data.amount ?? 0);
  const settled =
    typeof data.settled === "boolean"
      ? data.settled
      : String(data.status || "").toLowerCase() === "settled" ||
        Number(data.settledAmount ?? 0) >= amount;

  return {
    id,
    userId,
    personName: String(data.personName ?? ""),
    amount,
    category: String(data.category ?? "Personal"),
    direction: normalizeDirection(data.direction ?? data.iouType),
    description: String(data.description ?? data.reason ?? ""),
    date: normalizeDate(data.date),
    dueDate: data.dueDate ? normalizeDate(data.dueDate) : null,
    settled,
    settledAmount: Number(data.settledAmount ?? 0),
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : String(data.createdAt ?? new Date().toISOString()),
  };
}

export async function addIOU(iou: Omit<IOU, "id">): Promise<string> {
  const docRef = await addDoc(iouCollection(iou.userId), {
    ...iou,
    createdAt: Timestamp.now(),
  });

  await setDoc(docRef, { id: docRef.id }, { merge: true });

  return docRef.id;
}

export async function getIOUs(userId: string): Promise<IOU[]> {
  const q = query(iouCollection(userId), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) =>
    mapIouDoc(userId, d.id, d.data() as Record<string, unknown>),
  );
}

export async function updateIOU(
  userId: string,
  id: string,
  data: Partial<Omit<IOU, "id">>,
): Promise<void> {
  const updates: Partial<Omit<IOU, "id">> & {
    description?: string;
    status?: string;
  } = {
    ...data,
  };

  if (typeof (data as any).reason === "string") {
    updates.description = (data as any).reason;
  }
  if (typeof data.settled === "boolean") {
    updates.status = data.settled ? "settled" : "pending";
  }

  await updateDoc(iouDoc(userId, id), updates);
}

export async function deleteIOU(userId: string, id: string): Promise<void> {
  const ref = iouDoc(userId, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  await deleteDoc(ref);
}
