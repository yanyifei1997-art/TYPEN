
import React from 'react';
import { PracticeResult } from '../types';

interface ResultModalProps {
  result: PracticeResult;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[40px] p-10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        
        <h2 className="text-3xl font-black text-slate-900 text-center mb-10 tracking-tight">Practice Summary</h2>
        
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-50 p-6 rounded-[28px] flex flex-col items-center border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Speed</span>
            <div className="flex items-baseline">
              <span className="text-5xl font-black mono text-blue-600">{result.wpm}</span>
              <span className="text-xs font-bold text-slate-400 ml-1 uppercase">WPM</span>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-[28px] flex flex-col items-center border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Accuracy</span>
            <div className="flex items-baseline">
              <span className="text-5xl font-black mono text-blue-600">{result.accuracy}</span>
              <span className="text-xs font-bold text-slate-400 ml-1 uppercase">%</span>
            </div>
          </div>
          
          <div className="bg-blue-600 p-6 rounded-[28px] flex flex-col items-center col-span-2 shadow-lg shadow-blue-200">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Total Duration</span>
            <div className="flex items-baseline">
              <span className="text-3xl font-black mono text-white">
                {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-blue-200 ml-2 uppercase">Minutes</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg hover:bg-slate-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-200"
        >
          BACK TO LIBRARY
        </button>
      </div>
    </div>
  );
};

export default ResultModal;
