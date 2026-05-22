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
            onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, backdropFilter: "blur(4px)" }} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: "50%", left: "50%", zIndex: 50,
              background: "#10181D", borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "24px 20px",
              width: "90%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#F5F7FA" }}>{transactionToEdit ? "Edit Transaksi" : "Tambah Transaksi"}</h2>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#AAB7C2" />
              </button>
            </div>

            {/* Type Toggle */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4 }}>
              {(["expense", "income"] as const).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  style={{
                    padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                    background: type === t ? (t === "expense" ? "#E88989" : "#6EE7B7") : "transparent",
                    color: type === t ? "#0B1215" : "#748391",
                    transition: "all 0.2s ease",
                  }}>
                  {t === "expense" ? "Pengeluaran" : "Pemasukan"}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 6, fontWeight: 500 }}>Nominal</label>
              <input
                type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0" className="input-field" style={{ fontSize: 22, fontWeight: 700 }}
              />
            </div>

            {/* Note */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 6, fontWeight: 500 }}>Keterangan</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Makan siang" className="input-field" />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 10, fontWeight: 500 }}>Kategori</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 8 }}>
                {CATEGORY_KEYS.map((cat) => {
                  const m = CATEGORY_META[cat];
                  return (
                    <button key={cat} onClick={() => setCategory(cat)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        padding: "10px 6px", borderRadius: 12, border: `1px solid ${category === cat ? m.color : "rgba(255,255,255,0.06)"}`,
                        background: category === cat ? m.bg : "rgba(255,255,255,0.02)", cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}>
                      <span style={{ fontSize: 20 }}>{m.emoji}</span>
                      <span style={{ fontSize: 10, color: category === cat ? m.color : "#748391", fontWeight: 500, textAlign: "center", wordBreak: "break-word" }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {transactionToEdit && (
                <button onClick={handleDelete} disabled={saving}
                  style={{
                    padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
                    background: "rgba(232,137,137,0.15)", color: "#E88989", fontWeight: 700, fontSize: 15, transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                  Hapus
                </button>
              )}
              <button onClick={handleSave} disabled={saving || !amount}
                style={{
                  flex: 1, padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
                  background: saving || !amount ? "rgba(79,209,197,0.3)" : "#4FD1C5",
                  color: "#0B1215", fontWeight: 700, fontSize: 15, transition: "all 0.2s ease",
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
            onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, backdropFilter: "blur(4px)" }} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }} exit={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: "50%", left: "50%", zIndex: 50,
              background: "#10181D", borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "24px 20px", width: "90%", maxWidth: 380,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#F5F7FA" }}>Pilih Cara Tambah</h2>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#AAB7C2" />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={onManual} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#F5F7FA", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(79,209,197,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4FD1C5" }}><Edit3 size={18} /></div>
                Manual Input
              </button>
              <button onClick={onPhoto} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#F5F7FA", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(244,114,182,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F472B6" }}><ImageIcon size={18} /></div>
                Upload Foto / Dokumen
              </button>
              <button onClick={onCamera} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#F5F7FA", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(125,211,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7DD3FC" }}><Camera size={18} /></div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(79,209,197,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={24} color="#4FD1C5" />
            </motion.div>
            <p style={{ fontSize: 14, color: "#4FD1C5", fontWeight: 600 }}>AI sedang membaca struk...</p>
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
              background: "#152129", border: "1px solid rgba(232,137,137,0.3)",
              padding: "12px 20px", borderRadius: 99, color: "#F5F7FA", fontSize: 13,
              fontWeight: 500, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 100,
              display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap"
            }}
          >
            <span>⏳</span> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#F5F7FA", letterSpacing: "-0.02em" }}>Transaksi</h1>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAddMenu(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "#4FD1C5", color: "#0B1215", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>
          <Plus size={15} strokeWidth={2.5} /> Tambah
        </motion.button>
      </motion.div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div style={{ padding: "16px 18px", borderRadius: 16, background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.12)" }}>
          <p style={{ fontSize: 11, color: "#748391", marginBottom: 4 }}>Total Pemasukan</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#6EE7B7", overflowWrap: "anywhere" }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div style={{ padding: "16px 18px", borderRadius: 16, background: "rgba(232,137,137,0.06)", border: "1px solid rgba(232,137,137,0.12)" }}>
          <p style={{ fontSize: 11, color: "#748391", marginBottom: 4 }}>Total Pengeluaran</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#E88989", overflowWrap: "anywhere" }}>{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={15} color="#748391" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari transaksi..."
          className="input-field" style={{ paddingLeft: 40 }} />
      </div>

      {/* Filter Chips - Date */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12, scrollbarWidth: "none" }}>
        {[
          { id: "all", label: "Semua Waktu" },
          { id: "this_month", label: "Bulan Ini" },
          { id: "last_month", label: "Bulan Lalu" }
        ].map(filter => (
          <button key={filter.id} onClick={() => setDateFilter(filter.id as any)}
            style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, border: `1px solid ${dateFilter === filter.id ? "#4FD1C5" : "rgba(255,255,255,0.08)"}`, background: dateFilter === filter.id ? "rgba(79,209,197,0.12)" : "transparent", color: dateFilter === filter.id ? "#4FD1C5" : "#748391", cursor: "pointer" }}>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Filter Chips - Category */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20, scrollbarWidth: "none" }}>
        <button onClick={() => setActiveFilter("all")}
          style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, border: `1px solid ${activeFilter === "all" ? "#4FD1C5" : "rgba(255,255,255,0.08)"}`, background: activeFilter === "all" ? "rgba(79,209,197,0.12)" : "transparent", color: activeFilter === "all" ? "#4FD1C5" : "#748391", cursor: "pointer" }}>
          Semua Kategori
        </button>
        {CATEGORY_KEYS.map((cat) => {
          const m = CATEGORY_META[cat];
          const isActive = activeFilter === cat;
          return (
            <button key={cat} onClick={() => setActiveFilter(isActive ? "all" : cat)}
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500, border: `1px solid ${isActive ? m.color : "rgba(255,255,255,0.08)"}`, background: isActive ? m.bg : "transparent", color: isActive ? m.color : "#748391", cursor: "pointer" }}>
              <span>{m.emoji}</span> {m.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 62, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#748391" }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>📂</p>
          <p style={{ fontSize: 14 }}>Tidak ada transaksi</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>{search ? "Coba kata kunci lain" : "Tambah transaksi pertamamu!"}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((t, i) => (
            <div key={t.id} onClick={() => { setEditingTx(t); setShowForm(true); }} style={{ cursor: "pointer" }}>
              <TransactionItem transaction={t} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
