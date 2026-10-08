import React, { useState } from 'react';
import { FileText, Download, Eye, Trash2, Calendar, Search } from 'lucide-react';
import { Report, Patient, Simulation } from '../types';

interface ReportsViewProps {
  reports: Report[];
  patients: Patient[];
  simulations: Simulation[];
  onOpenReportModal: (report: Report) => void;
  onDeleteReport: (id: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  patients,
  simulations,
  onOpenReportModal,
  onDeleteReport,
}) => {
  const [search, setSearch] = useState('');
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q)
    );
  });

  const confirmDelete = () => {
    if (reportToDelete) {
      onDeleteReport(reportToDelete);
      setReportToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            CLINICAL REPORT REPOSITORY
          </span>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">
            Generated Doctor Reports
          </h1>
          <p className="text-xs text-slate-400">
            Exported multi-page reports with embedded cytogenetic and pathway graphs
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-4 text-xs font-mono-code">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Report ID, Patient ID, or title…"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <span className="text-slate-400 text-[11px]">
          Total Reports: {reports.length}
        </span>
      </div>

      {/* Reports Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
        <table className="w-full text-left text-xs font-mono-code border-collapse">
          <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="py-3 px-4">Report ID</th>
              <th className="py-3 px-3">Title</th>
              <th className="py-3 px-3">Patient ID</th>
              <th className="py-3 px-3">Simulation ID</th>
              <th className="py-3 px-3">Date Generated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((rep) => (
              <tr key={rep.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-cyan-300">{rep.id}</td>
                <td className="py-3 px-3 text-white font-medium">{rep.title}</td>
                <td className="py-3 px-3 text-slate-300">{rep.patientId}</td>
                <td className="py-3 px-3 text-violet-300">{rep.simulationId}</td>
                <td className="py-3 px-3 text-slate-400">
                  {new Date(rep.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onOpenReportModal(rep)}
                      className="flex items-center gap-1 px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-800 text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview & Download</span>
                    </button>
                    <button
                      onClick={() => setReportToDelete(rep.id)}
                      className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel rounded-xl p-6 border border-red-500/50 space-y-4">
            <h3 className="text-lg font-heading font-bold text-white text-red-400">
              Confirm Report Deletion
            </h3>
            <p className="text-xs text-slate-300 font-mono-code leading-relaxed">
              Are you sure you want to remove report record <span className="font-bold text-white">{reportToDelete}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReportToDelete(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-mono-code"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-mono-code font-bold"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
