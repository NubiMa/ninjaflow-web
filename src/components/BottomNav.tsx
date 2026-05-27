"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ArrowLeftRight, Sparkles, Target, User } from "lucide-react";

const navItems = [
  { href: "/dashboard",              icon: Home,            label: "Home" },
  { href: "/dashboard/transactions", icon: ArrowLeftRight,  label: "Transaksi" },
  { href: "/dashboard/insights",     icon: Sparkles,        label: "Insights" },
  { href: "/dashboard/goals",        icon: Target,          label: "Goals" },
  { href: "/dashboard/profile",      icon: User,            label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        padding: "8px 12px",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        background: "rgba(3,7,18,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 relative"
                style={{ padding: "8px 12px", borderRadius: 12 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0"
                    style={{
                      background: "rgba(79,209,197,0.1)",
                      borderRadius: 12,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? "#4FD1C5" : "#748391", position: "relative" }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#4FD1C5" : "#748391",
                    position: "relative",
                  }}
                >
                  {label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
