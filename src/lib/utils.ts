import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, overrideCurrency?: string): string {
  let currency = overrideCurrency || "IDR";
  let rate = 1;

  if (typeof window !== "undefined" && !overrideCurrency) {
    currency = localStorage.getItem("ninja_currency") || "IDR";
    const ratesJSON = localStorage.getItem("ninja_currency_rates");
    if (ratesJSON) {
      try {
        const data = JSON.parse(ratesJSON);
        if (data.rates && data.rates[currency]) {
          rate = data.rates[currency];
        }
      } catch(e) {}
    }
  }

  const converted = amount * rate;
  
  if (currency === "IDR" || currency === "JPY") {
    return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "ja-JP", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted);
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes}m lalu`;
  if (hours < 24) return `${hours}j lalu`;
  if (days < 7) return `${days}h lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}
