
import React from 'react';
import { TypingText } from '../types';

interface HistoryListProps {
  texts: TypingText[];
  onSelect: (text: TypingText) => void;
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ texts, onSelect, onDelete }) => {
  if (texts.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px]">
        <div className="inline-flex p-4 bg-slate-50 rounded-2xl mb-4">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
        </div>
        <p className="text-slate-500 font-medium">Your library is empty. Start by uploading a text.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {texts.map((text) => (
        <div 
          key={text.id}
          className="group relative bg-white rounded-[28px] border border-slate-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-900/5"
        >
          <div 
            className="p-8 cursor-pointer h-full flex flex-col"
            onClick={() => onSelect(text)}
          >
            <h3 className="text-slate-900 font-black mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">{text.title}</h3>
            <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-grow">
              {text.content}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {new Date(text.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase">
                  {text.content.split(/\s+/).length} Words
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(text.id);
            }}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
