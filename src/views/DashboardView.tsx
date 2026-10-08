import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Users,
  Cpu,
  FileText,
  Activity,
  Plus,
  Play,
  ArrowRight,
  Download,
  Calendar,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Patient, Simulation, Report } from '../types';

interface DashboardViewProps {
  patients: Patient[];
  simulations: Simulation[];
  reports: Report[];
  onNavigateTab: (tab: any) => void;
  onSelectPatient: (patient: Patient) => void;
  onOpenSimulation: (simulation: Simulation) => void;
  onOpenReport: (report: Report) => void;
  onNewPatient: () => void;
  onNewSimulation: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  simulations,
  reports,
  onNavigateTab,
  onSelectPatient,
  onOpenSimulation,
  onOpenReport,
  onNewPatient,
  onNewSimulation,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const chr21CanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mini Rotating 3D Chromosome 21 Hero Canvas
  useEffect(() => {
    const canvas = chr21CanvasRef.current;
    if (!canvas) return;

    const width = 240;
    const height = 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0xe879f9, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x22d3ee, 2.0);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    // Group for Chr 21 pair + extra 3rd copy
    const chrGroup = new THREE.Group();
    scene.add(chrGroup);

    const armGeo = new THREE.CapsuleGeometry(0.2, 1.4, 8, 16);
    const chrMat = new THREE.MeshStandardMaterial({
      color: 0xe879f9,
      roughness: 0.25,
      metalness: 0.3,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.7,
    });

    // Copy 1
    const m1 = new THREE.Mesh(armGeo, chrMat);
    m1.position.x = -0.5;
    chrGroup.add(m1);

    // Copy 2
    const m2 = new THREE.Mesh(armGeo, chrMat);
    m2.position.x = 0;
    chrGroup.add(m2);

    // Copy 3 (Extra)
    const extraMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.25,
      metalness: 0.3,
      emissive: 0xe11d48,
      emissiveIntensity: 0.9,
    });
    const m3 = new THREE.Mesh(armGeo, extraMat);
    m3.position.x = 0.55;
    chrGroup.add(m3);

    // Orbit Ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.02, 8, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    chrGroup.add(ringMesh);

    let animId: number;
    let isDragging = false;
    let prevMouseX = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onPointerMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - prevMouseX;
      chrGroup.rotation.y += delta * 0.015;
      prevMouseX = e.clientX;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        chrGroup.rotation.y += 0.012;
        chrGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.15;
      }
      ringMesh.rotation.z += 0.008;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      renderer.dispose();
    };
  }, []);

  const totalPatients = patients.length;
  const totalSims = simulations.length;
  const recentSims = simulations.slice(0, 5);
  const recentReports = reports.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Greeting Header & System Status Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono-code text-xs mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} · {currentTime}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white tracking-wide">
            Genomics Research Command
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            De-identified patient cohort & computational gene-dosage what-if modeling
          </p>
        </div>

        {/* System Status Panel */}
        <div className="flex flex-wrap items-center gap-3 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono-code">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
            <span className="text-slate-300">Engine: Online</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950">
            <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-glow" />
            <span className="text-slate-300">Data: Local Storage</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-slate-300">Model: v1.0 Pure Deterministic</span>
          </div>
        </div>
      </div>

      {/* Row of 4 Stat Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="glass-panel rounded-xl p-5 border border-cyan-500/20 hud-corner flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono-code uppercase">Patient Records</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-heading font-bold text-white font-mono-code">
              {totalPatients}
            </span>
            <span className="text-[11px] font-mono-code text-cyan-300">De-identified</span>
          </div>
          {/* Mini Sparkline SVG */}
          <div className="mt-3 h-5 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,15 L25,12 L50,16 L75,8 L100,5" fill="none" stroke="#22D3EE" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-panel rounded-xl p-5 border border-fuchsia-500/20 hud-corner flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono-code uppercase">Total Simulations</span>
            <Cpu className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-heading font-bold text-white font-mono-code">
              {totalSims}
            </span>
            <span className="text-[11px] font-mono-code text-fuchsia-300">Runs executed</span>
          </div>
          <div className="mt-3 h-5 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,18 L20,15 L45,10 L70,8 L100,3" fill="none" stroke="#E879F9" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-panel rounded-xl p-5 border border-emerald-500/20 hud-corner flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono-code uppercase">Active This Week</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-heading font-bold text-white font-mono-code">
              {Math.min(totalSims, 6)}
            </span>
            <span className="text-[11px] font-mono-code text-emerald-300">High activity</span>
          </div>
          <div className="mt-3 h-5 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,12 L30,16 L60,8 L85,12 L100,6" fill="none" stroke="#34D399" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-panel rounded-xl p-5 border border-violet-500/20 hud-corner flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono-code uppercase">Doctor Reports</span>
            <FileText className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-heading font-bold text-white font-mono-code">
              {reports.length}
            </span>
            <span className="text-[11px] font-mono-code text-violet-300">PDFs ready</span>
          </div>
          <div className="mt-3 h-5 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,14 L35,14 L65,8 L100,4" fill="none" stroke="#8B5CF6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Two Oversized Quick Action Buttons & 3D Hero Chromosome Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions (Col 1 & 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: New Patient */}
            <button
              onClick={onNewPatient}
              className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/70 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 transition-all group flex flex-col justify-between text-left shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono-code text-cyan-400 group-hover:translate-x-1 transition-transform">
                  ENTER DATA →
                </span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-1">
                  + New Patient Record
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Register de-identified cytogenetic record, karyotype notation, and laboratory test panels.
                </p>
              </div>
            </button>

            {/* Action 2: New Simulation */}
            <button
              onClick={onNewSimulation}
              className="p-6 rounded-2xl bg-gradient-to-br from-violet-950/70 to-slate-900 border border-violet-500/30 hover:border-violet-400 transition-all group flex flex-col justify-between text-left shadow-lg hover:shadow-violet-500/10 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-300 group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono-code text-violet-400 group-hover:translate-x-1 transition-transform">
                  LAUNCH RUN →
                </span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-1">
                  + Run "What-If" Simulation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Execute 47→46 chromosome gene-dosage model with adjustable uncertainty and sensitivity sliders.
                </p>
              </div>
            </button>
          </div>

          {/* Recent Simulations List */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-white text-sm">
                Recent Model Executions
              </h3>
              <button
                onClick={() => onNavigateTab('history')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono-code"
              >
                View All History →
              </button>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs font-mono-code">
              {recentSims.map((sim) => (
                <div
                  key={sim.id}
                  onClick={() => onOpenSimulation(sim)}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-cyan-400">{sim.id}</span>
                    <span className="text-slate-300">Patient: {sim.patientId}</span>
                    <span className="text-slate-400 hidden sm:inline">
                      {new Date(sim.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">
                      {sim.impactParameters[0]?.percentChange}% Dosage Burden
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                      {sim.confidence.overall}% Conf
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Mini Hero Interactive Chromosome 21 Card (Col 3) */}
        <div className="glass-panel rounded-2xl p-5 border border-fuchsia-500/30 hud-corner flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs font-mono-code mb-2">
            <span className="text-fuchsia-400 font-semibold uppercase">Locus Inspector</span>
            <span className="text-slate-400">Drag to Orbit</span>
          </div>

          <div className="relative my-2">
            <canvas ref={chr21CanvasRef} className="cursor-grab active:cursor-grabbing" />
          </div>

          <div className="w-full text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white font-heading">Chromosome 21</span>
              <span className="px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-700 text-[10px] font-mono-code">
                3 Copies Modeled
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-snug">
              Smallest human autosome (~48 Mb). Carries genes involved in synaptic transmission and neurodevelopment (DYRK1A, APP, SOD1).
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('genetics')}
            className="w-full mt-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-mono-code border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Explore 3D Karyotype</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Recent Downloadable Reports List */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-white text-sm">
            Recent Downloadable Doctor Reports
          </h3>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono-code"
          >
            View All Reports ({reports.length}) →
          </button>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs font-mono-code">
          {recentReports.map((rep) => (
            <div
              key={rep.id}
              className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-violet-400" />
                <div>
                  <span className="font-bold text-white block">{rep.title}</span>
                  <span className="text-slate-400 text-[11px]">
                    {rep.id} · Patient: {rep.patientId} · {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenReport(rep)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Preview & Re-download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
