import React, { useRef, useState } from 'react';
import { Download, Maximize2, Minimize2, BarChart2, Compass } from 'lucide-react';
import { exportSvgAsPng } from '../../utils/chartExport';
import { Simulation, ImpactParameter } from '../../types';

interface BeforeAfterRadarBarChartProps {
  simulation?: Simulation;
  comparisonSimulation?: Simulation | null;
  className?: string;
}

export const BeforeAfterRadarBarChart: React.FC<BeforeAfterRadarBarChartProps> = ({
  simulation,
  comparisonSimulation,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewMode, setViewMode] = useState<'bar' | 'radar'>('bar');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBefore, setShowBefore] = useState(true);
  const [showAfter, setShowAfter] = useState(true);
  const [hoveredParam, setHoveredParam] = useState<string | null>(null);

  const parameters: ImpactParameter[] = simulation?.impactParameters ?? [
    { id: 'gene_dosage_burden', name: 'Gene-dosage burden', before: 85, after: 52, change: -33, percentChange: -38.8, uncertaintyInterval: [44, 60], hedgedNote: 'Illustrative' },
    { id: 'neurodev_load', name: 'Neurodevelopmental load', before: 78, after: 50, change: -28, percentChange: -35.9, uncertaintyInterval: [41, 59], hedgedNote: 'Illustrative' },
    { id: 'synaptic_balance', name: 'Synaptic balance', before: 72, after: 48, change: -24, percentChange: -33.3, uncertaintyInterval: [40, 56], hedgedNote: 'Illustrative' },
    { id: 'oxidative_stress', name: 'Oxidative stress index', before: 75, after: 53, change: -22, percentChange: -29.3, uncertaintyInterval: [45, 61], hedgedNote: 'Illustrative' },
    { id: 'amyloid_load', name: 'Amyloid processing load', before: 70, after: 46, change: -24, percentChange: -34.3, uncertaintyInterval: [38, 54], hedgedNote: 'Illustrative' },
    { id: 'interferon_signaling', name: 'Interferon signaling', before: 68, after: 49, change: -19, percentChange: -27.9, uncertaintyInterval: [41, 57], hedgedNote: 'Illustrative' },
    { id: 'metabolic_load', name: 'Metabolic load', before: 64, after: 48, change: -16, percentChange: -25.0, uncertaintyInterval: [41, 55], hedgedNote: 'Illustrative' },
  ];

  const handleExportPng = () => {
    if (svgRef.current) {
      exportSvgAsPng(
        svgRef.current,
        `NeuroGeneX_Graph2_${viewMode === 'bar' ? 'Grouped_Bar' : 'Radar'}.png`
      );
    }
  };

  // Dimensions
  const width = 740;
  const height = 400;

  // Bar chart geometry
  const padding = { top: 40, right: 30, bottom: 90, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const getY = (val: number) => padding.top + chartH - (val / 100) * chartH;

  // Radar chart geometry
  const radarCenterX = width / 2;
  const radarCenterY = height / 2 + 10;
  const radarRadius = 140;
  const numAxes = parameters.length;

  const getRadarPoint = (index: number, val: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const r = (val / 100) * radarRadius;
    return {
      x: radarCenterX + r * Math.cos(angle),
      y: radarCenterY + r * Math.sin(angle),
    };
  };

  // Build Radar Polygon paths
  const beforePolygon = parameters
    .map((p, idx) => {
      const pt = getRadarPoint(idx, p.before);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const afterPolygon = parameters
    .map((p, idx) => {
      const pt = getRadarPoint(idx, p.after);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const comparisonPolygon = comparisonSimulation
    ? comparisonSimulation.impactParameters
        .map((p, idx) => {
          const pt = getRadarPoint(idx, p.after);
          return `${pt.x},${pt.y}`;
        })
        .join(' ')
    : '';

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
            GRAPH 2 · BEFORE VS SIMULATED AFTER
          </span>
          <h4 className="text-base font-heading font-semibold text-white">
            Normalized Biological Parameter Loads (0–100 Index)
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('bar')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono-code ${
                viewMode === 'bar' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Bar
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono-code ${
                viewMode === 'radar' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Radar
            </button>
          </div>

          {/* Interactive Legend / Series Toggles */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700 text-xs font-mono-code">
            <button
              onClick={() => setShowBefore(!showBefore)}
              className={`flex items-center gap-1.5 transition-opacity ${
                showBefore ? 'opacity-100 text-fuchsia-300' : 'opacity-40 text-slate-500 line-through'
              }`}
              title="Click to toggle Before series"
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-fuchsia-400" />
              <span>Current (3x)</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setShowAfter(!showAfter)}
              className={`flex items-center gap-1.5 transition-opacity ${
                showAfter ? 'opacity-100 text-emerald-300' : 'opacity-40 text-slate-500 line-through'
              }`}
              title="Click to toggle Simulated After series"
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <span>Simulated (2x)</span>
            </button>
          </div>

          <button
            onClick={handleExportPng}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono-code border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> PNG
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-x-auto flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[760px] h-auto select-none"
        >
          {viewMode === 'bar' ? (
            /* GROUPED BAR CHART VIEW */
            <g>
              {/* Horizontal Grid lines */}
              {[0, 20, 40, 60, 80, 100].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="rgba(51, 65, 85, 0.35)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      fill="#64748B"
                      fontSize="10"
                      fontFamily="'IBM Plex Mono', monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Bars per Parameter */}
              {parameters.map((p, idx) => {
                const groupWidth = chartW / parameters.length;
                const groupX = padding.left + idx * groupWidth;
                const singleBarWidth = Math.min(22, groupWidth * 0.34);
                const isHovered = hoveredParam === p.id;

                const beforeY = getY(p.before);
                const beforeH = getY(0) - beforeY;
                const afterY = getY(p.after);
                const afterH = getY(0) - afterY;

                return (
                  <g
                    key={p.id}
                    onMouseEnter={() => setHoveredParam(p.id)}
                    onMouseLeave={() => setHoveredParam(null)}
                    className="cursor-pointer"
                  >
                    {/* Hover highlight background */}
                    {isHovered && (
                      <rect
                        x={groupX + 4}
                        y={padding.top}
                        width={groupWidth - 8}
                        height={chartH}
                        fill="rgba(34, 211, 238, 0.05)"
                        rx="6"
                      />
                    )}

                    {/* Bar 1: Current (Before) */}
                    {showBefore && (
                      <g>
                        <rect
                          x={groupX + groupWidth / 2 - singleBarWidth - 2}
                          y={beforeY}
                          width={singleBarWidth}
                          height={beforeH}
                          fill="#E879F9"
                          fillOpacity="0.85"
                          stroke="#F43F5E"
                          strokeWidth={isHovered ? 2 : 1}
                          rx="4"
                        />
                        <text
                          x={groupX + groupWidth / 2 - singleBarWidth / 2 - 2}
                          y={beforeY - 6}
                          fill="#F43F5E"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="'IBM Plex Mono', monospace"
                          textAnchor="middle"
                        >
                          {p.before}
                        </text>
                      </g>
                    )}

                    {/* Bar 2: Simulated (After) */}
                    {showAfter && (
                      <g>
                        <rect
                          x={groupX + groupWidth / 2 + 2}
                          y={afterY}
                          width={singleBarWidth}
                          height={afterH}
                          fill="#34D399"
                          fillOpacity="0.85"
                          stroke="#10B981"
                          strokeWidth={isHovered ? 2 : 1}
                          rx="4"
                        />
                        <text
                          x={groupX + groupWidth / 2 + singleBarWidth / 2 + 2}
                          y={afterY - 6}
                          fill="#34D399"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="'IBM Plex Mono', monospace"
                          textAnchor="middle"
                        >
                          {p.after}
                        </text>
                      </g>
                    )}

                    {/* Delta label badge */}
                    <rect
                      x={groupX + groupWidth / 2 - 18}
                      y={getY(0) + 6}
                      width="36"
                      height="16"
                      rx="3"
                      fill="#064E3B"
                      stroke="#059669"
                      strokeWidth="0.8"
                    />
                    <text
                      x={groupX + groupWidth / 2}
                      y={getY(0) + 18}
                      fill="#6EE7B7"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="'IBM Plex Mono', monospace"
                      textAnchor="middle"
                    >
                      {p.change}
                    </text>

                    {/* Parameter Label (rotated slightly for legibility) */}
                    <text
                      x={groupX + groupWidth / 2}
                      y={getY(0) + 36}
                      fill={isHovered ? '#FFFFFF' : '#94A3B8'}
                      fontSize="10"
                      fontFamily="'Inter', sans-serif"
                      textAnchor="end"
                      transform={`rotate(-28, ${groupX + groupWidth / 2}, ${getY(0) + 36})`}
                    >
                      {p.name.length > 20 ? p.name.substring(0, 18) + '…' : p.name}
                    </text>
                  </g>
                );
              })}
            </g>
          ) : (
            /* RADAR / SPIDER CHART VIEW */
            <g>
              {/* Concentric Polygons */}
              {[20, 40, 60, 80, 100].map((level) => {
                const ringPoints = parameters
                  .map((_, idx) => {
                    const pt = getRadarPoint(idx, level);
                    return `${pt.x},${pt.y}`;
                  })
                  .join(' ');

                return (
                  <g key={level}>
                    <polygon
                      points={ringPoints}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray={level === 100 ? 'none' : '3,3'}
                    />
                    <text
                      x={radarCenterX + 6}
                      y={radarCenterY - (level / 100) * radarRadius + 4}
                      fill="#64748B"
                      fontSize="9"
                      fontFamily="'IBM Plex Mono', monospace"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Radial Axis Spokes & Labels */}
              {parameters.map((p, idx) => {
                const pt = getRadarPoint(idx, 100);
                const labelPt = getRadarPoint(idx, 118);
                const isHovered = hoveredParam === p.id;

                return (
                  <g
                    key={p.id}
                    onMouseEnter={() => setHoveredParam(p.id)}
                    onMouseLeave={() => setHoveredParam(null)}
                    className="cursor-pointer"
                  >
                    <line
                      x1={radarCenterX}
                      y1={radarCenterY}
                      x2={pt.x}
                      y2={pt.y}
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <text
                      x={labelPt.x}
                      y={labelPt.y}
                      fill={isHovered ? '#22D3EE' : '#94A3B8'}
                      fontSize="10"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fontFamily="'Inter', sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}

              {/* Before polygon area */}
              {showBefore && (
                <polygon
                  points={beforePolygon}
                  fill="rgba(232, 121, 249, 0.22)"
                  stroke="#E879F9"
                  strokeWidth="2.5"
                />
              )}

              {/* After polygon area */}
              {showAfter && (
                <polygon
                  points={afterPolygon}
                  fill="rgba(52, 211, 153, 0.28)"
                  stroke="#34D399"
                  strokeWidth="2.5"
                />
              )}

              {/* Comparison polygon outline */}
              {comparisonSimulation && comparisonPolygon && (
                <polygon
                  points={comparisonPolygon}
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="2"
                  strokeDasharray="5,4"
                />
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Accessible Text Alternative */}
      <div className="mt-3 text-[11px] text-slate-400 leading-normal border-t border-slate-800/40 pt-2">
        <span className="font-semibold text-slate-300">Accessible Summary:</span> Modeled normalized load indices comparing baseline elevated state vs simulated disomic state across 7 biological pathways. Largest modeled attenuation occurs in {parameters[0]?.name} (Current {parameters[0]?.before} → Simulated {parameters[0]?.after}, Δ {parameters[0]?.change}) and {parameters[1]?.name} (Current {parameters[1]?.before} → Simulated {parameters[1]?.after}, Δ {parameters[1]?.change}).
      </div>
    </div>
  );
};
