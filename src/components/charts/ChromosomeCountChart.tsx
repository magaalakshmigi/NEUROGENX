import React, { useRef, useState } from 'react';
import { Download, Maximize2, Minimize2, BarChart2, Layers } from 'lucide-react';
import { exportSvgAsPng } from '../../utils/chartExport';
import { Simulation } from '../../types';

interface ChromosomeCountChartProps {
  simulation?: Simulation;
  comparisonSimulation?: Simulation | null;
  className?: string;
}

export const ChromosomeCountChart: React.FC<ChromosomeCountChartProps> = ({
  simulation,
  comparisonSimulation,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showChr21SubPanel, setShowChr21SubPanel] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const currentChrCount = simulation?.currentState.chromosomeCount ?? 47;
  const simulatedChrCount = simulation?.simulatedState.chromosomeCount ?? 46;
  const currentChr21 = simulation?.currentState.chr21Copies ?? 3;
  const simulatedChr21 = simulation?.simulatedState.chr21Copies ?? 2;

  const handleExportPng = () => {
    if (svgRef.current) {
      exportSvgAsPng(svgRef.current, `NeuroGeneX_Graph1_Chromosome_Count.png`);
    }
  };

  // Chart dimensions
  const width = 640;
  const height = 340;
  const padding = { top: 45, right: 30, bottom: 50, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Y-axis range: 40 to 48 (axis break indicator at bottom)
  const yMin = 40;
  const yMax = 48;
  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padding.top + chartH - ((clamped - yMin) / (yMax - yMin)) * chartH;
  };

  const totalBars = [
    {
      id: 'typical',
      label: 'Typical Human',
      val: 46,
      chr21: 2,
      color: '#22D3EE',
      bgGlow: 'rgba(34, 211, 238, 0.25)',
      description: 'Standard diploid karyotype (46,XX or 46,XY)',
    },
    {
      id: 'down_syndrome',
      label: 'Down Syndrome (Current)',
      val: currentChrCount,
      chr21: currentChr21,
      color: '#E879F9',
      secondaryColor: '#FBBF24',
      bgGlow: 'rgba(232, 121, 249, 0.35)',
      description: 'Clinician-entered karyotype with triplication of chromosome 21',
      badge: '+1 Chromosome (chr21)',
    },
    {
      id: 'simulated',
      label: 'Simulated Scenario',
      val: simulatedChrCount,
      chr21: simulatedChr21,
      color: '#34D399',
      bgGlow: 'rgba(52, 211, 153, 0.25)',
      description: 'Hypothetical computational what-if scenario (46 chromosomes, 2x chr21)',
    },
  ];

  const barWidth = 64;
  const spacing = chartW / 3;

  return (
    <div
      className={`glass-panel rounded-xl p-5 border border-cyan-500/20 hud-corner flex flex-col justify-between ${
        isFullscreen ? 'fixed inset-6 z-50 bg-[#04060F]/95' : ''
      } ${className}`}
    >
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            GRAPH 1 · CHROMOSOME COUNT COMPARISON
          </span>
          <h4 className="text-base font-heading font-semibold text-white">
            Karyotype Total & Chromosome 21 Copies
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChr21SubPanel(!showChr21SubPanel)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono-code border border-slate-700"
            title="Toggle Chromosome 21 specific copies sub-panel"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chr 21 Panel</span>
          </button>

          <button
            onClick={handleExportPng}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono-code border border-slate-700"
            title="Export high-resolution PNG"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>PNG</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full overflow-x-auto flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[680px] h-auto select-none font-sans"
        >
          {/* Defs for gradients & filters */}
          <defs>
            <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0891B2" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="t21Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E879F9" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[40, 42, 44, 46, 47, 48].map((val) => {
            const y = getY(val);
            const isHighlight = val === 46 || val === 47;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isHighlight ? 'rgba(148, 163, 184, 0.25)' : 'rgba(51, 65, 85, 0.3)'}
                  strokeDasharray={val === 47 ? '4,4' : 'none'}
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  fill={isHighlight ? '#94A3B8' : '#475569'}
                  fontSize="11"
                  fontFamily="'IBM Plex Mono', monospace"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Y Axis Break Indicator (zigzag between 0 and 40) */}
          <g transform={`translate(${padding.left - 6}, ${getY(40.2)})`}>
            <path
              d="M -4,6 L 4,2 L -4,-2 L 4,-6"
              fill="none"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            <text
              x="-18"
              y="18"
              fill="#64748B"
              fontSize="9"
              fontFamily="'IBM Plex Mono', monospace"
            >
              // 0-40
            </text>
          </g>

          {/* Render Bars */}
          {totalBars.map((b, i) => {
            const x = padding.left + i * spacing + (spacing - barWidth) / 2;
            const y = getY(b.val);
            const barHeight = getY(40) - y;
            const isHovered = hoveredBar === b.id;

            return (
              <g
                key={b.id}
                onMouseEnter={() => setHoveredBar(b.id)}
                onMouseLeave={() => setHoveredBar(null)}
                className="cursor-pointer transition-opacity"
              >
                {/* Glow backdrop on hover */}
                {isHovered && (
                  <rect
                    x={x - 6}
                    y={y - 6}
                    width={barWidth + 12}
                    height={barHeight + 6}
                    fill={b.bgGlow}
                    rx="8"
                  />
                )}

                {/* Primary Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={
                    b.id === 'typical'
                      ? 'url(#cyanGrad)'
                      : b.id === 'down_syndrome'
                      ? 'url(#t21Grad)'
                      : 'url(#simGrad)'
                  }
                  stroke={b.color}
                  strokeWidth={isHovered ? 2 : 1}
                  rx="6"
                />

                {/* Top Value Label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 12}
                  fill={b.color}
                  fontSize="18"
                  fontWeight="bold"
                  fontFamily="'Orbitron', 'Space Grotesk', sans-serif"
                  textAnchor="middle"
                >
                  {b.val}
                </text>

                {/* Category Label */}
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartH + 20}
                  fill={isHovered ? '#FFFFFF' : '#94A3B8'}
                  fontSize="11"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="'Inter', sans-serif"
                  textAnchor="middle"
                >
                  {b.label}
                </text>

                {/* Badge annotation on Trisomy 21 */}
                {b.badge && (
                  <g transform={`translate(${x + barWidth / 2}, ${y - 30})`}>
                    <rect
                      x="-70"
                      y="-12"
                      width="140"
                      height="20"
                      rx="4"
                      fill="#831843"
                      stroke="#F43F5E"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="2"
                      fill="#FFE4E6"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="'IBM Plex Mono', monospace"
                      textAnchor="middle"
                    >
                      {b.badge}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Comparison Overlay (if compare mode is active) */}
          {comparisonSimulation && (
            <g>
              <line
                x1={padding.left}
                y1={getY(comparisonSimulation.currentState.chromosomeCount)}
                x2={width - padding.right}
                y2={getY(comparisonSimulation.currentState.chromosomeCount)}
                stroke="#FBBF24"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <text
                x={width - padding.right - 8}
                y={getY(comparisonSimulation.currentState.chromosomeCount) - 6}
                fill="#FBBF24"
                fontSize="10"
                fontFamily="'IBM Plex Mono', monospace"
                textAnchor="end"
              >
                Comparison ({comparisonSimulation.id}): {comparisonSimulation.currentState.chromosomeCount}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Sub-panel: Chromosome 21 Copies */}
      {showChr21SubPanel && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-around gap-2 text-xs font-mono-code bg-slate-900/50 p-2.5 rounded-lg">
          <span className="text-slate-400 font-semibold">Chr 21 Copies:</span>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Typical: 2 copies</span>
          </div>
          <div className="flex items-center gap-1.5 text-fuchsia-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <span>Current: 3 copies (+1 extra)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Simulated: 2 copies (Hypothetical)</span>
          </div>
        </div>
      )}

      {/* Accessible Text Alternative */}
      <div className="mt-3 text-[11px] text-slate-400 leading-normal border-t border-slate-800/40 pt-2">
        <span className="font-semibold text-slate-300">Accessible Summary:</span> Typical human karyotype contains 46 total chromosomes with 2 copies of chromosome 21. Down syndrome karyotype contains {currentChrCount} total chromosomes with {currentChr21} copies of chromosome 21. The simulated computational what-if scenario models a return to {simulatedChrCount} total chromosomes and {simulatedChr21} copies of chromosome 21.
      </div>
    </div>
  );
};
