import React, { useState, useEffect } from 'react';
import {
  Patient,
  Simulation,
  Report,
  SimulationAssumptions,
  AppSettings,
  EXACT_DISCLAIMER,
} from './types';
import { storage, DEFAULT_SETTINGS } from './services/storage';
import { runGeneDosageSimulation, generateSeedFromPatientId } from './services/simulationEngine';
import { soundManager } from './services/audio';

import { BackgroundHelix } from './components/common/BackgroundHelix';
import { TopNav } from './components/common/TopNav';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { DisclaimerModal } from './components/common/DisclaimerModal';
import { BootSequence } from './components/common/BootSequence';

import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PatientsView } from './views/PatientsView';
import { GeneticAnalysisView } from './views/GeneticAnalysisView';
import { SimulationView } from './views/SimulationView';
import { ResultsView } from './views/ResultsView';
import { SimulationHistoryView } from './views/SimulationHistoryView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { ReportModal } from './components/reports/ReportModal';

export const App: React.FC = () => {
  // App State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storage.isAuthenticated());
  const [hasAcknowledgedDisclaimer, setHasAcknowledgedDisclaimer] = useState<boolean>(() =>
    storage.isDisclaimerAcknowledged()
  );
  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [showReviewDisclaimerModal, setShowReviewDisclaimerModal] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const s = storage.getSettings();
    if (s.clinicalMode) document.body.classList.add('clinical-mode');
    if (s.reducedMotion) document.body.classList.add('reduced-motion');
    soundManager.setEnabled(s.soundEnabled);
    return s;
  });

  // Data
  const [patients, setPatients] = useState<Patient[]>(() => storage.getPatients());
  const [simulations, setSimulations] = useState<Simulation[]>(() => storage.getSimulations());
  const [reports, setReports] = useState<Report[]>(() => storage.getReports());

  // Navigation & Selection
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    const list = storage.getPatients();
    return list[0] || null;
  });
  const [latestSimulation, setLatestSimulation] = useState<Simulation | null>(() => {
    const list = storage.getSimulations();
    return list[0] || null;
  });

  // Active Simulation Assumptions
  const [assumptions, setAssumptions] = useState<SimulationAssumptions>(() => {
    const p = storage.getPatients()[0];
    const initialSeed = p ? generateSeedFromPatientId(p.id) : 4242;
    return {
      geneDosageSensitivity: 1.0,
      modelUncertainty: 15,
      ageModifierStrength: 0.5,
      mosaicismEffectScaling: 1.0,
      randomSeed: initialSeed,
    };
  });

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState<{
    patient: Patient;
    simulation: Simulation;
  } | null>(null);

  // Auth & Disclaimer Handlers
  const handleLoginSuccess = () => {
    storage.setAuthenticated(true);
    setIsAuthenticated(true);

    if (!hasAcknowledgedDisclaimer) {
      // First time login: wait for disclaimer accept
    } else {
      // Start boot sequence
      setIsBooting(true);
    }
  };

  const handleAcceptFirstLoginDisclaimer = () => {
    storage.setDisclaimerAcknowledged();
    setHasAcknowledgedDisclaimer(true);
    setIsBooting(true);
  };

  const handleBootComplete = () => {
    setIsBooting(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    storage.setAuthenticated(false);
    setIsAuthenticated(false);
  };

  // Patient Select Handler
  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setAssumptions((prev) => ({
      ...prev,
      randomSeed: generateSeedFromPatientId(p.id),
      mosaicismEffectScaling: p.trisomyType === 'Mosaic' ? 1.0 : prev.mosaicismEffectScaling,
    }));
  };

  // Save / Delete Patient Handlers
  const handleSavePatient = (p: Patient) => {
    storage.savePatient(p);
    const updated = storage.getPatients();
    setPatients(updated);
    if (selectedPatient?.id === p.id || !selectedPatient) {
      setSelectedPatient(p);
    }
  };

  const handleDeletePatient = (id: string) => {
    storage.deletePatient(id);
    const updated = storage.getPatients();
    setPatients(updated);
    if (selectedPatient?.id === id) {
      setSelectedPatient(updated[0] || null);
    }
  };

  // Simulation Handlers
  const handleSimulationComplete = (sim: Simulation) => {
    storage.saveSimulation(sim);
    setLatestSimulation(sim);
    setSimulations(storage.getSimulations());
  };

  const handleOpenSimulation = (sim: Simulation) => {
    setLatestSimulation(sim);
    setAssumptions({ ...sim.assumptions });
    const p = patients.find((pt) => pt.id === sim.patientId);
    if (p) setSelectedPatient(p);
    setActiveTab('results');
  };

  const handleDeleteSimulation = (id: string) => {
    storage.deleteSimulation(id);
    setSimulations(storage.getSimulations());
  };

  const handleSaveSimulation = (sim: Simulation) => {
    storage.saveSimulation(sim);
    setSimulations(storage.getSimulations());
  };

  // Reports Handlers
  const handleOpenReportModal = (sim?: Simulation, p?: Patient) => {
    const targetSim = sim || latestSimulation;
    const targetPatient = p || selectedPatient;
    if (targetSim && targetPatient) {
      setReportModalData({
        patient: targetPatient,
        simulation: targetSim,
      });
      setIsReportModalOpen(true);
    }
  };

  const handleOpenExistingReport = (rep: Report) => {
    const sim = simulations.find((s) => s.id === rep.simulationId);
    const p = patients.find((pt) => pt.id === rep.patientId);
    if (sim && p) {
      setReportModalData({ patient: p, simulation: sim });
      setIsReportModalOpen(true);
    }
  };

  const handleDeleteReport = (id: string) => {
    storage.deleteReport(id);
    setReports(storage.getReports());
  };

  const handleReportSaved = (rep: Report) => {
    setReports(storage.getReports());
  };

  const handleUpdateSettings = (s: AppSettings) => {
    storage.saveSettings(s);
    setSettings(s);
  };

  const handleResetDemoData = () => {
    storage.resetDemoData();
    setPatients(storage.getPatients());
    setSimulations(storage.getSimulations());
    setReports(storage.getReports());
    setSelectedPatient(storage.getPatients()[0]);
    setLatestSimulation(storage.getSimulations()[0]);
  };

  // 1. If not authenticated -> Login Screen
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. If first login and disclaimer not acknowledged -> Disclaimer Modal
  if (!hasAcknowledgedDisclaimer) {
    return (
      <DisclaimerModal
        isOpen={true}
        onAccept={handleAcceptFirstLoginDisclaimer}
      />
    );
  }

  // 3. If booting -> Boot Sequence
  if (isBooting) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  // 4. Main Holographic Command Center Interface
  return (
    <div className="min-h-screen flex flex-col bg-[#04060F] text-[#E6F1FF] relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Animated Double Helix Canvas */}
      <BackgroundHelix
        reducedMotion={settings.reducedMotion}
        density={settings.particleDensity}
      />

      {/* Optional Scanline Overlay */}
      {settings.scanlines && (
        <div className="fixed inset-0 pointer-events-none z-10 scanlines-overlay opacity-30" />
      )}

      {/* Main Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            soundManager.playClick();
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar Contract Navigation */}
          <TopNav
            selectedPatient={selectedPatient}
            patients={patients}
            onSelectPatient={handleSelectPatient}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onLogout={handleLogout}
          />

          {/* Active View Container */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-20">
            {activeTab === 'dashboard' && (
              <DashboardView
                patients={patients}
                simulations={simulations}
                reports={reports}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSelectPatient={handleSelectPatient}
                onOpenSimulation={handleOpenSimulation}
                onOpenReport={handleOpenExistingReport}
                onNewPatient={() => setActiveTab('patients')}
                onNewSimulation={() => setActiveTab('simulation')}
              />
            )}

            {activeTab === 'patients' && (
              <PatientsView
                patients={patients}
                onSavePatient={handleSavePatient}
                onDeletePatient={handleDeletePatient}
                onSelectPatient={(p) => {
                  handleSelectPatient(p);
                  setActiveTab('genetics');
                }}
                onRunSimulationForPatient={(p) => {
                  handleSelectPatient(p);
                  setActiveTab('simulation');
                }}
                selectedPatientId={selectedPatient?.id || null}
              />
            )}

            {activeTab === 'genetics' && selectedPatient && (
              <GeneticAnalysisView
                patient={selectedPatient}
                onRunSimulation={() => setActiveTab('simulation')}
              />
            )}

            {activeTab === 'simulation' && selectedPatient && (
              <SimulationView
                patient={selectedPatient}
                patients={patients}
                onSelectPatient={handleSelectPatient}
                assumptions={assumptions}
                onUpdateAssumptions={(updated) => setAssumptions(updated)}
                onResetAssumptions={() => {
                  if (selectedPatient) {
                    setAssumptions({
                      geneDosageSensitivity: 1.0,
                      modelUncertainty: 15,
                      ageModifierStrength: 0.5,
                      mosaicismEffectScaling: 1.0,
                      randomSeed: generateSeedFromPatientId(selectedPatient.id),
                    });
                  }
                }}
                onSimulationComplete={handleSimulationComplete}
                onViewResults={() => setActiveTab('results')}
                latestSimulation={latestSimulation}
              />
            )}

            {activeTab === 'results' && latestSimulation && selectedPatient && (
              <ResultsView
                simulation={latestSimulation}
                patient={selectedPatient}
                historicalSimulations={simulations}
                onSaveSimulation={handleSaveSimulation}
                onGenerateDoctorReport={() => handleOpenReportModal(latestSimulation, selectedPatient)}
              />
            )}

            {activeTab === 'history' && (
              <SimulationHistoryView
                simulations={simulations}
                onOpenSimulation={handleOpenSimulation}
                onDeleteSimulation={handleDeleteSimulation}
                onSaveSimulation={handleSaveSimulation}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                reports={reports}
                patients={patients}
                simulations={simulations}
                onOpenReportModal={handleOpenExistingReport}
                onDeleteReport={handleDeleteReport}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onViewDisclaimer={() => setShowReviewDisclaimerModal(true)}
                onResetDemoData={handleResetDemoData}
              />
            )}
          </main>

          {/* Persistent Footer with Exact Disclaimer on Every Screen */}
          <Footer />
        </div>
      </div>

      {/* Doctor Report Modal Preview & PDF Exporter */}
      {isReportModalOpen && reportModalData && (
        <ReportModal
          patient={reportModalData.patient}
          simulation={reportModalData.simulation}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onReportSaved={handleReportSaved}
        />
      )}

      {/* Review Disclaimer Modal (accessible anytime from Settings) */}
      <DisclaimerModal
        isOpen={showReviewDisclaimerModal}
        onAccept={() => setShowReviewDisclaimerModal(false)}
        canDismiss={true}
        onDismiss={() => setShowReviewDisclaimerModal(false)}
      />
    </div>
  );
};

export default App;
