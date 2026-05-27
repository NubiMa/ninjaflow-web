"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Shield, ChevronRight, LogOut, Moon, Globe, User, X, Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { getUserProfile, upsertUserProfile } from "@/lib/db";
import { UserProfile } from "@/types";
import { enablePushNotifications, disablePushNotifications, getSavedNotifTime } from "@/lib/notifications";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [openSetting, setOpenSetting] = useState<string | null>(null);
  const [notifSettings, setNotifSettings] = useState<{ push: boolean; email: boolean }>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ninja_notif_settings");
      if (stored) return JSON.parse(stored);
    }
    return { push: false, email: false };
  });
  const [notifTime, setNotifTime] = useState<string>(() => {
    const saved = getSavedNotifTime();
    return saved ? `${String(saved.hour).padStart(2, "0")}:${String(saved.minute).padStart(2, "0")}` : "09:00";
  });

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

  const handleSecurityClick = async () => {
    if (!user) return;
    const isGoogle = user.providerData.some((p) => p.providerId === "google.com");
    if (isGoogle) {
      setToastMsg("Anda login menggunakan Google. Web ini tidak memiliki akses ke password Anda, silakan ubah melalui pengaturan Akun Google Anda.");
    } else {
      try {
        if (user.email) {
          await sendPasswordResetEmail(auth, user.email);
          setToastMsg("Email untuk mereset password telah dikirim ke " + user.email);
        }
      } catch (e) {
        setToastMsg("Gagal mengirim email reset password.");
      }
    }
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleCurrencySelect = async (c: string) => {
    if (!user || !profile) return;
    await upsertUserProfile(user.uid, { currency: c });
    localStorage.setItem("ninja_currency", c);
    setProfile({ ...profile, currency: c });
    setShowCurrencySheet(false);
    window.location.reload();
  };

  const handleNotificationClick = async () => {
    if (notifSettings.push) {
      await disablePushNotifications();
      const next = { ...notifSettings, push: false };
      setNotifSettings(next);
      localStorage.setItem("ninja_notif_settings", JSON.stringify(next));
      setToastMsg("Push notifications dinonaktifkan.");
    } else {
      const [h, m] = notifTime.split(":").map(Number);
      const result = await enablePushNotifications({ hour: h, minute: m });
      if (result === "granted") {
        const next = { ...notifSettings, push: true };
        setNotifSettings(next);
        localStorage.setItem("ninja_notif_settings", JSON.stringify(next));
        setToastMsg(`Pengingat aktif! Notifikasi akan dikirim setiap pukul ${notifTime}.`);
      } else if (result === "denied") {
        setToastMsg("Izin ditolak. Aktifkan notifikasi di pengaturan browser Anda.");
      } else {
        setToastMsg("Browser Anda tidak mendukung push notifications.");
      }
    }
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleEmailToggle = () => {
    const next = { ...notifSettings, email: !notifSettings.email };
    setNotifSettings(next);
    localStorage.setItem("ninja_notif_settings", JSON.stringify(next));
    setToastMsg(next.email ? "Email alerts diaktifkan!" : "Email alerts akan segera hadir.");
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleThemeClick = () => {
    setToastMsg("Ninja Finance secara eksklusif didesain dengan Tema Gelap untuk melindungi mata Anda 🦉");
    setTimeout(() => setToastMsg(null), 5000);
  };

  const settingItems = [
    { 
      icon: Bell, 
      label: "Notifikasi", 
      sub: "Kelola pengingat harian", 
      dropdown: true,
      options: [
        { label: "Push Notifications", isOn: notifSettings.push, onClick: handleNotificationClick },
        { label: "Email Alerts", isOn: notifSettings.email, onClick: handleEmailToggle }
      ],
      timePicker: true,
      timeValue: notifTime,
      onTimeChange: async (t: string) => {
        setNotifTime(t);
        if (notifSettings.push) {
          const [h, m] = t.split(":").map(Number);
          await enablePushNotifications({ hour: h, minute: m });
        }
      },
    },
    { icon: Shield, label: "Keamanan",         sub: "Ubah Password", onClick: handleSecurityClick },
    { icon: Globe,  label: "Mata Uang",        sub: profile?.currency ?? "IDR", onClick: () => setShowCurrencySheet(true) },
    { icon: Moon,   label: "Tema Gelap",       sub: "Aktif", onClick: handleThemeClick },
  ];

  const CURRENCIES = [
    { id: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
    { id: "USD", name: "US Dollar", symbol: "$" },
    { id: "EUR", name: "Euro", symbol: "€" },
    { id: "JPY", name: "Japanese Yen", symbol: "¥" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "32px 20px" }}>
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Pengaturan Akun</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>Profil</h1>
      </motion.div>

      {/* Avatar Card */}
      <motion.div variants={itemVariants} style={{ padding: "32px", borderRadius: 32, background: "linear-gradient(145deg, rgba(21, 33, 41, 0.9) 0%, rgba(11, 18, 21, 1) 100%)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 28, display: "flex", alignItems: "center", gap: 24, position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ position: "absolute", top: -50, right: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,209,197,0.1) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        
        <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#030712", flexShrink: 0, boxShadow: "0 10px 25px rgba(79,209,197,0.4)" }}>
          {loading ? <User size={32} color="#030712" /> : (profile?.displayName?.[0]?.toUpperCase() ?? "N")}
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          {loading ? (
            <>
              <div className="skeleton" style={{ height: 22, width: 160, borderRadius: 8, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 14, width: 200, borderRadius: 6 }} />
            </>
          ) : (
            <>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.01em" }}>{profile?.displayName}</p>
              <p style={{ fontSize: 14, color: "#94A3B8", marginTop: 4 }}>{profile?.email}</p>
              <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: "rgba(79,209,197,0.1)", border: "1px solid rgba(79,209,197,0.2)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4FD1C5", letterSpacing: "0.05em", textTransform: "uppercase" }}>Ninja Member</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div variants={itemVariants} style={{ borderRadius: 28, background: "linear-gradient(135deg, rgba(21, 33, 41, 0.8), rgba(11, 18, 21, 0.9))", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", marginBottom: 24, backdropFilter: "blur(12px)" }}>
        {settingItems.map(({ icon: Icon, label, sub, onClick, dropdown, options, timePicker, timeValue, onTimeChange }, i) => {
          const isOpen = openSetting === label;
          return (
            <div key={label}>
              <div onClick={() => dropdown ? setOpenSetting(isOpen ? null : label) : onClick?.()} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Icon size={20} color="#94A3B8" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#F8FAFC" }}>{label}</p>
                  <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{sub}</p>
                </div>
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                  <ChevronRight size={18} color="#64748B" />
                </motion.div>
              </div>

              {dropdown && (
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                      <div style={{ padding: "0 24px 20px 84px", display: "flex", flexDirection: "column", gap: 16 }}>
                        {options?.map(opt => (
                          <div key={opt.label} onClick={opt.onClick} style={{ fontSize: 14, color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 500 }}>{opt.label}</span>
                            {/* Animated Toggle */}
                            <div style={{ width: 44, height: 24, borderRadius: 12, background: opt.isOn ? "rgba(79,209,197,0.2)" : "rgba(255,255,255,0.05)", position: "relative", transition: "all 0.3s ease", border: opt.isOn ? "1px solid rgba(79,209,197,0.4)" : "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                              <motion.div
                                animate={{ left: opt.isOn ? 22 : 4 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                style={{ width: 16, height: 16, borderRadius: "50%", background: opt.isOn ? "#4FD1C5" : "#64748B", position: "absolute", top: 3, boxShadow: opt.isOn ? "0 0 10px rgba(79,209,197,0.5)" : "none" }}
                              />
                            </div>
                          </div>
                        ))}
                        {timePicker && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.03)" }}>
                            <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>Waktu Pengingat</span>
                            <input 
                              type="time" 
                              value={timeValue} 
                              onChange={(e) => onTimeChange?.(e.target.value)}
                              style={{ 
                                background: "rgba(255,255,255,0.05)", 
                                border: "1px solid rgba(255,255,255,0.1)", 
                                borderRadius: 8, 
                                padding: "6px 12px", 
                                color: "#4FD1C5", 
                                fontSize: 14,
                                fontWeight: 700,
                                outline: "none",
                                cursor: "pointer"
                              }} 
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {i < settingItems.length - 1 && <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", margin: "0 24px" }} />}
            </div>
          );
        })}
      </motion.div>

      {/* Logout */}
      <motion.button variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={logout}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px", borderRadius: 20, background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s" }}>
        <LogOut size={18} strokeWidth={2.5} />
        Keluar dari Akun
      </motion.button>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 50, x: "-50%" }}
            style={{ position: "fixed", bottom: 100, left: "50%", background: "linear-gradient(135deg, rgba(21, 33, 41, 0.95), rgba(11, 18, 21, 1))", border: "1px solid rgba(79,209,197,0.3)", padding: "14px 24px", borderRadius: 99, color: "#F8FAFC", fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: "0 20px 40px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Currency Sheet */}
      <AnimatePresence>
        {showCurrencySheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCurrencySheet(false)} style={{ position: "fixed", inset: 0, background: "rgba(3,7,18,0.8)", zIndex: 40, backdropFilter: "blur(8px)" }} />
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
                width: "90%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC" }}>Pilih Mata Uang</h2>
                <button onClick={() => setShowCurrencySheet(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} color="#AAB7C2" /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {CURRENCIES.map(c => {
                  const isActive = (profile?.currency || "IDR") === c.id;
                  return (
                    <div key={c.id} onClick={() => handleCurrencySelect(c.id)}
                      style={{ padding: "16px", borderRadius: 16, background: isActive ? "rgba(79,209,197,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${isActive ? "rgba(79,209,197,0.3)" : "rgba(255,255,255,0.05)"}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: isActive ? "#4FD1C5" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: isActive ? "#030712" : "#94A3B8", boxShadow: isActive ? "0 4px 10px rgba(79,209,197,0.3)" : "none" }}>
                          {c.symbol}
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: isActive ? "#4FD1C5" : "#F8FAFC" }}>{c.id}</p>
                          <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{c.name}</p>
                        </div>
                      </div>
                      {isActive && <Check size={20} color="#4FD1C5" strokeWidth={3} />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
