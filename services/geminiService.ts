
import { GoogleGenAI } from "@google/genai";

// Cleanup text for typing practice
export const cleanTypingText = (text: string): string => {
  if (!text || typeof text !== 'string') return "";
  return text
    .replace(/[·•\u00B7\u2022\u25CF\u25AA\u2023\u2043\u2027\u25E6\u25AB\u25AC]/g, '')
    .replace(/[^a-zA-Z0-9\s.,:;!?'"()\-\n]/g, '')
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '))
    .filter(line => line.length > 0)
    .join('\n\n');
};

// Extract text from file using Gemini API
export const extractTextFromFile = async (file: File): Promise<string> => {
  // Use process.env.API_KEY directly as required by the system
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result?.includes(',')) resolve(result.split(',')[1]);
      else reject(new Error("File conversion failed."));
    };
    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsDataURL(file);
  });

  let mimeType = file.type || 'application/pdf';
  if (file.name.toLowerCase().endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Extract English text for typing practice. Return ONLY the text, maintain paragraphs." },
        ],
      },
      config: { 
        temperature: 0.1 
      },
    });

    const cleaned = cleanTypingText(response.text || "");
    if (cleaned.length < 5) throw new Error("Could not extract enough text content.");
    return cleaned;
  } catch (error: any) {
    throw new Error(error.message || "AI Extraction service failed.");
  }
};
