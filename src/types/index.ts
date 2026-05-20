import { Timestamp } from "firebase/firestore";

export type TransactionType = "expense" | "income";

export type TransactionCategory =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "health"
  | "education"
  | "bills"
  | "salary"
  | "investment"
  | "freelance"
  | "other";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  note: string;
  merchant?: string;
  date: Date;
  createdAt: Date;
}

export interface TransactionDraft {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  note: string;
  merchant?: string;
  date: Date;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  emoji: string;
  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  currency: string;
  monthlyBudget: number;
  createdAt: Date;
}

export const CATEGORY_META: Record<
  TransactionCategory,
  { label: string; emoji: string; color: string; bg: string }
> = {
  food:          { label: "Makanan",      emoji: "🍜", color: "#F6C177", bg: "rgba(246,193,119,0.1)" },
  transport:     { label: "Transport",    emoji: "🚗", color: "#7DD3FC", bg: "rgba(125,211,252,0.1)" },
  shopping:      { label: "Belanja",      emoji: "🛍️", color: "#C084FC", bg: "rgba(192,132,252,0.1)" },
  entertainment: { label: "Hiburan",      emoji: "🎮", color: "#F472B6", bg: "rgba(244,114,182,0.1)" },
  health:        { label: "Kesehatan",    emoji: "💊", color: "#6EE7B7", bg: "rgba(110,231,183,0.1)" },
  education:     { label: "Pendidikan",   emoji: "📚", color: "#4FD1C5", bg: "rgba(79,209,197,0.1)" },
  bills:         { label: "Tagihan",      emoji: "🧾", color: "#E88989", bg: "rgba(232,137,137,0.1)" },
  salary:        { label: "Gaji",         emoji: "💼", color: "#6EE7B7", bg: "rgba(110,231,183,0.1)" },
  investment:    { label: "Investasi",    emoji: "📈", color: "#4FD1C5", bg: "rgba(79,209,197,0.1)" },
  freelance:     { label: "Freelance",    emoji: "💻", color: "#7DD3FC", bg: "rgba(125,211,252,0.1)" },
  other:         { label: "Lainnya",      emoji: "📦", color: "#AAB7C2", bg: "rgba(170,183,194,0.1)" },
};

// Rule-based categorization (reduces AI token usage)
export function categorizeByMerchant(merchant: string): TransactionCategory {
  const lower = merchant.toLowerCase();
  if (/mcdonald|kfc|burger|pizza|sushi|warung|resto|cafe|coffee|starbucks|grab.?food|gofood|shopee.?food/.test(lower)) return "food";
  if (/gojek|grab|ojol|transjakarta|commuter|kereta|bus|taxi|uber|bluebird/.test(lower)) return "transport";
  if (/shopee|tokopedia|lazada|blibli|zalora|h&m|zara|indomaret|alfamart/.test(lower)) return "shopping";
  if (/netflix|spotify|steam|disney|youtube|cinema|bioskop/.test(lower)) return "entertainment";
  if (/apotek|klinik|rumah sakit|hospital|dokter|bpjs/.test(lower)) return "health";
  if (/coursera|udemy|skillshare|kampus|sekolah|les/.test(lower)) return "education";
  if (/pln|pdam|telkom|indihome|internet|listrik|air/.test(lower)) return "bills";
  return "other";
}
