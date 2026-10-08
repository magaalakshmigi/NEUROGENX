import React from 'react';
import { Patient, Simulation, SimulationAssumptions } from '../types';
import { AssumptionSliders } from '../components/simulation/AssumptionSliders';
import { SimulationStage } from '../components/simulation/SimulationStage';
import { Dna, UserCheck } from 'lucide-react';

interface SimulationViewProps {
  patient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  assumptions: SimulationAssumptions;
  onUpdateAssumptions: (updated: SimulationAssumptions) => void;
  onResetAssumptions: () => void;
  onSimulationComplete: (sim: Simulation) => void;
  onViewResults: () => void;
  latestSimulation: Simulation | null;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  patient,
  patients,
  onSelectPatient,
  assumptions,
  onUpdateAssumptions,
  onResetAssumptions,
  onSimulationComplete,
  onViewResults,
  latestSimulation,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            COMPUTATIONAL "WHAT-IF" SIMULATION STAGE
          </span>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">
            Gene-Dosage Attenuation Engine
          </h1>
          <p className="text-xs text-slate-400">
            Explore hypothetical disomic normalization (47 → 46 chromosomes; 3 → 2 copies of chr21)
          </p>
        </div>

        {/* Selected Patient Chip & Quick Switcher */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono-code">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Active Patient:</span>
          <select
            value={patient.id}
            onChange={(e) => {
              const found = patients.find((p) => p.id === e.target.value);
              if (found) onSelectPatient(found);
            }}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold focus:outline-none focus:border-cyan-400"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.trisomyType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Scenario Configurations + Simulation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Col 1-4): Scenario Definition & Assumption Sliders */}
        <div className="lg:col-span-4 space-y-4">
          {/* Current vs Simulated Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Current Scenario Card */}
            <div className="glass-panel rounded-xl p-4 border border-fuchsia-500/30 font-mono-code text-xs">
              <span className="text-[10px] uppercase text-fuchsia-400 font-bold block mb-1">
                CURRENT SCENARIO (CLINICIAN-ENTERED)
              </span>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm font-bold">47 Chromosomes</span>
                <span className="px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-700 text-[10px]">
                  3 Copies Chr 21
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
                Dosage Ratio: {(1 + 0.5 * (patient.trisomyType === 'Mosaic' ? (patient.mosaicismPercent ?? 35) / 100 : 1.0)).toFixed(2)}x · Triplicated loci expression baseline.
              </p>
            </div>

            {/* Simulated Scenario Card */}
            <div className="glass-panel rounded-xl p-4 border border-emerald-500/30 font-mono-code text-xs">
              <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-1">
                SIMULATED SCENARIO (HYPOTHETICAL WHAT-IF)
              </span>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm font-bold">46 Chromosomes</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-200 border border-emerald-700 text-[10px]">
                  2 Copies Chr 21
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
                Dosage Ratio: 1.00x · Normalized disomic copy stoichiometry.
              </p>
            </div>
          </div>

          {/* Assumption Sliders */}
          <AssumptionSliders
            patient={patient}
            assumptions={assumptions}
            onChange={onUpdateAssumptions}
            onReset={onResetAssumptions}
          />
        </div>

        {/* Center / Right Column (Col 5-12): Simulation Stage & Runner */}
        <div className="lg:col-span-8">
          <SimulationStage
            patient={patient}
            assumptions={assumptions}
            onSimulationComplete={onSimulationComplete}
            onViewResults={onViewResults}
            latestSimulation={latestSimulation}
          />
        </div>
      </div>
    </div>
  );
};
