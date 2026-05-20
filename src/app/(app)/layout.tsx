"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { motion } from "framer-motion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1215" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid rgba(79,209,197,0.15)",
            borderTopColor: "#4FD1C5",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100dvh", background: "#0B1215" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="pb-safe"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 32px 32px",
          }}
        >
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
