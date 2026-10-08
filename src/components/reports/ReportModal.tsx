import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Settings2,
} from 'lucide-react';
import { Patient, Simulation, Report, EXACT_DISCLAIMER } from '../../types';
import { storage } from '../../services/storage';
import { generateAndDownloadPdf } from '../../services/pdfExport';
import { ChromosomeCountChart } from '../charts/ChromosomeCountChart';
import { BeforeAfterRadarBarChart } from '../charts/BeforeAfterRadarBarChart';
import { PathwayImpactChart } from '../charts/PathwayImpactChart';
import { ConfidenceDistributionChart } from '../charts/ConfidenceDistributionChart';

interface ReportModalProps {
  patient: Patient;
  simulation: Simulation;
  isOpen: boolean;
  onClose: () => void;
  onReportSaved?: (report: Report) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  patient,
  simulation,
  isOpen,
  onClose,
  onReportSaved,
}) => {
  const [reportTitle, setReportTitle] = useState('Genomic Research Simulation & Pathway Load Summary');
  const [extraDoctorNotes, setExtraDoctorNotes] = useState(
    'Reviewed in computational genetics research group. Illustrative gene-dosage attenuation model aligns with theoretical expectations. Laboratory cytogenetic assays recommended.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  // Section include toggles
  const [sections, setSections] = useState({
    patientInfo: true,
    geneticFindings: true,
    simulationDetails: true,
    resultsTables: true,
    graphs: true,
    insights: true,
    confidence: true,
    limitations: true,
    doctorNotes: true,
    references: true,
  });

  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);
  const page4Ref = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const reportId = `NGX-R-${dateStr}-${simulation.id.replace('NGX-S-', '')}`;
  const formattedDateTime = new Date().toLocaleString();

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setProgressPct(10);

    const pages: HTMLElement[] = [];
    if (page1Ref.current) pages.push(page1Ref.current);
    if (page2Ref.current) pages.push(page2Ref.current);
    if (page3Ref.current) pages.push(page3Ref.current);
    if (page4Ref.current) pages.push(page4Ref.current);

    try {
      await generateAndDownloadPdf(pages, reportId, (p) => setProgressPct(p));

      // Save report record
      const newReport: Report = {
        id: reportId,
        patientId: patient.id,
        simulationId: simulation.id,
        createdAt: new Date().toISOString(),
        title: reportTitle,
        notes: extraDoctorNotes,
        includedSections: {
          patientInfo: sections.patientInfo,
          geneticFindings: sections.geneticFindings,
          simulationDetails: sections.simulationDetails,
          graphs: sections.graphs,
          impactTable: sections.resultsTables,
          pathwayTable: sections.resultsTables,
          insights: sections.insights,
          confidence: sections.confidence,
          limitations: sections.limitations,
          notes: sections.doctorNotes,
          references: sections.references,
        },
      };

      storage.saveReport(newReport);
      onReportSaved?.(newReport);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[94vh]">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-800 bg-slate-950/80 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-heading font-bold text-white text-base">
                Doctor Report Preview
              </h3>
              <span className="text-xs text-slate-400 font-mono-code">
                {reportId} · Patient: {patient.id} · Simulation: {simulation.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono-code transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-heading font-semibold text-xs tracking-wider shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>RENDERING PDF ({progressPct}%)…</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Options Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="text-slate-400 font-mono-code">Title:</span>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-code text-slate-300">
            <span className="text-slate-400">Include:</span>
            <button
              onClick={() => toggleSection('graphs')}
              className={`px-2 py-0.5 rounded border ${
                sections.graphs ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              4 Graphs
            </button>
            <button
              onClick={() => toggleSection('resultsTables')}
              className={`px-2 py-0.5 rounded border ${
                sections.resultsTables ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              Tables
            </button>
            <button
              onClick={() => toggleSection('insights')}
              className={`px-2 py-0.5 rounded border ${
                sections.insights ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => toggleSection('doctorNotes')}
              className={`px-2 py-0.5 rounded border ${
                sections.doctorNotes ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              Notes
            </button>
          </div>
        </div>

        {/* Scrollable A4 Pages Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/90 space-y-8 flex flex-col items-center">
          {/* ========================================================= */}
          {/* PAGE 1: COVER, PATIENT INFO, GENETIC FINDINGS, SCENARIO */}
          {/* ========================================================= */}
          <div
            ref={page1Ref}
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 shadow-2xl rounded-sm flex flex-col justify-between select-text"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold font-heading text-sm">
                      NX
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        NEUROGENEX
                      </h1>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                        Genomics Computational Research Simulation
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-slate-600">
                  <div className="font-bold text-slate-900">{reportId}</div>
                  <div>Generated: {formattedDateTime}</div>
                  <div className="text-cyan-700 font-semibold">Patient: {patient.id}</div>
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  {reportTitle}
                </h2>
                <span className="text-xs font-mono text-slate-500">
                  Simulation Reference: {simulation.id} · Model Version 1.0 (Deterministic)
                </span>
              </div>

              {/* 2. Prominent Disclaimer Box (EXACT TEXT) */}
              <div className="p-4 mb-6 bg-amber-50 border-2 border-amber-500/70 rounded-md text-xs leading-relaxed text-amber-950 font-medium">
                <span className="font-bold text-amber-900 block mb-1">
                  MANDATORY REGULATORY DISCLAIMER:
                </span>
                {EXACT_DISCLAIMER}
              </div>

              {/* 3. Basic Patient Information */}
              {sections.patientInfo && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-700 mb-2 border-b border-slate-300 pb-1">
                    1. Patient Record (De-Identified Data)
                  </h3>
                  <div className="grid grid-cols-4 gap-4 p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">PATIENT ID</span>
                      <span className="font-bold text-slate-900">{patient.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">AGE / SEX</span>
                      <span className="font-bold text-slate-900">
                        {patient.age} yrs · {patient.sex}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TRISOMY 21 STATUS</span>
                      <span className="font-bold text-cyan-800">
                        {patient.trisomy21Status}
                      </span>
                      <span className="text-[9px] text-slate-500 block">(Clinician-entered)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TRISOMY SUBTYPE</span>
                      <span className="font-bold text-slate-900">
                        {patient.trisomyType} {patient.mosaicismPercent ? `(${patient.mosaicismPercent}%)` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Genetic Findings and Baseline Information */}
              {sections.geneticFindings && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-700 mb-2 border-b border-slate-300 pb-1">
                    2. Baseline Cytogenetic & Clinical Documentation
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-mono text-slate-500 text-[10px] block">KARYOTYPE NOTATION:</span>
                      <p className="font-mono font-bold text-slate-900 bg-slate-100 p-2 rounded border border-slate-200">
                        {patient.karyotypeNotation || '47,XX,+21'}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-slate-500 text-[10px] block">GENETIC FINDINGS:</span>
                      <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                        {patient.geneticFindings}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-slate-500 text-[10px] block">MEDICAL HISTORY & RECENT ASSAYS:</span>
                      <p className="text-slate-700 leading-relaxed">
                        {patient.medicalHistory}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Simulation Scenario Definition */}
              {sections.simulationDetails && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-700 mb-2 border-b border-slate-300 pb-1">
                    3. Computational "What-If" Scenario Parameters
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 bg-red-50/60 border border-red-200 rounded">
                      <span className="font-bold text-red-900 block mb-1">
                        Current Scenario (Clinician-Entered)
                      </span>
                      <div>Chromosomes: 47 total</div>
                      <div>Chromosome 21 Copies: 3</div>
                      <div>Dosage Ratio: {(1 + 0.5 * simulation.currentState.effectiveTrisomicFraction).toFixed(2)}x</div>
                    </div>
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded">
                      <span className="font-bold text-emerald-900 block mb-1">
                        Simulated Scenario (Hypothetical What-If)
                      </span>
                      <div>Chromosomes: 46 total</div>
                      <div>Chromosome 21 Copies: 2</div>
                      <div>Dosage Ratio: 1.00x (Normalized)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Page 1 Footer */}
            <div className="pt-4 border-t border-slate-300 text-[9px] text-slate-500 flex justify-between items-center font-mono">
              <span className="max-w-[70%]">{EXACT_DISCLAIMER}</span>
              <span className="font-bold">Page 1 of 4 · {reportId}</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PAGE 2: ALL FOUR CHARTS EMBEDDED */}
          {/* ========================================================= */}
          <div
            ref={page2Ref}
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 shadow-2xl rounded-sm flex flex-col justify-between select-text"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-4 text-xs font-mono text-slate-600">
                <span className="font-bold text-slate-900">NEUROGENEX CLINICAL REPORT</span>
                <span>Patient: {patient.id} · {reportId}</span>
              </div>

              <h3 className="text-sm uppercase tracking-wider font-bold text-slate-800 mb-4 border-b-2 border-slate-900 pb-1">
                4. High-Resolution Simulation Visualizations (All 4 Models)
              </h3>

              {/* 2x2 Grid of the 4 Graphs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Graph 1 */}
                <div className="border border-slate-300 rounded p-2 bg-slate-900 text-white">
                  <ChromosomeCountChart simulation={simulation} />
                </div>
                {/* Graph 2 */}
                <div className="border border-slate-300 rounded p-2 bg-slate-900 text-white">
                  <BeforeAfterRadarBarChart simulation={simulation} />
                </div>
                {/* Graph 3 */}
                <div className="border border-slate-300 rounded p-2 bg-slate-900 text-white">
                  <PathwayImpactChart simulation={simulation} />
                </div>
                {/* Graph 4 */}
                <div className="border border-slate-300 rounded p-2 bg-slate-900 text-white">
                  <ConfidenceDistributionChart simulation={simulation} />
                </div>
              </div>
            </div>

            {/* Page 2 Footer */}
            <div className="pt-4 border-t border-slate-300 text-[9px] text-slate-500 flex justify-between items-center font-mono">
              <span className="max-w-[70%]">{EXACT_DISCLAIMER}</span>
              <span className="font-bold">Page 2 of 4 · {reportId}</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PAGE 3: PREDICTED IMPACT & PATHWAY TABLES */}
          {/* ========================================================= */}
          <div
            ref={page3Ref}
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 shadow-2xl rounded-sm flex flex-col justify-between select-text"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-4 text-xs font-mono text-slate-600">
                <span className="font-bold text-slate-900">NEUROGENEX CLINICAL REPORT</span>
                <span>Patient: {patient.id} · {reportId}</span>
              </div>

              <h3 className="text-sm uppercase tracking-wider font-bold text-slate-800 mb-3 border-b-2 border-slate-900 pb-1">
                5. Predicted Biological Impact & Pathway Changes Tables
              </h3>

              {/* Impact Parameters Table */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-700 mb-2 font-mono">
                  Table 5.1: Biological Parameter Load Attenuation
                </h4>
                <table className="w-full text-left text-xs border border-slate-300 font-mono">
                  <thead className="bg-slate-100 border-b border-slate-300 text-[10px] text-slate-700">
                    <tr>
                      <th className="py-2 px-2.5">Parameter</th>
                      <th className="py-2 px-2 text-center">Before (3x)</th>
                      <th className="py-2 px-2 text-center">Simulated (2x)</th>
                      <th className="py-2 px-2 text-center">Δ Change</th>
                      <th className="py-2 px-2 text-center">95% Interval</th>
                      <th className="py-2 px-2.5">Hedged Model Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulation.impactParameters.map((param, i) => (
                      <tr key={param.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-2 px-2.5 font-bold text-slate-900">{param.name}</td>
                        <td className="py-2 px-2 text-center text-red-700">{param.before}</td>
                        <td className="py-2 px-2 text-center text-emerald-700 font-bold">{param.after}</td>
                        <td className="py-2 px-2 text-center text-emerald-800 font-bold">
                          {param.change} ({param.percentChange}%)
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600">
                          [{param.uncertaintyInterval[0]}–{param.uncertaintyInterval[1]}]
                        </td>
                        <td className="py-2 px-2.5 text-[10px] text-slate-600 font-sans">
                          {param.hedgedNote}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pathway Changes Table */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-700 mb-2 font-mono">
                  Table 5.2: Ranked Pathway Shift Modeling
                </h4>
                <table className="w-full text-left text-xs border border-slate-300 font-mono">
                  <thead className="bg-slate-100 border-b border-slate-300 text-[10px] text-slate-700">
                    <tr>
                      <th className="py-2 px-2.5">Pathway</th>
                      <th className="py-2 px-2 text-center">Predicted Shift</th>
                      <th className="py-2 px-2 text-center">Uncertainty</th>
                      <th className="py-2 px-2.5">Biological Basis & Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulation.pathwayChanges.map((pw, i) => (
                      <tr key={pw.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-2 px-2.5 font-bold text-slate-900">{pw.name}</td>
                        <td className="py-2 px-2 text-center text-emerald-700 font-bold">
                          {pw.percentChange}%
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600">±{pw.uncertainty}%</td>
                        <td className="py-2 px-2.5 text-[10px] text-slate-600 font-sans">
                          {pw.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Page 3 Footer */}
            <div className="pt-4 border-t border-slate-300 text-[9px] text-slate-500 flex justify-between items-center font-mono">
              <span className="max-w-[70%]">{EXACT_DISCLAIMER}</span>
              <span className="font-bold">Page 3 of 4 · {reportId}</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PAGE 4: INSIGHTS, LIMITATIONS, DOCTOR NOTES, SIGNATURE */}
          {/* ========================================================= */}
          <div
            ref={page4Ref}
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 shadow-2xl rounded-sm flex flex-col justify-between select-text"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-4 text-xs font-mono text-slate-600">
                <span className="font-bold text-slate-900">NEUROGENEX CLINICAL REPORT</span>
                <span>Patient: {patient.id} · {reportId}</span>
              </div>

              {/* Research Insights */}
              {sections.insights && (
                <div className="mb-5">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-800 mb-2 border-b border-slate-300 pb-1">
                    6. Structured Research Insights (Hypothesis Generation)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="font-bold text-cyan-900 block mb-1">
                        What the Simulation Predicts:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                        {simulation.insights.whatSimulationPredicts.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="font-bold text-violet-900 block mb-1">
                        Findings for Further Research:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                        {simulation.insights.findingsForFurtherResearch.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Limitations */}
              {sections.limitations && (
                <div className="mb-5">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-800 mb-2 border-b border-slate-300 pb-1">
                    7. Fundamental Methodological Limitations
                  </h3>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-[11px] text-amber-950 space-y-1">
                    {simulation.limitations.map((lim, idx) => (
                      <p key={idx}>• {lim}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Researcher Notes */}
              {sections.doctorNotes && (
                <div className="mb-5">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-800 mb-1 border-b border-slate-300 pb-1">
                    8. Clinician & Researcher Annotations
                  </h3>
                  <textarea
                    value={extraDoctorNotes}
                    onChange={(e) => setExtraDoctorNotes(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-slate-300 rounded bg-slate-50 text-slate-800"
                    rows={2}
                  />
                </div>
              )}

              {/* References */}
              {sections.references && (
                <div className="mb-5 text-[10px] text-slate-500 font-mono">
                  <span className="font-bold text-slate-700 block">General References (verify current versions):</span>
                  <span>
                    NCBI Genome Data Viewer (GRCh38.p14) · Ensembl Gene Models · OMIM #190685 · GeneReviews: Down Syndrome (Trisomy 21).
                  </span>
                </div>
              )}

              {/* Signature Line */}
              <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block mb-3">REVIEWING CLINICIAN / RESEARCHER:</span>
                  <div className="border-b border-slate-400 w-full mb-1" />
                  <span className="text-[10px] text-slate-500">Signature / Printed Name</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-3">DATE OF REVIEW:</span>
                  <div className="border-b border-slate-400 w-full mb-1" />
                  <span className="text-[10px] text-slate-500">YYYY-MM-DD</span>
                </div>
              </div>
            </div>

            {/* Page 4 Footer */}
            <div className="pt-4 border-t border-slate-300 text-[9px] text-slate-500 flex justify-between items-center font-mono">
              <span className="max-w-[70%]">{EXACT_DISCLAIMER}</span>
              <span className="font-bold">Page 4 of 4 · {reportId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
