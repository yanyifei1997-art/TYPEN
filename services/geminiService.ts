
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
  // Always initialize with named parameter and direct process.env.API_KEY access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result && result.includes(',')) {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error("Empty or invalid file data."));
      }
    };
    reader.onerror = () => reject(new Error("File reader error."));
    reader.readAsDataURL(file);
  });

  let mimeType = file.type || 'application/pdf';
  const fileNameLower = file.name.toLowerCase();
  
  if (fileNameLower.endsWith('.docx')) {
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (fileNameLower.endsWith('.doc')) {
    mimeType = 'application/msword';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Extract all English text from this document for a typing practice exercise. Remove headers, footers, and page numbers. Format with clean paragraphs. Return ONLY the extracted text." },
        ],
      },
      config: { 
        temperature: 0.1 
      },
    });

    // Extract text from response using the .text property directly
    const extractedText = response.text || "";
    const cleaned = cleanTypingText(extractedText);
    
    if (cleaned.length < 10) {
      throw new Error("Extraction failed: Text content too sparse or invalid.");
    }
    
    return cleaned;
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    throw new Error(error.message || "The AI document processor encountered an error.");
  }
};
