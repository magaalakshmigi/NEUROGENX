import React, { useState } from 'react';
import { Dna, Play, ArrowRight, BookOpen, ExternalLink, Info } from 'lucide-react';
import { Patient } from '../types';
import { ThreeKaryotype, KaryotypeMode } from '../components/karyotype/ThreeKaryotype';
import { Chr21Ideogram, PlainLanguageExplainer } from '../components/karyotype/Chr21Ideogram';

interface GeneticAnalysisViewProps {
  patient: Patient;
  onRunSimulation: () => void;
}

export const GeneticAnalysisView: React.FC<GeneticAnalysisViewProps> = ({
  patient,
  onRunSimulation,
}) => {
  const [karyotypeMode, setKaryotypeMode] = useState<KaryotypeMode>('trisomy');

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            CYTOGENETIC VISUALIZATION ENGINE
          </span>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">
            Genetic & Karyotype Analysis: {patient.id}
          </h1>
          <p className="text-xs text-slate-400">
            Interactive 3D chromosome architecture, banded ideograms, and reference comparisons
          </p>
        </div>

        <button
          onClick={onRunSimulation}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-heading font-semibold text-xs tracking-wider shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>Launch "What-If" Simulation</span>
        </button>
      </div>

      {/* Summary Numeric Tiles Panel */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Tile 1 */}
        <div className="glass-panel rounded-xl p-3.5 border border-cyan-500/20 text-center">
          <span className="text-[10px] text-slate-400 font-mono-code uppercase block mb-1">
            Typical Chromosomes
          </span>
          <span className="text-2xl font-heading font-bold text-cyan-300 font-mono-code">
            46
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">23 homologous pairs</span>
        </div>

        {/* Tile 2 */}
        <div className="glass-panel rounded-xl p-3.5 border border-fuchsia-500/30 text-center">
          <span className="text-[10px] text-slate-400 font-mono-code uppercase block mb-1">
            Trisomy 21 Scenario
          </span>
          <span className="text-2xl font-heading font-bold text-fuchsia-300 font-mono-code">
            47
          </span>
          <span className="text-[9px] text-fuchsia-400 block mt-0.5">+1 extra chromosome</span>
        </div>

        {/* Tile 3 */}
        <div className="glass-panel rounded-xl p-3.5 border border-cyan-500/20 text-center">
          <span className="text-[10px] text-slate-400 font-mono-code uppercase block mb-1">
            Chr 21 Typical Copies
          </span>
          <span className="text-2xl font-heading font-bold text-cyan-300 font-mono-code">
            2
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Diploid disomy</span>
        </div>

        {/* Tile 4 */}
        <div className="glass-panel rounded-xl p-3.5 border border-fuchsia-500/30 text-center">
          <span className="text-[10px] text-slate-400 font-mono-code uppercase block mb-1">
            Chr 21 Trisomy Copies
          </span>
          <span className="text-2xl font-heading font-bold text-fuchsia-300 font-mono-code">
            3
          </span>
          <span className="text-[9px] text-fuchsia-400 block mt-0.5">Triplicated gene dosage</span>
        </div>

        {/* Tile 5 */}
        <div className="glass-panel rounded-xl p-3.5 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-mono-code uppercase block mb-1">
            Subtype
          </span>
          <span className="text-xs font-heading font-bold text-white block mt-1 truncate px-1">
            {patient.trisomyType}
          </span>
          <span className="text-[9px] text-slate-400 block mt-1">Clinician-entered</span>
        </div>

        {/* Tile 6 */}
        <div className="glass-panel rounded-xl p-3.5 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-mono-code uppercase block mb-1">
            Karyotype Notation
          </span>
          <span className="text-xs font-mono-code font-bold text-amber-300 block mt-1 truncate px-1">
            {patient.karyotypeNotation}
          </span>
          <span className="text-[9px] text-slate-400 block mt-1">Cytogenetic formula</span>
        </div>
      </div>

      {/* 3D Visual Karyotype Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono-code">
          <span className="text-slate-300 font-semibold">
            Interactive 3D Cytogenetic Karyotype Layout (Groups A through G + Sex Chromosomes)
          </span>
          <span className="text-cyan-400">
            Hover over chromosomes for locus details · Drag to orbit
          </span>
        </div>

        <ThreeKaryotype
          mode={karyotypeMode}
          onModeChange={(m) => setKaryotypeMode(m)}
          highlightChr21={true}
          className="h-[500px]"
        />
      </div>

      {/* Chromosome 21 Ideogram */}
      <Chr21Ideogram />

      {/* Plain Language Explainer */}
      <PlainLanguageExplainer />

      {/* Bottom CTA to launch simulation */}
      <div className="glass-panel rounded-xl p-6 border border-cyan-500/20 hud-corner flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-heading font-bold text-white mb-1">
            Ready to explore computational gene-dosage models?
          </h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Configure the 47→46 chromosome simulation for patient {patient.id}. Explore how modeled expression attenuation distributes across neurodevelopmental, synaptic, and metabolic pathways.
          </p>
        </div>
        <button
          onClick={onRunSimulation}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-heading font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap cursor-pointer"
        >
          Proceed to Simulation Stage →
        </button>
      </div>
    </div>
  );
};
