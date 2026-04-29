import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserData {
  uid: string;
  email: string;
  username: string;
  phoneNumber: string;
  income: number;
  expense: number;
  totalBalance: number;
  preferredCurrency: string;
}

/**
 * Creates a user document in Users/{uid}.
 * Mirrors the Flutter addUserToDatabase logic.
 */
export async function addUserToDatabase(
  uid: string,
  email: string,
  username: string,
  phoneNumber: string,
): Promise<void> {
  await setDoc(doc(db, "Users", uid), {
    uid,
    email,
    username,
    phoneNumber,
    income: 0,
    expense: 0,
    totalBalance: 0,
    preferredCurrency: "NPR",
  });
}

/**
 * Fetches user data from Users/{uid}.
 */
export async function getUserData(uid: string): Promise<UserData | null> {
  const snap = await getDoc(doc(db, "Users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserData;
}

/**
 * Fetches user data by email.
 * Mirrors the Flutter getUserDataByEmail logic.
 */
export async function getUserDataByEmail(
  email: string,
): Promise<UserData | null> {
  const q = query(collection(db, "Users"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as UserData;
}

/**
 * Atomically updates totalBalance, income, and expense
 * when a transaction is added.
 * Mirrors the Flutter updateUserFinancialData logic.
 */
export async function updateUserFinancialData(
  uid: string,
  amount: number,
  type: string,
): Promise<void> {
  const isExpense = type.toUpperCase() === "EXPENSE";
  await updateDoc(doc(db, "Users", uid), {
    totalBalance: increment(isExpense ? -amount : amount),
    income: increment(isExpense ? 0 : amount),
    expense: increment(isExpense ? amount : 0),
  });
}

/**
 * Reverses the financial data when a transaction is deleted.
 */
export async function reverseUserFinancialData(
  uid: string,
  amount: number,
  type: string,
): Promise<void> {
  const isExpense = type.toUpperCase() === "EXPENSE";
  await updateDoc(doc(db, "Users", uid), {
    totalBalance: increment(isExpense ? amount : -amount),
    income: increment(isExpense ? 0 : -amount),
    expense: increment(isExpense ? -amount : 0),
  });
}

/**
 * Updates all user profile fields.
 * Mirrors the Flutter updateAllUserFields logic.
 */
export async function updateAllUserFields(data: {
  uid: string;
  email: string;
  username: string;
  phoneNumber: string;
  income: number;
  expense: number;
  totalBalance: number;
}): Promise<void> {
  await updateDoc(doc(db, "Users", data.uid), {
    email: data.email,
    username: data.username,
    phoneNumber: data.phoneNumber,
    income: data.income,
    expense: data.expense,
    totalBalance: data.totalBalance,
  });
}

/**
 * Partial update of user fields.
 * Mirrors the Flutter updateByUserFields logic.
 */
export async function updateByUserFields(
  uid: string,
  fieldsToUpdate: Record<string, unknown>,
): Promise<void> {
  await updateDoc(doc(db, "Users", uid), fieldsToUpdate);
}

/**
 * Batch-deletes all docs in a subcollection.
 * Mirrors the Flutter _deleteSubcollectionSafely logic.
 */
async function deleteSubcollectionSafely(
  parentCollection: string,
  uid: string,
  subcollectionName: string,
): Promise<void> {
  const batchSize = 400;
  let hasMore = true;

  while (hasMore) {
    const q = query(collection(db, parentCollection, uid, subcollectionName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      hasMore = false;
      break;
    }

    const batch = writeBatch(db);
    const docs = snapshot.docs.slice(0, batchSize);
    docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    hasMore = snapshot.docs.length >= batchSize;
  }
}

/**
 * Deletes a user and all their subcollections.
 * Mirrors the Flutter deleteUser logic.
 */
export async function deleteUserData(uid: string): Promise<void> {
  // Delete subcollections first
  await deleteSubcollectionSafely("Transactions", uid, "transaction");
  await deleteSubcollectionSafely("Budgets", uid, "budget");
  await deleteSubcollectionSafely("Goals", uid, "goal");
  await deleteSubcollectionSafely("IOUs", uid, "iou");
  await deleteSubcollectionSafely("Wallets", uid, "wallet");

  // Then delete parent docs
  await deleteDoc(doc(db, "Transactions", uid));
  await deleteDoc(doc(db, "Budgets", uid));
  await deleteDoc(doc(db, "Goals", uid));
  await deleteDoc(doc(db, "IOUs", uid));
  await deleteDoc(doc(db, "Wallets", uid));
  await deleteDoc(doc(db, "Users", uid));
}
