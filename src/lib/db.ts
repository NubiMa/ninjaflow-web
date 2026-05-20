import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Transaction, TransactionDraft, Goal, UserProfile } from "@/types";

// ─── User Profile ────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid,
    displayName: d.displayName ?? "Ninja User",
    email: d.email ?? "",
    photoURL: d.photoURL,
    currency: d.currency ?? "IDR",
    monthlyBudget: d.monthlyBudget ?? 5000000,
    createdAt: d.createdAt?.toDate() ?? new Date(),
  };
}

export async function upsertUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function subscribeToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void,
  limitCount = 50
): () => void {
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snap) => {
    let txs: Transaction[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        note: data.note ?? "",
        merchant: data.merchant,
        date: data.date?.toDate() ?? new Date(),
        createdAt: data.createdAt?.toDate() ?? new Date(),
      };
    });
    
    // Client-side sorting to bypass composite index requirements
    txs.sort((a, b) => b.date.getTime() - a.date.getTime());
    if (limitCount) {
      txs = txs.slice(0, limitCount);
    }
    
    callback(txs);
  }, (err) => {
    console.error("Firestore Transaction Error:", err);
    if (onError) onError(err);
  });
}

export async function addTransaction(userId: string, draft: TransactionDraft): Promise<string> {
  const ref = await addDoc(collection(db, "transactions"), {
    ...draft,
    userId,
    date: Timestamp.fromDate(draft.date),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, "transactions", id));
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export function subscribeToGoals(
  userId: string,
  callback: (goals: Goal[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, "goals"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snap) => {
    const goals: Goal[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        title: data.title,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount ?? 0,
        deadline: data.deadline?.toDate(),
        emoji: data.emoji ?? "🎯",
        createdAt: data.createdAt?.toDate() ?? new Date(),
      };
    });

    // Client-side sorting to bypass composite index requirements
    goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    callback(goals);
  }, (err) => {
    console.error("Firestore Goals Error:", err);
    if (onError) onError(err);
  });
}

export async function addGoal(userId: string, goal: Omit<Goal, "id" | "userId" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "goals"), {
    ...goal,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGoalAmount(goalId: string, amount: number): Promise<void> {
  await updateDoc(doc(db, "goals", goalId), { currentAmount: amount });
}

export async function deleteGoal(goalId: string): Promise<void> {
  await deleteDoc(doc(db, "goals", goalId));
}
