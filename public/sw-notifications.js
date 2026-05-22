// Ninja Finance — Notification Service Worker
// Fires daily reminder at the scheduled time

const CHECK_INTERVAL_MS = 60 * 1000; // check every minute

let checkTimer = null;

function checkAndNotify() {
  const settingsRaw = self.__notifTime || null;
  if (!settingsRaw) return;

  const { hour, minute } = settingsRaw;
  const now = new Date();

  if (now.getHours() === hour && now.getMinutes() === minute) {
    self.registration.showNotification("💸 Ninja Finance — Pengingat Harian", {
      body: "Jangan lupa catat transaksi hari ini agar keuanganmu tetap terkontrol!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "daily-reminder",       // prevents duplicate notifications
      renotify: false,
    });
  }
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  if (checkTimer) clearInterval(checkTimer);
  checkTimer = setInterval(checkAndNotify, CHECK_INTERVAL_MS);
});

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_NOTIF_TIME") {
    self.__notifTime = event.data.payload; // { hour: number, minute: number }
  }
  if (event.data?.type === "STOP_NOTIF") {
    self.__notifTime = null;
  }
  if (event.data?.type === "TEST_NOTIF") {
    self.registration.showNotification("💸 Ninja Finance — Test Notifikasi", {
      body: "Push Notifications berhasil diaktifkan! Kamu akan mendapat pengingat setiap hari.",
      icon: "/icon-192.png",
      tag: "test-notification",
    });
  }
});

// Handle notification click — focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return self.clients.openWindow("/dashboard");
    })
  );
});
