"use server";

import { GoogleGenAI } from "@google/genai";
import { TransactionDraft, TransactionCategory, categorizeByMerchant } from "@/types";

export interface ScanResult {
  draft: TransactionDraft;
  confidence: "high" | "medium" | "low";
}

export async function scanReceiptImage(base64Image: string, mimeType: string = "image/jpeg", source: "photo" | "camera" = "photo"): Promise<ScanResult> {
  let responseText = "";

  const prompt = `Extract receipt to JSON (NO markdown, NO extra text). Keys:
merchant(str),amount(num IDR),date(YYYY-MM-DD),category(food,transport,shopping,entertainment,health,education,bills,other),note(short desc),confidence(high,medium,low).
Output ONLY valid JSON.`;

  if (source === "camera") {
    responseText = await groqVisionScan(base64Image, mimeType, prompt);
  } else {
    responseText = await geminiVisionScan(base64Image, mimeType, prompt, process.env.VISION_AI_API_KEY);
  }

  const parsed = JSON.parse(responseText);

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

async function groqVisionScan(base64Image: string, mimeType: string, prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY tidak ditemukan di .env. Silakan tambahkan kunci Groq.");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ],
      temperature: 0.1,
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API Error: ${err}`);
  }

  const data = await response.json();
  let text = data.choices[0].message.content || "";
  // Bersihkan markdown jika Groq masih memaksa memberikan backticks
  if (text.startsWith("\`\`\`json")) text = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
  else if (text.startsWith("\`\`\`")) text = text.replace(/\`\`\`/g, "").trim();
  
  return text;
}

async function geminiVisionScan(base64Image: string, mimeType: string, prompt: string, apiKey?: string): Promise<string> {
  if (!apiKey) throw new Error("VISION_AI_API_KEY tidak ditemukan di .env");
  const visionAI = new GoogleGenAI({ apiKey });
  
  let response;
  let retries = 3;
  let delay = 2000;

  while (retries > 0) {
    try {
      response = await visionAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Image } }] },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });
      break;
    } catch (err: any) {
      const errorMsg = err.message || err.toString();
      if (errorMsg.includes("503") || errorMsg.includes("429") || errorMsg.toLowerCase().includes("overloaded") || errorMsg.toLowerCase().includes("unavailable")) {
        retries--;
        if (retries === 0) throw new Error("Server AI sedang sibuk. Coba lagi.");
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw new Error("Gagal menghubungi AI: " + errorMsg);
      }
    }
  }

  if (!response || !response.text) throw new Error("Gagal membaca gambar.");
  return response.text;
}
