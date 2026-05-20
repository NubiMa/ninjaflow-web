export function checkVisionCooldown(): { canUse: boolean; remainingMinutes: number } {
  if (typeof window === "undefined") return { canUse: true, remainingMinutes: 0 };
  
  const lastUsed = localStorage.getItem("ninja_vision_last_used");
  if (!lastUsed) return { canUse: true, remainingMinutes: 0 };

  const lastTime = parseInt(lastUsed, 10);
  const now = Date.now();
  const fiveMinutesMs = 5 * 60 * 1000;
  
  const diff = now - lastTime;
  if (diff < fiveMinutesMs) {
    const remaining = Math.ceil((fiveMinutesMs - diff) / (60 * 1000));
    return { canUse: false, remainingMinutes: remaining };
  }
  
  return { canUse: true, remainingMinutes: 0 };
}

export function setVisionUsed() {
  if (typeof window !== "undefined") {
    localStorage.setItem("ninja_vision_last_used", Date.now().toString());
  }
}
