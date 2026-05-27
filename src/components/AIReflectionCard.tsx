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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 24,
        background: "linear-gradient(135deg, rgba(79, 209, 197, 0.05) 0%, rgba(125, 211, 252, 0.02) 100%)",
        border: "1px solid rgba(79, 209, 197, 0.15)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
        padding: "24px 28px",
      }}
    >
      {/* Dynamic Glows */}
      <motion.div
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(79, 209, 197, 0.1)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.2, 1, 1.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(125, 211, 252, 0.08)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, rgba(79,209,197,0.2), rgba(125,211,252,0.1))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(79,209,197,0.3)" }}>
            <Sparkles size={14} color="#4FD1C5" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C5", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            AI Reflection
          </span>
        </div>
        {onRefresh && (
          <motion.button
            whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
          >
            <motion.div animate={isLoading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <RefreshCw size={14} color="#94A3B8" strokeWidth={2.5} />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="skeleton" style={{ height: 16, width: "100%", borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 16, width: "90%", borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 16, width: "70%", borderRadius: 8 }} />
          </div>
        ) : (
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#E2E8F0", fontWeight: 400 }}>
            {summary}
          </p>
        )}
      </div>
    </motion.div>
  );
}
