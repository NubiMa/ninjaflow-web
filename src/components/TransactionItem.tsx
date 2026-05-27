"use client";

import { motion } from "framer-motion";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { CATEGORY_META, Transaction } from "@/types";

interface TransactionItemProps {
  transaction: Transaction;
  index?: number;
  onDelete?: (id: string) => void;
}

export default function TransactionItem({ transaction, index = 0, onDelete }: TransactionItemProps) {
  const meta = CATEGORY_META[transaction.category];
  const isExpense = transaction.type === "expense";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ 
        scale: 1.01, 
        backgroundColor: "rgba(255, 255, 255, 0.06)", 
        borderColor: "rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
      }}
      whileTap={{ scale: 0.99 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px",
        borderRadius: 20,
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(12px)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${meta.color}05, transparent)`, pointerEvents: "none" }} />
      
      {/* Category Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: meta.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
          boxShadow: `0 4px 12px ${meta.color}20`,
          border: `1px solid ${meta.color}20`
        }}
      >
        <meta.icon size={20} color={meta.color} />
      </div>

      {/* Info & Amount */}
      <div style={{ flex: 1, minWidth: 0, zIndex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", wordBreak: "break-word", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {transaction.note || transaction.merchant || meta.label}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
          <p style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
            {meta.label} <span style={{ color: "#475569", margin: "0 4px" }}>•</span> {formatRelativeTime(transaction.date)}
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: isExpense ? "#F87171" : "#4ADE80",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {isExpense ? "−" : "+"}{formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
