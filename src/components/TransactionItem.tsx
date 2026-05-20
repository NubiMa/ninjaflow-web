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
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s ease",
      }}
      whileHover={{ background: "rgba(255,255,255,0.04)" }}
    >
      {/* Category Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: meta.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {meta.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#F5F7FA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {transaction.note || transaction.merchant || meta.label}
        </p>
        <p style={{ fontSize: 11.5, color: "#748391", marginTop: 2 }}>
          {meta.label} · {formatRelativeTime(transaction.date)}
        </p>
      </div>

      {/* Amount */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: isExpense ? "#E88989" : "#6EE7B7",
            letterSpacing: "-0.01em",
          }}
        >
          {isExpense ? "−" : "+"}{formatCurrency(transaction.amount)}
        </p>
      </div>
    </motion.div>
  );
}
