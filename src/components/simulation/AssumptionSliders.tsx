import React from 'react';
import { HelpCircle, RotateCcw, Shuffle } from 'lucide-react';
import { SimulationAssumptions, Patient } from '../../types';

interface AssumptionSlidersProps {
  patient: Patient;
  assumptions: SimulationAssumptions;
  onChange: (updated: SimulationAssumptions) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const AssumptionSliders: React.FC<AssumptionSlidersProps> = ({
  patient,
  assumptions,
  onChange,
  onReset,
  disabled = false,
}) => {
  const isMosaic = patient.trisomyType === 'Mosaic';

  const handleSliderChange = (key: keyof SimulationAssumptions, value: number) => {
    onChange({
      ...assumptions,
      [key]: value,
    });
  };

  const handleRandomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 9000) + 1000;
    handleSliderChange('randomSeed', newSeed);
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-cyan-500/20 hud-corner space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            MODEL PARAMETERS
          </span>
          <h3 className="text-base font-heading font-semibold text-white">
            Assumption Controls
          </h3>
        </div>
        <button
          onClick={onReset}
          disabled={disabled}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 font-mono-code transition-colors disabled:opacity-40"
          title="Reset to default assumption values"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Slider 1: Gene-dosage sensitivity weight */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 text-slate-300 font-medium group cursor-help">
            <span>Gene-Dosage Sensitivity Weight</span>
            <span
              className="text-slate-400 group-hover:text-cyan-300 transition-colors"
              title="Scales the magnitude of downstream pathway attenuation per unit change in chromosome 21 gene dosage (0.5 to 1.5)."
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </label>
          <span className="font-mono-code font-bold text-cyan-300">
            {assumptions.geneDosageSensitivity.toFixed(2)}x
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={assumptions.geneDosageSensitivity}
          disabled={disabled}
          onChange={(e) => handleSliderChange('geneDosageSensitivity', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono-code">
          <span>0.50 (Attenuated)</span>
          <span>1.0 (Standard)</span>
          <span>1.50 (Maximized)</span>
        </div>
      </div>

      {/* Slider 2: Model Uncertainty */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 text-slate-300 font-medium group cursor-help">
            <span>Model Uncertainty Variance</span>
            <span
              className="text-slate-400 group-hover:text-cyan-300 transition-colors"
              title="Sets the base confidence band width and stochastic variability bound (±5% to ±40%)."
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </label>
          <span className="font-mono-code font-bold text-amber-300">
            ±{assumptions.modelUncertainty}%
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="40"
          step="1"
          value={assumptions.modelUncertainty}
          disabled={disabled}
          onChange={(e) => handleSliderChange('modelUncertainty', parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono-code">
          <span>±5% (Narrow)</span>
          <span>±15% (Default)</span>
          <span>±40% (Broad)</span>
        </div>
      </div>

      {/* Slider 3: Age Modifier Strength */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 text-slate-300 font-medium group cursor-help">
            <span>Age Modifier Strength</span>
            <span
              className="text-slate-400 group-hover:text-cyan-300 transition-colors"
              title="Controls the weight of chronological age weighting on amyloid kinetics vs neurodevelopmental pathways (0 to 1.0)."
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </label>
          <span className="font-mono-code font-bold text-fuchsia-300">
            {assumptions.ageModifierStrength.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={assumptions.ageModifierStrength}
          disabled={disabled}
          onChange={(e) => handleSliderChange('ageModifierStrength', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-400 disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono-code">
          <span>0.0 (Unadjusted)</span>
          <span>0.5 (Standard)</span>
          <span>1.0 (Full Age Weight)</span>
        </div>
      </div>

      {/* Slider 4: Mosaicism Effect Scaling (enabled only when mosaic) */}
      <div className={`space-y-1.5 ${!isMosaic ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 text-slate-300 font-medium group cursor-help">
            <span>Mosaicism Effect Scaling</span>
            <span
              className="text-slate-400 group-hover:text-cyan-300 transition-colors"
              title="Scales the influence of the reported trisomic cell fraction (~35%) on modeled dosage burden."
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </label>
          <span className="font-mono-code font-bold text-emerald-300">
            {isMosaic ? `${(assumptions.mosaicismEffectScaling * 100).toFixed(0)}%` : 'N/A (Non-mosaic)'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={assumptions.mosaicismEffectScaling}
          disabled={disabled || !isMosaic}
          onChange={(e) => handleSliderChange('mosaicismEffectScaling', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono-code">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Seed Input for Reproducibility */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1">
          <label className="text-slate-300 font-medium">Deterministic PRNG Seed</label>
          <button
            onClick={handleRandomizeSeed}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono-code disabled:opacity-40"
          >
            <Shuffle className="w-3 h-3" /> Randomize
          </button>
        </div>
        <input
          type="number"
          value={assumptions.randomSeed}
          disabled={disabled}
          onChange={(e) => handleSliderChange('randomSeed', parseInt(e.target.value, 10) || 1)}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono-code focus:outline-none focus:border-cyan-400"
        />
        <span className="text-[10px] text-slate-400 mt-1 block">
          Mulberry32 PRNG ensures identical computational results for any given seed.
        </span>
      </div>
    </div>
  );
};
