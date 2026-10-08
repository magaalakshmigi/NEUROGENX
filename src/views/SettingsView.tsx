import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Eye,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AppSettings, EXACT_DISCLAIMER } from '../types';
import { storage } from '../services/storage';
import { soundManager } from '../services/audio';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onViewDisclaimer: () => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onViewDisclaimer,
  onResetDemoData,
}) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'aboutModel'>('preferences');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const toggleClinicalMode = () => {
    const next = !settings.clinicalMode;
    onUpdateSettings({ ...settings, clinicalMode: next });
    if (next) document.body.classList.add('clinical-mode');
    else document.body.classList.remove('clinical-mode');
  };

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    soundManager.setEnabled(next);
    onUpdateSettings({ ...settings, soundEnabled: next });
    if (next) soundManager.playClick();
  };

  const toggleReducedMotion = () => {
    const next = !settings.reducedMotion;
    onUpdateSettings({ ...settings, reducedMotion: next });
    if (next) document.body.classList.add('reduced-motion');
    else document.body.classList.remove('reduced-motion');
  };

  const toggleScanlines = () => {
    onUpdateSettings({ ...settings, scanlines: !settings.scanlines });
  };

  const handleExportBackup = () => {
    const jsonStr = storage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NeuroGeneX_Data_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importAllData(content);
      if (success) {
        setImportStatus('Data backup successfully restored! Refreshing view…');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            SYSTEM CALIBRATION & MATHEMATICAL SPECIFICATION
          </span>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">
            Settings & Model Reference
          </h1>
          <p className="text-xs text-slate-400">
            Configure visual presentation, audio feedback, data backups, and inspect deterministic formulas
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono-code text-xs">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'preferences' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Preferences & Data
          </button>
          <button
            onClick={() => setActiveTab('aboutModel')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'aboutModel' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            About This Model (Formulas)
          </button>
        </div>
      </div>

      {activeTab === 'preferences' ? (
        /* PREFERENCES & DATA TAB */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual & Audio Preferences */}
            <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4 text-xs font-mono-code">
              <h3 className="font-heading font-bold text-sm text-white text-cyan-300 pb-2 border-b border-slate-800">
                Interface Customization
              </h3>

              {/* Clinical Mode */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <div>
                  <span className="text-white font-bold block">Theme: Clinical Mode</span>
                  <span className="text-slate-400 text-[11px] block">
                    High-contrast light surfaces for documentation & printing
                  </span>
                </div>
                <button
                  onClick={toggleClinicalMode}
                  className={`p-2 rounded-lg border ${
                    settings.clinicalMode ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.clinicalMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
              </div>

              {/* Synthesized Audio */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <div>
                  <span className="text-white font-bold block">Synthesized Sound Effects</span>
                  <span className="text-slate-400 text-[11px] block">
                    Soft UI ticks, simulation rising tone, completion chime (Web Audio)
                  </span>
                </div>
                <button
                  onClick={toggleSound}
                  className={`p-2 rounded-lg border ${
                    settings.soundEnabled ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <div>
                  <span className="text-white font-bold block">Reduce Motion Mode</span>
                  <span className="text-slate-400 text-[11px] block">
                    Disables parallax, tilt, and particle drift for accessibility
                  </span>
                </div>
                <button
                  onClick={toggleReducedMotion}
                  className={`px-3 py-1.5 rounded-lg border ${
                    settings.reducedMotion ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.reducedMotion ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Scanline Overlay */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-white font-bold block">Holographic Scanline Texture</span>
                  <span className="text-slate-400 text-[11px] block">
                    Subtle CRT/HUD scanlines over dark command center
                  </span>
                </div>
                <button
                  onClick={toggleScanlines}
                  className={`px-3 py-1.5 rounded-lg border ${
                    settings.scanlines ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.scanlines ? 'Active' : 'Off'}
                </button>
              </div>
            </div>

            {/* Data Management & Backup */}
            <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4 text-xs font-mono-code">
              <h3 className="font-heading font-bold text-sm text-white text-cyan-300 pb-2 border-b border-slate-800">
                Data Persistence & Backups
              </h3>

              <p className="text-slate-400 leading-relaxed font-sans text-xs">
                NeuroGeneX stores records client-side in browser local storage. You can export complete snapshots to JSON or restore existing data archives.
              </p>

              {importStatus && (
                <div className="p-2.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {importStatus}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleExportBackup}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Export JSON Backup</span>
                </button>

                <label className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 cursor-pointer">
                  <Upload className="w-4 h-4 text-violet-400" />
                  <span>Import JSON Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset Demo Data */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 rounded-lg border border-red-800"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Factory Demo Data</span>
                </button>
              </div>

              {/* View Disclaimer Again */}
              <div className="pt-2">
                <button
                  onClick={onViewDisclaimer}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg border border-amber-500/40"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Review Regulatory Disclaimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ABOUT THIS MODEL TAB (Section 5) */
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 space-y-6 text-xs font-mono-code hud-corner">
          <div>
            <h3 className="text-xl font-heading font-bold text-white mb-2">
              NeuroGeneX Computational Gene-Dosage Model Specification
            </h3>
            <p className="text-slate-300 text-xs font-sans leading-relaxed">
              NeuroGeneX employs a transparent, deterministic mathematical simulation based on gene-dosage balance theory. It explores theoretical cellular responses to a hypothetical reduction from triplicated (47, +21) to disomic (46) chromosome states.
            </p>
          </div>

          {/* Mathematical Formulations */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-bold block text-sm">
                1. Effective Trisomic Cellular Fraction (f)
              </span>
              <p className="text-slate-400 font-sans">
                For non-mosaic free trisomy and Robertsonian translocation, <code className="text-white">f = 1.0</code>. For mosaic patients, the fraction is modulated by the mosaicism percentage and slider:
              </p>
              <div className="p-2.5 bg-slate-900 rounded text-cyan-300 font-mono-code">
                f = (mosaicismPercent / 100) × mosaicismEffectScaling
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-bold block text-sm">
                2. Chromosome 21 Gene Dosage Ratio
              </span>
              <p className="text-slate-400 font-sans">
                Current baseline dosage ratio for chromosome 21 loci vs disomic reference:
              </p>
              <div className="p-2.5 bg-slate-900 rounded text-cyan-300 font-mono-code">
                Ratio_current = 1.0 + 0.5 × f &nbsp;&nbsp;(e.g., 1.50 for full Trisomy 21)<br />
                Ratio_simulated = 1.00 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Standard diploid disomy)<br />
                Δ_dosage = Ratio_current − Ratio_simulated = 0.5 × f
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-bold block text-sm">
                3. Pathway Attenuation & Age Modifier Function
              </span>
              <div className="p-2.5 bg-slate-900 rounded text-cyan-300 font-mono-code leading-relaxed">
                Reduction = SensitivityWeight × DosageSlider × Δ_dosage × AgeModifier × 46 + PRNG_noise(±3%)<br />
                After_index = max(20, min(100, round(Before_index − Reduction)))
              </div>
              <p className="text-slate-400 font-sans text-[11px]">
                AgeModifier weights younger cohorts toward neurodevelopmental plasticity loads, and mature adult cohorts toward APP amyloid processing dynamics.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-bold block text-sm">
                4. Deterministic PRNG Algorithm (Mulberry32)
              </span>
              <p className="text-slate-400 font-sans">
                Stochastic variations use Mulberry32 seeded with the patient seed. Identical seeds and parameters yield bitwise identical outcomes:
              </p>
              <div className="p-2.5 bg-slate-900 rounded text-slate-300 font-mono-code text-[11px]">
                let t = a += 0x6D2B79F5; t = Math.imul(t ^ (t &gt;&gt;&gt; 15), t | 1);<br />
                return ((t ^ (t + Math.imul(t ^ (t &gt;&gt;&gt; 7), 61 | t))) &gt;&gt;&gt; 0) / 4294967296;
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-bold block text-sm">
                5. Model Confidence Calculation
              </span>
              <div className="p-2.5 bg-slate-900 rounded text-amber-300 font-mono-code">
                Uncertainty = ModelUncertaintySlider + DataCompletenessPenalty + PathwayExtra<br />
                OverallConfidence = clamp(35%, 85%, 100 − MeanUncertainty)
              </div>
              <p className="text-slate-400 font-sans text-[11px]">
                The app caps confidence between 35% and 85% to explicitly avoid presenting false computational certainty.
              </p>
            </div>
          </div>

          {/* Disclaimer Reminder */}
          <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-sans leading-relaxed">
            <span className="font-bold block mb-1">MANDATORY NOTICE:</span>
            {EXACT_DISCLAIMER}
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel rounded-xl p-6 border border-red-500/60 space-y-4">
            <h3 className="text-lg font-heading font-bold text-white text-red-400">
              Reset Demo Data?
            </h3>
            <p className="text-xs text-slate-300 font-mono-code leading-relaxed">
              This will reset all 5 patients, simulations, and reports back to original initial states. Any custom records created will be replaced.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-mono-code"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-mono-code font-bold"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
