
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key is not configured on Vercel' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Dưới đây là các lời nhắn từ học sinh gửi cho giáo viên. Hãy viết một đoạn tổng kết ngắn gọn (khoảng 3-4 câu), ấm áp, chân thành để giúp giáo viên cảm nhận được tình cảm chung của cả lớp và những điểm cần lưu ý.
    Dữ liệu: ${messages.map(m => `HS ${m.name}: ${m.reflection}`).join(' | ')}`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return res.status(200).json({ text: result.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
