"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

const MOCKED_TRANSACTIONS = [
  { emoji: "🍜", name: "Mie Ramen Kenangan", cat: "Makanan", amount: "- Rp 45.000", color: "#EF4444" },
  { emoji: "🚌", name: "Gojek ke Kantor", cat: "Transport", amount: "- Rp 18.000", color: "#EF4444" },
  { emoji: "💰", name: "Gaji Freelance", cat: "Pemasukan", amount: "+ Rp 2.500.000", color: "#22C55E" },
  { emoji: "☕", name: "Kopi Kekinian", cat: "Makanan", amount: "- Rp 38.000", color: "#EF4444" },
];

export default function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 15 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000, maxWidth: 440, margin: "0 auto" }}
    >
      {/* Phone Shell */}
      <div style={{ background: "rgba(21,33,41,0.9)", backdropFilter: "blur(24px)", borderRadius: 40, border: "1px solid rgba(255,255,255,0.1)", padding: 16, boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,209,197,0.08)" }}>
        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 12px 16px", fontSize: 11, color: "#748391" }}>
          <span>9:41 AM</span>
          <span>●●● 5G</span>
        </div>

        {/* Balance card */}
        <div style={{ background: "linear-gradient(135deg, #152129, #1a2d38)", borderRadius: 24, padding: 24, marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: "#748391", marginBottom: 8 }}>Total Saldo</p>
          <p style={{ fontSize: 34, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.03em" }}>Rp 4.280.000</p>
          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            <div style={{ flex: 1, padding: "12px", background: "rgba(110,231,183,0.1)", borderRadius: 16, border: "1px solid rgba(110,231,183,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <TrendingUp size={14} color="#22C55E" />
                <span style={{ fontSize: 11, color: "#748391" }}>Pemasukan</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#22C55E" }}>Rp 5.200.000</p>
            </div>
            <div style={{ flex: 1, padding: "12px", background: "rgba(232,137,137,0.1)", borderRadius: 16, border: "1px solid rgba(232,137,137,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <TrendingDown size={14} color="#EF4444" />
                <span style={{ fontSize: 11, color: "#748391" }}>Pengeluaran</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#EF4444" }}>Rp 920.000</p>
            </div>
          </div>
        </div>

        {/* AI Card */}
        <div style={{ background: "linear-gradient(135deg, rgba(79,209,197,0.12), rgba(125,211,252,0.05))", borderRadius: 20, padding: 18, marginBottom: 16, border: "1px solid rgba(79,209,197,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Sparkles size={16} color="#4FD1C5" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#4FD1C5", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Insight</span>
          </div>
          <p style={{ fontSize: 14, color: "#F5F7FA", lineHeight: 1.5, fontWeight: 500 }}>
            "Pengeluaran kopimu turun 30% minggu ini. Tabungan liburanmu sudah 68% 🏖️"
          </p>
        </div>

        {/* Transaction list */}
        <div>
          <p style={{ fontSize: 12, color: "#748391", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, paddingLeft: 4 }}>Transaksi Terbaru</p>
          {MOCKED_TRANSACTIONS.map((tx, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", borderBottom: i < MOCKED_TRANSACTIONS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{tx.emoji}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#F5F7FA" }}>{tx.name}</p>
                  <p style={{ fontSize: 11, color: "#748391" }}>{tx.cat}</p>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: tx.color }}>{tx.amount}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
