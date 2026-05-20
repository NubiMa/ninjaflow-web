import { AIInsightResult } from "@/app/actions/ai";

const CACHE_KEY = "ninja_ai_insight_cache";
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

interface InsightCacheData {
  result: AIInsightResult;
  generatedAt: number;
  txCount: number;
}

export function getInsightCache(): InsightCacheData | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CACHE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as InsightCacheData;
  } catch {
    return null;
  }
}

export function setInsightCache(result: AIInsightResult, txCount: number) {
  if (typeof window === "undefined") return;
  const data: InsightCacheData = {
    result,
    generatedAt: Date.now(),
    txCount,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

export function shouldRegenerateInsight(currentTxCount: number): boolean {
  const cache = getInsightCache();
  // If no cache, must generate
  if (!cache) return true;
  
  // If tx count hasn't changed, NEVER regenerate (0 token waste)
  if (cache.txCount === currentTxCount) return false;

  // If tx count changed, only regenerate if 5 minutes have passed
  const timePassed = Date.now() - cache.generatedAt;
  return timePassed >= COOLDOWN_MS;
}
