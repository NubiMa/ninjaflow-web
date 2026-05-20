"use client";

import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

interface AIReflectionCardProps {
  summary: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function AIReflectionCard({ summary, isLoading = false, onRefresh }: AIReflectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        background: "linear-gradient(135deg, rgba(79,209,197,0.08) 0%, rgba(125,211,252,0.05) 100%)",
        border: "1px solid rgba(79,209,197,0.15)",
        padding: "20px 22px",
      }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(79,209,197,0.08)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={14} color="#4FD1C5" strokeWidth={2} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#4FD1C5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            AI Reflection
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <motion.div animate={isLoading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <RefreshCw size={13} color="#748391" strokeWidth={2} />
            </motion.div>
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="skeleton" style={{ height: 14, width: "100%", borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 14, width: "80%", borderRadius: 6 }} />
        </div>
      ) : (
        <p style={{ fontSize: 14, lineHeight: 1.65, color: "#AAB7C2", position: "relative" }}>
          {summary}
        </p>
      )}
    </motion.div>
  );
}
