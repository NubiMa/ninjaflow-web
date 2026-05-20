"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Bell, Plus, ChevronRight } from "lucide-react";
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
  const balance      = totalIncome - totalExpense;
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
  }, [loading, error]); // Intentionally not listening to transactions.length to avoid spam

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
    <div style={{ maxWidth: 960, width: "100%", margin: "0 auto", padding: 20 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}
      >
        <div>
          <p style={{ fontSize: 13, color: "#748391", marginBottom: 4 }}>
            {getGreeting()}, {user?.displayName?.split(" ")[0] ?? "Ninja"} 👋
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#F5F7FA", letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard/transactions">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 12,
                background: "#4FD1C5",
                color: "#0B1215",
                fontWeight: 600,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Tambah
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          background: "linear-gradient(135deg, #152129 0%, #1a2d38 100%)",
          border: "1px solid rgba(79,209,197,0.12)",
          padding: "28px 28px",
          marginBottom: 24,
        }}
      >
        <div style={{ position: "absolute",margin : 10, width: 180, height: 180, borderRadius: "50%", background: "rgba(79,209,197,0.05)", filter: "blur(50px)", pointerEvents: "none" }} />
        <p style={{ fontSize: 12, color: "#748391", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Saldo Bulan Ini
        </p>
        {loading ? (
          <div className="skeleton" style={{ height: 40, width: 200, borderRadius: 8, marginBottom: 8 }} />
        ) : (
          <h2 style={{ fontSize: 28, fontWeight: 800, color: balance >= 0 ? "#4FD1C5" : "#E88989", letterSpacing: "-0.03em", marginBottom: 20, overflowWrap: "anywhere" }}>
            {formatCurrency(balance)}
          </h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(110,231,183,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowDownLeft size={16} color="#6EE7B7" strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#748391" }}>Pemasukan</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#6EE7B7", overflowWrap: "anywhere" }}>{loading ? "—" : formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(232,137,137,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowUpRight size={16} color="#E88989" strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#748391" }}>Pengeluaran</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#E88989", overflowWrap: "anywhere" }}>{loading ? "—" : formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats + AI Grid */}
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
        <div style={{ flexShrink: 0, minWidth: 140 }}>
          <StatCard label="Transaksi" value={loading ? "—" : `${thisMonth.length}x`} sub="Bulan ini" index={0} />
        </div>
        <div style={{ flexShrink: 0, minWidth: 140 }}>
          <StatCard label="Terbesar" value={loading ? "—" : (thisMonth.length ? formatCurrency(Math.max(...thisMonth.filter(t=>t.type==="expense").map(t=>t.amount), 0)) : "—")} sub="Pengeluaran" accent="#E88989" index={1} />
        </div>
        <div style={{ flexShrink: 0, minWidth: 140 }}>
          <StatCard label="Terkecil" value={loading ? "—" : (thisMonth.length ? formatCurrency(Math.min(...thisMonth.filter(t=>t.type==="expense").map(t=>t.amount), Infinity) === Infinity ? 0 : Math.min(...thisMonth.filter(t=>t.type==="expense").map(t=>t.amount))) : "—")} sub="Pengeluaran" accent="#F6C177" index={2} />
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* AI Reflection */}
        <div style={{ gridColumn: "1 / -1" }}>
          <AIReflectionCard summary={aiResult?.reflection || ""} isLoading={loadingAi || loading} onRefresh={handleManualRefresh} />
        </div>

        {/* Recent Transactions */}
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#F5F7FA" }}>Transaksi Terbaru</h2>
            <Link href="/dashboard/transactions" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4FD1C5" }}>
              Lihat semua <ChevronRight size={13} strokeWidth={2} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 58, borderRadius: 14 }} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#748391", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>📭</p>
              <p style={{ fontSize: 14 }}>Belum ada transaksi</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Tambah transaksi pertamamu!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recent.map((t, i) => <TransactionItem key={t.id} transaction={t} index={i} />)}
            </div>
          )}
        </div>
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
