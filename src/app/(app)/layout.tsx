"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { motion } from "framer-motion";

import { restoreNotificationSchedule } from "@/lib/notifications";

function CurrencyFetcher() {
  useEffect(() => {
    restoreNotificationSchedule();
    async function fetchRates() {
      try {
        const CACHE_KEY = "ninja_currency_rates";
        const CACHE_TIME = 24 * 60 * 60 * 1000;
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          if (Date.now() - data.timestamp < CACHE_TIME) return;
        }

        const res = await fetch("https://open.er-api.com/v6/latest/IDR");
        const data = await res.json();
        if (data && data.rates) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, timestamp: Date.now() }));
        }
      } catch (e) {
        console.error("Failed to fetch rates", e);
      }
    }
    fetchRates();
  }, []);
  return null;
}

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
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: "#0B1215" }}>
      <CurrencyFetcher />
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
          className="pb-safe px-4 py-6 md:px-10 md:py-8 lg:px-16 lg:py-12"
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
