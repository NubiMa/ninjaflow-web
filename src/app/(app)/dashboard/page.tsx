"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Plus, ChevronRight, Activity, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToTransactions } from "@/lib/db";
import { StatCard } from "@/components/Card";
import AIReflectionCard from "@/components/AIReflectionCard";
import TransactionItem from "@/components/TransactionItem";
import { Transaction } from "@/types";
import { formatCurrency, getGreeting } from "@/lib/utils";
import { generateFinancialInsight, AIInsightResult } from "@/app/actions/ai";
import { getInsightCache, setInsightCache, shouldRegenerateInsight } from "@/lib/ai-cache";

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
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
    const d = t.date;
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome  = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  
  const totalAllTimeIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalAllTimeExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const allTimeBalance = totalAllTimeIncome - totalAllTimeExpense;
  const recent       = transactions.slice(0, 5);

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

      const breakdown = thisMonth
        .filter(t => t.type === "expense")
        .reduce((acc, t) => {
          const existing = acc.find(c => c.cat === t.category);
          if (existing) existing.amount += t.amount;
          else acc.push({ cat: t.category, amount: t.amount });
          return acc;
        }, [] as { cat: string; amount: number }[])
        .sort((a, b) => b.amount - a.amount);

      const recentMapped = recent.map(t => ({ note: t.note, amount: t.amount, category: t.category }));

      const result = await generateFinancialInsight(totalExpense, totalIncome, breakdown, recentMapped);
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
      if (transactions.length === 0) {
        setAiResult({ reflection: "Belum ada transaksi. Yuk mulai catat pengeluaranmu!", cards: [] });
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
      <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
        <div>
          <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>
            {getGreeting()}, <span style={{ color: "#E2E8F0" }}>{user?.displayName?.split(" ")[0] ?? "Ninja"}</span> 👋
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>
            Overview
          </h1>
        </div>
        <Link href="/dashboard/transactions">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(79,209,197,0.3)" }}
            whileTap={{ scale: 0.95 }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 16, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", color: "#030712", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(79,209,197,0.2)" }}
          >
            <Plus size={18} strokeWidth={3} />
            <span>Catat</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Hero Balance Card */}
      <motion.div variants={itemVariants} style={{ position: "relative", overflow: "hidden", borderRadius: 32, background: "linear-gradient(145deg, rgba(21, 33, 41, 0.9) 0%, rgba(11, 18, 21, 1) 100%)", border: "1px solid rgba(255, 255, 255, 0.05)", padding: "40px", marginBottom: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        {/* Abstract Background Orbs */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,209,197,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, left: -50, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(125,211,252,0.1) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.02%22/%3E%3C/svg%3E')", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Activity size={16} color="#94A3B8" />
            <p style={{ fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Total Kekayaan</p>
          </div>
          
          {loading ? (
            <div className="skeleton" style={{ height: 60, width: 250, borderRadius: 12, marginBottom: 32 }} />
          ) : (
            <h2 style={{ fontSize: "clamp(28px, 8vw, 56px)", fontWeight: 800, color: allTimeBalance >= 0 ? "#F8FAFC" : "#F87171", letterSpacing: "-0.03em", marginBottom: 40, lineHeight: 1.1 }}>
              {formatCurrency(allTimeBalance)}
            </h2>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(74,222,128,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(74,222,128,0.2)" }}>
                <ArrowDownLeft size={20} color="#4ADE80" strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4, fontWeight: 500 }}>Total Pemasukan</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#4ADE80" }}>{loading ? "—" : formatCurrency(totalAllTimeIncome)}</p>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(248,113,113,0.2)" }}>
                <ArrowUpRight size={20} color="#F87171" strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4, fontWeight: 500 }}>Total Pengeluaran</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#F87171" }}>{loading ? "—" : formatCurrency(totalAllTimeExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Transaksi Bulan Ini" value={loading ? "—" : `${thisMonth.length}`} sub="Aktivitas" index={0} accent="#7DD3FC" />
        <StatCard label="Pengeluaran Terbesar" value={loading ? "—" : (thisMonth.length ? formatCurrency(Math.max(...thisMonth.filter(t=>t.type==="expense").map(t=>t.amount), 0)) : "—")} sub="Bulan ini" accent="#F87171" index={1} />
        <StatCard label="Pengeluaran Terkecil" value={loading ? "—" : (thisMonth.length ? formatCurrency(Math.min(...thisMonth.filter(t=>t.type==="expense").map(t=>t.amount), Infinity) === Infinity ? 0 : Math.min(...thisMonth.filter(t=>t.type==="expense").map(t=>t.amount))) : "—")} sub="Bulan ini" accent="#FCD34D" index={2} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* AI Reflection */}
        <motion.div variants={itemVariants}>
          <AIReflectionCard summary={aiResult?.reflection || ""} isLoading={loadingAi || loading} onRefresh={handleManualRefresh} />
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 24, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.01em" }}>Aktivitas Terbaru</h2>
            <Link href="/dashboard/transactions">
              <motion.div whileHover={{ x: 2, color: "#7DD3FC" }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#4FD1C5", cursor: "pointer" }}>
                Semua <ChevronRight size={14} strokeWidth={2.5} />
              </motion.div>
            </Link>
          </div>
          
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 70, borderRadius: 20 }} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748B", background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px dashed rgba(255,255,255,0.1)" }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>📭</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#E2E8F0" }}>Belum ada aktivitas</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Mulai catat pengeluaran atau pemasukan pertamamu.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recent.map((t, i) => <TransactionItem key={t.id} transaction={t} index={i} />)}
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
