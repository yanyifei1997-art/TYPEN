
import React, { useState, useEffect } from 'react';
import { TypingText } from '../types';

interface SelectionViewProps {
  text: TypingText;
  onConfirm: (selectedContent: string) => void;
  onCancel: () => void;
}

const SelectionView: React.FC<SelectionViewProps> = ({ text, onConfirm, onCancel }) => {
  const paragraphs = text.content.split('\n').filter(p => p.trim().length > 0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [rangeFrom, setRangeFrom] = useState<string>("");
  const [rangeTo, setRangeTo] = useState<string>("");
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const toggleSelection = (idx: number, isShiftKey: boolean = false) => {
    if (isShiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, idx);
      const end = Math.max(lastSelectedIndex, idx);
      const newIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      setSelectedIndices(prev => {
        const combined = Array.from(new Set([...prev, ...newIndices]));
        return combined;
      });
    } else {
      setSelectedIndices(prev => 
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    }
    setLastSelectedIndex(idx);
  };

  const handleRangeSelect = () => {
    const from = parseInt(rangeFrom);
    const to = parseInt(rangeTo);
    if (isNaN(from) || isNaN(to)) return;

    const start = Math.max(0, Math.min(from - 1, paragraphs.length - 1));
    const end = Math.max(0, Math.min(to - 1, paragraphs.length - 1));
    const actualStart = Math.min(start, end);
    const actualEnd = Math.max(start, end);

    const newIndices = Array.from({ length: actualEnd - actualStart + 1 }, (_, i) => actualStart + i);
    setSelectedIndices(prev => Array.from(new Set([...prev, ...newIndices])));
  };

  const handleSelectAll = () => {
    setSelectedIndices(paragraphs.map((_, i) => i));
  };

  const handleClearAll = () => {
    setSelectedIndices([]);
    setLastSelectedIndex(null);
  };

  const handleConfirm = () => {
    if (selectedIndices.length === 0) return;
    const finalContent = selectedIndices
      .sort((a, b) => a - b)
      .map(idx => paragraphs[idx])
      .join(' ');
    onConfirm(finalContent);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
      <header className="px-10 py-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">Selection Strategy</h2>
            <p className="text-sm text-slate-400 font-medium">Select sections to begin training</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Range Selection Inputs */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Range</span>
            <input 
              type="number" 
              placeholder="From"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <span className="text-slate-300">to</span>
            <input 
              type="number" 
              placeholder="To"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <button 
              onClick={handleRangeSelect}
              className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest"
            >
              Apply
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleSelectAll}
              className="px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest border border-slate-200"
            >
              All
            </button>
            <button 
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest border border-slate-200"
            >
              Reset
            </button>
          </div>

          <button
            onClick={handleConfirm}
            disabled={selectedIndices.length === 0}
            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg ${
              selectedIndices.length > 0 
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 scale-105" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            PRACTICE NOW ({selectedIndices.length})
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
        <div className="max-w-4xl mx-auto pb-20">
          <div className="mb-6 px-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="m12 16 4-4-4-4"/><path d="M8 12h8"/></svg>
               Tip: Use Shift + Click to select multiple paragraphs quickly
             </p>
          </div>
          
          <div className="space-y-4">
            {paragraphs.map((p, idx) => {
              const isSelected = selectedIndices.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={(e) => toggleSelection(idx, e.shiftKey)}
                  className={`relative p-8 rounded-[32px] border-2 transition-all cursor-pointer group select-none ${
                    isSelected
                    ? "bg-white border-blue-600 shadow-xl shadow-blue-900/5 ring-4 ring-blue-50"
                    : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex gap-6 items-start">
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        isSelected ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-200 scale-110" : "bg-white border-slate-200 group-hover:border-blue-300"
                      }`}>
                        {isSelected ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300">{idx + 1}</span>
                        )}
                      </div>
                      <div className={`h-full w-px flex-1 ${isSelected ? "bg-blue-100" : "bg-slate-50"}`}></div>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                         <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? "text-blue-500" : "text-slate-300"}`}>
                           Section {idx + 1}
                         </span>
                         <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                           {p.split(' ').length} Words
                         </span>
                      </div>
                      <p className={`text-xl leading-relaxed tracking-wide transition-colors ${isSelected ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                        {p}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating Tooltip for range selection on Mobile if needed, currently just Desktop */}
    </div>
  );
};

export default SelectionView;
