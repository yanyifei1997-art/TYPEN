
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
  const [appStatus, setAppStatus] = useState<'ready' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState("");

  // Storage Key Constant
  const STORAGE_KEY = 'typen_v1_saved_texts';

  useEffect(() => {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === 'undefined') {
        setAppStatus('error');
        setErrorMessage("API Key is missing. Please check your deployment settings (Environment Variables).");
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedTexts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Initialization error", e);
    }
  }, []);

  useEffect(() => {
    try {
      if (savedTexts.length > 0 || localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTexts));
      }
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
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

  if (appStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white p-12 rounded-[48px] shadow-2xl text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Configuration Required</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
          >
            REFRESH PAGE
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
      <div className="min-h-screen bg-white text-slate-800 flex flex-col">
        <TypingArea 
          practiceText={mockText} 
          onFinish={handleFinishPractice} 
          onExit={() => setActivePracticeContent(null)}
        />
        {lastResult && (
          <ResultModal result={lastResult} onClose={handleCloseModal} />
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200">
            <span className="text-white font-black text-2xl">T</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">Typen</h1>
        </div>
        <p className="text-slate-500 text-xl max-w-xl font-medium">
          Premium Typing Experience. <br/>
          <span className="text-slate-300 text-sm uppercase tracking-widest font-black">Professional Training Protocol</span>
        </p>
      </header>

      <main className="max-w-4xl mx-auto w-full space-y-24 flex-grow">
        <section>
          <div className="flex items-center gap-6 mb-10">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600">01. Import Content</h2>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>
          <InputSection onUploadSuccess={handleUploadSuccess} />
        </section>

        <section>
          <div className="flex items-center gap-6 mb-10">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">02. Exercise Library</h2>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>
          <HistoryList 
            texts={savedTexts} 
            onSelect={handleSelectFromLibrary} 
            onDelete={handleDeleteText} 
          />
        </section>
      </main>

      <footer className="mt-24 py-12 text-center border-t border-slate-200/50">
        <div className="flex justify-center gap-8 mb-6">
          <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
          <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
          <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
        </div>
        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
          TYPEN PROTOCOL • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default App;
