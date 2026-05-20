"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, ArrowLeftRight, Sparkles, Target, User, LogOut, Zap,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/dashboard",              icon: Home,           label: "Dashboard" },
  { href: "/dashboard/transactions", icon: ArrowLeftRight, label: "Transaksi" },
  { href: "/dashboard/insights",     icon: Sparkles,       label: "Insights" },
  { href: "/dashboard/goals",        icon: Target,         label: "Goals" },
  { href: "/dashboard/profile",      icon: User,           label: "Profil" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="hidden md:flex flex-col"
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#0D1A1F",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "28px 24px 20px" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Zap size={18} color="#0B1215" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#F5F7FA", letterSpacing: "-0.02em" }}>
            Ninja Flow
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: isActive ? "rgba(79,209,197,0.1)" : "transparent",
                  border: isActive ? "1px solid rgba(79,209,197,0.15)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? "#4FD1C5" : "#748391", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#F5F7FA" : "#AAB7C2",
                  }}
                >
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    style={{
                      marginLeft: "auto",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#4FD1C5",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4FD1C5, #7DD3FC)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#0B1215",
              flexShrink: 0,
            }}
          >
            {user?.displayName?.[0]?.toUpperCase() ?? "N"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "#F5F7FA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.displayName ?? "Ninja User"}
            </p>
            <p style={{ fontSize: 11, color: "#748391", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#748391",
            fontSize: 13,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,137,137,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "#E88989";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#748391";
          }}
        >
          <LogOut size={15} strokeWidth={1.8} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
