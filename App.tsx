
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

  useEffect(() => {
    const stored = localStorage.getItem('typen_saved_texts');
    if (stored) {
      try {
        setSavedTexts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load saved texts", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('typen_saved_texts', JSON.stringify(savedTexts));
  }, [savedTexts]);

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

  if (activePracticeContent) {
    const mockText: TypingText = {
      id: activePracticeContent.id,
      title: activePracticeContent.title,
      content: activePracticeContent.content,
      createdAt: Date.now()
    };
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col">
        <TypingArea 
          practiceText={mockText} 
          onFinish={handleFinishPractice} 
          onExit={() => setActivePracticeContent(null)}
        />
        {lastResult && (
          <ResultModal 
            result={lastResult} 
            onClose={handleCloseModal} 
          />
        )}
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
    <div className="min-h-screen flex flex-col px-6 py-12 md:py-20 bg-slate-50">
      <header className="max-w-6xl mx-auto w-full mb-16 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Typen</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-xl font-medium">
          Professional English typing trainer. 
          Upload PDF/Word or Paste text to begin.
        </p>
      </header>

      <main className="max-w-4xl mx-auto w-full space-y-20">
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Exercise Source</h2>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>
          <InputSection onUploadSuccess={handleUploadSuccess} />
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Library</h2>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>
          <HistoryList 
            texts={savedTexts} 
            onSelect={handleSelectFromLibrary} 
            onDelete={handleDeleteText} 
          />
        </section>
      </main>

      <footer className="mt-auto pt-20 pb-8 text-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">
        <p>© {new Date().getFullYear()} TYPEN. HIGH-PERFORMANCE TRAINING.</p>
      </footer>
    </div>
  );
};

export default App;
