"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  animate?: boolean;
  index?: number;
}

export default function Card({ children, style, onClick, animate = true, index = 0 }: CardProps) {
  const content = (
    <div
      onClick={onClick}
      style={{
        background: "#152129",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      whileHover={onClick ? { y: -2, borderColor: "rgba(79,209,197,0.15)" } : undefined}
      style={{
        background: "#152129",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  accent?: string;
  index?: number;
}

export function StatCard({ label, value, sub, trend, accent = "#4FD1C5", index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "#152129",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 500, color: "#748391", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: "-0.02em" }}>
          {value}
        </span>
        {trend === "up" && <TrendingUp size={14} color="#6EE7B7" strokeWidth={2} />}
        {trend === "down" && <TrendingDown size={14} color="#E88989" strokeWidth={2} />}
      </div>
      {sub && (
        <span style={{ fontSize: 11.5, color: "#748391" }}>{sub}</span>
      )}
    </motion.div>
  );
}
