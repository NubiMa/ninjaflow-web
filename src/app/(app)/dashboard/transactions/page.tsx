"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, Camera, Image as ImageIcon, Edit3, Zap } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToTransactions, addTransaction, deleteTransaction, updateTransaction } from "@/lib/db";
import TransactionItem from "@/components/TransactionItem";
import { Transaction, TransactionCategory, TransactionDraft, CATEGORY_META } from "@/types";
import { formatCurrency } from "@/lib/utils";

import CameraSheet from "@/components/CameraSheet";
import ScanResultSheet from "@/components/ScanResultSheet";
import { scanReceiptImage, ScanResult } from "@/app/actions/vision";
import { compressImage } from "@/lib/compress-image";
import { checkVisionCooldown, setVisionUsed } from "@/lib/vision-cache";

const CATEGORY_KEYS = Object.keys(CATEGORY_META) as TransactionCategory[];

function TransactionFormSheet({ isOpen, onClose, userId, transactionToEdit, onDelete }: { isOpen: boolean; onClose: () => void; userId: string; transactionToEdit?: Transaction | null; onDelete?: (id: string) => void; }) {
  const [type, setType]         = useState<"expense" | "income">("expense");
  const [amount, setAmount]     = useState("");
  const [category, setCategory] = useState<TransactionCategory>("food");
  const [note, setNote]         = useState("");
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (transactionToEdit && isOpen) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setNote(transactionToEdit.note || transactionToEdit.merchant || "");
    } else if (isOpen) {
      setType("expense");
      setAmount("");
      setCategory("food");
      setNote("");
    }
  }, [transactionToEdit, isOpen]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setSaving(true);
    try {
      const draft: TransactionDraft = {
        type, category,
        amount: Number(amount),
        note,
        date: transactionToEdit ? transactionToEdit.date : new Date(),
      };
      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.id, draft);
      } else {
        await addTransaction(userId, draft);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!transactionToEdit || !onDelete) return;
    if (confirm("Apakah kamu yakin ingin menghapus transaksi ini?")) {
      await onDelete(transactionToEdit.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(3,7,18,0.8)", zIndex: 40, backdropFilter: "blur(8px)" }} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: "50%", left: "50%", zIndex: 50,
              background: "linear-gradient(145deg, rgba(21, 33, 41, 0.95) 0%, rgba(11, 18, 21, 1) 100%)", borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "24px 20px",
              width: "90%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC" }}>{transactionToEdit ? "Edit Transaksi" : "Tambah Transaksi"}</h2>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#AAB7C2" />
              </button>
            </div>

            {/* Type Toggle */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
              {(["expense", "income"] as const).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  style={{
                    padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                    background: type === t ? (t === "expense" ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.15)") : "transparent",
                    color: type === t ? (t === "expense" ? "#F87171" : "#4ADE80") : "#94A3B8",
                    transition: "all 0.2s ease",
                  }}>
                  {t === "expense" ? "Pengeluaran" : "Pemasukan"}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Nominal</label>
              <input
                type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0" className="input-field" style={{ width: "100%", padding: "16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC", fontSize: 24, fontWeight: 700 }}
              />
            </div>

            {/* Note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Keterangan</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Makan siang" className="input-field" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC", fontSize: 14 }} />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 12, color: "#94A3B8", marginBottom: 10, fontWeight: 500 }}>Kategori</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(75px, 1fr))", gap: 10 }}>
                {CATEGORY_KEYS.map((cat) => {
                  const m = CATEGORY_META[cat];
                  const Icon = m.icon;
                  return (
                    <button key={cat} onClick={() => setCategory(cat)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: "12px 6px", borderRadius: 14, border: `1px solid ${category === cat ? m.color : "rgba(255,255,255,0.04)"}`,
                        background: category === cat ? m.bg : "rgba(255,255,255,0.02)", cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}>
                      <Icon size={22} color={category === cat ? m.color : "#64748B"} />
                      <span style={{ fontSize: 11, color: category === cat ? m.color : "#94A3B8", fontWeight: 600, textAlign: "center", wordBreak: "break-word" }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {transactionToEdit && (
                <button onClick={handleDelete} disabled={saving}
                  style={{
                    padding: "14px", borderRadius: 14, border: "1px solid rgba(248,113,113,0.2)", cursor: "pointer",
                    background: "transparent", color: "#F87171", fontWeight: 700, fontSize: 14, transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                  Hapus
                </button>
              )}
              <button onClick={handleSave} disabled={saving || !amount}
                style={{
                  flex: 1, padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
                  background: saving || !amount ? "rgba(79,209,197,0.3)" : "linear-gradient(135deg, #4FD1C5, #7DD3FC)",
                  color: "#030712", fontWeight: 700, fontSize: 14, transition: "all 0.2s ease",
                }}>
                {saving ? "Menyimpan..." : "Simpan Transaksi"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AddMenuSheet({ isOpen, onClose, onManual, onPhoto, onCamera }: { isOpen: boolean; onClose: () => void; onManual: () => void; onPhoto: () => void; onCamera: () => void; }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(3,7,18,0.8)", zIndex: 40, backdropFilter: "blur(8px)" }} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }} exit={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: "50%", left: "50%", zIndex: 50,
              background: "linear-gradient(145deg, rgba(21, 33, 41, 0.95) 0%, rgba(11, 18, 21, 1) 100%)", borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "24px 20px", width: "90%", maxWidth: 380,
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC" }}>Pilih Cara Tambah</h2>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#AAB7C2" />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={onManual} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", color: "#F8FAFC", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(79,209,197,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4FD1C5", border: "1px solid rgba(79,209,197,0.2)" }}><Edit3 size={20} /></div>
                Manual Input
              </button>
              <button onClick={onPhoto} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", color: "#F8FAFC", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(244,114,182,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F472B6", border: "1px solid rgba(244,114,182,0.2)" }}><ImageIcon size={20} /></div>
                Upload Foto / Dokumen
              </button>
              <button onClick={onCamera} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", color: "#F8FAFC", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(125,211,252,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7DD3FC", border: "1px solid rgba(125,211,252,0.2)" }}><Camera size={20} /></div>
                Kamera Realtime
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<TransactionCategory | "all">("all");
  const [dateFilter, setDateFilter]     = useState<"all" | "this_month" | "last_month">("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);
  
  const [showAddMenu, setShowAddMenu]       = useState(false);
  const [showForm, setShowForm]             = useState(false);
  const [editingTx, setEditingTx]           = useState<Transaction | null>(null);
  const [showCamera, setShowCamera]         = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  
  const [scanResult, setScanResult]     = useState<ScanResult | null>(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

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

  const filtered = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter((t) => {
      // 1. Search text
      const matchSearch = !debouncedSearch || t.note.toLowerCase().includes(debouncedSearch.toLowerCase()) || (t.merchant ?? "").toLowerCase().includes(debouncedSearch.toLowerCase());
      
      // 2. Category
      const matchCategory = activeFilter === "all" || t.category === activeFilter;
      
      // 3. Date Range
      let matchDate = true;
      if (dateFilter === "this_month") {
        matchDate = t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear;
      } else if (dateFilter === "last_month") {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        matchDate = t.date.getMonth() === lastMonth && t.date.getFullYear() === lastMonthYear;
      }
      
      return matchSearch && matchCategory && matchDate;
    });
  }, [transactions, debouncedSearch, activeFilter, dateFilter]);

  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome  = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setShowAddMenu(false);
    try {
      const compressed = await compressImage(file);
      const res = await scanReceiptImage(compressed.base64, compressed.mimeType, "photo");
      setScanResult(res);
      setShowScanResult(true);
    } catch (err: any) {
      alert(err.message ?? "Gagal memindai gambar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const checkCooldownAndOpen = (action: "photo" | "camera") => {
    const { canUse, remainingMinutes } = checkVisionCooldown();
    if (!canUse) {
      setShowAddMenu(false);
      setToastMsg(`Limit tercapai. Fitur AI Scanner dapat digunakan lagi dalam ${remainingMinutes} menit.`);
      setTimeout(() => setToastMsg(null), 4000);
      return;
    }
    
    if (action === "photo") fileInputRef.current?.click();
    if (action === "camera") {
      setShowAddMenu(false);
      setShowCamera(true);
    }
  };

  const handleConfirmScan = async (draft: TransactionDraft) => {
    if (!user) return;
    await addTransaction(user.uid, draft);
    setVisionUsed();
  };

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
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ maxWidth: 1000, width: "100%", margin: "0 auto", padding: "32px 20px" }}>
      
      {/* File input (Hidden) */}
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
      
      {/* Sheets */}
      {user && <TransactionFormSheet isOpen={showForm} onClose={() => { setShowForm(false); setEditingTx(null); }} userId={user.uid} transactionToEdit={editingTx} onDelete={deleteTransaction} />}
      <AddMenuSheet isOpen={showAddMenu} onClose={() => setShowAddMenu(false)} 
        onManual={() => { setShowAddMenu(false); setShowForm(true); setEditingTx(null); }} 
        onPhoto={() => checkCooldownAndOpen("photo")} 
        onCamera={() => checkCooldownAndOpen("camera")} 
      />
      <CameraSheet isOpen={showCamera} onClose={() => setShowCamera(false)} onResult={(r) => { setScanResult(r); setShowScanResult(true); }} />
      {user && <ScanResultSheet isOpen={showScanResult} onClose={() => { setShowScanResult(false); setScanResult(null); }} result={scanResult} onConfirm={handleConfirmScan} />}

      {/* Loading Overlay for Upload */}
      <AnimatePresence>
        {isUploading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(3,7,18,0.8)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <motion.div animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 0px rgba(79,209,197,0)", "0 0 30px rgba(79,209,197,0.5)", "0 0 0px rgba(79,209,197,0)"] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(79,209,197,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(79,209,197,0.3)" }}>
              <Zap size={28} color="#4FD1C5" />
            </motion.div>
            <p style={{ fontSize: 15, color: "#4FD1C5", fontWeight: 700, letterSpacing: "0.02em" }}>AI sedang membaca struk...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Popup */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            style={{
              position: "fixed", bottom: 100, left: "50%",
              background: "linear-gradient(135deg, rgba(21, 33, 41, 0.95), rgba(11, 18, 21, 1))", border: "1px solid rgba(255,255,255,0.08)",
              padding: "14px 24px", borderRadius: 99, color: "#F8FAFC", fontSize: 14,
              fontWeight: 600, boxShadow: "0 20px 40px rgba(0,0,0,0.4)", zIndex: 100,
              display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap"
            }}
          >
            <span style={{ fontSize: 18 }}>⏳</span> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Histori Keuangan</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>Transaksi</h1>
        </div>
        <motion.button whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(79,209,197,0.3)" }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddMenu(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 16, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", color: "#030712", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(79,209,197,0.2)" }}>
          <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Tambah Transaksi</span>
        </motion.button>
      </motion.div>

      {/* Summary */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <div style={{ padding: "24px", borderRadius: 24, background: "linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(74, 222, 128, 0.01))", border: "1px solid rgba(74,222,128,0.1)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)", filter: "blur(20px)" }} />
          <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pemasukan</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: "#4ADE80", overflowWrap: "anywhere", letterSpacing: "-0.02em" }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div style={{ padding: "24px", borderRadius: 24, background: "linear-gradient(135deg, rgba(248, 113, 113, 0.05), rgba(248, 113, 113, 0.01))", border: "1px solid rgba(248,113,113,0.1)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(248,113,113,0.1) 0%, transparent 70%)", filter: "blur(20px)" }} />
          <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pengeluaran</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: "#F87171", overflowWrap: "anywhere", letterSpacing: "-0.02em" }}>{formatCurrency(totalExpense)}</p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} style={{ position: "relative", marginBottom: 24 }}>
        <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari transaksi berdasarkan catatan atau merchant..."
          className="input-field" style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "#F8FAFC", fontSize: 14 }} />
      </motion.div>

      {/* Filter Chips - Date */}
      <motion.div variants={itemVariants} style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, marginBottom: 16, scrollbarWidth: "none" }}>
        {[
          { id: "all", label: "Semua Waktu" },
          { id: "this_month", label: "Bulan Ini" },
          { id: "last_month", label: "Bulan Lalu" }
        ].map(filter => (
          <button key={filter.id} onClick={() => setDateFilter(filter.id as any)}
            style={{ flexShrink: 0, padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600, border: `1px solid ${dateFilter === filter.id ? "rgba(79,209,197,0.3)" : "rgba(255,255,255,0.06)"}`, background: dateFilter === filter.id ? "rgba(79,209,197,0.1)" : "rgba(255,255,255,0.01)", color: dateFilter === filter.id ? "#4FD1C5" : "#94A3B8", cursor: "pointer", transition: "all 0.2s" }}>
            {filter.label}
          </button>
        ))}
      </motion.div>

      {/* Filter Chips - Category */}
      <motion.div variants={itemVariants} style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, marginBottom: 32, scrollbarWidth: "none" }}>
        <button onClick={() => setActiveFilter("all")}
          style={{ flexShrink: 0, padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600, border: `1px solid ${activeFilter === "all" ? "rgba(79,209,197,0.3)" : "rgba(255,255,255,0.06)"}`, background: activeFilter === "all" ? "rgba(79,209,197,0.1)" : "rgba(255,255,255,0.01)", color: activeFilter === "all" ? "#4FD1C5" : "#94A3B8", cursor: "pointer", transition: "all 0.2s" }}>
          Semua Kategori
        </button>
        {CATEGORY_KEYS.map((cat) => {
          const m = CATEGORY_META[cat];
          const isActive = activeFilter === cat;
          const Icon = m.icon;
          return (
            <button key={cat} onClick={() => setActiveFilter(isActive ? "all" : cat)}
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600, border: `1px solid ${isActive ? m.color : "rgba(255,255,255,0.06)"}`, background: isActive ? m.bg : "rgba(255,255,255,0.01)", color: isActive ? m.color : "#94A3B8", cursor: "pointer", transition: "all 0.2s" }}>
              <Icon size={14} color={isActive ? m.color : "#94A3B8"} /> {m.label}
            </button>
          );
        })}
      </motion.div>

      {/* List */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 16 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 32 }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📂</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>Tidak ada transaksi</p>
            <p style={{ fontSize: 14, color: "#94A3B8" }}>{search ? "Coba kata kunci lain" : "Tambah transaksi pertamamu untuk mulai melacak keuangan!"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((t, i) => (
              <div key={t.id} onClick={() => { setEditingTx(t); setShowForm(true); }} style={{ cursor: "pointer" }}>
                <TransactionItem transaction={t} index={i} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
