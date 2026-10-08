import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Grid,
  List,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  FileText,
  Dna,
  Save,
  X,
} from 'lucide-react';
import {
  Patient,
  PatientSex,
  PatientStatus,
  Trisomy21Status,
  TrisomyType,
  TestResult,
} from '../types';

interface PatientsViewProps {
  patients: Patient[];
  onSavePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onSelectPatient: (patient: Patient) => void;
  onRunSimulationForPatient: (patient: Patient) => void;
  selectedPatientId: string | null;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSavePatient,
  onDeletePatient,
  onSelectPatient,
  onRunSimulationForPatient,
  selectedPatientId,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'age' | 'updated'>('id');

  // Detail / Form Modal states
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  // Form states
  const [formStep, setFormStep] = useState<number>(1);
  const [draftTimestamp, setDraftTimestamp] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Patient>>({
    id: '',
    age: 18,
    sex: 'Female',
    trisomy21Status: 'Reported Trisomy 21',
    karyotypeNotation: '47,XX,+21',
    trisomyType: 'Free trisomy 21',
    mosaicismPercent: 0,
    geneticFindings: '',
    medicalHistory: '',
    medicalHistoryTags: [],
    testResults: [],
    clinicianNotes: '',
    status: 'Complete',
  });
  const [phiWarning, setPhiWarning] = useState<string | null>(null);

  // Autosave simulated trigger
  useEffect(() => {
    if (isFormOpen) {
      setDraftTimestamp(`Draft autosaved at ${new Date().toLocaleTimeString()}`);
    }
  }, [formData, isFormOpen]);

  // Check for potential PHI (names / emails)
  const checkForPotentialPhi = (text: string) => {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const namePrefixPattern = /\b(Mr\.|Mrs\.|Ms\.|Dr\.|Patient Name:|Name:)\s+[A-Za-z]+/i;

    if (emailPattern.test(text)) {
      setPhiWarning('Soft Notice: Input looks like an email address. Remember: De-identified IDs only.');
    } else if (namePrefixPattern.test(text)) {
      setPhiWarning('Soft Notice: Text may contain an individual name. Please use de-identified patient IDs only.');
    } else {
      setPhiWarning(null);
    }
  };

  const handleOpenNewPatientForm = () => {
    const nextNum = patients.length + 1;
    const newId = `NGX-P-${String(nextNum).padStart(4, '0')}`;
    setFormData({
      id: newId,
      age: 16,
      sex: 'Female',
      trisomy21Status: 'Reported Trisomy 21',
      karyotypeNotation: '47,XX,+21',
      trisomyType: 'Free trisomy 21',
      mosaicismPercent: 0,
      geneticFindings: 'Constitutional G-banded karyotype confirms 47,XX,+21.',
      medicalHistory: 'Baseline medical history. Monitored for pediatric/adult milestones.',
      medicalHistoryTags: ['thyroid'],
      testResults: [
        {
          id: 'test-1',
          name: 'Baseline TSH',
          date: new Date().toISOString().slice(0, 10),
          value: '2.1',
          unit: 'mIU/L',
          notes: 'Normal',
        },
      ],
      clinicianNotes: 'Routine cytogenetic research record entry.',
      status: 'Complete',
    });
    setEditingPatient(null);
    setFormStep(1);
    setIsFormOpen(true);
  };

