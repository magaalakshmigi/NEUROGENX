import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Eye,
  LogOut,
  User,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { Patient, AppSettings } from '../../types';
import { soundManager } from '../../services/audio';

interface TopNavProps {
  selectedPatient: Patient | null;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onLogout: () => void;
  onSearchSelect?: (type: 'patient' | 'simulation' | 'report', id: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  selectedPatient,
  patients,
  onSelectPatient,
  settings,
  onUpdateSettings,
  onLogout,
  onSearchSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global "/" keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleClinicalMode = () => {
    const next = !settings.clinicalMode;
    onUpdateSettings({ ...settings, clinicalMode: next });
    if (next) {
      document.body.classList.add('clinical-mode');
    } else {
      document.body.classList.remove('clinical-mode');
    }
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
    if (next) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  };

  // Filtered search results
  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.trisomyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.karyotypeNotation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#070B1A]/80 backdrop-blur-md px-6 flex items-center justify-between gap-4 z-30">
      {/* Zone 1: Brand title wordmark */}
      <div className="flex items-center gap-3">
        <a href="#dashboard" className="text-base font-bold tracking-tight text-white font-heading">
          NeuroGeneX
        </a>
        <span className="hidden sm:inline-block text-[11px] font-mono-code text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
          Hypothetical Research Console
        </span>
      </div>

      {/* Zone 2: Global Search & Active Patient Chip */}
      <div className="flex items-center gap-3 flex-1 max-w-xl mx-4">
        {/* Search input with shortcut badge */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search patients, simulations, tests…"
            className="w-full pl-9 pr-8 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors font-mono-code"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono-code text-slate-400 bg-slate-800 border border-slate-700 rounded shadow-inner">
              /
            </kbd>
          </div>

          {/* Search dropdown results */}
          {isSearchFocused && filteredPatients.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-cyan-500/40 rounded-lg shadow-2xl p-2 z-50 text-xs font-mono-code">
              <span className="text-[10px] uppercase text-slate-400 block px-2 py-1">
                Patients Found ({filteredPatients.length}):
              </span>
              {filteredPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectPatient(p);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-between group"
                >
                  <span className="font-bold text-cyan-400">{p.id}</span>
                  <span className="text-slate-400 text-[11px]">{p.trisomyType}</span>
                  <span className="text-slate-400">{p.karyotypeNotation}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected-Patient Chip */}
        {selectedPatient && (
          <div className="relative">
            <button
              onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-500/60 text-xs font-mono-code transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-white font-bold">{selectedPatient.id}</span>
              <span className="hidden md:inline text-slate-400">({selectedPatient.age}y·{selectedPatient.sex[0]})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Patient Switcher Dropdown */}
            {isPatientDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-slate-900 border border-cyan-500/40 rounded-lg shadow-2xl p-2 z-50 text-xs font-mono-code">
                <span className="text-[10px] uppercase text-slate-400 block px-2 py-1">
                  Switch Active Patient:
                </span>
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPatient(p);
                      setIsPatientDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                      p.id === selectedPatient.id
                        ? 'bg-cyan-950/70 text-cyan-300 font-bold border border-cyan-800'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{p.id}</span>
                    <span className="text-[11px] text-slate-400">{p.trisomyType}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 3: Actions & System Toggles */}
      <div className="flex items-center gap-2">
        {/* Clinical Mode Toggle */}
        <button
          onClick={toggleClinicalMode}
          title={settings.clinicalMode ? 'Switch to Deep Lab Dark' : 'Switch to Clinical High-Contrast'}
          className={`p-2 rounded-lg border transition-colors ${
            settings.clinicalMode
              ? 'bg-slate-200 text-slate-900 border-slate-400 shadow-sm'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          {settings.clinicalMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Synthesized Audio Toggle */}
        <button
          onClick={toggleSound}
          title={settings.soundEnabled ? 'Mute synthesized sound effects' : 'Enable synthesized sound effects'}
          className={`p-2 rounded-lg border transition-colors ${
            settings.soundEnabled
              ? 'bg-cyan-950/70 text-cyan-300 border-cyan-700'
              : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Reduce Motion Toggle */}
        <button
          onClick={toggleReducedMotion}
          title={settings.reducedMotion ? 'Enable smooth animations' : 'Reduce all motion'}
          className={`p-2 rounded-lg border transition-colors ${
            settings.reducedMotion
              ? 'bg-cyan-950/70 text-cyan-300 border-cyan-700'
              : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* User Avatar Menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono-code transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-400 flex items-center justify-center text-cyan-300 text-xs font-bold">
              DR
            </div>
            <span className="hidden lg:inline text-slate-200">Researcher</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-52 bg-slate-900 border border-cyan-500/40 rounded-lg shadow-2xl p-2 z-50 text-xs font-mono-code">
              <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] text-slate-400">
                <div className="font-bold text-white">Clinical Researcher</div>
                <div className="truncate">demo@neurogenex.app</div>
              </div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-2 py-1.5 mt-1 rounded text-coral-400 hover:bg-red-950/40 text-red-400 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
