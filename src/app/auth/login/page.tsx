"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Zap, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await signInWithEmail(email, password); }
    catch { setError("Email atau password salah. Coba lagi."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try { await signInWithGoogle(false); }
    catch (err: any) { 
      if (err.message === "auth/user-not-found") {
        setError("Akun belum terdaftar. Silakan daftar gratis terlebih dahulu.");
      } else {
        setError("Login Google gagal. Coba lagi."); 
      }
    }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#0B1215", display: "flex" }}>
      {/* Left Panel — Branding */}
      <div className="hidden md:flex" style={{ width: "50%", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #0D1A1F 0%, #152129 100%)", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "rgba(79,209,197,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "5%", width: 200, height: 200, borderRadius: "50%", background: "rgba(125,211,252,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 400 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={22} color="#0B1215" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.02em" }}>Ninja Flow</span>
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#F5F7FA", lineHeight: 1.2, marginBottom: 18, letterSpacing: "-0.03em" }}>
            Kelola uangmu<br />dengan lebih<br />
            <span style={{ background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>tenang dan cerdas.</span>
          </h2>
          <p style={{ fontSize: 15, color: "#748391", lineHeight: 1.6 }}>
            AI finance companion yang membantu kamu memahami pola keuangan tanpa ribet.
          </p>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
            {["Lacak pemasukan & pengeluaran otomatis", "Insight AI yang calm & personal", "Scan struk dengan kamera"].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(79,209,197,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: "#4FD1C5" }}>✓</span>
                </div>
                <span style={{ fontSize: 13.5, color: "#AAB7C2" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="flex md:hidden" style={{ alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="#0B1215" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#F5F7FA" }}>Ninja Flow</span>
          </div>

          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#748391", fontSize: 13, textDecoration: "none", marginBottom: 28, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#F5F7FA"} onMouseLeave={e => e.currentTarget.style.color = "#748391"}>
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#F5F7FA", marginBottom: 6, letterSpacing: "-0.02em" }}>Masuk</h1>
          <p style={{ fontSize: 14, color: "#748391", marginBottom: 32 }}>Belum punya akun? <Link href="/auth/signup" style={{ color: "#4FD1C5", textDecoration: "none", fontWeight: 500 }}>Daftar gratis</Link></p>

          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(232,137,137,0.08)", border: "1px solid rgba(232,137,137,0.2)", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "#E88989" }}>{error}</p>
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "13px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#F5F7FA", fontWeight: 500, fontSize: 14, cursor: "pointer", marginBottom: 20, transition: "all 0.2s ease" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(79,209,197,0.3)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Lanjutkan dengan Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 12, color: "#748391" }}>atau</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ position: "relative" }}>
              <Mail size={15} color="#748391" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email kamu" className="input-field" style={{ paddingLeft: 40 }} />
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={15} color="#748391" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="input-field" style={{ paddingLeft: 40, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                {showPw ? <EyeOff size={15} color="#748391" /> : <Eye size={15} color="#748391" />}
              </button>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              style={{ padding: "13px", borderRadius: 14, border: "none", background: loading ? "rgba(79,209,197,0.4)" : "#4FD1C5", color: "#0B1215", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
              {loading ? "Masuk..." : "Masuk"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
