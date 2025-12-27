
import { GoogleGenAI } from "@google/genai";

// Strictly using process.env.API_KEY as per coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Standard cleanup for English typing text.
 * Keeps letters, numbers, spaces, and standard punctuation (. , : ; ! ? ' " ( ) -).
 * Specifically removes decorative symbols like ·, •, etc.
 */
export const cleanTypingText = (text: string): string => {
  return text
    // Replace non-standard whitespace/bullets/symbols with empty or spaces
    .replace(/[·•\u00B7\u2022\u25CF\u25AA\u2023\u2043\u2027]/g, '')
    // Allow only: A-Z, a-z, 0-9, spaces, and . , : ; ! ? ' " ( ) - \n
    .replace(/[^a-zA-Z0-9\s.,:;!?'"()\-\n]/g, '')
    // Normalize spaces within lines
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '))
    .filter(line => line.length > 0)
    .join('\n\n');
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
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
  } else if (!mimeType) {
    mimeType = 'application/octet-stream';
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
              text: "Extract full English text. CRITICAL: 1. KEEP only standard punctuation (. , : ; ! ? ' \" ( ) -). 2. REMOVE all non-standard symbols like dots (·), bullets (•), or decorative marks. 3. PRESERVE paragraph structure. 4. Return the cleaned text only.",
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    const rawText = response.text?.trim() || "";
    return cleanTypingText(rawText);
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error("Gemini could not parse this document. Please check your network or try converting it to a standard PDF.");
  }
};
