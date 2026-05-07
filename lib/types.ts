import {Timestamp} from "firebase/firestore";

export interface Transaction {
  id?: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  title: string;
  category: string;
  transactionDescription: string;
  date: Timestamp; // ISO string
  wallet: string;
  createdAt: string;
}

export interface Budget {
  id?: string;
  userId: string;
  name: string;
  amount: number;
  spent: number;
  period: "daily" | "weekly" | "monthly";
  category: string; // "All" or specific category
  createdAt: string;
}

export interface Goal {
  id?: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  icon: string;
  createdAt: string;
}

export interface Wallet {
  id?: string;
  userId: string;
  name: string;
  type: "bank" | "cash" | "digital";
  balance: number;
  icon: string;
  color: string;
  createdAt: string;
}

export interface IOU {
  id?: string;
  userId: string;
  personName: string;
  amount: number;
  category: string;
  direction: "owe" | "owed"; // "owe" = I owe them, "owed" = they owe me
  description: string;
  date: string;
  dueDate?: string | null;
  settled: boolean;
  settledAmount?: number;
  createdAt: string;
}

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investments",
  "Rental",
  "Gifts",
  "Refunds",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Health",
  "Education",
  "Rent",
  "Insurance",
  "Savings",
  "Groceries",
  "Personal Care",
  "Travel",
  "Gifts & Donations",
  "Other",
] as const;

export const IOU_CATEGORIES = [
  "Personal",
  "Food",
  "Entertainment",
  "Shopping",
  "Coffee",
  "Transport",
  "Gift",
  "Emergency",
  "Other",
] as const;

export const WALLET_TYPES = ["bank", "cash", "digital"] as const;

export const WALLET_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#6366f1",
] as const;
