"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Edit3 } from "lucide-react";
import { ScanResult } from "@/app/actions/vision";
import { TransactionDraft, TransactionCategory, CATEGORY_META } from "@/types";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_KEYS = Object.keys(CATEGORY_META) as TransactionCategory[];

interface ScanResultSheetProps {
  isOpen: boolean;
  result: ScanResult | null;
  onClose: () => void;
  onConfirm: (draft: TransactionDraft) => Promise<void>;
}

export default function ScanResultSheet({ isOpen, result, onClose, onConfirm }: ScanResultSheetProps) {
  const [draft, setDraft] = useState<TransactionDraft | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync draft from incoming result
  if (result && !draft) setDraft(result.draft);

  const handleConfirm = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await onConfirm(draft);
      setDraft(null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const confidenceConfig = {
    high:   { color: "#6EE7B7", label: "Terbaca jelas",    icon: <CheckCircle size={12} /> },
    medium: { color: "#F6C177", label: "Beberapa data ambigu", icon: <AlertTriangle size={12} /> },
    low:    { color: "#E88989", label: "Gambar kurang jelas — periksa kembali", icon: <AlertTriangle size={12} /> },
  };
  const conf = result ? confidenceConfig[result.confidence] : null;

  return (
    <AnimatePresence>
      {isOpen && draft && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, backdropFilter: "blur(4px)" }} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: "50%", left: "50%", zIndex: 50,
              background: "#10181D", borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "24px 20px", width: "90%", maxWidth: 420, maxHeight: "90dvh", overflowY: "auto",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Edit3 size={15} color="#4FD1C5" />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#F5F7FA" }}>Hasil Scan Struk</span>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                <X size={16} color="#AAB7C2" />
              </button>
            </div>

            {/* Confidence badge */}
            {conf && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: `${conf.color}18`, border: `1px solid ${conf.color}40`, marginBottom: 20 }}>
                <span style={{ color: conf.color }}>{conf.icon}</span>
                <span style={{ fontSize: 11, color: conf.color, fontWeight: 600 }}>{conf.label}</span>
              </div>
            )}

            {/* AI disclaimer */}
            <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(79,209,197,0.04)", border: "1px solid rgba(79,209,197,0.12)", marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "#748391", lineHeight: 1.6 }}>
                ✨ Diperiksa oleh <span style={{ color: "#4FD1C5", fontWeight: 600 }}>AI Ninja</span> — pastikan semua data sudah benar sebelum menyimpan.
              </p>
            </div>

            {/* Type toggle */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4 }}>
              {(["expense", "income"] as const).map((t) => (
                <button key={t} onClick={() => setDraft(d => d ? { ...d, type: t } : d)}
                  style={{
                    padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                    background: draft.type === t ? (t === "expense" ? "#E88989" : "#6EE7B7") : "transparent",
                    color: draft.type === t ? "#0B1215" : "#748391", transition: "all 0.2s",
                  }}>
                  {t === "expense" ? "Pengeluaran" : "Pemasukan"}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 6, fontWeight: 500 }}>Nominal (IDR)</label>
              <input type="number" value={draft.amount || ""} onChange={e => setDraft(d => d ? { ...d, amount: Number(e.target.value) } : d)}
                className="input-field" style={{ fontSize: 20, fontWeight: 700 }} />
            </div>

            {/* Merchant */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 6, fontWeight: 500 }}>Merchant / Toko</label>
              <input value={draft.merchant ?? ""} onChange={e => setDraft(d => d ? { ...d, merchant: e.target.value } : d)}
                placeholder="Nama toko" className="input-field" />
            </div>

            {/* Note */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 6, fontWeight: 500 }}>Keterangan</label>
              <input value={draft.note} onChange={e => setDraft(d => d ? { ...d, note: e.target.value } : d)}
                placeholder="Keterangan transaksi" className="input-field" />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 10, fontWeight: 500 }}>Kategori</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 8 }}>
                {CATEGORY_KEYS.map((cat) => {
                  const m = CATEGORY_META[cat];
                  const isActive = draft.category === cat;
                  return (
                    <button key={cat} onClick={() => setDraft(d => d ? { ...d, category: cat } : d)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        padding: "10px 6px", borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${isActive ? m.color : "rgba(255,255,255,0.06)"}`,
                        background: isActive ? m.bg : "rgba(255,255,255,0.02)", transition: "all 0.15s",
                      }}>
                      <span style={{ fontSize: 20 }}>{m.emoji}</span>
                      <span style={{ fontSize: 10, color: draft.category === cat ? m.color : "#748391", fontWeight: 500, textAlign: "center", wordBreak: "break-word" }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <button onClick={handleConfirm} disabled={saving || !draft.amount}
              style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
                background: saving || !draft.amount ? "rgba(79,209,197,0.3)" : "#4FD1C5",
                color: "#0B1215", fontWeight: 700, fontSize: 15, marginBottom: 10,
              }}>
              {saving ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
            <button onClick={onClose}
              style={{ width: "100%", padding: "12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#748391", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
              Batalkan
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
