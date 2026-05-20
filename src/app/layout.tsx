import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ninja Flow — AI Finance Companion",
  description:
    "Ninja Flow membantu kamu memahami pola keuangan dengan cara yang calm, modern, dan cerdas. Lacak pengeluaran, scan struk, dan dapatkan insight AI personal.",
  keywords: ["finance", "ai", "expense tracker", "keuangan", "ninja"],
  authors: [{ name: "Ninja Flow" }],
  openGraph: {
    title: "Ninja Flow — AI Finance Companion",
    description: "Kelola keuanganmu dengan AI yang calm dan modern.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1215",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={plusJakarta.variable}>
      <body style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
