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
  const baseStyle: React.CSSProperties = {
    background: "linear-gradient(145deg, rgba(21, 33, 41, 0.7) 0%, rgba(11, 18, 21, 0.8) 100%)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.04)",
    borderRadius: 24,
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    cursor: onClick ? "pointer" : "default",
    overflow: "hidden",
    position: "relative",
    ...style,
  };

  const content = (
    <div onClick={onClick} style={baseStyle}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      whileHover={onClick ? { 
        y: -4, 
        scale: 1.01,
        borderColor: "rgba(79, 209, 197, 0.2)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(79, 209, 197, 0.2)"
      } : undefined}
      style={baseStyle}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
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
  const isUp = trend === "up";
  const isDown = trend === "down";
  const trendColor = isUp ? "#4ADE80" : isDown ? "#F87171" : "#94A3B8";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "linear-gradient(135deg, rgba(21, 33, 41, 0.8), rgba(11, 18, 21, 0.9))",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.03)",
        borderRadius: 20,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "150px", background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`, filter: "blur(20px)", transform: "translate(30%, -30%)", pointerEvents: "none" }} />
      
      <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", position: "relative", zIndex: 1 }}>
        {label}
      </span>
      
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          {value}
        </span>
      </div>
      
      {(sub || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, position: "relative", zIndex: 1 }}>
          {trend && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: `${trendColor}1A`, padding: "4px 8px", borderRadius: 8, color: trendColor, fontSize: 12, fontWeight: 600 }}>
              {isUp && <TrendingUp size={12} strokeWidth={2.5} />}
              {isDown && <TrendingDown size={12} strokeWidth={2.5} />}
              <span>{sub || (isUp ? "Naik" : "Turun")}</span>
            </div>
          )}
          {!trend && sub && <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{sub}</span>}
        </div>
      )}
    </motion.div>
  );
}
