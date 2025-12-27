
export interface TypingText {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface TypingSession {
  startTime: number | null;
  endTime: number | null;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
}

export interface PracticeResult {
  id: string;
  textId: string;
  wpm: number;
  accuracy: number;
  duration: number; // in seconds
  timestamp: number;
}
