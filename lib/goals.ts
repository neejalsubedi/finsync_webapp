import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Goal } from "./types";

const COLLECTION = "goals";

export async function addGoal(goal: Omit<Goal, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...goal,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getGoals(userId: string): Promise<Goal[]> {
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt:
      d.data().createdAt instanceof Timestamp
        ? d.data().createdAt.toDate().toISOString()
        : d.data().createdAt,
  })) as Goal[];
}

export async function updateGoal(
  id: string,
  data: Partial<Omit<Goal, "id">>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteGoal(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
