"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, X, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToGoals, addGoal, deleteGoal, updateGoalAmount, addTransaction } from "@/lib/db";
import { Goal } from "@/types";
import { formatCurrency } from "@/lib/utils";

const EMOJIS = ["🎯", "🏠", "🚗", "✈️", "💻", "📱", "🎓", "💍", "🌿", "💰"];

function AddGoalSheet({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string }) {
  const [title, setTitle]   = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji]   = useState("🎯");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !target) return;
    setSaving(true);
    try {
      await addGoal(userId, { title, targetAmount: Number(target), currentAmount: 0, emoji });
      setTitle(""); setTarget(""); setEmoji("🎯");
      onClose();
    } finally { setSaving(false); }
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#F5F7FA" }}>Tambah Goal</h2>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} color="#AAB7C2" /></button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  style={{ width: 44, height: 44, borderRadius: 12, fontSize: 22, background: emoji === e ? "rgba(79,209,197,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${emoji === e ? "rgba(79,209,197,0.3)" : "rgba(255,255,255,0.06)"}`, cursor: "pointer" }}>
                  {e}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 6 }}>Nama Goal</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Beli Laptop Baru" className="input-field" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 6 }}>Target (IDR)</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" className="input-field" />
            </div>
            <button onClick={handleSave} disabled={saving || !title || !target}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: saving || !title || !target ? "rgba(79,209,197,0.3)" : "#4FD1C5", color: "#0B1215", fontWeight: 700, fontSize: 15 }}>
              {saving ? "Menyimpan..." : "Simpan Goal"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TopUpSheet({ goal, onClose, userId }: { goal: Goal | null; onClose: () => void; userId: string }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!goal || !amount) return;
    setSaving(true);
    try {
      const added = Number(amount);
      await updateGoalAmount(goal.id, goal.currentAmount + added);
      
      // Auto create transaction to deduct balance
      await addTransaction(userId, {
        type: "expense",
        category: "investment",
        amount: added,
        date: new Date(),
        note: "Top Up Goal: " + goal.title,
        merchant: "Ninja Goals",
      });

      setAmount("");
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {goal && (
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#F5F7FA" }}>Top Up Goal</h2>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} color="#AAB7C2" /></button>
            </div>
            
            <div style={{ marginBottom: 24, textAlign: "center" }}>
               <span style={{ fontSize: 40 }}>{goal.emoji}</span>
               <p style={{ fontSize: 16, fontWeight: 600, color: "#F5F7FA", marginTop: 8 }}>{goal.title}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#748391", marginBottom: 6 }}>Nominal Top Up (IDR)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="input-field" />
            </div>
            <button onClick={handleSave} disabled={saving || !amount}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: saving || !amount ? "rgba(79,209,197,0.3)" : "#4FD1C5", color: "#0B1215", fontWeight: 700, fontSize: 15 }}>
              {saving ? "Menyimpan..." : "Top Up Sekarang"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals]     = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToGoals(user.uid, (gs) => { 
      setGoals(gs); 
      setLoading(false); 
      setError(null);
    }, (err) => {
      setLoading(false);
      setError(err.message);
    });
    return unsub;
  }, [user]);

  const totalTarget  = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallPct   = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

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
      {user && <AddGoalSheet isOpen={showAdd} onClose={() => setShowAdd(false)} userId={user.uid} />}
      {user && <TopUpSheet goal={selectedGoal} onClose={() => setSelectedGoal(null)} userId={user.uid} />}

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#F5F7FA", letterSpacing: "-0.02em" }}>Goals</h1>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAdd(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "#4FD1C5", color: "#0B1215", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>
          <Plus size={15} strokeWidth={2.5} /> Tambah Goal
        </motion.button>
      </motion.div>

      {/* Overall progress */}
      {!loading && goals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ padding: "20px 22px", borderRadius: 20, background: "#152129", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 12, color: "#748391", marginBottom: 4 }}>Total Progress</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#4FD1C5", overflowWrap: "anywhere" }}>{formatCurrency(totalCurrent)} <span style={{ fontSize: 13, color: "#748391", fontWeight: 400 }}>/ {formatCurrency(totalTarget)}</span></p>
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#F5F7FA" }}>{overallPct}%</p>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4FD1C5, #7DD3FC)" }} />
          </div>
        </motion.div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 20 }} />)}
        </div>
      ) : goals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#748391" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🎯</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#AAB7C2", marginBottom: 6 }}>Belum ada goals</p>
          <p style={{ fontSize: 13 }}>Tambah goal pertamamu dan mulai menabung!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {goals.map((goal, i) => {
            const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: "20px", borderRadius: 20, background: "#152129", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 26 }}>{goal.emoji}</span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA", marginTop: 8 }}>{goal.title}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setSelectedGoal(goal)}
                      style={{ background: "rgba(79,209,197,0.1)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                      <Plus size={13} color="#4FD1C5" />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)}
                      style={{ background: "rgba(232,137,137,0.08)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                      <X size={13} color="#E88989" />
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 13, color: "#748391", overflowWrap: "anywhere" }}>{formatCurrency(goal.currentAmount)}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#4FD1C5" }}>{pct}%</p>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 8 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ delay: i * 0.06 + 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: "100%", borderRadius: 99, background: pct >= 100 ? "#6EE7B7" : "linear-gradient(90deg, #4FD1C5, #7DD3FC)" }} />
                </div>
                <p style={{ fontSize: 11, color: "#748391", overflowWrap: "anywhere" }}>Target: {formatCurrency(goal.targetAmount)}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
