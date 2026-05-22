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



      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
        style={{ borderRadius: 20, background: "#152129", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 16 }}>
        {settingItems.map(({ icon: Icon, label, sub, onClick, dropdown, options, timePicker, timeValue, onTimeChange }, i) => {
          const isOpen = openSetting === label;
          return (
            <div key={label}>
              <div onClick={() => dropdown ? setOpenSetting(isOpen ? null : label) : onClick?.()} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color="#748391" strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "#F5F7FA" }}>{label}</p>
                  <p style={{ fontSize: 11.5, color: "#748391", marginTop: 2 }}>{sub}</p>
                </div>
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                  <ChevronRight size={15} color="#748391" strokeWidth={1.8} />
                </motion.div>
              </div>

              {dropdown && (
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                      <div style={{ padding: "0 20px 16px 70px", display: "flex", flexDirection: "column", gap: 12 }}>
                        {options?.map(opt => (
                          <div key={opt.label} onClick={opt.onClick} style={{ fontSize: 13, color: "#AAB7C2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                            <span>{opt.label}</span>
                            {/* Animated Toggle */}
                            <div style={{ width: 34, height: 20, borderRadius: 10, background: opt.isOn ? "rgba(79,209,197,0.3)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background 0.25s ease", border: opt.isOn ? "1px solid rgba(79,209,197,0.5)" : "1px solid transparent", flexShrink: 0 }}>
                              <motion.div
                                animate={{ left: opt.isOn ? 16 : 3 }}
                                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                style={{ width: 14, height: 14, borderRadius: "50%", background: opt.isOn ? "#4FD1C5" : "#748391", position: "absolute", top: 2 }}
                              />
                            </div>
                          </div>
                        ))}
                        {timePicker && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", marginTop: 4 }}>
                            <span style={{ fontSize: 13, color: "#AAB7C2" }}>Waktu Pengingat</span>
                            <input 
                              type="time" 
                              value={timeValue} 
                              onChange={(e) => onTimeChange?.(e.target.value)}
                              style={{ 
                                background: "rgba(255,255,255,0.06)", 
                                border: "1px solid rgba(255,255,255,0.1)", 
                                borderRadius: 8, 
                                padding: "4px 8px", 
                                color: "#4FD1C5", 
                                fontSize: 13,
                                fontWeight: 600,
                                outline: "none" 
                              }} 
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {i < settingItems.length - 1 && <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", margin: "0 20px" }} />}
            </div>
          );
        })}
      </motion.div>

      {/* Logout */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} onClick={logout}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 14, background: "rgba(232,137,137,0.08)", border: "1px solid rgba(232,137,137,0.15)", color: "#E88989", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
        <LogOut size={16} strokeWidth={2} />
        Keluar dari Akun
      </motion.button>

      {/* Toast */}
      {toastMsg && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
          style={{ position: "fixed", bottom: 100, left: 20, right: 20, background: "#152129", border: "1px solid rgba(79,209,197,0.3)", padding: "14px 20px", borderRadius: 16, color: "#F5F7FA", fontSize: 13, zIndex: 100, boxShadow: "0 10px 40px rgba(0,0,0,0.5)", textAlign: "center" }}>
          {toastMsg}
        </motion.div>
      )}

      {/* Currency Sheet */}
      {showCurrencySheet && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCurrencySheet(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, backdropFilter: "blur(4px)" }} />
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
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#F5F7FA" }}>Pilih Mata Uang</h2>
              <button onClick={() => setShowCurrencySheet(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} color="#AAB7C2" /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CURRENCIES.map(c => {
                const isActive = (profile?.currency || "IDR") === c.id;
                return (
                  <div key={c.id} onClick={() => handleCurrencySelect(c.id)}
                    style={{ padding: "16px", borderRadius: 16, background: isActive ? "rgba(79,209,197,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? "rgba(79,209,197,0.3)" : "rgba(255,255,255,0.05)"}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: isActive ? "#4FD1C5" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: isActive ? "#0B1215" : "#AAB7C2" }}>
                        {c.symbol}
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: isActive ? "#4FD1C5" : "#F5F7FA" }}>{c.id}</p>
                        <p style={{ fontSize: 12, color: "#748391", marginTop: 2 }}>{c.name}</p>
                      </div>
                    </div>
                    {isActive && <Check size={20} color="#4FD1C5" strokeWidth={2.5} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
