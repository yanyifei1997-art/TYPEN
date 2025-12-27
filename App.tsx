
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
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load from storage safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem('typen_saved_texts');
      if (stored) {
        setSavedTexts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved texts", e);
    }
  }, []);

  // Sync to storage safely
  useEffect(() => {
    try {
      localStorage.setItem('typen_saved_texts', JSON.stringify(savedTexts));
    } catch (e) {
      console.error("Failed to save texts to local storage", e);
    }
  }, [savedTexts]);

  const handleUploadSuccess = useCallback((newText: TypingText) => {
    setSavedTexts(prev => [newText, ...prev]);
    setGlobalError(null);
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

  // Global error recovery
  if (globalError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-xl text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Application Error</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">{globalError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all"
          >
            RELOAD APP
          </button>
        </div>
      </div>
    );
  }

  if (activePracticeContent) {
    const mockText: TypingText = {
      id: activePracticeContent.id,
      title: activePracticeContent.title,
      content: activePracticeContent.content,
      createdAt: Date.now()
    };
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col overflow-hidden">
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
    <div className="min-h-screen flex flex-col px-6 py-12 md:py-20 bg-slate-50 overflow-x-hidden">
      <header className="max-w-6xl mx-auto w-full mb-16 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Typen</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-xl font-medium">
          Professional English typing trainer. 
          Optimized for WPS, Word, and PDF.
        </p>
      </header>

      <main className="max-w-4xl mx-auto w-full space-y-20 flex-grow">
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

      <footer className="mt-20 pt-10 pb-8 text-center border-t border-slate-200/50">
        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} TYPEN. HIGH-PERFORMANCE TRAINING.
        </p>
      </footer>
    </div>
  );
};

export default App;
