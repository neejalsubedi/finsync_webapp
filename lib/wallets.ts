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
