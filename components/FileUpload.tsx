
import React, { useState } from 'react';
import { extractTextFromFile, cleanTypingText } from '../services/geminiService';
import { TypingText } from '../types';

const generateId = () => {
  try {
    return window.crypto.randomUUID();
  } catch (e) {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
};

interface InputSectionProps {
  onUploadSuccess: (text: TypingText) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onUploadSuccess }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const extractedText = await extractTextFromFile(file);
      
      const newText: TypingText = {
        id: generateId(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        content: extractedText,
        createdAt: Date.now(),
      };

      onUploadSuccess(newText);
    } catch (err: any) {
      setError(err.message || "Document analysis failed.");
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handlePasteSubmit = () => {
    const trimmed = pasteContent.trim();
    if (!trimmed) return;
    
    const cleanedContent = cleanTypingText(trimmed);

    if (cleanedContent.length < 5) {
      setError("Text content is too short or unsupported.");
      return;
    }

    const newText: TypingText = {
      id: generateId(),
      title: pasteTitle.trim() || `Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      content: cleanedContent,
      createdAt: Date.now(),
    };

    onUploadSuccess(newText);
    setPasteContent('');
    setPasteTitle('');
    setError(null);
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden transform hover:shadow-xl hover:shadow-slate-200/50 transition-all">
      <div className="flex bg-slate-50/50 border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'upload' ? "bg-white text-blue-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Upload Source
        </button>
        <button 
          onClick={() => setActiveTab('paste')}
          className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'paste' ? "bg-white text-blue-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Manual Entry
        </button>
      </div>

      <div className="p-10">
        {activeTab === 'upload' ? (
          <div className="flex flex-col items-center justify-center p-14 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/30 hover:bg-blue-50/20 hover:border-blue-300 transition-all cursor-pointer relative group">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <div className="flex flex-col items-center gap-6">
              {isUploading ? (
                <div className="flex flex-col items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 border-[5px] border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-slate-900 text-sm font-black uppercase tracking-widest">Processing...</p>
                </div>
              ) : (
                <>
                  <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-900 text-lg font-black tracking-tight">Drop Document</p>
                    <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">PDF or Word Formatting</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <input 
              type="text" 
              placeholder="Exercise Title"
              className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[22px] text-sm font-black focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all placeholder:text-slate-300"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
            />
            <textarea 
              placeholder="Paste text content here..."
              className="w-full h-56 px-8 py-8 bg-slate-50 border border-slate-200 rounded-[32px] text-sm leading-loose focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all resize-none custom-scrollbar font-medium"
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
            />
            <button 
              onClick={handlePasteSubmit}
              disabled={!pasteContent.trim()}
              className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-100 disabled:bg-slate-200 disabled:shadow-none transform active:scale-[0.98]"
            >
              INITIALIZE TRAINING
            </button>
          </div>
        )}

        {error && (
          <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-[24px] flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p className="text-red-600 text-[11px] font-black uppercase tracking-widest mt-1 leading-relaxed">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;
