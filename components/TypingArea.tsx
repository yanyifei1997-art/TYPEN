
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TypingText, PracticeResult } from '../types';

interface ErrorLog {
  expected: string;
  actual: string;
  index: number;
}

interface TypingAreaProps {
  practiceText: TypingText;
  onFinish: (result: PracticeResult) => void;
  onExit: () => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({ practiceText, onFinish, onExit }) => {
  const [input, setInput] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  // Sanitize text for display - ensure paragraphs are clean
  const textToType = useMemo(() => {
    return practiceText.content
      .split('\n')
      .map(line => line.trim().replace(/\s+/g, ' '))
      .filter(line => line.length > 0)
      .join('\n');
  }, [practiceText.content]);

  useEffect(() => {
    if (isStarted && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isPaused]);

  useEffect(() => {
    if (!isPaused) {
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(focusTimer);
    }
  }, [isPaused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onExit();
      return;
    }
    if (!isStarted && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      setIsStarted(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPaused) return;
    const val = e.target.value;
    if (val.length <= textToType.length) {
      setInput(val);
      if (val.length === textToType.length) {
        finishPractice(val);
      }
    }
  };

  const finishPractice = (finalInput: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsStarted(false);
    
    const duration = elapsedTime;
    let correctChars = 0;
    for (let i = 0; i < finalInput.length; i++) {
      if (finalInput[i] === textToType[i]) correctChars++;
    }
    const accuracy = textToType.length > 0 ? (correctChars / textToType.length) * 100 : 100;
    const wpm = duration > 0 ? (correctChars / 5) / (duration / 60) : 0;

    onFinish({
      id: crypto.randomUUID(),
      textId: practiceText.id,
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy),
      duration: Math.round(duration),
      timestamp: Date.now(),
    });
  };

  const stats = useMemo(() => {
    let correctCount = 0;
    for(let i=0; i < input.length; i++) {
      if (input[i] === textToType[i]) correctCount++;
    }
    const accuracy = input.length > 0 ? (correctCount / input.length) * 100 : 100;
    const wpm = elapsedTime > 0 ? (correctCount / 5) / (elapsedTime / 60) : 0;
    return {
      accuracy: Math.round(accuracy),
      wpm: Math.round(wpm),
      correctChars: correctCount
    };
  }, [input, textToType, elapsedTime]);

  const renderContent = () => {
    let charIndexCounter = 0;

    return textToType.split('\n').map((paragraph, pIdx) => (
      <div key={pIdx} className="mb-12 flex flex-wrap items-baseline content-start text-justify">
        {paragraph.split(/(?=\s)|(?<=\s)/g).map((wordOrSpace, wIdx) => (
          <span key={`${pIdx}-${wIdx}`} className="inline-block whitespace-nowrap">
            {wordOrSpace.split('').map((char) => {
              const globalIndex = charIndexCounter++;
              let colorClass = "text-slate-300";
              let decoration = "";
              let displayText = char;
              let hint = null;

              if (globalIndex < input.length) {
                if (input[globalIndex] === char) {
                  colorClass = "text-slate-900 font-medium";
                } else {
                  colorClass = "text-red-500 bg-red-50 ring-1 ring-red-200 rounded-[2px]";
                  displayText = input[globalIndex] === ' ' ? '␣' : input[globalIndex];
                  hint = (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[11px] font-black text-white bg-blue-600 px-2 py-1 rounded-lg shadow-lg z-50 whitespace-nowrap transition-all scale-100 animate-in fade-in zoom-in duration-200">
                      {char === ' ' ? 'Space' : char}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-blue-600"></span>
                    </span>
                  );
                }
              }

              if (globalIndex === input.length && !isPaused) {
                decoration = "border-b-2 border-blue-600 animate-pulse";
              }

              return (
                <span 
                  key={globalIndex} 
                  className={`relative inline-block ${colorClass} ${decoration} transition-all duration-75 min-w-[0.6em] text-center`}
                >
                  {hint}
                  {displayText}
                </span>
              );
            })}
          </span>
        ))}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <header className="flex items-center justify-between px-10 py-5 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <span className="text-white font-black text-lg">T</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight max-w-[300px] truncate">{practiceText.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            disabled={!isStarted}
            className={`px-8 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
              isPaused 
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100" 
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button 
            onClick={onExit}
            className="px-8 py-2.5 rounded-2xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all border border-red-100"
          >
            Stop
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main 
          className="flex-1 overflow-y-auto p-12 custom-scrollbar relative bg-slate-50/30"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="max-w-4xl mx-auto pt-10 pb-32">
            <div className="bg-white p-12 md:p-20 rounded-[48px] shadow-sm border border-slate-200 min-h-[500px] relative overflow-hidden">
              <div className="text-3xl md:text-4xl leading-[4.5rem] md:leading-[5.5rem] mono whitespace-pre-wrap select-none tracking-widest text-slate-300">
                {renderContent()}
              </div>

              {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[48px] backdrop-blur-md z-40 animate-in fade-in duration-300">
                  <div className="text-center bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100">
                    <p className="text-3xl font-black text-slate-900 mb-8">Practice Paused</p>
                    <button 
                      onClick={() => setIsPaused(false)}
                      className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                    >
                      RESUME
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={inputRef}
                type="text"
                className="absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </div>
        </main>

        <aside className="w-80 bg-white border-l border-slate-100 flex flex-col p-10 overflow-y-auto custom-scrollbar shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-10">
             <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Stats</h3>
          </div>
          
          <div className="space-y-10">
            <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-100/50 flex flex-col items-center">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">WPM</p>
              <p className="text-6xl font-black mono text-blue-600 tracking-tighter">{stats.wpm}</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Accuracy</p>
              <p className="text-5xl font-black mono text-slate-900 tracking-tighter">{stats.accuracy}<span className="text-xl">%</span></p>
            </div>

            <div className="pt-6 space-y-5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Timer</span>
                <span className="text-slate-900 mono text-lg">
                   {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Errors</span>
                <span className="text-red-500 mono text-lg">{input.length - stats.correctChars}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TypingArea;
