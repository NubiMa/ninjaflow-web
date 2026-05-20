"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Zap, Sparkles, TrendingUp, Shield, Brain, Target, ChevronDown } from "lucide-react";

const features = [
  { icon: Brain,      title: "AI Reflection",     desc: "Insight personal dari AI yang memahami pola belanjamu — calm, jujur, dan tidak menghakimi.",     emoji: "🧠" },
  { icon: TrendingUp, title: "Expense Tracking",   desc: "Catat pemasukan & pengeluaran dengan cepat. Auto-kategorisasi berbasis aturan untuk efisiensi.",  emoji: "📊" },
  { icon: Sparkles,   title: "Receipt Scanner",    desc: "Foto struk belanja dan biarkan AI mengekstrak data transaksi otomatis. Edit sebelum simpan.",      emoji: "📸" },
  { icon: Target,     title: "Goals & Tabungan",   desc: "Set target finansial dan pantau progress-mu. Visual yang motivating dan mudah dibaca.",            emoji: "🎯" },
  { icon: Shield,     title: "Aman & Privat",      desc: "Data terenkripsi dengan Firebase Security Rules. Hanya kamu yang bisa melihat datamu.",            emoji: "🔒" },
  { icon: Zap,        title: "Mobile First",       desc: "Dirancang untuk dipakai di mana saja. Terasa seperti native app di smartphone-mu.",               emoji: "⚡" },
];

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, transition: "all 0.3s ease",
        background: scrolled ? "rgba(11,18,21,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={17} color="#0B1215" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.02em" }}>Ninja Flow</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/auth/login">
            <button style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#AAB7C2", fontWeight: 500, fontSize: 13.5, cursor: "pointer", transition: "all 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#F5F7FA"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#AAB7C2"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; }}>
              Masuk
            </button>
          </Link>
          <Link href="/auth/signup">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "8px 18px", borderRadius: 10, background: "#4FD1C5", color: "#0B1215", fontWeight: 600, fontSize: 13.5, border: "none", cursor: "pointer" }}>
              Mulai Gratis
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: "#0B1215", minHeight: "100dvh", overflowX: "hidden" }}>
      <NavBar />

      {/* Hero */}
      <section style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "100px 24px 80px" }}>
        {/* Ambient orbs */}
        <div style={{ position: "absolute", top: "15%", left: "10%", width: 500, height: 500, borderRadius: "50%", background: "rgba(79,209,197,0.05)", filter: "blur(100px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(125,211,252,0.04)", filter: "blur(90px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 760 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99, background: "rgba(79,209,197,0.08)", border: "1px solid rgba(79,209,197,0.2)", marginBottom: 28 }}>
              <Sparkles size={12} color="#4FD1C5" strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#4FD1C5", letterSpacing: "0.03em" }}>AI-Powered Finance Companion</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800, color: "#F5F7FA", lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: 22 }}>
            Kelola uangmu<br />
            <span style={{ background: "linear-gradient(135deg, #4FD1C5 0%, #7DD3FC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              lebih tenang.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}
            style={{ fontSize: "clamp(16px, 2vw, 19px)", color: "#748391", lineHeight: 1.65, maxWidth: 540, margin: "0 auto 40px" }}>
            Ninja Flow adalah AI finance companion yang membantu kamu memahami pola keuangan dengan cara yang calm, modern, dan mudah dipahami.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/auth/signup" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 12px 40px rgba(79,209,197,0.25)" }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: "#4FD1C5", color: "#0B1215", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                Mulai Gratis <ArrowRight size={16} strokeWidth={2.5} />
              </motion.button>
            </Link>
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: "rgba(255,255,255,0.04)", color: "#AAB7C2", fontWeight: 500, fontSize: 15, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                Masuk
              </button>
            </Link>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ fontSize: 12, color: "#748391", marginTop: 20 }}>
            Gratis selamanya · Tanpa kartu kredit · Data aman
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}>
          <ChevronDown size={20} color="#748391" strokeWidth={1.5} />
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#4FD1C5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Fitur Utama</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
            Semua yang kamu butuhkan<br />dalam satu app
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {features.map(({ icon: Icon, title, desc, emoji }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, borderColor: "rgba(79,209,197,0.15)" }}
              style={{ padding: "24px 22px", borderRadius: 20, background: "#10181D", border: "1px solid rgba(255,255,255,0.06)", transition: "border-color 0.2s ease, transform 0.2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(79,209,197,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="#4FD1C5" strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#F5F7FA" }}>{title}</h3>
              </div>
              <p style={{ fontSize: 13.5, color: "#748391", lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ maxWidth: 600, margin: "0 auto", padding: "48px 40px", borderRadius: 28, background: "linear-gradient(135deg, #0D1A1F, #152129)", border: "1px solid rgba(79,209,197,0.12)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(79,209,197,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />
          <Zap size={32} color="#4FD1C5" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.03em", marginBottom: 14 }}>
            Siap mulai tracking<br />keuanganmu?
          </h2>
          <p style={{ fontSize: 15, color: "#748391", marginBottom: 32, lineHeight: 1.6 }}>
            Bergabung dan mulai membangun awareness finansialmu hari ini. Gratis selamanya.
          </p>
          <Link href="/auth/signup" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: "0 12px 40px rgba(79,209,197,0.25)" }} whileTap={{ scale: 0.97 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 14, background: "#4FD1C5", color: "#0B1215", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
              Mulai Sekarang <ArrowRight size={16} strokeWidth={2.5} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#748391" }}>© 2026 Ninja Flow · Built with ❤️ for Indonesia</p>
      </footer>
    </div>
  );
}
