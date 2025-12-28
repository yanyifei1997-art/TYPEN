
import { GoogleGenAI } from "@google/genai";

/**
 * Strictly filters text for typing practice.
 * Ensures the output is clean and suitable for the typing engine.
 */
export const cleanTypingText = (text: string): string => {
  if (!text || typeof text !== 'string') return "";
  
  return text
    // 1. Remove specific unwanted decorative symbols from WPS/Word
    .replace(/[·•\u00B7\u2022\u25CF\u25AA\u2023\u2043\u2027\u25E6\u25AB\u25AC]/g, '')
    // 2. Filter to only allow standard alphanumeric and typing punctuation
    .replace(/[^a-zA-Z0-9\s.,:;!?'"()\-\n]/g, '')
    // 3. Normalize whitespace and clean up empty lines
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '))
    .filter(line => line.length > 0)
    .join('\n\n');
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (!file) throw new Error("No file selected.");

  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("Gemini API Key is missing. Please check your Environment Variables.");
  }

  // Initialize inside function to ensure we catch environment access issues
  const ai = new GoogleGenAI({ apiKey });

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result && result.includes(',')) {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error("File processing failed."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsDataURL(file);
  });

  let mimeType = file.type;
  const fileName = file.name.toLowerCase();
  
  // Robust mime type fallback
  if (fileName.endsWith('.docx')) {
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (fileName.endsWith('.doc')) {
    mimeType = 'application/msword';
  } else if (fileName.endsWith('.pdf')) {
    mimeType = 'application/pdf';
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
                mimeType: mimeType || 'application/pdf',
              },
            },
            {
              text: "Extract English text for typing practice. Rules: 1. Keep standard punctuation (. , : ; ! ? ' \" ( ) -). 2. Remove bullets and decorative symbols. 3. Return ONLY the text, maintain paragraphs.",
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
    
    if (cleaned.length < 10) {
      throw new Error("Document content is too brief for practice.");
    }
    
    return cleaned;
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    throw new Error(error.message || "Failed to parse document content.");
  }
};
