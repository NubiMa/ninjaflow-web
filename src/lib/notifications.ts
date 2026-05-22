// Ninja Finance — Notification Service

const SW_PATH = "/sw-notifications.js";
const NOTIF_TIME_KEY = "ninja_notif_time";

export type NotifTime = { hour: number; minute: number };

async function getSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    // Reuse existing registration or register fresh
    const existing = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (existing) return existing;
    return await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  } catch (e) {
    console.error("SW registration failed:", e);
    return null;
  }
}

async function sendSWMessage(msg: object) {
  const reg = await getSW();
  if (!reg || !reg.active) return;
  reg.active.postMessage(msg);
}

/** Request permission and set up push notifications */
export async function enablePushNotifications(time: NotifTime): Promise<"granted" | "denied" | "unsupported"> {
  if (!("Notification" in window)) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  // Store time preference
  localStorage.setItem(NOTIF_TIME_KEY, JSON.stringify(time));

  // Register SW and send the schedule
  const reg = await getSW();
  if (!reg) return "granted"; // permission ok, but SW failed silently

  // Wait for SW to be active
  if (reg.installing || reg.waiting) {
    await new Promise<void>((resolve) => {
      const sw = reg.installing || reg.waiting;
      sw!.addEventListener("statechange", function handler() {
        if (reg.active) { sw!.removeEventListener("statechange", handler); resolve(); }
      });
    });
  }

  await sendSWMessage({ type: "SET_NOTIF_TIME", payload: time });
  // Fire a test notification immediately
  await sendSWMessage({ type: "TEST_NOTIF" });

  return "granted";
}

/** Disable push notifications */
export async function disablePushNotifications() {
  localStorage.removeItem(NOTIF_TIME_KEY);
  await sendSWMessage({ type: "STOP_NOTIF" });
}

/** Restore the saved schedule on page load (called from layout) */
export async function restoreNotificationSchedule() {
  const stored = localStorage.getItem(NOTIF_TIME_KEY);
  if (!stored) return;
  const time: NotifTime = JSON.parse(stored);
  await sendSWMessage({ type: "SET_NOTIF_TIME", payload: time });
}

/** Get the saved notification time, if any */
export function getSavedNotifTime(): NotifTime | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(NOTIF_TIME_KEY);
  return stored ? JSON.parse(stored) : null;
}
