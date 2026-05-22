"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, CreditCard, Activity, ArrowUpRight } from "lucide-react";
import { getAllUsersForAdmin } from "@/lib/db";
import { UserProfile } from "@/types";

export default function AdminOverview() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllUsersForAdmin();
        setUsers(data);
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalUsers = users.length;
  const newUsersThisWeek = users.filter((u) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return u.createdAt > oneWeekAgo;
  }).length;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Admin Overview
        </h1>
        <p style={{ color: "#748391", fontSize: 14, marginBottom: 32 }}>
          Pantau performa sistem dan metrik Ninja Finance secara real-time.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: 24, borderRadius: 20, background: "rgba(246,193,119,0.06)", border: "1px solid rgba(246,193,119,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(246,193,119,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={22} color="#F6C177" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(110,231,183,0.1)", padding: "4px 8px", borderRadius: 99, color: "#6EE7B7", fontSize: 12, fontWeight: 600 }}>
              <ArrowUpRight size={14} /> +{newUsersThisWeek} minggu ini
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#748391", marginBottom: 4 }}>Total Pengguna</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#F5F7FA" }}>
            {loading ? "..." : totalUsers}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ padding: 24, borderRadius: 20, background: "rgba(79,209,197,0.06)", border: "1px solid rgba(79,209,197,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(79,209,197,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={22} color="#4FD1C5" />
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#748391", marginBottom: 4 }}>Status Firebase</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: "#F5F7FA", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#6EE7B7", boxShadow: "0 0 10px #6EE7B7" }} />
            Connected
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ padding: 24, borderRadius: 20, background: "rgba(125,211,252,0.06)", border: "1px solid rgba(125,211,252,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(125,211,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={22} color="#7DD3FC" />
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#748391", marginBottom: 4 }}>Penggunaan AI Hari Ini</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#F5F7FA" }}>
            0 <span style={{ fontSize: 14, fontWeight: 500, color: "#748391" }}>requests</span>
          </p>
        </motion.div>
      </div>

      {/* Basic Users Table Placeholder */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F5F7FA", marginBottom: 16 }}>Pendaftaran Terbaru</h2>
        <div style={{ background: "#152129", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 20, color: "#748391", textAlign: "center", fontSize: 14 }}>Memuat data pengguna...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 20, color: "#748391", textAlign: "center", fontSize: 14 }}>Belum ada pengguna.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left", fontSize: 12, color: "#748391", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 20px" }}>Nama Pengguna</th>
                  <th style={{ padding: "14px 20px" }}>Email</th>
                  <th style={{ padding: "14px 20px" }}>Mata Uang</th>
                  <th style={{ padding: "14px 20px" }}>Terdaftar</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((u, i) => (
                  <tr key={u.uid} style={{ borderBottom: i < Math.min(users.length, 5) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "14px 20px", fontSize: 14, color: "#F5F7FA", fontWeight: 500 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0B1215", fontSize: 13, fontWeight: 700 }}>
                          {u.displayName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        {u.displayName}
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#AAB7C2" }}>{u.email}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#AAB7C2" }}>{u.currency}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#AAB7C2" }}>
                      {u.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
