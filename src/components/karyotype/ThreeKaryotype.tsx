import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Maximize2, Minimize2, RotateCcw, Eye, Sparkles } from 'lucide-react';

export type KaryotypeMode = 'typical' | 'trisomy' | 'sideBySide';

interface ChromosomeSpec {
  num: number | string;
  name: string;
  size: number; // height scale
  width: number;
  row: number;
  col: number;
  description: string;
  isSexChr?: boolean;
}

const CHROMOSOME_DATA: ChromosomeSpec[] = [
  // Row 1: Group A (1-3) & Group B (4-5)
  { num: 1, name: 'Chr 1', size: 3.4, width: 0.38, row: 0, col: 0, description: 'Largest human autosome; ~249 million base pairs, over 2,000 genes.' },
  { num: 2, name: 'Chr 2', size: 3.2, width: 0.36, row: 0, col: 1, description: 'Second-largest autosome; formed by ancestral telomeric fusion.' },
  { num: 3, name: 'Chr 3', size: 2.8, width: 0.35, row: 0, col: 2, description: 'Metacentric chromosome containing ~1,000 coding genes.' },
  { num: 4, name: 'Chr 4', size: 2.7, width: 0.34, row: 0, col: 3.5, description: 'Submetacentric chromosome carrying ~750 coding genes.' },
  { num: 5, name: 'Chr 5', size: 2.6, width: 0.34, row: 0, col: 4.5, description: 'Submetacentric chromosome with ~900 genes.' },

  // Row 2: Group C (6-12)
  { num: 6, name: 'Chr 6', size: 2.4, width: 0.32, row: 1, col: 0, description: 'Carries Major Histocompatibility Complex (MHC) immune genes.' },
  { num: 7, name: 'Chr 7', size: 2.3, width: 0.32, row: 1, col: 1, description: 'Contains CFTR, FOXP2, and ~1,150 protein-coding genes.' },
  { num: 8, name: 'Chr 8', size: 2.2, width: 0.31, row: 1, col: 2, description: 'Submetacentric chromosome; ~145 million base pairs.' },
  { num: 9, name: 'Chr 9', size: 2.1, width: 0.31, row: 1, col: 3, description: 'Carries ABO blood group locus.' },
  { num: 10, name: 'Chr 10', size: 2.0, width: 0.3, row: 1, col: 4, description: 'Submetacentric chromosome with ~800 protein-coding genes.' },
  { num: 11, name: 'Chr 11', size: 1.9, width: 0.3, row: 1, col: 5, description: 'One of the most gene-dense autosomes; contains hemoglobin beta.' },
  { num: 12, name: 'Chr 12', size: 1.9, width: 0.3, row: 1, col: 6, description: 'Home to homeobox gene clusters and ~1,000 coding genes.' },

  // Row 3: Group D (13-15) & Group E (16-18)
  { num: 13, name: 'Chr 13', size: 1.7, width: 0.28, row: 2, col: 0, description: 'Acrocentric chromosome carrying BRCA2 and RB1.' },
  { num: 14, name: 'Chr 14', size: 1.6, width: 0.28, row: 2, col: 1, description: 'Acrocentric; carries immunoglobulin heavy chain locus.' },
  { num: 15, name: 'Chr 15', size: 1.5, width: 0.27, row: 2, col: 2, description: 'Acrocentric; imprinted region involved in Prader-Willi/Angelman.' },
  { num: 16, name: 'Chr 16', size: 1.4, width: 0.27, row: 2, col: 3.5, description: 'Metacentric chromosome with high density of segment duplications.' },
  { num: 17, name: 'Chr 17', size: 1.3, width: 0.26, row: 2, col: 4.5, description: 'Gene-dense; carries TP53 and BRCA1.' },
  { num: 18, name: 'Chr 18', size: 1.3, width: 0.26, row: 2, col: 5.5, description: 'Low gene density; submetacentric.' },

  // Row 4: Group F (19-20), Group G (21-22), Sex (X, Y)
  { num: 19, name: 'Chr 19', size: 1.1, width: 0.24, row: 3, col: 0, description: 'Highest gene density of any human chromosome (~1,400 genes).' },
  { num: 20, name: 'Chr 20', size: 1.0, width: 0.24, row: 3, col: 1, description: 'Metacentric autosome; ~63 million base pairs.' },
  { num: 21, name: 'Chr 21', size: 0.85, width: 0.22, row: 3, col: 2.2, description: 'Smallest human autosome (~48 Mb); carries genes studied in neurodevelopment and related pathways (DYRK1A, APP, SOD1).' },
  { num: 22, name: 'Chr 22', size: 0.9, width: 0.23, row: 3, col: 3.4, description: 'Second acrocentric G-group autosome; ~500 coding genes.' },
  { num: 'X', name: 'Chr X', size: 2.3, width: 0.32, row: 3, col: 5.2, isSexChr: true, description: 'Large sex chromosome; ~155 million base pairs.' },
  { num: 'Y', name: 'Chr Y', size: 0.85, width: 0.22, row: 3, col: 6.2, isSexChr: true, description: 'Male sex-determining chromosome carrying SRY locus.' },
];

