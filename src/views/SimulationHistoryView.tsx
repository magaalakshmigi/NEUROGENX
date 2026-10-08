import React, { useState } from 'react';
import {
  History,
  Search,
  Sliders,
  Calendar,
  Trash2,
  Eye,
  Plus,
  MessageSquare,
  CheckSquare,
  Square,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Simulation, SimulationNote } from '../types';

interface SimulationHistoryViewProps {
  simulations: Simulation[];
  onOpenSimulation: (sim: Simulation) => void;
  onDeleteSimulation: (id: string) => void;
  onSaveSimulation: (sim: Simulation) => void;
}

export const SimulationHistoryView: React.FC<SimulationHistoryViewProps> = ({
  simulations,
  onOpenSimulation,
  onDeleteSimulation,
  onSaveSimulation,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSimIds, setSelectedSimIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [newNoteText, setNewNoteText] = useState<{ [simId: string]: string }>({});
  const [deletedUndoItem, setDeletedUndoItem] = useState<Simulation | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);

  // Toggle selection for comparison (2 to 4)
  const toggleSelect = (id: string) => {
    setSelectedSimIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) return prev; // max 4
        return [...prev, id];
      }
    });
  };

  const handleDeleteWithUndo = (sim: Simulation) => {
    onDeleteSimulation(sim.id);
    setDeletedUndoItem(sim);
    if (undoTimer) clearTimeout(undoTimer);
    const timer = setTimeout(() => {
      setDeletedUndoItem(null);
    }, 6000);
    setUndoTimer(timer);
  };

  const handleUndo = () => {
    if (deletedUndoItem) {
      onSaveSimulation(deletedUndoItem);
      setDeletedUndoItem(null);
      if (undoTimer) clearTimeout(undoTimer);
    }
  };

  const handleAddNote = (simId: string) => {
    const text = newNoteText[simId]?.trim();
    if (!text) return;

    const targetSim = simulations.find((s) => s.id === simId);
    if (!targetSim) return;

    const newNote: SimulationNote = {
      id: `n-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };

    const updated: Simulation = {
      ...targetSim,
      userNotes: [...targetSim.userNotes, newNote],
    };

    onSaveSimulation(updated);
    setNewNoteText({ ...newNoteText, [simId]: '' });
  };

  const filtered = simulations.filter((s) => {
    const q = search.toLowerCase();
    const matchId = s.id.toLowerCase().includes(q) || s.patientId.toLowerCase().includes(q);
    const matchTags = s.tags.some((t) => t.toLowerCase().includes(q));
    const matchNotes = s.userNotes.some((n) => n.text.toLowerCase().includes(q));
    return matchId || matchTags || matchNotes;
  });

  const comparedSimulations = simulations.filter((s) => selectedSimIds.includes(s.id));

  return (
    <div className="space-y-6">
      {/* Undo Toast Notification */}
      {deletedUndoItem && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-amber-500/80 shadow-2xl flex items-center gap-4 text-xs font-mono-code animate-bounce">
          <span>Deleted simulation {deletedUndoItem.id}</span>
          <button
            onClick={handleUndo}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
          >
            Undo (6s)
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            LONGITUDINAL AUDIT TRAIL
          </span>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">
            Simulation History & Multi-Run Comparison
          </h1>
          <p className="text-xs text-slate-400">
            Deterministic state restoration, timestamped notes, and multi-model variance analysis
          </p>
        </div>

        {/* Multi-Select Compare Action */}
        <div className="flex items-center gap-3">
          {selectedSimIds.length >= 2 && (
            <button
              onClick={() => setIsComparing(!isComparing)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-heading font-semibold text-xs tracking-wider shadow-lg shadow-cyan-500/20"
            >
              <Layers className="w-4 h-4" />
              <span>
                {isComparing ? 'Close Comparison View' : `Compare Selected (${selectedSimIds.length})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-4 text-xs font-mono-code">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by simulation ID, patient ID, tags, or notes…"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="text-slate-400 text-[11px]">
          Showing {filtered.length} of {simulations.length} runs · Select 2 to 4 to compare
        </div>
      </div>

      {/* COMPARISON MODAL / TRAY */}
      {isComparing && comparedSimulations.length >= 2 && (
        <div className="glass-panel rounded-2xl p-6 border-2 border-cyan-500/40 hud-corner space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="text-lg font-heading font-bold text-white text-cyan-300">
              Multi-Simulation Comparative Variance Table ({comparedSimulations.length} Models)
            </h3>
            <button
              onClick={() => setIsComparing(false)}
              className="text-xs text-slate-400 hover:text-white font-mono-code"
            >
              Close Comparison
            </button>
          </div>

          {/* Differences Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-code border-collapse border border-slate-800">
              <thead className="bg-slate-900/90 text-slate-300">
                <tr>
                  <th className="p-3 border border-slate-800">Biological Metric / Parameter</th>
                  {comparedSimulations.map((s) => (
                    <th key={s.id} className="p-3 border border-slate-800">
                      <span className="font-bold text-cyan-400 block">{s.id}</span>
                      <span className="text-[10px] text-slate-400">
                        {s.patientId} · Seed: {s.seed}
                      </span>
                    </th>
                  ))}
                  <th className="p-3 border border-slate-800 text-emerald-400">Max Delta Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {/* Row 1: Dosage sensitivity */}
                <tr>
                  <td className="p-3 font-semibold text-white border border-slate-800">
                    Dosage Sensitivity Setting
                  </td>
                  {comparedSimulations.map((s) => (
                    <td key={s.id} className="p-3 border border-slate-800 text-slate-300">
                      {s.assumptions.geneDosageSensitivity}x
                    </td>
                  ))}
                  <td className="p-3 border border-slate-800 text-slate-400">Parameter</td>
                </tr>

                {/* Row 2: Model uncertainty */}
                <tr>
                  <td className="p-3 font-semibold text-white border border-slate-800">
                    Model Uncertainty Variance
                  </td>
                  {comparedSimulations.map((s) => (
                    <td key={s.id} className="p-3 border border-slate-800 text-slate-300">
                      ±{s.assumptions.modelUncertainty}%
                    </td>
                  ))}
                  <td className="p-3 border border-slate-800 text-slate-400">Variance bound</td>
                </tr>

                {/* Row 3: Confidence Score */}
                <tr>
                  <td className="p-3 font-semibold text-white border border-slate-800">
                    Calculated Confidence Score
                  </td>
                  {comparedSimulations.map((s) => (
                    <td key={s.id} className="p-3 border border-slate-800 text-cyan-300 font-bold">
                      {s.confidence.overall}%
                    </td>
                  ))}
                  <td className="p-3 border border-slate-800 text-emerald-300 font-bold">
                    {Math.max(...comparedSimulations.map((s) => s.confidence.overall)) -
                      Math.min(...comparedSimulations.map((s) => s.confidence.overall))}% spread
                  </td>
                </tr>

                {/* Parameter rows */}
                {comparedSimulations[0].impactParameters.map((p, pIdx) => {
                  const values = comparedSimulations.map(
                    (s) => s.impactParameters[pIdx]?.percentChange || 0
                  );
                  const minVal = Math.min(...values);
                  const maxVal = Math.max(...values);
                  const spread = Math.abs(maxVal - minVal);

                  return (
                    <tr key={p.id}>
                      <td className="p-3 font-semibold text-white border border-slate-800">
                        {p.name}
                      </td>
                      {comparedSimulations.map((s) => (
                        <td key={s.id} className="p-3 border border-slate-800 text-emerald-400 font-bold">
                          {s.impactParameters[pIdx]?.percentChange}%
                        </td>
                      ))}
                      <td className="p-3 border border-slate-800 text-amber-300 font-bold">
                        Δ {spread.toFixed(1)}% {spread > 8 ? '★' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main List of Saved Simulations */}
      <div className="space-y-4">
        {filtered.map((sim) => {
          const isSelected = selectedSimIds.includes(sim.id);

          return (
            <div
              key={sim.id}
              className={`glass-panel rounded-xl p-5 border transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
                {/* Left: Checkbox + Meta */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSelect(sim.id)}
                    className="text-cyan-400 hover:text-cyan-300"
                    title={isSelected ? 'Deselect' : 'Select for comparison'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-base text-white">
                        {sim.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono-code font-bold">
                        Patient: {sim.patientId}
                      </span>
                    </div>
                    <span
                      className="text-[11px] text-slate-400 font-mono-code cursor-help block mt-0.5"
                      title={`ISO Timestamp: ${sim.createdAt}`}
                    >
                      Ran on {new Date(sim.createdAt).toLocaleString()} (Local Time)
                    </span>
                  </div>
                </div>

                {/* Right: Key Stats & Quick Actions */}
                <div className="flex items-center gap-4 text-xs font-mono-code">
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block text-sm">
                      {sim.impactParameters[0]?.percentChange}% Dosage Shift
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Confidence: {sim.confidence.overall}% · Seed: {sim.seed}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenSimulation(sim)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Model</span>
                    </button>

                    <button
                      onClick={() => handleDeleteWithUndo(sim)}
                      className="p-1.5 rounded-lg hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                      title="Delete run"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes & Annotations Section */}
              <div className="mt-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono-code text-slate-400 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Clinical & Research Notes ({sim.userNotes.length}):</span>
                </div>

                {/* Notes List */}
                {sim.userNotes.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {sim.userNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 font-mono-code flex justify-between items-start"
                      >
                        <p className="flex-1 font-sans">{note.text}</p>
                        <span className="text-[10px] text-slate-400 font-mono-code ml-3 shrink-0">
                          {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Note Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNoteText[sim.id] || ''}
                    onChange={(e) =>
                      setNewNoteText({ ...newNoteText, [sim.id]: e.target.value })
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote(sim.id)}
                    placeholder="Add clinical observation or methodology note…"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono-code"
                  />
                  <button
                    onClick={() => handleAddNote(sim.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-mono-code"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