  const handleEditPatient = (p: Patient) => {
    setEditingPatient(p);
    setFormData({ ...p });
    setFormStep(1);
    setIsFormOpen(true);
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    const newOrUpdated: Patient = {
      id: formData.id,
      createdAt: editingPatient ? editingPatient.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      age: Number(formData.age) || 0,
      sex: (formData.sex as PatientSex) || 'Not specified',
      trisomy21Status: (formData.trisomy21Status as Trisomy21Status) || 'Reported Trisomy 21',
      karyotypeNotation: formData.karyotypeNotation || '47,XX,+21',
      trisomyType: (formData.trisomyType as TrisomyType) || 'Free trisomy 21',
      mosaicismPercent: formData.mosaicismPercent,
      geneticFindings: formData.geneticFindings || '',
      medicalHistory: formData.medicalHistory || '',
      medicalHistoryTags: formData.medicalHistoryTags || [],
      testResults: formData.testResults || [],
      clinicianNotes: formData.clinicianNotes || '',
      dataSources: formData.dataSources || ['NCBI GDV', 'GeneReviews'],
      status: (formData.status as PatientStatus) || 'Complete',
      isDemo: editingPatient ? editingPatient.isDemo : false,
    };

    onSavePatient(newOrUpdated);
    setIsFormOpen(false);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      onDeletePatient(patientToDelete);
      setPatientToDelete(null);
      if (selectedPatientForDetail?.id === patientToDelete) {
        setSelectedPatientForDetail(null);
      }
    }
  };

  // Filter & Sort Logic
  const filtered = patients
    .filter((p) => {
      const matchSearch =
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.karyotypeNotation.toLowerCase().includes(search.toLowerCase()) ||
        p.trisomyType.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || p.trisomyType === filterType;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'age') return a.age - b.age;
      if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return a.id.localeCompare(b.id);
    });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            DE-IDENTIFIED CLINICAL REPOSITORY
          </span>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">
            Genetic Patient Records
          </h1>
          <p className="text-xs text-slate-400">
            De-identified records only. Trisomy 21 status is clinician-entered; never inferred.
          </p>
        </div>

        <button
          onClick={handleOpenNewPatientForm}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-heading font-semibold text-xs tracking-wider shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ NEW PATIENT</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient ID, karyotype notation, subtype…"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subtype Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="all">All Subtypes</option>
            <option value="Free trisomy 21">Free trisomy 21</option>
            <option value="Mosaic">Mosaic</option>
            <option value="Robertsonian translocation">Robertsonian translocation</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="id">Sort: Patient ID</option>
            <option value="age">Sort: Age</option>
            <option value="updated">Sort: Last Updated</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded ${viewMode === 'cards' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              title="Cards View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main List / Table */}
      {viewMode === 'table' ? (
        <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs font-mono-code border-collapse">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-3">Age / Sex</th>
                <th className="py-3 px-3">Trisomy 21 Status</th>
                <th className="py-3 px-3">Karyotype</th>
                <th className="py-3 px-3">Subtype</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p) => {
                const isSelected = selectedPatientId === p.id;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-cyan-950/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-cyan-300">
                      <div className="flex items-center gap-2">
                        <span>{p.id}</span>
                        {p.isDemo && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {p.age} yrs · {p.sex}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-cyan-400 font-semibold">{p.trisomy21Status}</span>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        (Clinician-entered)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-fuchsia-300">{p.karyotypeNotation}</td>
                    <td className="py-3 px-3 text-slate-300">
                      {p.trisomyType} {p.mosaicismPercent ? `(${p.mosaicismPercent}%)` : ''}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.status === 'Simulated'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectPatient(p)}
                          className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-800 text-[11px]"
                          title="Set as Active Patient"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => setSelectedPatientForDetail(p)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                          title="View Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditPatient(p)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setPatientToDelete(p.id)}
                          className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="glass-panel rounded-xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-bold text-lg text-white text-cyan-300">
                    {p.id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono-code">
                    {p.age} yrs · {p.sex}
                  </span>
                </div>
                <div className="text-xs font-mono-code space-y-1 text-slate-300 mb-3">
                  <div>
                    <span className="text-slate-500">Status: </span>
                    <span className="text-cyan-400">{p.trisomy21Status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Karyotype: </span>
                    <span className="text-fuchsia-300">{p.karyotypeNotation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Subtype: </span>
                    <span>{p.trisomyType}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {p.geneticFindings}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono-code">
                <button
                  onClick={() => onRunSimulationForPatient(p)}
                  className="text-cyan-400 hover:underline"
                >
                  Run What-If →
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedPatientForDetail(p)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEditPatient(p)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatientForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-heading font-bold text-white">
                  Patient Record {selectedPatientForDetail.id}
                </h3>
                <span className="text-xs text-cyan-400 font-mono-code">
                  De-Identified Record · Clinician-Entered Cytogenetics
                </span>
              </div>
              <button
                onClick={() => setSelectedPatientForDetail(null)}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono-code">
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">AGE / SEX</span>
                  <span className="text-white font-bold">{selectedPatientForDetail.age}y · {selectedPatientForDetail.sex}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">KARYOTYPE</span>
                  <span className="text-fuchsia-300 font-bold">{selectedPatientForDetail.karyotypeNotation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SUBTYPE</span>
                  <span className="text-white">{selectedPatientForDetail.trisomyType}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Genetic Findings:</span>
                <p className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-200 font-sans leading-relaxed">
                  {selectedPatientForDetail.geneticFindings}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Medical History:</span>
                <p className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-200 font-sans leading-relaxed">
                  {selectedPatientForDetail.medicalHistory}
                </p>
              </div>

              {selectedPatientForDetail.testResults.length > 0 && (
                <div>
                  <span className="text-slate-400 block mb-1">Recent Laboratory Tests:</span>
                  <div className="border border-slate-800 rounded overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400">
                        <tr>
                          <th className="p-2">Test Name</th>
                          <th className="p-2">Date</th>
                          <th className="p-2">Value</th>
                          <th className="p-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {selectedPatientForDetail.testResults.map((t) => (
                          <tr key={t.id}>
                            <td className="p-2 text-white font-bold">{t.name}</td>
                            <td className="p-2 text-slate-400">{t.date}</td>
                            <td className="p-2 text-emerald-400">{t.value} {t.unit}</td>
                            <td className="p-2 text-slate-400">{t.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  onSelectPatient(selectedPatientForDetail);
                  onRunSimulationForPatient(selectedPatientForDetail);
                  setSelectedPatientForDetail(null);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-heading font-semibold text-xs"
              >
                Run What-If Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-step Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 border border-cyan-500/40 max-h-[92vh] overflow-y-auto">
            {/* Form Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-heading font-bold text-white">
                  {editingPatient ? `Edit Patient Record (${editingPatient.id})` : 'New De-Identified Patient Record'}
                </h3>
                <span className="text-[11px] font-mono-code text-cyan-400">
                  {draftTimestamp}
                </span>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Regulatory De-identified Warning */}
            <div className="p-3 mb-4 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 font-mono-code leading-relaxed">
              <span className="font-bold">DE-IDENTIFIED DATA ONLY:</span> Do NOT enter patient names, addresses, or identifiers. All records must use anonymous ID codes only.
            </div>

            {/* Soft Warning if PHI is detected */}
            {phiWarning && (
              <div className="p-3 mb-4 rounded-lg bg-amber-950/70 border border-amber-500/50 text-xs text-amber-200 font-mono-code flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{phiWarning}</span>
              </div>
            )}

            <form onSubmit={handleSavePatient} className="space-y-4 text-xs font-mono-code">
              {/* Step indicator */}
              <div className="flex border-b border-slate-800 pb-2 gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className={`pb-1 ${formStep === 1 ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold' : 'text-slate-500'}`}
                >
                  1. Basic Cytogenetics
                </button>
                <button
                  type="button"
                  onClick={() => setFormStep(2)}
                  className={`pb-1 ${formStep === 2 ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold' : 'text-slate-500'}`}
                >
                  2. Genetic Findings
                </button>
                <button
                  type="button"
                  onClick={() => setFormStep(3)}
                  className={`pb-1 ${formStep === 3 ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold' : 'text-slate-500'}`}
                >
                  3. Medical History & Tests
                </button>
              </div>

              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Patient ID (Auto)</label>
                      <input
                        type="text"
                        required
                        value={formData.id}
                        disabled={!!editingPatient}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Age (0-120)</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        required
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Sex</label>
                      <select
                        value={formData.sex}
                        onChange={(e) => setFormData({ ...formData, sex: e.target.value as PatientSex })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Intersex">Intersex</option>
                        <option value="Not specified">Not specified</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">
                        Trisomy 21 Status (Clinician-Entered)
                      </label>
                      <select
                        value={formData.trisomy21Status}
                        onChange={(e) =>
                          setFormData({ ...formData, trisomy21Status: e.target.value as Trisomy21Status })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-cyan-300"
                      >
                        <option value="Reported Trisomy 21">Reported Trisomy 21</option>
                        <option value="Reported mosaic">Reported mosaic</option>
                        <option value="Reported translocation">Reported translocation</option>
                        <option value="Not reported">Not reported</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">
                        Karyotype Notation (e.g. 47,XX,+21)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.karyotypeNotation}
                        onChange={(e) => {
                          setFormData({ ...formData, karyotypeNotation: e.target.value });
                          checkForPotentialPhi(e.target.value);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-fuchsia-300 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Subtype Classification</label>
                      <select
                        value={formData.trisomyType}
                        onChange={(e) =>
                          setFormData({ ...formData, trisomyType: e.target.value as TrisomyType })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      >
                        <option value="Free trisomy 21">Free trisomy 21</option>
                        <option value="Robertsonian translocation">Robertsonian translocation</option>
                        <option value="Mosaic">Mosaic</option>
                        <option value="Not available">Not available</option>
                      </select>
                    </div>

                    {formData.trisomyType === 'Mosaic' && (
                      <div>
                        <label className="block text-slate-400 mb-1">Mosaicism Percent (0-100%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.mosaicismPercent ?? 35}
                          onChange={(e) =>
                            setFormData({ ...formData, mosaicismPercent: Number(e.target.value) })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Genetic Findings & Cytogenetic Documentation
                    </label>
                    <textarea
                      rows={5}
                      value={formData.geneticFindings}
                      onChange={(e) => {
                        setFormData({ ...formData, geneticFindings: e.target.value });
                        checkForPotentialPhi(e.target.value);
                      }}
                      placeholder="Detail metaphase analysis, FISH results, chromosome microarrays..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Clinician Notes</label>
                    <textarea
                      rows={3}
                      value={formData.clinicianNotes}
                      onChange={(e) => {
                        setFormData({ ...formData, clinicianNotes: e.target.value });
                        checkForPotentialPhi(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Medical History Summary</label>
                    <textarea
                      rows={4}
                      value={formData.medicalHistory}
                      onChange={(e) => {
                        setFormData({ ...formData, medicalHistory: e.target.value });
                        checkForPotentialPhi(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Test Results Included:</span>
                    <span className="text-cyan-300">
                      {formData.testResults?.length || 0} baseline assays attached
                    </span>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div>
                  {formStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormStep(formStep - 1)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {formStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setFormStep(formStep + 1)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-semibold"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded font-bold shadow-lg"
                    >
                      Save Patient Record
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel rounded-xl p-6 border border-red-500/50 space-y-4">
            <h3 className="text-lg font-heading font-bold text-white text-red-400">
              Confirm Patient Record Deletion
            </h3>
            <p className="text-xs text-slate-300 font-mono-code leading-relaxed">
              Are you sure you want to delete patient record <span className="font-bold text-white">{patientToDelete}</span>? This will remove all associated notes and local records.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPatientToDelete(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-mono-code"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-mono-code font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
