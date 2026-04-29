import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  increment,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { Transaction } from "./types";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { updateUserFinancialData, reverseUserFinancialData } from "./users";

/**
 * Normalizes a Firestore transaction doc into a Transaction object.
 * Handles the mobile app storing type as "INCOME"/"EXPENSE" (uppercase)
 * while the web app expects "income"/"expense" (lowercase).
 */
function mapDoc(d: QueryDocumentSnapshot<DocumentData>): Transaction {
  const data = d.data();
  // Normalize date — could be a Firestore Timestamp, an ISO string, or another format
  let dateStr = data.date;
  if (data.date instanceof Timestamp) {
    dateStr = data.date.toDate().toISOString().split("T")[0];
  } else if (data.date && typeof data.date === "object" && data.date.seconds) {
    // Firestore Timestamp-like object from REST
    dateStr = new Date(data.date.seconds * 1000).toISOString().split("T")[0];
  } else if (typeof data.date === "string" && data.date) {
    // Try to ensure it's a valid parseable date
    const parsed = new Date(data.date);
    dateStr = isNaN(parsed.getTime())
      ? data.date
      : parsed.toISOString().split("T")[0];
  }

  return {
    id: d.id,
    ...data,
    date: dateStr,
    type: (data.type || "").toLowerCase() as "income" | "expense",
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
  } as Transaction;
}

/**
 * Returns the subcollection ref: Transactions/{userId}/transaction
 * Matches the mobile app's Firestore structure.
 */
function txCollection(userId: string) {
  return collection(db, "Transactions", userId, "transaction");
}

/**
 * Returns a doc ref: Transactions/{userId}/transaction/{txId}
 */
function txDoc(userId: string, txId: string) {
  return doc(db, "Transactions", userId, "transaction", txId);
}

/**
 * Returns the subcollection ref: Wallets/{userId}/wallet
 * Matches the mobile app's Firestore structure.
 */
function walletCollection(userId: string) {
  return collection(db, "Wallets", userId, "wallet");
}

/**
 * Atomically adjust a wallet's balance by name.
 * Mirrors the Flutter _adjustWalletBalance logic.
 */
async function adjustWalletBalance(
  userId: string,
  walletName: string,
  delta: number,
): Promise<void> {
  if (!walletName) return;
  const q = query(
    walletCollection(userId),
    where("name", "==", walletName),
    limit(1),
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, {
      balance: increment(delta),
    });
  }
}

export async function addTransaction(
  transaction: Omit<Transaction, "id">,
): Promise<string> {
  const userId = transaction.userId;

  // Update user's totalBalance/income/expense aggregates
  await updateUserFinancialData(userId, transaction.amount, transaction.type);

  const docRef = await addDoc(txCollection(userId), {
    ...transaction,
    createdAt: Timestamp.now(),
  });

  // Also write the id into the document so it matches mobile app behaviour
  await setDoc(docRef, { id: docRef.id }, { merge: true });

  // Update wallet balance if a wallet was selected
  if (transaction.walletName) {
    const delta =
      transaction.type === "income" ? transaction.amount : -transaction.amount;
    await adjustWalletBalance(userId, transaction.walletName, delta);
  }

  return docRef.id;
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const q = query(txCollection(userId), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapDoc);
}

export async function getRecentTransactions(
  userId: string,
  count = 7,
): Promise<Transaction[]> {
  const q = query(txCollection(userId), orderBy("date", "desc"), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapDoc);
}

export async function getTransactionsByType(
  userId: string,
  type: "income" | "expense",
): Promise<Transaction[]> {
  const q = query(
    txCollection(userId),
    where("type", "==", type),
    orderBy("date", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapDoc);
}

export async function deleteTransaction(
  id: string,
  userId: string,
): Promise<void> {
  const ref = txDoc(userId, id);
  const txSnap = await getDoc(ref);

  if (txSnap.exists()) {
    const data = txSnap.data();
    const walletName = data.walletName || data.wallet || "";
    const amount = data.amount || 0;
    const type = (data.type || "").toLowerCase();

    // Reverse wallet balance
    if (walletName) {
      const delta = type === "expense" ? amount : -amount;
      await adjustWalletBalance(userId, walletName, delta);
    }

    // Reverse user's totalBalance/income/expense aggregates
    await reverseUserFinancialData(userId, amount, type);
  }

  await deleteDoc(ref);
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, "id">>,
  userId: string,
): Promise<void> {
  const ref = txDoc(userId, id);
  const txSnap = await getDoc(ref);

  if (txSnap.exists()) {
    const old = txSnap.data();
    const oldWallet = old.walletName || old.wallet || "";
    const oldAmount = old.amount || 0;
    const oldType = (old.type || "").toLowerCase();

    // Reverse old wallet balance
    if (oldWallet) {
      const oldDelta = oldType === "expense" ? oldAmount : -oldAmount;
      await adjustWalletBalance(userId, oldWallet, oldDelta);
    }

    // Apply new wallet balance
    const newWallet = data.walletName ?? oldWallet;
    const newAmount = data.amount ?? oldAmount;
    const newType = data.type ?? oldType;
    if (newWallet) {
      const newDelta = newType === "expense" ? -newAmount : newAmount;
      await adjustWalletBalance(userId, newWallet, newDelta);
    }

    // Update user aggregates: reverse old, apply new
    await reverseUserFinancialData(userId, oldAmount, oldType);
    await updateUserFinancialData(
      userId,
      data.amount ?? oldAmount,
      data.type ?? oldType,
    );
  }

  await updateDoc(ref, data);
}
