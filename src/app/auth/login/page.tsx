"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Zap, ArrowLeft, ShieldCheck, Camera, Brain } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#030712", display: "flex", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Left Panel — Premium Cinematic Branding */}
      <div className="hidden lg:flex" style={{ width: "55%", position: "relative", overflow: "hidden", alignItems: "center", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.03)" }}>
        {/* Animated Background Mesh */}
        <motion.div 
          animate={{ 
            x: mousePosition.x * 0.05, 
            y: mousePosition.y * 0.05 
          }}
          transition={{ type: "tween", ease: "linear", duration: 0.2 }}
          style={{ position: "absolute", inset: -100, pointerEvents: "none" }}
        >
          <div style={{ position: "absolute", top: "10%", left: "20%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(79,209,197,0.15) 0%, rgba(3,7,18,0) 70%)", filter: "blur(60px)", mixBlendMode: "screen" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(125,211,252,0.1) 0%, rgba(3,7,18,0) 70%)", filter: "blur(80px)", mixBlendMode: "screen" }} />
        </motion.div>

        {/* Ambient Noise Overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E")', pointerEvents: "none", opacity: 0.5 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 480, padding: 40 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 60 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(79,209,197,0.3)" }}>
                <Zap size={24} color="#030712" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>Ninja Finance</span>
            </div>
            
            <h2 style={{ fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.03em" }}>
              Clarity for your<br />
              <span style={{ color: "#7DD3FC" }}>cashflow.</span>
            </h2>
            <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.6, marginBottom: 48 }}>
              Bukan sekadar pencatat uang. Ini adalah AI companion yang membantu memahami pola finansialmu secara tenang.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { icon: Camera, text: "Magic Receipt Scanner", sub: "Scan struk instan dengan Vision AI" },
                { icon: Brain, text: "Calming Insights", sub: "Analisa pola pengeluaran yang tidak menghakimi" },
                { icon: ShieldCheck, text: "Enterprise Security", sub: "Data terenkripsi penuh via Google Cloud" }
              ].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1), duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
                  style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.02)", padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(79,209,197,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <f.icon size={20} color="#4FD1C5" strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", marginBottom: 2 }}>{f.text}</p>
                    <p style={{ fontSize: 13, color: "#64748B" }}>{f.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form Area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px", position: "relative" }}>
        
        <Link href="/" style={{ position: "absolute", top: 40, left: 40, display: "inline-flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={16} />
          </div>
          <span className="hidden sm:inline">Kembali</span>
        </Link>

        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ width: "100%", maxWidth: 380 }}>
          
          <motion.div variants={itemVariants} className="flex lg:hidden" style={{ alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={20} color="#030712" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC" }}>Ninja</span>
          </motion.div>

          <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F8FAFC", marginBottom: 12, letterSpacing: "-0.03em" }}>Selamat Datang</h1>
            <p style={{ fontSize: 15, color: "#94A3B8" }}>
              Belum punya akun? <Link href="/auth/signup" style={{ color: "#7DD3FC", textDecoration: "none", fontWeight: 600, borderBottom: "1px solid rgba(125,211,252,0.3)", paddingBottom: 2 }}>Daftar sekarang</Link>
            </p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 24 }}>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ marginTop: 2 }}><Zap size={16} color="#EF4444" /></div>
                  <p style={{ fontSize: 13, color: "#FCA5A5", lineHeight: 1.5 }}>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants}>
            <button onClick={handleGoogle} disabled={loading}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "#ffffff", color: "#030712", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 24, transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Masuk dengan Google
            </button>
          </motion.div>

          <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>atau email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </motion.div>

          <motion.form variants={itemVariants} onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }}>
                <Mail size={18} />
              </div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" 
                style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC", fontSize: 15, outline: "none", transition: "all 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#4FD1C5"; e.target.style.background = "rgba(79,209,197,0.05)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.03)"; }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }}>
                <Lock size={18} />
              </div>
              <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" 
                style={{ width: "100%", padding: "16px 48px 16px 48px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC", fontSize: 15, outline: "none", transition: "all 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#4FD1C5"; e.target.style.background = "rgba(79,209,197,0.05)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.03)"; }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748B", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", background: loading ? "rgba(79,209,197,0.4)" : "linear-gradient(135deg, #4FD1C5, #7DD3FC)", color: "#030712", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, boxShadow: "0 10px 30px rgba(79,209,197,0.2)" }}>
              {loading ? "Authenticating..." : "Masuk ke Dashboard"}
            </motion.button>
          </motion.form>

        </motion.div>
      </div>
    </div>
  );
}
