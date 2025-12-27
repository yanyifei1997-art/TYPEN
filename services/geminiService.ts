
import { GoogleGenAI } from "@google/genai";

// Initialize using the mandatory pattern from guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Strictly filters text for typing practice.
 * Preserves: Letters, Numbers, standard spaces, and standard English punctuation.
 * Specifically removes: Decorative dots (·), bullets (•), and non-typing symbols.
 */
export const cleanTypingText = (text: string): string => {
  if (!text) return "";
  
  return text
    // 1. Remove specific unwanted decorative symbols that often appear in WPS/Word
    .replace(/[·•\u00B7\u2022\u25CF\u25AA\u2023\u2043\u2027\u25E6\u25AB\u25AC]/g, '')
    // 2. Filter to only allow English alphanumeric and standard typing punctuation
    // Allowed: a-zA-Z, 0-9, spaces, \n, and . , : ; ! ? ' " ( ) -
    .replace(/[^a-zA-Z0-9\s.,:;!?'"()\-\n]/g, '')
    // 3. Normalize whitespace and preserve paragraph structure
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '))
    .filter(line => line.length > 0)
    .join('\n\n');
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (!file) throw new Error("No file provided.");

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result && result.includes(',')) {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as base64."));
      }
    };
    reader.onerror = () => reject(new Error("File reading error."));
    reader.readAsDataURL(file);
  });

  // Comprehensive mime type detection for various environments
  let mimeType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.docx')) {
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (fileName.endsWith('.doc')) {
    mimeType = 'application/msword';
  } else if (fileName.endsWith('.pdf')) {
    mimeType = 'application/pdf';
  } else if (!mimeType || mimeType === 'application/octet-stream') {
    // Fallback detection based on extension for non-standard systems
    if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (fileName.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else mimeType = 'application/pdf'; // Default to PDF for Gemini's multi-modal capability
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: "Act as a high-precision text extractor for typing practice. Extract ALL English text. RULES: 1. Keep standard punctuation (. , : ; ! ? ' \" ( ) -). 2. ABSOLUTELY REMOVE decorative symbols like middle dots (·), bullets, or list markers. 3. Maintain paragraphs. 4. If the document is from WPS/Word, ensure text flow is logical. Return ONLY the extracted text.",
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    const rawText = response.text || "";
    const cleaned = cleanTypingText(rawText);
    
    if (!cleaned || cleaned.length < 5) {
      throw new Error("Extracted text is too short or invalid for typing practice.");
    }
    
    return cleaned;
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    const msg = error.message || "";
    if (msg.includes("API_KEY")) {
      throw new Error("Invalid API Key configuration. Please check your environment variables.");
    }
    throw new Error(`Failed to parse document: ${msg}. Please try a standard PDF or paste text manually.`);
  }
};
