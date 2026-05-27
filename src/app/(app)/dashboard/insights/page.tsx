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
import { StatCard } from "@/components/Card";
import { Sparkles, PieChart, BarChart3 } from "lucide-react";

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
      <div style={{ padding: 40, textAlign: "center", color: "#F87171", background: "rgba(248, 113, 113, 0.05)", borderRadius: 24, border: "1px solid rgba(248, 113, 113, 0.1)", margin: "20px 0" }}>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
          {isIndexError ? "Membutuhkan Firestore Composite Index" : "Gagal memuat data"}
        </p>
        <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6, wordBreak: "break-word" }}>
          {isIndexError ? "Query ini membutuhkan index khusus di Firestore. Klik tombol di bawah untuk membuatnya secara otomatis:" : error}
        </p>
        {link && (
          <a href={link} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 24, padding: "12px 24px", background: "#F87171", color: "#030712", borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
            Buat Index Firestore
          </a>
        )}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ maxWidth: 1000, width: "100%", margin: "0 auto", padding: "32px 20px" }}>
      
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>
          Analisis Finansial
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>
          Insights
        </h1>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Pengeluaran" value={loading ? "—" : formatCurrency(totalExpense)} sub="Bulan ini" index={0} accent="#F87171" />
        <StatCard label="Total Pemasukan" value={loading ? "—" : formatCurrency(totalIncome)} sub="Bulan ini" index={1} accent="#4ADE80" />
        <StatCard label="Saving Rate" value={loading ? "—" : `${savingsRate}%`} sub="Rasio Tabungan" index={2} accent="#7DD3FC" />
      </motion.div>

      {/* AI Reflection */}
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <AIReflectionCard summary={aiResult?.reflection || ""} isLoading={loadingAi || loading} onRefresh={handleManualRefresh} />
        
        {/* 3 Summary Cards */}
        {!loadingAi && aiResult && aiResult.cards && aiResult.cards.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginTop: 24 }}>
            {aiResult.cards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                style={{ background: "linear-gradient(135deg, rgba(21, 33, 41, 0.8), rgba(11, 18, 21, 0.9))", backdropFilter: "blur(12px)", borderRadius: 20, padding: "20px", border: "1px solid rgba(255,255,255,0.03)", flex: 1, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.02)", filter: "blur(20px)", pointerEvents: "none" }} />
                
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{card.emoji}</span>
                  <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.title}</p>
                </div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.01em" }}>{card.value}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        
        {/* Weekly Bar Chart */}
        <motion.div variants={itemVariants} style={{ padding: "28px", borderRadius: 24, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(79,209,197,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart3 size={16} color="#4FD1C5" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC" }}>7 Hari Terakhir</h3>
          </div>
          
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160, position: "relative" }}>
            {weekly.map(({ label, amount }, i) => {
              const height = amount > 0 ? Math.max((amount / maxWeekly) * 100, 8) : 6;
              const isToday = i === 6;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ 
                      width: "100%", 
                      height: `${height}%`, 
                      borderRadius: 8, 
                      background: amount > 0 ? (isToday ? "linear-gradient(180deg, #7DD3FC, #4FD1C5)" : "linear-gradient(180deg, #4FD1C5, rgba(79,209,197,0.2))") : "rgba(255,255,255,0.04)", 
                      transformOrigin: "bottom",
                      boxShadow: amount > 0 ? "0 4px 12px rgba(79,209,197,0.1)" : "none",
                      position: "relative"
                    }}
                  >
                    {isToday && amount > 0 && (
                      <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 0 10px #FFFFFF" }} />
                    )}
                  </motion.div>
                  <span style={{ fontSize: 11, color: isToday ? "#F8FAFC" : "#64748B", fontWeight: isToday ? 700 : 500 }}>{label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div variants={itemVariants} style={{ padding: "28px", borderRadius: 24, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(125,211,252,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PieChart size={16} color="#7DD3FC" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC" }}>Kategori Terbesar</h3>
          </div>
          
          {categoryBreakdown.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, opacity: 0.5 }}>
              <PieChart size={32} color="#64748B" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: "#94A3B8" }}>Belum ada data</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {categoryBreakdown.map(({ cat, amount }, i) => {
                const meta = CATEGORY_META[cat];
                const pct  = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                return (
                  <div key={cat} style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <meta.icon size={18} color={meta.color} />
                        </div>
                        <span style={{ fontSize: 14, color: "#E2E8F0", fontWeight: 600 }}>{meta.label}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{formatCurrency(amount)}</span>
                        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.08 + 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${meta.color}90, ${meta.color})`, boxShadow: `0 0 10px ${meta.color}50` }}
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
            initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
            style={{
              position: "fixed", bottom: 40, left: "50%",
              background: "rgba(11, 18, 21, 0.9)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(79,209,197,0.3)",
              padding: "16px 24px", borderRadius: 100, color: "#F8FAFC", fontSize: 14,
              fontWeight: 600, boxShadow: "0 20px 40px rgba(0,0,0,0.5)", zIndex: 100,
              display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap"
            }}
          >
            <Sparkles size={16} color="#4FD1C5" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
