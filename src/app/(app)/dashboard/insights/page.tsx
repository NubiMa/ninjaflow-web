"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToTransactions } from "@/lib/db";
import AIReflectionCard from "@/components/AIReflectionCard";
import { Transaction, CATEGORY_META, TransactionCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { generateFinancialInsight, AIInsightResult } from "@/app/actions/ai";
import { getInsightCache, setInsightCache, shouldRegenerateInsight } from "@/lib/ai-cache";

export default function InsightsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIInsightResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTransactions(user.uid, (txs) => { 
      setTransactions(txs); 
      setLoading(false); 
      setError(null);
    }, (err) => {
      setLoading(false);
      setError(err.message);
    });
    return unsub;
  }, [user]);

  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    return t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear();
  });

  const totalExpense = thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome  = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const savingsRate  = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Partial<Record<TransactionCategory, number>> = {};
    thisMonth.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return Object.entries(map)
      .map(([cat, amt]) => ({ cat: cat as TransactionCategory, amount: amt ?? 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [thisMonth]);

  // Weekly spending (last 7 days)
  const weekly = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((day) => {
      const sum = transactions
        .filter(t => t.type === "expense" && t.date.toDateString() === day.toDateString())
        .reduce((s, t) => s + t.amount, 0);
      return { label: day.toLocaleDateString("id-ID", { weekday: "short" }), amount: sum };
    });
  }, [transactions]);

  const maxWeekly = Math.max(...weekly.map(w => w.amount), 1);

  const fetchInsight = async (force = false) => {
    setLoadingAi(true);
    try {
      if (!force && !shouldRegenerateInsight(transactions.length)) {
        const cache = getInsightCache();
        if (cache) {
          setAiResult(cache.result);
          setLoadingAi(false);
          return;
        }
      }

      const recentMapped = transactions.slice(0, 5).map(t => ({ note: t.note, amount: t.amount, category: t.category }));
      const result = await generateFinancialInsight(totalExpense, totalIncome, categoryBreakdown.map(c => ({ cat: c.cat, amount: c.amount })), recentMapped);
      setAiResult(result);
      setInsightCache(result, transactions.length);
    } catch (e) {
      setAiResult({ reflection: "Gagal memuat AI Reflection.", cards: [] });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleManualRefresh = () => {
    if (!shouldRegenerateInsight(transactions.length)) {
      setToastMsg("Tidak ada transaksi baru. Insight sudah mutakhir.");
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }
    fetchInsight(true);
  };

  useEffect(() => {
    if (!loading && !error) {
      if (thisMonth.length === 0) {
        setAiResult({ reflection: "Tidak ada transaksi bulan ini. Mulai catat pengeluaranmu untuk mendapatkan insight personal dari Ninja.", cards: [] });
        setLoadingAi(false);
      } else {
        fetchInsight();
      }
    }
  }, [loading, error]);

  if (error) {
    const isIndexError = error.includes("requires an index");
    const linkMatch = error.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
    const link = linkMatch ? linkMatch[0] : null;

    return (
      <div style={{ padding: 40, textAlign: "center", color: "#E88989", background: "rgba(232,137,137,0.05)", borderRadius: 16, border: "1px solid rgba(232,137,137,0.1)", margin: "20px 0" }}>
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
          {isIndexError ? "Membutuhkan Firestore Composite Index" : "Gagal memuat data"}
        </p>
        <p style={{ fontSize: 13, color: "#AAB7C2", lineHeight: 1.5, wordBreak: "break-word" }}>
          {isIndexError ? "Query ini membutuhkan index khusus di Firestore. Klik tombol di bawah untuk membuatnya secara otomatis:" : error}
        </p>
        {link && (
          <a href={link} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", background: "#E88989", color: "#0B1215", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
            Buat Index Firestore
          </a>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1600, width: "100%", margin: "0 auto" }}>
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ fontSize: 24, fontWeight: 700, color: "#F5F7FA", letterSpacing: "-0.02em", marginBottom: 28 }}>
        Insights
      </motion.h1>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Pengeluaran", value: formatCurrency(totalExpense), color: "#E88989" },
          { label: "Pemasukan",   value: formatCurrency(totalIncome),  color: "#6EE7B7" },
          { label: "Saving Rate", value: `${savingsRate}%`,            color: "#4FD1C5" },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}
            style={{ padding: "18px 20px", borderRadius: 18, background: "#152129", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 11, color: "#748391", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color }}>{loading ? "—" : value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Reflection */}
      <div style={{ marginBottom: 24 }}>
        <AIReflectionCard summary={aiResult?.reflection || ""} isLoading={loadingAi || loading} onRefresh={handleManualRefresh} />
        
        {/* 3 Summary Cards */}
        {!loadingAi && aiResult && aiResult.cards && aiResult.cards.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
            {aiResult.cards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                style={{ background: "#152129", borderRadius: 16, padding: "16px", border: "1px solid rgba(255,255,255,0.06)", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{card.emoji}</span>
                  <p style={{ fontSize: 12, color: "#748391", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.title}</p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#F5F7FA" }}>{card.value}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Weekly Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          style={{ padding: "20px", borderRadius: 20, background: "#152129", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA", marginBottom: 20 }}>7 Hari Terakhir</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {weekly.map(({ label, amount }, i) => {
              const height = amount > 0 ? Math.max((amount / maxWeekly) * 100, 6) : 4;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05 + 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: "100%", height: height, borderRadius: 6, background: amount > 0 ? "linear-gradient(180deg, #4FD1C5, rgba(79,209,197,0.3))" : "rgba(255,255,255,0.06)", transformOrigin: "bottom" }}
                  />
                  <span style={{ fontSize: 10, color: "#748391" }}>{label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          style={{ padding: "20px", borderRadius: 20, background: "#152129", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA", marginBottom: 16 }}>Kategori Terbesar</h3>
          {categoryBreakdown.length === 0 ? (
            <p style={{ fontSize: 13, color: "#748391", textAlign: "center", paddingTop: 20 }}>Belum ada data</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {categoryBreakdown.map(({ cat, amount }, i) => {
                const meta = CATEGORY_META[cat];
                const pct  = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                        <span style={{ fontSize: 12.5, color: "#AAB7C2" }}>{meta.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#748391" }}>{pct}%</span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#F5F7FA" }}>{formatCurrency(amount)}</span>
                      </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.06 + 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "100%", borderRadius: 99, background: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Toast Popup */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            style={{
              position: "fixed", bottom: 100, left: "50%",
              background: "#152129", border: "1px solid rgba(79,209,197,0.3)",
              padding: "12px 20px", borderRadius: 99, color: "#F5F7FA", fontSize: 13,
              fontWeight: 500, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 100,
              display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap"
            }}
          >
            <span>✨</span> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
