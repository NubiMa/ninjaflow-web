"use client";

import { motion } from "framer-motion";
import { Terminal, Cpu, Database, Activity } from "lucide-react";

export default function AdminLogsPage() {
  const MOCK_LOGS = [
    { id: 1, type: "AI_SCAN", message: "Processed receipt image", user: "U_A73X9", time: "Baru saja", status: "success", quota: "Free" },
    { id: 2, type: "AI_SCAN", message: "Extracted transaction data", user: "U_B92M1", time: "5 mnt lalu", status: "success", quota: "Free" },
    { id: 3, type: "SYS_ERR", message: "Failed to connect to Firebase", user: "system", time: "12 mnt lalu", status: "error", quota: null },
    { id: 4, type: "USER_AUTH", message: "New user registered via Google", user: "U_K81L2", time: "1 jam lalu", status: "info", quota: null },
    { id: 5, type: "AI_SCAN", message: "Processed receipt image (blurred)", user: "U_C44X1", time: "3 jam lalu", status: "warning", quota: "Free" },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.02em", marginBottom: 6 }}>
          System Logs & AI Monitoring
        </h1>
        <p style={{ color: "#748391", fontSize: 14, marginBottom: 32 }}>
          Lacak error sistem, autentikasi pengguna, dan penggunaan kuota API Gemini.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          style={{ background: "#152129", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(125,211,252,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={24} color="#7DD3FC" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#748391", marginBottom: 4 }}>Total AI Requests</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#F5F7FA" }}>142 <span style={{ fontSize: 12, fontWeight: 500, color: "#7DD3FC" }}>bulan ini</span></p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          style={{ background: "#152129", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(110,231,183,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Database size={24} color="#6EE7B7" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#748391", marginBottom: 4 }}>Status Kuota API</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#F5F7FA" }}>Free Tier <span style={{ fontSize: 12, fontWeight: 500, color: "#6EE7B7" }}>aktif</span></p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          style={{ background: "#152129", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(232,137,137,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={24} color="#E88989" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#748391", marginBottom: 4 }}>System Errors</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#F5F7FA" }}>1 <span style={{ fontSize: 12, fontWeight: 500, color: "#E88989" }}>perlu cek</span></p>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: "#0B1215", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>
        
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <Terminal size={18} color="#AAB7C2" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA", letterSpacing: "0.05em", textTransform: "uppercase" }}>Live Server Terminal</span>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, fontFamily: "monospace", fontSize: 13 }}>
          {MOCK_LOGS.map((log) => (
            <div key={log.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ color: "#748391", whiteSpace: "nowrap", width: 80 }}>[{log.time}]</div>
              <div style={{ 
                color: log.status === "error" ? "#E88989" : log.status === "warning" ? "#F6C177" : log.status === "success" ? "#6EE7B7" : "#7DD3FC",
                fontWeight: 600, width: 90
              }}>
                {log.type}
              </div>
              <div style={{ color: "#F5F7FA", flex: 1 }}>{log.message}</div>
              <div style={{ color: "#748391", width: 80 }}>{log.user}</div>
              <div style={{ color: "#6EE7B7", width: 60, textAlign: "right" }}>{log.quota || "-"}</div>
            </div>
          ))}
          <div style={{ color: "#748391", marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4FD1C5", boxShadow: "0 0 10px #4FD1C5", animation: "pulse 2s infinite" }} />
            Listening for new events...
          </div>
        </div>
      </motion.div>
    </div>
  );
}
