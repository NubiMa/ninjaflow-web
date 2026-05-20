"use server";

import { GoogleGenAI } from "@google/genai";
import { TransactionDraft, TransactionCategory, categorizeByMerchant } from "@/types";

export interface ScanResult {
  draft: TransactionDraft;
  confidence: "high" | "medium" | "low";
}

export async function scanReceiptImage(base64Image: string, mimeType: string = "image/jpeg", source: "photo" | "camera" = "photo"): Promise<ScanResult> {
  const apiKey = source === "camera" ? process.env.CAMERA_AI_API_KEY : process.env.VISION_AI_API_KEY;
  if (!apiKey) throw new Error(`API Key untuk ${source} tidak ditemukan di .env`);

  const visionAI = new GoogleGenAI({ apiKey });

  // Extremely minimal prompt to save tokens
  const prompt = `Extract receipt to JSON (NO markdown). Keys:
merchant(str),amount(num IDR),date(YYYY-MM-DD),category(food,transport,shopping,entertainment,health,education,bills,other),note(short desc),confidence(high,medium,low).`;

  const response = await visionAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Image } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.1, // more deterministic, less rambling
    },
  });

  if (!response.text) throw new Error("Gagal membaca gambar.");

  const parsed = JSON.parse(response.text);

  let category: TransactionCategory = parsed.category ?? "other";
  if (parsed.merchant) {
    const ruleCategory = categorizeByMerchant(parsed.merchant);
    if (ruleCategory !== "other") category = ruleCategory;
  }

  const draft: TransactionDraft = {
    type: "expense",
    category,
    amount: Number(parsed.amount) || 0,
    note: parsed.note ?? parsed.merchant ?? "Struk",
    merchant: parsed.merchant || undefined,
    date: parsed.date ? new Date(parsed.date) : new Date(),
  };

  return {
    draft,
    confidence: parsed.confidence ?? "medium",
  };
}
