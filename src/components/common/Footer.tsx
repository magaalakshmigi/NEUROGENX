import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { EXACT_DISCLAIMER } from '../../types';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md py-4 px-6 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex items-center gap-2 text-cyan-400 font-mono-code text-[11px]">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>DE-IDENTIFIED DATA ONLY · NO PROTECTED HEALTH INFORMATION</span>
        </div>
        <p className="max-w-3xl text-[11px] leading-relaxed text-slate-400 font-sans">
          <strong className="text-slate-300">Regulatory Disclaimer: </strong>
          {EXACT_DISCLAIMER}
        </p>
      </div>
    </footer>
  );
};
