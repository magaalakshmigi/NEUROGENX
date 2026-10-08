import React, { useState, useEffect } from 'react';
import { FastForward, CheckCircle2 } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  'Initializing genomic engine…',
  'Loading reference karyotype (46)…',
  'Calibrating gene-dosage model…',
  'Securing de-identified data layer…',
  'Systems online.',
];

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLineIndex((prev) => {
        if (prev < BOOT_LINES.length - 1) {
          const next = prev + 1;
          setProgress(Math.round(((next + 1) / BOOT_LINES.length) * 100));
          return next;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prev;
        }
      });
    }, 850);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#04060F] flex flex-col items-center justify-center p-6 text-white font-mono-code select-none">
      {/* Skip Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-700 text-xs transition-colors"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip</span>
        </button>
      </div>

      {/* Holographic Glowing SVG Logo Drawing */}
      <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
        {/* Animated Circular Ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#0B1226"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="4"
            strokeDasharray={276}
            strokeDashoffset={276 - (276 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out shadow-[0_0_15px_#22d3ee]"
          />
        </svg>

        {/* Center Stylized Chromosome 21 Glyph */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-8 h-14 relative flex items-center justify-center">
            {/* Double Chromatid arms */}
            <div className="w-2.5 h-12 rounded-full bg-gradient-to-b from-fuchsia-400 via-violet-500 to-cyan-400 animate-pulse shadow-[0_0_12px_#e879f9]" />
            <div className="w-2.5 h-12 rounded-full bg-gradient-to-b from-fuchsia-400 via-violet-500 to-cyan-400 animate-pulse shadow-[0_0_12px_#e879f9] -ml-0.5" />
            {/* Centromere glow */}
            <div className="absolute w-6 h-1 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-heading font-bold text-white tracking-widest mb-1 text-center">
        NEUROGENEX
      </h1>
      <span className="text-xs text-cyan-400 tracking-wider uppercase mb-8 text-center">
        Computational Genomic Architecture v1.0
      </span>

      {/* Terminal Status Output */}
      <div className="w-full max-w-md bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2 shadow-2xl">
        {BOOT_LINES.slice(0, currentLineIndex + 1).map((line, idx) => (
          <div key={idx} className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{line}</span>
          </div>
        ))}
      </div>

      {/* Progress percentage */}
      <div className="mt-6 text-xs text-slate-400 font-mono-code">
        Calibrating: <span className="text-cyan-400 font-bold">{progress}%</span>
      </div>
    </div>
  );
};
