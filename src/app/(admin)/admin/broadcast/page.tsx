"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success">("info");
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; success: boolean } | null>(null);

  const handleSend = async () => {
    if (!title || !message) return;
    setIsSending(true);
    setStatusMsg(null);

    try {
      await addDoc(collection(db, "broadcasts"), {
        title,
        message,
        type,
        createdAt: serverTimestamp(),
        active: true,
      });

      setStatusMsg({ text: "Pesan berhasil dikirim ke seluruh pengguna!", success: true });
      setTitle("");
      setMessage("");
    } catch (e) {
      console.error(e);
      setStatusMsg({ text: "Gagal mengirim pesan broadcast.", success: false });
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Broadcast Message
        </h1>
        <p style={{ color: "#748391", fontSize: 14, marginBottom: 32 }}>
          Kirim pengumuman penting yang akan muncul di dashboard semua pengguna.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>
        {/* Editor */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "#152129", padding: 28, borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "#AAB7C2", marginBottom: 8, fontWeight: 500 }}>
              Judul Pengumuman
            </label>
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Maintenance Server" 
              className="input-field" 
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, color: "#AAB7C2", marginBottom: 8, fontWeight: 500 }}>
              Isi Pesan
            </label>
            <textarea 
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Tulis pesan lengkap di sini..." 
              className="input-field" 
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", minHeight: 120, resize: "vertical" }}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: 13, color: "#AAB7C2", marginBottom: 8, fontWeight: 500 }}>
              Tipe Pesan
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              {(["info", "success", "warning"] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  style={{ 
                    flex: 1, padding: "10px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize",
                    border: type === t 
                      ? `1px solid ${t === "info" ? "#7DD3FC" : t === "success" ? "#6EE7B7" : "#F6C177"}`
                      : "1px solid rgba(255,255,255,0.08)",
                    background: type === t 
                      ? `rgba(${t === "info" ? "125,211,252" : t === "success" ? "110,231,183" : "246,193,119"},0.1)` 
                      : "transparent",
                    color: type === t ? (t === "info" ? "#7DD3FC" : t === "success" ? "#6EE7B7" : "#F6C177") : "#748391"
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSend} 
            disabled={!title || !message || isSending}
            style={{ 
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, border: "none",
              background: !title || !message || isSending ? "rgba(246,193,119,0.3)" : "#F6C177", 
              color: "#0B1215", fontSize: 14, fontWeight: 700, cursor: !title || !message || isSending ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}>
            {isSending ? "Mengirim..." : <><Send size={16} strokeWidth={2.5} /> Kirim Sekarang</>}
          </button>

          <AnimatePresence>
            {statusMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, background: statusMsg.success ? "rgba(110,231,183,0.1)" : "rgba(232,137,137,0.1)", color: statusMsg.success ? "#6EE7B7" : "#E88989", fontSize: 13, fontWeight: 500 }}>
                  {statusMsg.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {statusMsg.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Live Preview */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: 14, color: "#748391", marginBottom: 12, fontWeight: 600 }}>Live Preview</h3>
          <div style={{ background: "#0B1215", padding: 20, borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
            {/* Fake App Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, opacity: 0.5 }}>
              <div style={{ height: 20, width: 100, background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
              <div style={{ height: 32, width: 32, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
            </div>

            {/* Broadcast Toast Preview */}
            <AnimatePresence mode="popLayout">
              {(title || message) && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 16, borderRadius: 16,
                    background: type === "info" ? "rgba(125,211,252,0.1)" : type === "success" ? "rgba(110,231,183,0.1)" : "rgba(246,193,119,0.1)",
                    border: `1px solid ${type === "info" ? "rgba(125,211,252,0.2)" : type === "success" ? "rgba(110,231,183,0.2)" : "rgba(246,193,119,0.2)"}`,
                    marginBottom: 20
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <AlertCircle size={18} color={type === "info" ? "#7DD3FC" : type === "success" ? "#6EE7B7" : "#F6C177"} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: type === "info" ? "#7DD3FC" : type === "success" ? "#6EE7B7" : "#F6C177", marginBottom: 4 }}>
                        {title || "Judul Pengumuman"}
                      </p>
                      <p style={{ fontSize: 12, color: "#AAB7C2", lineHeight: 1.5 }}>
                        {message || "Isi pesan akan muncul di sini..."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fake Content */}
            <div style={{ height: 80, background: "rgba(255,255,255,0.04)", borderRadius: 16, marginBottom: 12 }} />
            <div style={{ height: 60, background: "rgba(255,255,255,0.04)", borderRadius: 16 }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
