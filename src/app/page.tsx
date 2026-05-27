"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Zap, Sparkles, ChevronDown, CheckCircle2, Menu, X } from "lucide-react";
import FeatureBento from "@/components/landing/FeatureBento";
import HeroMockup from "@/components/landing/HeroMockup";
import Logo from "@/components/Logo";

const FAQS = [
  { q: "Apakah Ninja Finance benar-benar gratis?", a: "Ya, 100% gratis. Tidak ada uji coba, tidak ada kartu kredit. Semua fitur inti — termasuk AI Insights dan Receipt Scanner — tersedia tanpa biaya." },
  { q: "Bagaimana cara kerja AI Receipt Scanner?", a: "Cukup foto atau upload gambar struk belanjamu. Vision AI kami akan mengekstrak merchant, total, tanggal, dan kategori secara otomatis dalam hitungan detik. Kamu bisa review dan edit sebelum transaksi disimpan." },
  { q: "Apakah data keuangan saya aman?", a: "Keamanan adalah prioritas utama kami. Data diproteksi oleh Firebase Security Rules dari Google Cloud. Hanya akun kamu yang bisa mengakses transaksi dan saldomu — tidak ada yang lain, termasuk kami." },
  { q: "Bisa dipakai di HP tanpa install aplikasi?", a: "Ninja Finance dirancang sebagai Progressive Web App. Buka di browser HP-mu, lalu tambahkan ke Home Screen — pengalamannya sama seperti native app, tanpa harus download dari App Store." },
  { q: "Bagaimana AI Insights bekerja?", a: "Gemini AI menganalisa pola transaksimu — kategori terbesar, kebiasaan spending, tren mingguan — lalu menghasilkan insight singkat yang calm dan tidak menghakimi. Tujuannya adalah awareness, bukan rasa bersalah." },
];

