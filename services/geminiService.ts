import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLuckyQuote = async (balance: number, lastWin: number): Promise<string> => {
  try {
    const prompt = `
      You are a mystical casino oracle.
      The player currently has ${balance} credits.
      Their last spin result was a win of ${lastWin}.
      Give them a very short, mystical, funny, or encouraging fortune about their next spin.
      Keep it under 15 words.
      Do not be negative.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "The stars are aligning for you...";
  } catch (error) {
    console.error("Oracle error:", error);
    return "Luck favors the bold!";
  }
};