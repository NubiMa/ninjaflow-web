"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Pengguna" },
  { href: "/admin/logs", icon: ShieldAlert, label: "System Logs" },
  { href: "/admin/broadcast", icon: MessageSquare, label: "Broadcast" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 260,
        background: "#0B1215",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        flexDirection: "column",
        padding: "32px 20px",
      }}
      className="hidden md:flex"
    >
      <div style={{ paddingLeft: 12, marginBottom: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #F6C177, #EB984E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldAlert size={18} color="#0B1215" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-0.02em" }}>
          Ninja <span style={{ color: "#F6C177" }}>Admin</span>
        </span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 14,
                  color: isActive ? "#F5F7FA" : "#748391",
                  transition: "color 0.2s ease",
                  overflow: "hidden"
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-active-bg"
                    style={{ position: "absolute", inset: 0, background: "rgba(246,193,119,0.12)", border: "1px solid rgba(246,193,119,0.2)", borderRadius: 14 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ position: "relative", zIndex: 1, color: isActive ? "#F6C177" : "inherit" }} />
                <span style={{ position: "relative", zIndex: 1, fontSize: 15, fontWeight: isActive ? 600 : 500 }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, color: "#748391", transition: "color 0.2s ease" }}
               onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F7FA")}
               onMouseLeave={(e) => (e.currentTarget.style.color = "#748391")}>
            <LayoutDashboard size={20} strokeWidth={2} />
            <span style={{ fontSize: 15, fontWeight: 500 }}>Kembali ke App</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
