
import React, { useState, useEffect, useCallback } from 'react';
import InputSection from './components/FileUpload';
import HistoryList from './components/HistoryList';
import TypingArea from './components/TypingArea';
import ResultModal from './components/ResultModal';
import SelectionView from './components/SelectionView';
import { TypingText, PracticeResult } from './types';

const App: React.FC = () => {
  const [savedTexts, setSavedTexts] = useState<TypingText[]>([]);
  const [textToSelect, setTextToSelect] = useState<TypingText | null>(null);
  const [activePracticeContent, setActivePracticeContent] = useState<{title: string, content: string, id: string} | null>(null);
  const [lastResult, setLastResult] = useState<PracticeResult | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const STORAGE_KEY = 'typen_v2_store';

  useEffect(() => {
    // Access process.env.API_KEY directly as required by the environment
    try {
      if (!process.env.API_KEY) {
        setInitError("API_KEY is missing. Document processing will be unavailable.");
      }
    } catch (e) {
      console.warn("process.env check caught error", e);
      setInitError("Environment initialization error.");
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedTexts(parsed);
      }
    } catch (e) {
      console.warn("Storage recovery failed.");
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTexts));
    }
  }, [savedTexts, isReady]);

  const handleUploadSuccess = useCallback((newText: TypingText) => {
    setSavedTexts(prev => [newText, ...prev]);
  }, []);

  const handleSelectFromLibrary = useCallback((text: TypingText) => {
    setTextToSelect(text);
  }, []);

  const handleConfirmSelection = useCallback((selectedContent: string) => {
    if (textToSelect) {
      setActivePracticeContent({
        id: textToSelect.id,
        title: textToSelect.title,
        content: selectedContent
      });
      setTextToSelect(null);
    }
  }, [textToSelect]);

  const handleDeleteText = useCallback((id: string) => {
    setSavedTexts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleFinishPractice = useCallback((result: PracticeResult) => {
    setLastResult(result);
  }, []);

  const handleCloseModal = useCallback(() => {
    setLastResult(null);
    setActivePracticeContent(null);
  }, []);

  if (!isReady) return null;

  if (activePracticeContent) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
        <TypingArea 
          practiceText={{
            id: activePracticeContent.id,
            title: activePracticeContent.title,
            content: activePracticeContent.content,
            createdAt: Date.now()
          }} 
          onFinish={handleFinishPractice} 
          onExit={() => setActivePracticeContent(null)}
        />
        {lastResult && <ResultModal result={lastResult} onClose={handleCloseModal} />}
      </div>
    );
  }

  if (textToSelect) {
    return (
      <SelectionView 
        text={textToSelect}
        onConfirm={handleConfirmSelection}
        onCancel={() => setTextToSelect(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 md:py-20 bg-slate-50 font-sans">
      <header className="max-w-6xl mx-auto w-full mb-20 flex flex-col items-center text-center">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-blue-200 transform -rotate-3">
            <span className="text-white font-black text-3xl">T</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900">Typen</h1>
        </div>
        <p className="text-slate-500 text-xl max-w-xl font-semibold">Master English Typing with AI</p>
        {initError && <p className="mt-4 text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl">{initError}</p>}
      </header>

      <main className="max-w-4xl mx-auto w-full space-y-28 flex-grow">
        <InputSection onUploadSuccess={handleUploadSuccess} />
        
        <section>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Library</h2>
            <div className="h-px flex-1 bg-slate-200 mx-6"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{savedTexts.length} Units</span>
          </div>
          <HistoryList texts={savedTexts} onSelect={handleSelectFromLibrary} onDelete={handleDeleteText} />
        </section>
      </main>
    </div>
  );
};

export default App;
