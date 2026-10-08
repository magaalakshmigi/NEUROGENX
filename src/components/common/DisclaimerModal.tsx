import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, Check } from 'lucide-react';
import { EXACT_DISCLAIMER } from '../../types';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  canDismiss?: boolean;
  onDismiss?: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onAccept,
  canDismiss = false,
  onDismiss,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/40 shadow-2xl hud-corner">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white tracking-wide">
              Mandatory Research Protocol Acknowledgement
            </h2>
            <span className="text-xs font-mono-code text-cyan-400">
              CLINICAL INVESTIGATOR PROTOCOL COMPLIANCE
            </span>
          </div>
        </div>

        {/* Exact Disclaimer Box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/50 text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
          <p className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            REGULATORY NOTICE:
          </p>
          <p className="text-slate-200">
            {EXACT_DISCLAIMER}
          </p>
        </div>

        {/* Core Principles reminder */}
        <div className="space-y-2 mb-6 text-xs text-slate-300 font-mono-code">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>This is a computational what-if simulation; it does NOT alter DNA.</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Only de-identified data (IDs) may be recorded; never patient names.</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Trisomy 21 status is clinician-entered; never an automated diagnosis.</span>
          </div>
        </div>

        {/* Mandatory Checkbox */}
        <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-700/80 cursor-pointer hover:border-cyan-500/50 transition-colors mb-6 select-none">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.value === 'true' || e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400"
          />
          <span className="text-xs text-slate-200 font-medium">
            I understand this is a hypothetical research prototype.
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {canDismiss && onDismiss && (
            <button
              onClick={onDismiss}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-code transition-colors"
            >
              Close
            </button>
          )}

          <button
            onClick={onAccept}
            disabled={!isChecked}
            className={`px-6 py-3 rounded-xl font-heading font-semibold text-xs tracking-wider uppercase transition-all shadow-lg ${
              isChecked
                ? 'bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-cyan-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            Enter NeuroGeneX
          </button>
        </div>
      </div>
    </div>
  );
};
