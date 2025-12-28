
import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
  try {
    const key = (window as any).process?.env?.API_KEY;
    return key || '';
  } catch (e) {
    return '';
  }
};

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
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key 未在环境变量中配置。");

  const ai = new GoogleGenAI({ apiKey });
  
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result?.includes(',')) resolve(result.split(',')[1]);
      else reject(new Error("文件转换失败。"));
    };
    reader.onerror = () => reject(new Error("读取文件失败。"));
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
    if (cleaned.length < 5) throw new Error("未能从文档中提取到足够的文字内容。");
    return cleaned;
  } catch (error: any) {
    throw new Error(error.message || "AI 提取服务暂时不可用。");
  }
};
