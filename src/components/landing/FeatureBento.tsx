"use client";

import { motion } from "framer-motion";
import { Camera, Brain, PieChart, Target, Zap, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    title: "Magic Receipt Scanner",
    desc: "Foto struk belanja dari warung, kafe, atau supermarket. Vision AI Ninja akan otomatis membaca merchant, total, tanggal, dan langsung membuat draft transaksi — tanpa kamu perlu mengetik satu huruf pun.",
    tag: "Vision AI",
    bg: "#F8FAFC",
    color: "#0F172A",
    wide: true,
  },
  {
    icon: Brain,
    title: "AI Spending Insights",
    desc: "Setiap minggu, Gemini AI menganalisa pola belanjamu dan memberi summary yang calm, observatif, dan tidak menghakimi. Tahu kemana uangmu pergi, tanpa rasa panik.",
    tag: "Gemini AI",
    bg: "#0F172A",
    color: "#FFFFFF",
    wide: false,
  },
  {
    icon: PieChart,
    title: "Kategori & Breakdown",
    desc: "Pengeluaran otomatis terkategorisasi: Makanan, Transport, Hiburan, Belanja, dan 10+ kategori lainnya. Lihat distribusi spending-mu dalam grafik yang elegan dan mudah dibaca.",
    tag: "Auto-categorize",
    bg: "#F8FAFC",
    color: "#0F172A",
    wide: false,
  },
  {
    icon: Target,
    title: "Goals & Tabungan",
    desc: "Set target finansialmu — liburan, laptop baru, atau dana darurat. Pantau progres setiap saat dan top-up langsung dari dashboard. Visualisasi yang motivating, bukan menekan.",
    tag: "Financial Goals",
    bg: "#F8FAFC",
    color: "#0F172A",
    wide: false,
  },
  {
    icon: Zap,
    title: "Cashflow Real-time",
    desc: "Lihat total saldo, pemasukan bulan ini, dan pengeluaran dalam satu dashboard yang bersih. Tambah transaksi dalam hitungan detik — dirancang untuk kecepatan dan zero friction.",
    tag: "Live Dashboard",
    bg: "#F8FAFC",
    color: "#0F172A",
    wide: false,
  },
  {
    icon: Shield,
    title: "100% Private & Aman",
    desc: "Data keuangan kamu diproteksi oleh Firebase Security Rules — standar enkripsi enterprise dari Google Cloud. Hanya kamu yang memiliki akses penuh ke transaksimu.",
    tag: "Google Cloud",
    bg: "#0F172A",
    color: "#FFFFFF",
    wide: false,
  },
];

export default function FeatureBento() {
  return (
    <section id="features" style={{ background: "#FFFFFF", padding: "120px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 13, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}
          >Semua yang kamu butuhkan</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 20 }}
          >Didesain untuk efisiensi<br />dan ketenangan pikiran.</motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ fontSize: 18, color: "#475569", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}
          >Kami membuang grafik rumit dan form panjang. Fokus pada pengalaman mencatat uang semudah mungkin — dibantu kecerdasan buatan.</motion.p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>
          {/* Wide Card: Receipt Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -4 }} transition={{ duration: 0.5 }}
            style={{ gridColumn: "1 / -1", background: "#F8FAFC", borderRadius: 32, padding: "48px 52px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 48, overflow: "hidden", position: "relative" }}
            className="lg:col-span-8"
          >
            <div style={{ position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)", width: 400, height: 400, background: "radial-gradient(circle, #E2E8F0 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ zIndex: 1, maxWidth: 480 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E0F2FE", color: "#0284C7", padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <Camera size={14} /> Vision AI
              </div>
              <h3 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 16, letterSpacing: "-0.02em" }}>Magic Receipt Scanner</h3>
              <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.65 }}>
                Foto struk belanja dari warung, kafe, atau supermarket. Vision AI Ninja otomatis membaca merchant, total, tanggal, dan langsung membuat draft transaksi — tanpa mengetik satu huruf pun.
              </p>
            </div>
          </motion.div>

          {/* AI Insights — Dark */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.05 }}
            whileHover={{ y: -4 }}
            style={{ gridColumn: "1 / -1", background: "#0F172A", borderRadius: 32, padding: 40, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 280 }}
            className="lg:col-span-4"
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(79,209,197,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Brain size={26} color="#4FD1C5" />
            </div>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", color: "#94A3B8", padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>Gemini AI</div>
              <h3 style={{ fontSize: 26, fontWeight: 800, color: "#FFFFFF", marginBottom: 12, letterSpacing: "-0.02em" }}>Calming AI Insights</h3>
              <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.6 }}>
                Gemini AI menganalisa pola pengeluaranmu secara rutin. Feedback yang supportif — tidak menghakimi, tidak menakut-nakuti.
              </p>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          {[
            { icon: PieChart, tag: "Auto-categorize", title: "10+ Kategori Otomatis", desc: "Makanan, Transport, Hiburan, Belanja, Tagihan — semua terkategorisasi otomatis. Lihat distribusi spending dalam grafik visual yang elegan.", tagBg: "#FFF7ED", tagColor: "#C2410C" },
            { icon: Target, tag: "Financial Goals", title: "Goals & Tabungan", desc: "Set target tabungan — liburan, laptop baru, atau dana darurat. Pantau progres dan top-up langsung dari dashboard kapan saja.", tagBg: "#F0FDF4", tagColor: "#15803D" },
            { icon: Zap, tag: "Real-time", title: "Cashflow Instan", desc: "Tambah transaksi dalam hitungan detik. Saldo total, pemasukan, dan pengeluaran bulan ini tersaji dalam satu layar yang bersih.", tagBg: "#FEFCE8", tagColor: "#A16207" },
            { icon: Shield, tag: "Google Cloud", title: "100% Private", desc: "Firebase Security Rules memastikan hanya kamu yang bisa mengakses datamu. Enkripsi standar enterprise — keuanganmu adalah milikmu seorang.", tagBg: "#F0F9FF", tagColor: "#0369A1", dark: true },
          ].map(({ icon: Icon, tag, title, desc, tagBg, tagColor, dark }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              style={{ gridColumn: "1 / -1", background: dark ? "#0F172A" : "#F8FAFC", borderRadius: 32, padding: 40, border: dark ? "none" : "1px solid #E2E8F0" }}
              className="md:col-span-6"
            >
              <div style={{ width: 52, height: 52, borderRadius: 16, background: dark ? "rgba(255,255,255,0.08)" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: dark ? "none" : "1px solid #E2E8F0" }}>
                <Icon size={26} color={dark ? "#F5F7FA" : "#0F172A"} />
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", background: dark ? "rgba(255,255,255,0.05)" : tagBg, color: dark ? "#94A3B8" : tagColor, padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>{tag}</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: dark ? "#FFFFFF" : "#0F172A", marginBottom: 12, letterSpacing: "-0.02em" }}>{title}</h3>
              <p style={{ fontSize: 15, color: dark ? "#94A3B8" : "#475569", lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
