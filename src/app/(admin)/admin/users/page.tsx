"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserX, UserCheck } from "lucide-react";
import { getAllUsersForAdmin } from "@/lib/db";
import { UserProfile } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsersForAdmin().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Manajemen Pengguna
        </h1>
        <p style={{ color: "#748391", fontSize: 14, marginBottom: 32 }}>
          Lihat semua daftar pengguna yang terdaftar di Ninja Finance.
        </p>
      </motion.div>

      <div style={{ position: "relative", marginBottom: 24 }}>
        <Search size={16} color="#748391" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
        <input 
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari email atau nama pengguna..." 
          className="input-field" 
          style={{ paddingLeft: 42, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }} 
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ background: "#152129", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#748391" }}>Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#748391" }}>Tidak ada pengguna ditemukan.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left", fontSize: 12, color: "#748391", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "16px 20px" }}>Pengguna</th>
                  <th style={{ padding: "16px 20px" }}>Email</th>
                  <th style={{ padding: "16px 20px" }}>Mata Uang</th>
                  <th style={{ padding: "16px 20px" }}>Bergabung</th>
                  <th style={{ padding: "16px 20px", textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.uid} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0B1215", fontSize: 14, fontWeight: 700 }}>
                          {u.displayName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>{u.displayName}</p>
                          <p style={{ fontSize: 11, color: "#748391", marginTop: 2 }}>ID: {u.uid.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#AAB7C2" }}>{u.email}</td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#AAB7C2" }}>
                      <span className="badge" style={{ background: "rgba(246,193,119,0.1)", color: "#F6C177", border: "1px solid rgba(246,193,119,0.2)" }}>
                        {u.currency}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#AAB7C2" }}>
                      {u.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 8, color: "#F5F7FA", fontSize: 12, cursor: "pointer" }}>
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
