"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AdminSidebar from "@/components/AdminSidebar";
import { motion } from "framer-motion";
import { checkIsAdmin } from "@/lib/db";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
      } else {
        checkIsAdmin(user.email).then((admin) => {
          if (!admin) {
            router.replace("/dashboard");
          } else {
            setIsAdmin(true);
          }
        });
      }
    }
  }, [user, loading, router]);

  if (loading || !user || isAdmin === null) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1215" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid rgba(246,193,119,0.15)", // Admin orange
            borderTopColor: "#F6C177",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: "#0B1215" }}>
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="pb-safe px-4 py-6 md:px-10 md:py-8 lg:px-16 lg:py-12"
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