interface ThreeKaryotypeProps {
  mode?: KaryotypeMode;
  onModeChange?: (mode: KaryotypeMode) => void;
  isSimulating?: boolean;
  simulationStep?: number; // 0 to 5
  highlightChr21?: boolean;
  showThirdCopyDissolve?: boolean;
  className?: string;
}

export const ThreeKaryotype: React.FC<ThreeKaryotypeProps> = ({
  mode = 'trisomy',
  onModeChange,
  isSimulating = false,
  simulationStep = 0,
  highlightChr21 = true,
  showThirdCopyDissolve = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredChr, setHoveredChr] = useState<ChromosomeSpec | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showA11yTable, setShowA11yTable] = useState(false);

  // References for Three.js scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const thirdCopyRef = useRef<THREE.Group | null>(null);
  const particleGroupRef = useRef<THREE.Points | null>(null);

  const effectiveChr21Count = useMemo(() => {
    if (mode === 'typical') return 2;
    if (showThirdCopyDissolve) return 2;
    return 3;
  }, [mode, showThirdCopyDissolve]);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Ambient and directional lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x22d3ee, 1.4);
    dirLight1.position.set(10, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe879f9, 1.2);
    dirLight2.position.set(-10, -5, 8);
    scene.add(dirLight2);

    // Karyotype Root Group
    const karyotypeGroup = new THREE.Group();
    scene.add(karyotypeGroup);

    // Build Chromosomes
    const meshes = new Map<string, THREE.Object3D>();

    // Helper to build a banded chromosome mesh
    const createChromatid = (
      spec: ChromosomeSpec,
      isChr21: boolean,
      isExtra: boolean
    ) => {
      const group = new THREE.Group();
      const h = spec.size;
      const r = spec.width;

      // Two sister chromatids side-by-side
      const chromatidOffsets = [-r * 0.7, r * 0.7];

      chromatidOffsets.forEach((offset) => {
        // Chromatid arm geometry
        const armGeo = new THREE.CapsuleGeometry(r * 0.55, h * 0.75, 8, 16);

        let color = isChr21 ? 0xe879f9 : 0x06b6d4;
        let emissive = isChr21 ? 0x9333ea : 0x0891b2;
        let emissiveIntensity = isChr21 ? 0.65 : 0.2;

        if (isExtra) {
          color = 0xf43f5e;
          emissive = 0xe11d48;
          emissiveIntensity = 0.85;
        }

        const armMat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.35,
          metalness: 0.25,
          emissive,
          emissiveIntensity,
          transparent: true,
          opacity: 0.92,
        });

        const armMesh = new THREE.Mesh(armGeo, armMat);
        armMesh.position.x = offset;
        group.add(armMesh);

        // Centromere indent ring
        const cenGeo = new THREE.TorusGeometry(r * 0.6, 0.04, 8, 16);
        const cenMat = new THREE.MeshBasicMaterial({
          color: isChr21 ? 0xffffff : 0x22d3ee,
          wireframe: false,
        });
        const cenMesh = new THREE.Mesh(cenGeo, cenMat);
        cenMesh.rotation.x = Math.PI / 2;
        cenMesh.position.x = offset;
        cenMesh.position.y = (h * 0.75) * 0.15; // slightly off-center
        group.add(cenMesh);
      });

      return group;
    };

    // Calculate grid layout positions
    // 4 rows: Y from +3.8 down to -3.8
    // X from -6.5 to +6.5
    const rowYPositions = [3.4, 1.2, -1.0, -3.2];

    CHROMOSOME_DATA.forEach((spec) => {
      const isChr21 = spec.num === 21;
      const colX = (spec.col - 3.2) * 1.8;
      const rowY = rowYPositions[spec.row];

      // Base pair 1 & 2
      const pairGroup = new THREE.Group();
      pairGroup.position.set(colX, rowY, 0);

      // Chr copy 1
      const copy1 = createChromatid(spec, isChr21, false);
      copy1.position.x = -spec.width * 1.4;
      pairGroup.add(copy1);

      // Chr copy 2
      const copy2 = createChromatid(spec, isChr21, false);
      copy2.position.x = spec.width * 1.4;
      pairGroup.add(copy2);

      // If Chr 21, add 3rd copy
      if (isChr21) {
        const copy3 = createChromatid(spec, true, true);
        copy3.position.x = spec.width * 4.0;
        copy3.name = 'chr21_extra_copy';
        pairGroup.add(copy3);
        thirdCopyRef.current = copy3;

        // Glowing targeting ring around 3rd copy
        const ringGeo = new THREE.RingGeometry(spec.width * 1.6, spec.width * 1.9, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.x = spec.width * 4.0;
        copy3.add(ringMesh);
      }

      pairGroup.name = `chr_${spec.num}`;
      (pairGroup as unknown as { userData: { spec: ChromosomeSpec } }).userData = { spec };
      karyotypeGroup.add(pairGroup);
      meshes.set(String(spec.num), pairGroup);
    });

    meshesRef.current = meshes;

    // Dissolve Particle System
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = 0;
      pPos[i * 3 + 1] = 0;
      pPos[i * 3 + 2] = 0;
      pVel[i * 3] = (Math.random() - 0.5) * 0.05;
      pVel[i * 3 + 1] = (Math.random() * 0.06) + 0.01;
      pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe879f9,
      size: 0.12,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(pGeo, pMat);
    scene.add(particlePoints);
    particleGroupRef.current = particlePoints;

    // Raycaster for hover interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(karyotypeGroup.children, true);

      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && parent.parent !== karyotypeGroup && parent.parent !== scene) {
          parent = parent.parent;
        }
        const data = (parent as unknown as { userData?: { spec?: ChromosomeSpec } })?.userData;
        if (data?.spec) {
          setHoveredChr(data.spec);
          return;
        }
      }
      setHoveredChr(null);
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('mousemove', handlePointerMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Soft hovering floating motion for chromosomes
      karyotypeGroup.children.forEach((group, idx) => {
        const floatOffset = Math.sin(elapsedTime * 1.5 + idx * 0.3) * 0.05;
        group.position.z = floatOffset;
      });

      // Special animation on Chr 21
      const chr21Obj = meshes.get('21');
      if (chr21Obj) {
        chr21Obj.rotation.y = Math.sin(elapsedTime * 2.0) * 0.12;
      }

      // Third copy dissolve handling
      if (thirdCopyRef.current && particlePoints) {
        if (showThirdCopyDissolve) {
          thirdCopyRef.current.visible = false;
          (particlePoints.material as THREE.PointsMaterial).opacity = Math.max(
            0,
            1.0 - (elapsedTime % 3) * 0.35
          );

          // Animate particles drifting
          const positions = (particlePoints.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += pVel[i * 3];
            positions[i * 3 + 1] += pVel[i * 3 + 1];
            positions[i * 3 + 2] += pVel[i * 3 + 2];
          }
          (particlePoints.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
        } else {
          thirdCopyRef.current.visible = mode !== 'typical';
          (particlePoints.material as THREE.PointsMaterial).opacity = 0;
        }
      }

      // Camera push-in during simulation sequence
      if (isSimulating && simulationStep >= 1) {
        const targetZ = simulationStep >= 2 ? 8.5 : 12;
        camera.position.z += (targetZ - camera.position.z) * 0.05;
        const targetY = simulationStep >= 2 ? -2.2 : 0;
        camera.position.y += (targetY - camera.position.y) * 0.05;
      } else {
        camera.position.z += (15 - camera.position.z) * 0.05;
        camera.position.y += (0 - camera.position.y) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || 800;
      const h = containerRef.current.clientHeight || 450;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvasEl.removeEventListener('mousemove', handlePointerMove);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [mode, showThirdCopyDissolve, isSimulating, simulationStep]);

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 15);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden glass-panel border border-cyan-500/20 hud-corner ${
        isFullscreen ? 'fixed inset-4 z-50 bg-[#04060F]/95' : 'w-full h-[460px]'
      } ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Top HUD Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Mode selector (Functional buttons) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/80 pointer-events-auto">
          <button
            onClick={() => onModeChange?.('trisomy')}
            className={`text-xs px-2.5 py-1 rounded transition-colors font-mono-code font-medium ${
              mode === 'trisomy'
                ? 'bg-fuchsia-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Trisomy 21 (47)
          </button>
          <button
            onClick={() => onModeChange?.('typical')}
            className={`text-xs px-2.5 py-1 rounded transition-colors font-mono-code font-medium ${
              mode === 'typical'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Typical (46)
          </button>
          <button
            onClick={() => onModeChange?.('sideBySide')}
            className={`text-xs px-2.5 py-1 rounded transition-colors font-mono-code font-medium ${
              mode === 'sideBySide'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Side by Side
          </button>
        </div>

        {/* Status Indicators & View actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Chromosome 21 indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-fuchsia-950/70 border border-fuchsia-500/40 rounded-lg text-xs font-mono-code text-fuchsia-200">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <span>Chr 21 Copies: {effectiveChr21Count}</span>
          </div>

          <button
            onClick={resetView}
            title="Reset Camera View"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowA11yTable(!showA11yTable)}
            title="Toggle Accessible Table View"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Tooltip / HUD Panel */}
      {hoveredChr && (
        <div className="absolute bottom-3 left-3 max-w-md bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 text-xs shadow-xl pointer-events-none animate-fadeIn">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-heading font-bold text-sm text-cyan-300">
              {hoveredChr.name}
            </span>
            {hoveredChr.num === 21 && (
              <span className="px-2 py-0.5 rounded bg-fuchsia-500/30 text-fuchsia-200 font-mono-code text-[10px] border border-fuchsia-400/40">
                Signature Locus · 3 Copies in Trisomy 21
              </span>
            )}
          </div>
          <p className="text-slate-300 leading-snug">{hoveredChr.description}</p>
        </div>
      )}

      {/* Side-by-side comparison overlay pill */}
      {mode === 'sideBySide' && (
        <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-emerald-500/40 p-2.5 rounded-lg text-xs font-mono-code text-slate-200 flex items-center gap-3 shadow-lg pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Typical: 46 chr (2x chr21)</span>
          </div>
          <span className="text-slate-400">vs</span>
          <div className="flex items-center gap-1.5 text-fuchsia-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
            <span>Trisomy 21: 47 chr (+1 copy)</span>
          </div>
        </div>
      )}

      {/* Screen-reader accessible data table toggle */}
      {showA11yTable && (
        <div className="absolute inset-0 z-20 bg-slate-950/95 overflow-y-auto p-6 text-xs text-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-heading font-semibold text-base text-cyan-400">
              Karyotype Accessible Chromosome Register
            </h4>
            <button
              onClick={() => setShowA11yTable(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono-code"
            >
              Close Table View
            </button>
          </div>
          <table className="w-full text-left border-collapse font-mono-code text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-cyan-300">
                <th className="py-2 px-3">Chromosome</th>
                <th className="py-2 px-3">Typical Copies</th>
                <th className="py-2 px-3">Trisomy 21 Copies</th>
                <th className="py-2 px-3">Cytogenetic Notes</th>
              </tr>
            </thead>
            <tbody>
              {CHROMOSOME_DATA.map((chr) => (
                <tr
                  key={String(chr.num)}
                  className={`border-b border-slate-800/80 ${
                    chr.num === 21 ? 'bg-fuchsia-950/40 text-fuchsia-200 font-semibold' : ''
                  }`}
                >
                  <td className="py-2 px-3">{chr.name}</td>
                  <td className="py-2 px-3">{chr.isSexChr ? '1 or 2' : '2'}</td>
                  <td className="py-2 px-3">{chr.num === 21 ? '3 (Extra copy)' : chr.isSexChr ? '1 or 2' : '2'}</td>
                  <td className="py-2 px-3 text-slate-400">{chr.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
