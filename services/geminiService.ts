
import { GoogleGenAI } from "@google/genai";

/**
 * Strictly filters text for typing practice.
 */
export const cleanTypingText = (text: string): string => {
  if (!text) return "";
  
  return text
    // 1. Remove specific unwanted decorative symbols
    .replace(/[·•\u00B7\u2022\u25CF\u25AA\u2023\u2043\u2027\u25E6\u25AB\u25AC]/g, '')
    // 2. Filter to only allow English alphanumeric and standard typing punctuation
    .replace(/[^a-zA-Z0-9\s.,:;!?'"()\-\n]/g, '')
    // 3. Normalize whitespace
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '))
    .filter(line => line.length > 0)
    .join('\n\n');
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (!file) throw new Error("No file provided.");

  // Check API Key right before use
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API_KEY is not configured in the environment variables.");
  }

  // Initialize right before making the call to ensure fresh environment access
  const ai = new GoogleGenAI({ apiKey });

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result && result.includes(',')) {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file."));
      }
    };
    reader.onerror = () => reject(new Error("File reading error."));
    reader.readAsDataURL(file);
  });

  let mimeType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.docx')) {
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (fileName.endsWith('.doc')) {
    mimeType = 'application/msword';
  } else if (fileName.endsWith('.pdf')) {
    mimeType = 'application/pdf';
  } else if (!mimeType || mimeType === 'application/octet-stream') {
    if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (fileName.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else mimeType = 'application/pdf'; 
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
              text: "Act as a high-precision text extractor for typing practice. Extract ALL English text. RULES: 1. Keep standard punctuation (. , : ; ! ? ' \" ( ) -). 2. ABSOLUTELY REMOVE decorative symbols like middle dots (·), bullets, or list markers. 3. Maintain paragraphs. 4. Return ONLY the extracted text.",
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
      throw new Error("The document contains no valid English content for practice.");
    }
    
    return cleaned;
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    const msg = error.message || "Unknown error";
    throw new Error(`Extraction failed: ${msg}. Please ensure your API key is valid and the file is not password protected.`);
  }
};
