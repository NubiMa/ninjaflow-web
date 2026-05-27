"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, AlertTriangle, AlertCircle, Target, Home, Car, Plane, Laptop, Smartphone, GraduationCap, Gem, Leaf, Coins } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToGoals, addGoal, deleteGoalWithRefund, updateGoalAmount, addTransaction } from "@/lib/db";
import { Goal } from "@/types";
import { formatCurrency } from "@/lib/utils";

const GOAL_ICONS: Record<string, any> = {
  "🎯": Target,
  "🏠": Home,
  "🚗": Car,
  "✈️": Plane,
  "💻": Laptop,
  "📱": Smartphone,
  "🎓": GraduationCap,
  "💍": Gem,
  "🌿": Leaf,
  "💰": Coins
};

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
            onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(3,7,18,0.8)", zIndex: 40, backdropFilter: "blur(8px)" }} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: "50%", left: "50%", zIndex: 50,
              background: "linear-gradient(145deg, rgba(21, 33, 41, 0.9) 0%, rgba(11, 18, 21, 1) 100%)", borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "24px 20px",
              width: "90%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC" }}>Tambah Goal</h2>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} color="#AAB7C2" /></button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {Object.entries(GOAL_ICONS).map(([key, Icon]) => (
                <button key={key} onClick={() => setEmoji(key)}
                  style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: emoji === key ? "rgba(79,209,197,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${emoji === key ? "rgba(79,209,197,0.3)" : "rgba(255,255,255,0.06)"}`, cursor: "pointer", transition: "all 0.2s" }}>
                  <Icon size={20} color={emoji === key ? "#4FD1C5" : "#94A3B8"} />
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Nama Goal</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Beli Laptop Baru" className="input-field" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC", fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Target (IDR)</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" className="input-field" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC", fontSize: 14 }} />
            </div>
            <button onClick={handleSave} disabled={saving || !title || !target}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: saving || !title || !target ? "rgba(79,209,197,0.3)" : "linear-gradient(135deg, #4FD1C5, #7DD3FC)", color: "#030712", fontWeight: 700, fontSize: 15, transition: "all 0.2s" }}>
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
            onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(3,7,18,0.8)", zIndex: 40, backdropFilter: "blur(8px)" }} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: "50%", left: "50%", zIndex: 50,
              background: "linear-gradient(145deg, rgba(21, 33, 41, 0.9) 0%, rgba(11, 18, 21, 1) 100%)", borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "24px 20px",
              width: "90%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC" }}>Top Up Goal</h2>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} color="#AAB7C2" /></button>
            </div>
            
            <div style={{ marginBottom: 24, textAlign: "center", background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
               <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", border: "1px solid rgba(255,255,255,0.1)" }}>
                 {(() => {
                   const Icon = GOAL_ICONS[goal.emoji] || Target;
                   return <Icon size={32} color="#4FD1C5" />;
                 })()}
               </div>
               <p style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", marginTop: 12 }}>{goal.title}</p>
               <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Terkumpul: {formatCurrency(goal.currentAmount)}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Nominal Top Up (IDR)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="input-field" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC", fontSize: 14 }} />
            </div>
            <button onClick={handleSave} disabled={saving || !amount}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: saving || !amount ? "rgba(79,209,197,0.3)" : "linear-gradient(135deg, #4FD1C5, #7DD3FC)", color: "#030712", fontWeight: 700, fontSize: 15, transition: "all 0.2s" }}>
              {saving ? "Menyimpan..." : "Top Up Sekarang"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DeleteGoalSheet({ goal, onClose, userId }: { goal: Goal | null; onClose: () => void; userId: string }) {
  const [saving, setSaving] = useState(false);

  const handleDelete = async () => {
    if (!goal) return;
    setSaving(true);
    try {
      await deleteGoalWithRefund(userId, {
        id: goal.id,
        title: goal.title,
        currentAmount: goal.currentAmount
      });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {goal && (
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
              background: "linear-gradient(145deg, rgba(21, 33, 41, 0.9) 0%, rgba(11, 18, 21, 1) 100%)", borderRadius: 24,
              border: "1px solid rgba(248,113,113,0.15)",
              padding: "24px 20px",
              width: "90%", maxWidth: 400, maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={16} color="#F87171" />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC" }}>Hapus Goal?</h2>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} color="#AAB7C2" /></button>
            </div>
            
            <div style={{ marginBottom: 24, padding: 16, borderRadius: 16, background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.1)" }}>
              <p style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.5, marginBottom: 12 }}>
                Apakah kamu yakin ingin menghapus goal <strong>{goal.title}</strong>?
              </p>
              {goal.currentAmount > 0 && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(74,222,128,0.05)", padding: 12, borderRadius: 12, border: "1px solid rgba(74,222,128,0.1)" }}>
                  <AlertCircle size={16} color="#4ADE80" style={{ marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>
                    Tenang saja, dana sebesar <strong style={{ color: "#4ADE80" }}>{formatCurrency(goal.currentAmount)}</strong> yang sudah terkumpul akan dikembalikan (refund) ke Saldo Total kamu.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onClose} disabled={saving} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "transparent", color: "#F8FAFC", fontWeight: 600, fontSize: 14 }}>
                Batal
              </button>
              <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: "#F87171", color: "#030712", fontWeight: 700, fontSize: 14 }}>
                {saving ? "Menghapus..." : "Hapus Goal"}
              </button>
            </div>
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
  const [deleteGoal, setDeleteGoal] = useState<Goal | null>(null);

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
      {user && <AddGoalSheet isOpen={showAdd} onClose={() => setShowAdd(false)} userId={user.uid} />}
      {user && <TopUpSheet goal={selectedGoal} onClose={() => setSelectedGoal(null)} userId={user.uid} />}
      {user && <DeleteGoalSheet goal={deleteGoal} onClose={() => setDeleteGoal(null)} userId={user.uid} />}

      <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
        <div>
          <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>
            Tabungan Masa Depan
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>
            Goals
          </h1>
        </div>
        <motion.button whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(79,209,197,0.3)" }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 16, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", color: "#030712", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(79,209,197,0.2)" }}>
          <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Tambah Goal</span>
        </motion.button>
      </motion.div>

      {/* Overall progress */}
      {!loading && goals.length > 0 && (
        <motion.div variants={itemVariants} style={{ position: "relative", overflow: "hidden", padding: "32px", borderRadius: 32, background: "linear-gradient(145deg, rgba(21, 33, 41, 0.9) 0%, rgba(11, 18, 21, 1) 100%)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,209,197,0.1) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
          
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, position: "relative", zIndex: 1, gap: 20 }}>
            <div>
              <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Total Progress</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <p style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, color: "#4FD1C5", letterSpacing: "-0.02em" }}>{formatCurrency(totalCurrent)}</p>
                <p style={{ fontSize: 15, color: "#64748B", fontWeight: 500 }}>/ {formatCurrency(totalTarget)}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(79,209,197,0.1)", border: "1px solid rgba(79,209,197,0.2)" }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#7DD3FC" }}>{overallPct}%</p>
              </div>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative", zIndex: 1 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4FD1C5, #7DD3FC)", boxShadow: "0 0 20px rgba(79,209,197,0.4)" }} />
          </div>
        </motion.div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 24 }} />)}
        </div>
      ) : goals.length === 0 ? (
        <motion.div variants={itemVariants} style={{ textAlign: "center", padding: "80px 20px", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 32 }}>
          {/* <p style={{ fontSize: 48, marginBottom: 16 }}>🎯</p> */}
          <p style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>Belum ada goals</p>
          <p style={{ fontSize: 14, color: "#94A3B8" }}>Mulai rencanakan masa depanmu dengan menambahkan goal pertamamu.</p>
        </motion.div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {goals.map((goal, i) => {
            const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            const isComplete = pct >= 100;
            
            return (
              <motion.div key={goal.id} variants={itemVariants} custom={i} whileHover={{ y: -4, borderColor: "rgba(79,209,197,0.3)" }}
                style={{ padding: "24px", borderRadius: 24, background: "linear-gradient(135deg, rgba(21, 33, 41, 0.8), rgba(11, 18, 21, 0.9))", border: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", position: "relative", overflow: "hidden", transition: "all 0.3s" }}>
                
                {isComplete && (
                  <div style={{ position: "absolute", top: 0, right: 0, left: 0, height: 2, background: "linear-gradient(90deg, transparent, #4ADE80, transparent)" }} />
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                      {(() => {
                        const Icon = GOAL_ICONS[goal.emoji] || Target;
                        return <Icon size={24} color="#F8FAFC" />;
                      })()}
                    </div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", marginBottom: 2 }}>{goal.title}</p>
                      <p style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>Target: {formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.02)", padding: 4, borderRadius: 12, border: "1px solid rgba(255,255,255,0.03)" }}>
                    <motion.button whileHover={{ scale: 1.1, background: "rgba(79,209,197,0.15)" }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedGoal(goal)}
                      style={{ background: "rgba(79,209,197,0.1)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", transition: "background 0.2s" }}>
                      <Plus size={14} color="#4FD1C5" strokeWidth={2.5} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1, background: "rgba(248,113,113,0.15)" }} whileTap={{ scale: 0.9 }} onClick={() => setDeleteGoal(goal)}
                      style={{ background: "transparent", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", transition: "background 0.2s" }}>
                      <X size={14} color="#94A3B8" strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "flex-end" }}>
                  <div>
                    <p style={{ fontSize: 11, color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Terkumpul</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: isComplete ? "#4ADE80" : "#E2E8F0", letterSpacing: "-0.01em" }}>{formatCurrency(goal.currentAmount)}</p>
                  </div>
                  <div style={{ background: isComplete ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.03)", padding: "4px 10px", borderRadius: 8, border: isComplete ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: isComplete ? "#4ADE80" : "#94A3B8" }}>{pct}%</p>
                  </div>
                </div>
                
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: "100%", borderRadius: 99, background: isComplete ? "#4ADE80" : "linear-gradient(90deg, #4FD1C5, #7DD3FC)", boxShadow: isComplete ? "0 0 10px rgba(74,222,128,0.4)" : "none" }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
