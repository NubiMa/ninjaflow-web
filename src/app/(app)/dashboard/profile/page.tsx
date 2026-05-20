"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, ChevronRight, LogOut, Moon, Globe, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getUserProfile, upsertUserProfile } from "@/lib/db";
import { UserProfile } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((p) => {
      if (p) setProfile(p);
      else setProfile({
        uid: user.uid,
        displayName: user.displayName ?? "Ninja User",
        email: user.email ?? "",
        photoURL: user.photoURL ?? undefined,
        currency: "IDR",
        monthlyBudget: 5000000,
        createdAt: new Date(),
      });
      setLoading(false);
    });
  }, [user]);

  const settingItems = [
    { icon: Bell,   label: "Notifikasi",      sub: "Kelola pengingat harian" },
    { icon: Shield, label: "Keamanan",         sub: "Password & privasi" },
    { icon: Globe,  label: "Mata Uang",        sub: profile?.currency ?? "IDR" },
    { icon: Moon,   label: "Tema Gelap",       sub: "Aktif" },
  ];

  return (
    <div style={{ maxWidth: 700, width: "100%", margin: "0 auto", padding: 20}}>
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ fontSize: 24, fontWeight: 700, color: "#F5F7FA", letterSpacing: "-0.02em", marginBottom: 28 }}>
        Profil
      </motion.h1>

      {/* Avatar Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: "28px", borderRadius: 24, background: "linear-gradient(135deg, #152129, #1a2d38)", border: "1px solid rgba(79,209,197,0.12)", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(79,209,197,0.05)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#0B1215", flexShrink: 0 }}>
          {loading ? <User size={24} color="#0B1215" /> : (profile?.displayName?.[0]?.toUpperCase() ?? "N")}
        </div>
        <div>
          {loading ? (
            <>
              <div className="skeleton" style={{ height: 18, width: 140, borderRadius: 6, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 13, width: 180, borderRadius: 6 }} />
            </>
          ) : (
            <>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#F5F7FA" }}>{profile?.displayName}</p>
              <p style={{ fontSize: 13, color: "#748391", marginTop: 4 }}>{profile?.email}</p>
              <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, background: "rgba(79,209,197,0.1)", border: "1px solid rgba(79,209,197,0.2)" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4FD1C5" }}>Ninja Member</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Budget Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        style={{ padding: "18px 22px", borderRadius: 18, background: "#152129", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 12, color: "#748391", marginBottom: 4 }}>Budget Bulanan</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#F5F7FA" }}>
            {loading ? "—" : formatCurrency(profile?.monthlyBudget ?? 5000000)}
          </p>
        </div>
        <button style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(79,209,197,0.1)", border: "1px solid rgba(79,209,197,0.15)", color: "#4FD1C5", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          Edit
        </button>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
        style={{ borderRadius: 20, background: "#152129", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 16 }}>
        {settingItems.map(({ icon: Icon, label, sub }, i) => (
          <div key={label}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color="#748391" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "#F5F7FA" }}>{label}</p>
                <p style={{ fontSize: 11.5, color: "#748391", marginTop: 2 }}>{sub}</p>
              </div>
              <ChevronRight size={15} color="#748391" strokeWidth={1.8} />
            </div>
            {i < settingItems.length - 1 && <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", margin: "0 20px" }} />}
          </div>
        ))}
      </motion.div>

      {/* Logout */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} onClick={logout}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 14, background: "rgba(232,137,137,0.08)", border: "1px solid rgba(232,137,137,0.15)", color: "#E88989", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
        <LogOut size={16} strokeWidth={2} />
        Keluar dari Akun
      </motion.button>
    </div>
  );
}
