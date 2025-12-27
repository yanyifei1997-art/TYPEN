
import React, { useState } from 'react';
import { extractTextFromFile, cleanTypingText } from '../services/geminiService';
import { TypingText } from '../types';

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
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        content: extractedText,
        createdAt: Date.now(),
      };

      onUploadSuccess(newText);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) return;
    
    // Clean pasted content using the same logic as extracted files
    const cleanedContent = cleanTypingText(pasteContent);

    if (!cleanedContent) {
      setError("The pasted text contains no valid English content for practice.");
      return;
    }

    const newText: TypingText = {
      id: crypto.randomUUID(),
      title: pasteTitle.trim() || `Pasted Text ${new Date().toLocaleTimeString()}`,
      content: cleanedContent,
      createdAt: Date.now(),
    };

    onUploadSuccess(newText);
    setPasteContent('');
    setPasteTitle('');
    setError(null);
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button 
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'upload' ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Upload Document
        </button>
        <button 
          onClick={() => setActiveTab('paste')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'paste' ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Paste Text
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'upload' ? (
          <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/30 hover:bg-blue-50/20 hover:border-blue-300 transition-all cursor-pointer relative group">
            <input
              type="file"
              accept=".pdf,.doc,.docx,text/plain"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <div className="flex flex-col items-center gap-4">
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-600 text-sm font-bold">Refining text with Gemini...</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-900 font-bold">Select File</p>
                    <p className="text-slate-400 text-xs mt-1">PDF, Word (WPS Compatible), or TXT</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Enter a title for this exercise..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
            />
            <textarea 
              placeholder="Paste English content here. Only standard punctuation (. , : ; ! ? ' &quot; ( ) -) will be kept."
              className="w-full h-48 px-6 py-6 bg-slate-50 border border-slate-200 rounded-[24px] text-sm leading-relaxed focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none custom-scrollbar"
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
            />
            <button 
              onClick={handlePasteSubmit}
              disabled={!pasteContent.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:bg-slate-200 disabled:shadow-none"
            >
              CREATE EXERCISE
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-500 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-red-500 text-xs font-bold leading-tight">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;
