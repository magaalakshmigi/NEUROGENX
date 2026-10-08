import React, { useState } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Layers,
  LayoutGrid,
  ArrowDownRight,
  TrendingDown,
  Info,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Patient, Simulation, EXACT_DISCLAIMER } from '../types';
import { ChromosomeCountChart } from '../components/charts/ChromosomeCountChart';
import { BeforeAfterRadarBarChart } from '../components/charts/BeforeAfterRadarBarChart';
import { PathwayImpactChart } from '../components/charts/PathwayImpactChart';
import { ConfidenceDistributionChart } from '../components/charts/ConfidenceDistributionChart';

interface ResultsViewProps {
  simulation: Simulation;
  patient: Patient;
  historicalSimulations: Simulation[];
  onSaveSimulation: (sim: Simulation) => void;
  onGenerateDoctorReport: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  simulation,
  patient,
  historicalSimulations,
  onSaveSimulation,
  onGenerateDoctorReport,
}) => {
  const [graphsLayout, setGraphsLayout] = useState<'grid' | 'tabs'>('grid');
  const [activeGraphTab, setActiveGraphTab] = useState<number>(1);
  const [comparisonSimId, setComparisonSimId] = useState<string>('none');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const comparisonSimulation =
    comparisonSimId !== 'none'
      ? historicalSimulations.find((s) => s.id === comparisonSimId) || null
      : null;

  const handleCopyInsights = () => {
    const text = [
      'NEUROGENEX COMPUTATIONAL INSIGHTS (Hypothesis Generation Only):',
      'What Simulation Predicts:',
      ...simulation.insights.whatSimulationPredicts.map((b) => `- ${b}`),
      'Biological Areas Changing:',
      ...simulation.insights.biologicalAreasChanging.map((b) => `- ${b}`),
      'Findings for Further Research:',
      ...simulation.insights.findingsForFurtherResearch.map((b) => `- ${b}`),
      'What Remains Uncertain:',
      ...simulation.insights.whatRemainsUncertain.map((b) => `- ${b}`),
      '\nDisclaimer: ' + EXACT_DISCLAIMER,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSave = () => {
    onSaveSimulation(simulation);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-code mb-1">
            <span className="text-cyan-400 font-bold">{simulation.id}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Patient: {simulation.patientId}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">
              {new Date(simulation.createdAt).toLocaleString()}
            </span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">
            Computational Simulation Results
          </h1>
          <p className="text-xs text-slate-400">
            Hedged predictions from deterministic gene-dosage attenuation model
          </p>
        </div>

        {/* Action Buttons: Save & Generate Doctor Report */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono-code transition-colors"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Saved to History</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Simulation</span>
              </>
            )}
          </button>

          <button
            onClick={onGenerateDoctorReport}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-white font-heading font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>GENERATE DOCTOR REPORT</span>
          </button>
        </div>
      </div>

      {/* Compare Mode Selector Strip */}
      <div className="glass-panel rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-semibold">Compare Mode:</span>
          <select
            value={comparisonSimId}
            onChange={(e) => setComparisonSimId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="none">None (Single Run)</option>
            {historicalSimulations
              .filter((s) => s.id !== simulation.id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  Compare with {s.id} ({s.patientId} · Seed:{s.seed})
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Graphs Layout:</span>
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setGraphsLayout('grid')}
              className={`px-2 py-1 rounded flex items-center gap-1 ${
                graphsLayout === 'grid' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> 2x2 Grid
            </button>
            <button
              onClick={() => setGraphsLayout('tabs')}
              className={`px-2 py-1 rounded flex items-center gap-1 ${
                graphsLayout === 'tabs' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Tabbed
            </button>
          </div>
        </div>
      </div>

      {/* All 7 Result Sections in Structured Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Section 1: Current Genetic State */}
        <div className="glass-panel rounded-xl p-4 border border-fuchsia-500/30 font-mono-code text-xs">
          <span className="text-[10px] uppercase text-fuchsia-400 font-bold block mb-1">
            1. Current Genetic State
          </span>
          <div className="text-white font-bold text-lg">
            {simulation.currentState.chromosomeCount} Chromosomes
          </div>
          <div className="text-fuchsia-300 font-semibold mt-0.5">
            {simulation.currentState.chr21Copies} Copies of Chr 21
          </div>
          <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
            {simulation.currentState.description}
          </p>
        </div>

        {/* Section 2: Simulated State */}
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/30 font-mono-code text-xs">
          <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-1">
            2. Simulated State (Hypothetical)
          </span>
          <div className="text-white font-bold text-lg">
            {simulation.simulatedState.chromosomeCount} Chromosomes
          </div>
          <div className="text-emerald-300 font-semibold mt-0.5">
            {simulation.simulatedState.chr21Copies} Copies of Chr 21
          </div>
          <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
            {simulation.simulatedState.description}
          </p>
        </div>

        {/* Section 3: Predicted Aggregate Shift */}
        <div className="glass-panel rounded-xl p-4 border border-cyan-500/30 font-mono-code text-xs">
          <span className="text-[10px] uppercase text-cyan-400 font-bold block mb-1">
            3. Predicted Biological Impact
          </span>
          <div className="text-white font-bold text-lg flex items-center gap-1.5 text-emerald-400">
            <TrendingDown className="w-5 h-5" />
            <span>{simulation.impactParameters[0]?.percentChange}% Mean Delta</span>
          </div>
          <div className="text-slate-300 font-semibold mt-0.5">
            Gene-dosage burden normalized
          </div>
          <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
            {simulation.impactParameters[0]?.hedgedNote}
          </p>
        </div>

        {/* Section 5: Confidence & Uncertainty */}
        <div className="glass-panel rounded-xl p-4 border border-amber-500/30 font-mono-code text-xs">
          <span className="text-[10px] uppercase text-amber-400 font-bold block mb-1">
            5. Confidence & Uncertainty
          </span>
          <div className="text-white font-bold text-lg text-amber-300">
            {simulation.confidence.overall}% Overall Confidence
          </div>
          <div className="text-slate-300 font-semibold mt-0.5">
            Model Variance: ±{simulation.assumptions.modelUncertainty}%
          </div>
          <p className="text-slate-400 text-[11px] mt-2 leading-relaxed truncate">
            {simulation.confidence.sourcesOfUncertainty[0]}
          </p>
        </div>
      </div>

      {/* ALL FOUR INTERACTIVE GRAPHS */}
      {graphsLayout === 'grid' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChromosomeCountChart
            simulation={simulation}
            comparisonSimulation={comparisonSimulation}
          />
          <BeforeAfterRadarBarChart
            simulation={simulation}
            comparisonSimulation={comparisonSimulation}
          />
          <PathwayImpactChart
            simulation={simulation}
            comparisonSimulation={comparisonSimulation}
          />
          <ConfidenceDistributionChart
            simulation={simulation}
            comparisonSimulation={comparisonSimulation}
          />
        </div>
      ) : (
        /* Tabbed Layout */
        <div className="space-y-4">
          <div className="flex border-b border-slate-800 gap-2 font-mono-code text-xs">
            <button
              onClick={() => setActiveGraphTab(1)}
              className={`px-4 py-2 border-b-2 font-medium ${
                activeGraphTab === 1
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Graph 1: Chromosome Counts
            </button>
            <button
              onClick={() => setActiveGraphTab(2)}
              className={`px-4 py-2 border-b-2 font-medium ${
                activeGraphTab === 2
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Graph 2: Before vs Simulated After
            </button>
            <button
              onClick={() => setActiveGraphTab(3)}
              className={`px-4 py-2 border-b-2 font-medium ${
                activeGraphTab === 3
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Graph 3: Pathway Shifts
            </button>
            <button
              onClick={() => setActiveGraphTab(4)}
              className={`px-4 py-2 border-b-2 font-medium ${
                activeGraphTab === 4
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Graph 4: Confidence & Variance
            </button>
          </div>

          <div>
            {activeGraphTab === 1 && (
              <ChromosomeCountChart
                simulation={simulation}
                comparisonSimulation={comparisonSimulation}
              />
            )}
            {activeGraphTab === 2 && (
              <BeforeAfterRadarBarChart
                simulation={simulation}
                comparisonSimulation={comparisonSimulation}
              />
            )}
            {activeGraphTab === 3 && (
              <PathwayImpactChart
                simulation={simulation}
                comparisonSimulation={comparisonSimulation}
              />
            )}
            {activeGraphTab === 4 && (
              <ConfidenceDistributionChart
                simulation={simulation}
                comparisonSimulation={comparisonSimulation}
              />
            )}
          </div>
        </div>
      )}

      {/* Section 6: Research Insights (Section 4.10) */}
      <div className="glass-panel rounded-xl p-5 border border-cyan-500/20 hud-corner space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
              SECTION 6 · STRUCTURED RESEARCH INSIGHTS
            </span>
            <h3 className="text-base font-heading font-semibold text-white">
              Model-Generated Hypothesis Summaries
            </h3>
          </div>
          <button
            onClick={handleCopyInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 text-xs font-mono-code border border-slate-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Insights'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Sub-panel 1 */}
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-cyan-300 font-mono-code block mb-2">
              What the Simulation Predicts:
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              {simulation.insights.whatSimulationPredicts.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </div>

          {/* Sub-panel 2 */}
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-fuchsia-300 font-mono-code block mb-2">
              Biological Areas Predicted to Change:
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              {simulation.insights.biologicalAreasChanging.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </div>

          {/* Sub-panel 3 */}
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-emerald-300 font-mono-code block mb-2">
              Findings for Further Research:
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              {simulation.insights.findingsForFurtherResearch.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </div>

          {/* Sub-panel 4 */}
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-amber-300 font-mono-code block mb-2">
              What Remains Uncertain:
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              {simulation.insights.whatRemainsUncertain.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic pt-1 font-mono-code">
          Insights are model-generated summaries for hypothesis generation only. Contains NO treatment instructions and NO clinical procedure recommendations.
        </p>
      </div>

      {/* Section 7: Important Limitations (Section 4.11) */}
      <div className="glass-panel rounded-xl p-5 border border-amber-500/30 text-xs">
        <div className="flex items-center gap-2 mb-3 text-amber-400 font-mono-code font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>SECTION 7 · ESSENTIAL METHODOLOGICAL LIMITATIONS</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-sans leading-relaxed">
          {simulation.limitations.map((lim, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-amber-400 font-mono-code">[{idx + 1}]</span>
              <span>{lim}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
