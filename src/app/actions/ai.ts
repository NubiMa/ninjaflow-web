"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AIInsightResult {
  reflection: string;
  cards: {
    title: string;
    value: string;
    emoji: string;
  }[];
}

export async function generateFinancialInsight(
  totalExpense: number,
  totalIncome: number,
  categoryBreakdown: { cat: string; amount: number }[],
  recentTransactions: { note: string; amount: number; category: string }[]
): Promise<AIInsightResult> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      reflection: "💡 Tambahkan Gemini API Key di pengaturan untuk mengaktifkan AI Reflection.",
      cards: []
    };
  }

  const prompt = `
Kamu adalah Ninja, asisten finansial personal yang "calm, cerdas, dan tidak menghakimi".
Analisis data finansial bulan ini dan kembalikan response DALAM FORMAT JSON SAJA.
Jangan sertakan teks apapun di luar JSON block (tanpa markdown backticks \`\`\`json).

Data Bulan Ini:
- Pemasukan: Rp${totalIncome}
- Pengeluaran: Rp${totalExpense}
- Kategori Terbesar: ${categoryBreakdown.slice(0, 3).map(c => `${c.cat} (Rp${c.amount})`).join(', ')}

Format JSON yang dibutuhkan:
{
  "reflection": "1-2 kalimat pendek yang actionable dan suportif. Menenangkan tapi menyadarkan.",
  "cards": [
    {
      "title": "Status Cashflow",
      "value": "Singkat (misal: Sehat, Waspada, dsb)",
      "emoji": "Satu emoji"
    },
    {
      "title": "Fokus Utama",
      "value": "Singkat (misal: Kurangi Jajan, Pertahankan)",
      "emoji": "Satu emoji"
    },
    {
      "title": "Top Pengeluaran",
      "value": "Kategori terbesar",
      "emoji": "Satu emoji"
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        reflection: parsed.reflection || "Kamu melakukan pekerjaan yang baik bulan ini.",
        cards: parsed.cards || []
      };
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("AI Insight Error:", error);
    return {
      reflection: "Maaf, Ninja sedang istirahat. Gagal memuat AI Reflection saat ini.",
      cards: []
    };
  }
}
