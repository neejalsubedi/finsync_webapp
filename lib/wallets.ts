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
import { Wallet } from "./types";

const COLLECTION = "wallets";

export async function addWallet(wallet: Omit<Wallet, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...wallet,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getWallets(userId: string): Promise<Wallet[]> {
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt:
      d.data().createdAt instanceof Timestamp
        ? d.data().createdAt.toDate().toISOString()
        : d.data().createdAt,
  })) as Wallet[];
}

export async function updateWallet(
  id: string,
  data: Partial<Omit<Wallet, "id">>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteWallet(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Recalculates every wallet's balance from scratch by summing ALL of the
 * user's transactions. Transactions that pre-date wallet selection (i.e.,
 * have no wallet field) are attributed to "Cash" by default.
 *
 * Call this:
 *  – right after seeding default wallets for the first time
 *  – when the user presses the "Sync Balances" button on the wallets page
 */
export async function recalculateWalletBalances(userId: string): Promise<void> {
  // 1. Read every transaction from Transactions/{userId}/transaction
  const txSnap = await getDocs(
    collection(db, "Transactions", userId, "transaction"),
  );

  // 2. Tally net balance per wallet name
  const balanceMap: Record<string, number> = {};
  txSnap.forEach((d) => {
    const data = d.data();
    const type = (data.type || "").toLowerCase() as "income" | "expense";
    const amount = Number(data.amount) || 0;
    // Old transactions without a wallet field default to Cash
    const walletName: string = data.wallet || "Cash";

    if (!(walletName in balanceMap)) balanceMap[walletName] = 0;
    balanceMap[walletName] += type === "income" ? amount : -amount;
  });

  // 3. Update every wallet document with its calculated balance
  const wallets = await getWallets(userId);
  await Promise.all(
    wallets.map((w) => {
      const newBalance = balanceMap[w.name] ?? 0;
      return w.id
        ? updateWallet(w.id, { balance: newBalance })
        : Promise.resolve();
    }),
  );
}
