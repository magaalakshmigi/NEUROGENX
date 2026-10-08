import React, { useState, useEffect, useRef } from 'react';
import { Play, FastForward, CheckCircle2, AlertTriangle, Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { ThreeKaryotype } from '../karyotype/ThreeKaryotype';
import { soundManager } from '../../services/audio';
import { Patient, Simulation, SimulationAssumptions, EXACT_DISCLAIMER, WHAT_IF_BANNER_TEXT } from '../../types';

interface SimulationStageProps {
  patient: Patient;
  assumptions: SimulationAssumptions;
  onSimulationComplete: (sim: Simulation) => void;
  onViewResults: () => void;
  latestSimulation: Simulation | null;
}

export const SimulationStage: React.FC<SimulationStageProps> = ({
  patient,
  assumptions,
  onSimulationComplete,
  onViewResults,
  latestSimulation,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState<number>(0); // 0: Idle, 1: Scanning, 2: Targeting chr21, 3: Modeling pathways, 4: Particle dissolve, 5: Settled
  const [progressPct, setProgressPct] = useState<number>(0);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [displayChrCount, setDisplayChrCount] = useState<number>(47);
  const [displayChr21Count, setDisplayChr21Count] = useState<number>(3);
  const [glitchActive, setGlitchActive] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [completedSim, setCompletedSim] = useState<Simulation | null>(latestSimulation);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const runSimulationSequence = () => {
    clearAllTimers();
    setIsRunning(true);
    setStep(1);
    setProgressPct(5);
    setDisplayChrCount(47);
    setDisplayChr21Count(3);
    setGlitchActive(false);
    setShowShockwave(false);
    setStatusLog(['[INIT] Genomic coordinate frame calibrated.', '[SCAN] Initiating karyotype laser sweep...']);

    // Play rising tone via sound synthesizer
    soundManager.playRisingTone(8);

    // Timeline of sequence:
    // T = 1.5s -> Step 2: Target Chromosome 21
    const t1 = setTimeout(() => {
      setStep(2);
      setProgressPct(25);
      setStatusLog((prev) => [
        ...prev,
        '[TARGET] Chromosome 21 localized: 3 copies detected.',
        '[TARGET] Isolating third copy: computational what-if flag enabled.',
      ]);
    }, 1800);

    // T = 3.8s -> Step 3: Modeling pathways & gene-dosage attenuation
    const t2 = setTimeout(() => {
      setStep(3);
      setProgressPct(55);
      setStatusLog((prev) => [
        ...prev,
        `[CALC] Modeling gene-dosage effects (Sensitivity: ${assumptions.geneDosageSensitivity.toFixed(2)}x)...`,
        '[CALC] Estimating neurodevelopmental and synaptic pathway shifts...',
        `[CALC] Computing uncertainty bounds (±${assumptions.modelUncertainty}%)...`,
      ]);
    }, 3800);

    // T = 6.2s -> Step 4: Particle dissolution, glitch & shockwave, counter drop 47->46, 3->2
    const t3 = setTimeout(() => {
      setStep(4);
      setProgressPct(85);
      setGlitchActive(true);
      setShowShockwave(true);
      setStatusLog((prev) => [
        ...prev,
        '[SIM] Dissolving third chromosome copy into particle cloud...',
        '[SIM] Normalizing karyotype: 47 → 46 chromosomes (2 copies of chr21)...',
      ]);

      // Count down transition
      setTimeout(() => {
        setDisplayChrCount(46);
        setDisplayChr21Count(2);
      }, 400);

      setTimeout(() => {
        setGlitchActive(false);
      }, 700);
    }, 6200);

    // T = 8.5s -> Step 5: Completed
    const t4 = setTimeout(() => {
      finishSimulation();
    }, 8500);

    timersRef.current = [t1, t2, t3, t4];
  };

  const skipSequence = () => {
    clearAllTimers();
    finishSimulation();
  };

  const finishSimulation = () => {
    setIsRunning(false);
    setStep(5);
    setProgressPct(100);
    setDisplayChrCount(46);
    setDisplayChr21Count(2);
    setGlitchActive(false);
    setShowShockwave(false);

    soundManager.playCompletionChime();

    // Import and run simulation calculation
    import('../../services/simulationEngine').then(({ runGeneDosageSimulation }) => {
      const simId = `NGX-S-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const sim = runGeneDosageSimulation(patient, assumptions, simId);
      setCompletedSim(sim);
      onSimulationComplete(sim);
    });

    setStatusLog((prev) => [
      ...prev,
      '[COMPLETE] Deterministic simulation finished.',
      '[STATUS] Model state settled: 46 chromosomes, disomic state.',
    ]);
  };

  return (
    <div className="space-y-4">
      {/* PERSISTENT TOP BANNER - RULE 8 */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-amber-950/70 border border-amber-500/50 shadow-lg flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
        <div className="text-xs">
          <p className="font-bold text-amber-200 tracking-wide">
            {WHAT_IF_BANNER_TEXT}
          </p>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Trisomy 21 status: Clinician-entered data · De-identified record
          </p>
        </div>
      </div>

      {/* Main 3D Stage with HUD */}
      <div className="relative rounded-2xl overflow-hidden glass-panel border border-cyan-500/30">
        {/* Holographic Scanline Overlay during Step 1 */}
        {isRunning && step >= 1 && step < 4 && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse absolute top-0 animate-bounce" />
          </div>
        )}

        {/* Shockwave circle during Step 4 */}
        {showShockwave && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
          </div>
        )}

        {/* Top Floating Telemetry Strip */}
        <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Chromosome Count Counter HUD */}
            <div
              className={`px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border font-mono-code text-xs transition-all ${
                glitchActive
                  ? 'border-red-500 bg-red-950/80 scale-105'
                  : displayChrCount === 46
                  ? 'border-emerald-500 text-emerald-300'
                  : 'border-fuchsia-500 text-fuchsia-300'
              }`}
            >
              <span className="text-slate-400 text-[10px] block uppercase">Chr Total</span>
              <span className="text-lg font-bold font-heading">{displayChrCount}</span>
            </div>

            {/* Chromosome 21 Copies HUD */}
            <div
              className={`px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border font-mono-code text-xs transition-all ${
                displayChr21Count === 2
                  ? 'border-emerald-500 text-emerald-300'
                  : 'border-fuchsia-500 text-fuchsia-300'
              }`}
            >
              <span className="text-slate-400 text-[10px] block uppercase">Chr 21 Copies</span>
              <span className="text-lg font-bold font-heading">{displayChr21Count}</span>
            </div>
          </div>

          {/* Skip animation button (visible during running) */}
          {isRunning && (
            <button
              onClick={skipSequence}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/50 text-xs font-mono-code shadow-md transition-all"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip Animation</span>
            </button>
          )}
        </div>

        {/* 3D Karyotype Canvas */}
        <ThreeKaryotype
          mode={step >= 4 ? 'typical' : 'trisomy'}
          isSimulating={isRunning}
          simulationStep={step}
          showThirdCopyDissolve={step >= 4}
          className="h-[480px]"
        />

        {/* Live HUD Progress Bar & Terminal Output Panel (Bottom right) */}
        {isRunning && (
          <div className="absolute bottom-4 right-4 z-20 w-80 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-cyan-500/40 text-xs font-mono-code shadow-2xl">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 animate-spin" /> GENOMIC ENGINE RUNNING
              </span>
              <span className="text-cyan-300 font-bold">{progressPct}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {/* Terminal log lines */}
            <div className="space-y-0.5 text-[11px] text-slate-300 max-h-24 overflow-y-auto">
              {statusLog.slice(-4).map((line, idx) => (
                <div key={idx} className="truncate">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Giant Hero Action Button ("RUN SIMULATION") */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-400 font-mono-code">
          <span className="text-slate-300 font-semibold">Active Assumptions:</span> Sensitivity {assumptions.geneDosageSensitivity}x · Uncertainty ±{assumptions.modelUncertainty}% · Age Strength {assumptions.ageModifierStrength} · Seed #{assumptions.randomSeed}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {completedSim && (
            <button
              onClick={onViewResults}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-heading font-semibold text-sm border border-cyan-500/40 transition-all shadow-md"
            >
              <span>View Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={runSimulationSequence}
            disabled={isRunning}
            className={`flex-1 sm:flex-initial relative flex items-center justify-center gap-3 px-8 min-h-[64px] rounded-xl font-heading font-bold text-base text-white tracking-wider uppercase transition-all shadow-xl disabled:opacity-50 cursor-pointer ${
              isRunning
                ? 'bg-slate-800 border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-500 hover:to-fuchsia-400 border-2 border-cyan-300 shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Play className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'SIMULATION IN PROGRESS…' : 'RUN SIMULATION'}</span>
          </button>
        </div>
      </div>

      {/* Post-Run Summary Strip */}
      {completedSim && !isRunning && (
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">Simulation Settled ({completedSim.id})</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>Model: v1.0 Deterministic</span>
            <span>Seed: {completedSim.seed}</span>
            <span>Confidence: {completedSim.confidence.overall}%</span>
            <span>Dosage Delta: -33.3%</span>
          </div>
        </div>
      )}

      {/* Exact Disclaimer word-for-word in bottom banner */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
        <span className="font-semibold text-slate-300">Disclaimer: </span>
        {EXACT_DISCLAIMER}
      </div>
    </div>
  );
};