const STATS = [
  { value: "< 5 detik", label: "Waktu tambah transaksi" },
  { value: "10+", label: "Kategori pengeluaran" },
  { value: "AI-powered", label: "Analisa spending otomatis" },
  { value: "0 iklan", label: "Privasi terjaga penuh" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Daftar gratis", desc: "Buat akun dengan Google atau email dalam 30 detik. Tidak perlu kartu kredit." },
  { step: "02", title: "Catat atau scan", desc: "Tambah transaksi manual atau foto struk belanja — biarkan AI yang mengekstrak datanya." },
  { step: "03", title: "Dapatkan insight", desc: "Setiap minggu, Gemini AI merangkum pola belanjamu dengan cara yang calm dan mudah dipahami." },
];

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(11,18,21,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s ease" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Logo size={18} color="#0B1215" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.02em" }}>Ninja Finance</span>
        </div>
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 36 }}>
          {[["Features", "#features"], ["How it works", "#how"], ["FAQ", "#faq"]].map(([name, href]) => (
            <a key={name} href={href} style={{ fontSize: 14, fontWeight: 500, color: "#AAB7C2", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#F5F7FA"} onMouseLeave={e => e.currentTarget.style.color = "#AAB7C2"}>{name}</a>
          ))}
        </div>
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 16 }}>
          <Link href="/auth/login" style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA", textDecoration: "none" }}>Sign In</Link>
          <Link href="/auth/signup" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: "10px 22px", borderRadius: 99, background: "#F5F7FA", color: "#0B1215", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
              Get Started
            </motion.button>
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", color: "#F5F7FA", cursor: "pointer" }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ background: "#0B1215", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 0 }}>
              {[["Features", "#features"], ["How it works", "#how"], ["FAQ", "#faq"]].map(([name, href]) => (
                <a key={name} href={href} onClick={() => setMobileOpen(false)} style={{ fontSize: 16, fontWeight: 500, color: "#F5F7FA", textDecoration: "none", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{name}</a>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
                <Link href="/auth/login" style={{ textDecoration: "none" }}><button style={{ width: "100%", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "#F5F7FA", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>Sign In</button></Link>
                <Link href="/auth/signup" style={{ textDecoration: "none" }}><button style={{ width: "100%", padding: 14, borderRadius: 12, background: "#F5F7FA", color: "#0B1215", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>Get Started Free</button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #E2E8F0", padding: "24px 0" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", padding: 0, gap: 20 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={20} color="#64748B" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <p style={{ marginTop: 16, fontSize: 16, color: "#475569", lineHeight: 1.65 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      <NavBar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ background: "#0B1215", minHeight: "100dvh", position: "relative", display: "flex", alignItems: "center", paddingTop: 72, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "90vw", maxWidth: 1000, height: 600, background: "radial-gradient(ellipse, rgba(79,209,197,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", width: "100%", position: "relative", zIndex: 10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left: Copy */}
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, background: "rgba(79,209,197,0.08)", border: "1px solid rgba(79,209,197,0.2)", marginBottom: 32 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4FD1C5", boxShadow: "0 0 8px #4FD1C5" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#4FD1C5" }}>AI-Powered Personal Finance</span>
                </div>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: "clamp(40px, 5.5vw, 68px)", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
                Pahami uangmu,<br />
                <span style={{ color: "#748391" }}>tanpa dihakimi.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                style={{ fontSize: "clamp(16px, 1.8vw, 19px)", color: "#AAB7C2", lineHeight: 1.65, marginBottom: 40 }}>
                Ninja bukan sekadar pencatat uang, ini adalah AI companion yang membantu kamu memahami pola keuangan. Scan struk otomatis, insight mingguan dari Gemini AI, dan goal tracking. Semua dalam satu app yang terasa ringan dan menenangkan.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 16 }} className="items-center lg:items-start">
                <Link href="/auth/signup" style={{ textDecoration: "none" }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 32px", borderRadius: 14, background: "#FFFFFF", color: "#0B1215", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", boxShadow: "0 10px 30px rgba(255,255,255,0.12)" }}>
                    Mulai Gratis Sekarang <ArrowRight size={18} strokeWidth={2.5} />
                  </motion.button>
                </Link>
                <div style={{ display: "flex", gap: 24, justifyContent: "center" }} className="lg:justify-start">
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#748391", fontSize: 13, fontWeight: 500 }}>
                    <CheckCircle2 size={14} color="#4FD1C5" /> Tidak perlu kartu kredit
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#748391", fontSize: 13, fontWeight: 500 }}>
                    <CheckCircle2 size={14} color="#4FD1C5" /> Langsung pakai di HP
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Right: App Mockup */}
            <div className="hidden lg:block">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section style={{ background: "#0F172A", padding: "60px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }} className="grid-cols-2 md:grid-cols-4">
          {STATS.map(({ value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ textAlign: "center" }}>
              <p style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.03em", marginBottom: 8 }}>{value}</p>
              <p style={{ fontSize: 14, color: "#748391", fontWeight: 500 }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURE BENTO ────────────────────────────────── */}
      <FeatureBento />

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" style={{ background: "#0B1215", padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: 16 }}>
              Mulai dalam 3 langkah.
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              style={{ fontSize: 18, color: "#748391", maxWidth: 500, margin: "0 auto" }}>
              Tidak perlu tutorial panjang. Ninja dirancang agar kamu langsung paham sejak detik pertama.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <motion.div key={step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                style={{ padding: 32, borderRadius: 28, background: "#10181D", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: 48, fontWeight: 900, color: "rgba(79,209,197,0.15)", letterSpacing: "-0.04em", marginBottom: 20 }}>{step}</p>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#F5F7FA", marginBottom: 12, letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ fontSize: 15, color: "#748391", lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY QUOTE ─────────────────────────────── */}
      <section style={{ background: "#F8FAFC", padding: "120px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <Sparkles size={40} color="#64748B" style={{ marginBottom: 32 }} />
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#0F172A", lineHeight: 1.5, letterSpacing: "-0.02em", marginBottom: 32 }}>
              "Mencatat uang tidak seharusnya bikin stres. Ninja hadir agar kamu punya clarity tentang keuangan — bukan rasa bersalah."
            </h2>
            <p style={{ fontSize: 14, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>The Ninja Finance Philosophy</p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" style={{ background: "#F8FAFC", padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 48, textAlign: "center" }}>
            Pertanyaan yang sering ditanya.
          </motion.h2>
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "8px 40px 16px", border: "1px solid #E2E8F0", boxShadow: "0 8px 32px rgba(0,0,0,0.04)" }}>
            {FAQS.map((faq, i) => (
              <motion.div key={faq.q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section style={{ background: "#0B1215", padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(79,209,197,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <h2 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", marginBottom: 20 }}>
            Siap untuk financial clarity?
          </h2>
          <p style={{ fontSize: 18, color: "#AAB7C2", marginBottom: 48, lineHeight: 1.6 }}>
            Bergabung gratis. Scan struk pertamamu, dapatkan insight pertamamu. Mulai sekarang, tanpa ribet.
          </p>
          <Link href="/auth/signup" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: "0 20px 50px rgba(255,255,255,0.2)" }} whileTap={{ scale: 0.97 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "20px 48px", borderRadius: 99, background: "#FFFFFF", color: "#0B1215", fontWeight: 800, fontSize: 18, border: "none", cursor: "pointer", boxShadow: "0 10px 30px rgba(255,255,255,0.12)" }}>
              Daftar Gratis <ArrowRight size={20} strokeWidth={2.5} />
            </motion.button>
          </Link>
        </motion.div>

        <div style={{ marginTop: 100, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#748391", fontSize: 14 }}>
          <div style={{ display: "flex", gap: 32 }}>
            {["Terms", "Privacy Policy", "Contact"].map(item => (
              <a key={item} href="#" style={{ color: "#748391", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#F5F7FA"} onMouseLeave={e => e.currentTarget.style.color = "#748391"}>{item}</a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={16} />
            <span>© 2026 Ninja Finance. Crafted with extreme care.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
