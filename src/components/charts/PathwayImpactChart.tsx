import React, { useRef, useState, useMemo } from 'react';
import { Download, Maximize2, Minimize2, Grid, BarChart3 } from 'lucide-react';
import { exportSvgAsPng } from '../../utils/chartExport';
import { Simulation, PathwayChange } from '../../types';

interface PathwayImpactChartProps {
  simulation?: Simulation;
  comparisonSimulation?: Simulation | null;
  className?: string;
}

export const PathwayImpactChart: React.FC<PathwayImpactChartProps> = ({
  simulation,
  comparisonSimulation,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewMode, setViewMode] = useState<'diverging' | 'heatmap'>('diverging');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPathway, setHoveredPathway] = useState<PathwayChange | null>(null);

  const pathways: PathwayChange[] = useMemo(() => {
    if (!simulation?.pathwayChanges) return [];
    return [...simulation.pathwayChanges].sort((a, b) => a.percentChange - b.percentChange);
  }, [simulation]);

  const handleExportPng = () => {
    if (svgRef.current) {
      exportSvgAsPng(
        svgRef.current,
        `NeuroGeneX_Graph3_${viewMode === 'diverging' ? 'Diverging_Bars' : 'Heatmap'}.png`
      );
    }
  };

  const width = 740;
  const height = 380;
  const padding = { top: 35, right: 40, bottom: 40, left: 240 };
  const chartW = width - padding.left - padding.right;
  const rowHeight = (height - padding.top - padding.bottom) / Math.max(1, pathways.length);

  // Range from -60% to +20% (zero is centered relatively)
  const minPct = -60;
  const maxPct = 20;
  const getX = (pct: number) => {
    const clamped = Math.max(minPct, Math.min(maxPct, pct));
    return padding.left + ((clamped - minPct) / (maxPct - minPct)) * chartW;
  };
  const zeroX = getX(0);

  return (
    <div
      className={`glass-panel rounded-xl p-5 border border-cyan-500/20 hud-corner flex flex-col justify-between ${
        isFullscreen ? 'fixed inset-6 z-50 bg-[#04060F]/95' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            GRAPH 3 · PREDICTED PATHWAY IMPACT
          </span>
          <h4 className="text-base font-heading font-semibold text-white">
            Modeled Relative Percentage Shift with Uncertainty Whiskers
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('diverging')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono-code ${
                viewMode === 'diverging' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Diverging
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono-code ${
                viewMode === 'heatmap' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Matrix
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

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[760px] h-auto select-none font-sans"
        >
          {viewMode === 'diverging' ? (
            <g>
              {/* Vertical Grid lines */}
              {[-60, -45, -30, -15, 0, 15].map((tick) => {
                const x = getX(tick);
                const isZero = tick === 0;
                return (
                  <g key={tick}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={height - padding.bottom}
                      stroke={isZero ? '#E2E8F0' : 'rgba(51, 65, 85, 0.4)'}
                      strokeWidth={isZero ? 1.5 : 1}
                      strokeDasharray={isZero ? 'none' : '2,2'}
                    />
                    <text
                      x={x}
                      y={height - padding.bottom + 16}
                      fill={isZero ? '#E2E8F0' : '#64748B'}
                      fontSize="10"
                      fontFamily="'IBM Plex Mono', monospace"
                      textAnchor="middle"
                    >
                      {tick > 0 ? `+${tick}%` : `${tick}%`}
                    </text>
                  </g>
                );
              })}

              {/* Rows */}
              {pathways.map((item, idx) => {
                const y = padding.top + idx * rowHeight + rowHeight * 0.15;
                const barH = rowHeight * 0.7;
                const barX = item.percentChange < 0 ? getX(item.percentChange) : zeroX;
                const barW = Math.abs(getX(item.percentChange) - zeroX);
                const isHovered = hoveredPathway?.id === item.id;

                // Uncertainty whiskers: min and max bound based on item.uncertainty
                const whiskerDelta = (item.uncertainty / 100) * 12; // in percentage units
                const whiskerMinX = getX(item.percentChange - whiskerDelta);
                const whiskerMaxX = getX(item.percentChange + whiskerDelta);

                const barColor = item.percentChange < 0 ? '#34D399' : '#FBBF24';

                return (
                  <g
                    key={item.id}
                    onMouseEnter={() => setHoveredPathway(item)}
                    onMouseLeave={() => setHoveredPathway(null)}
                    className="cursor-pointer"
                  >
                    {/* Hover strip */}
                    {isHovered && (
                      <rect
                        x={10}
                        y={padding.top + idx * rowHeight}
                        width={width - 20}
                        height={rowHeight}
                        fill="rgba(34, 211, 238, 0.06)"
                        rx="4"
                      />
                    )}

                    {/* Pathway Label (left) */}
                    <text
                      x={padding.left - 12}
                      y={y + barH / 2 + 4}
                      fill={isHovered ? '#FFFFFF' : '#CBD5E1'}
                      fontSize="11"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fontFamily="'Inter', sans-serif"
                      textAnchor="end"
                    >
                      {item.name}
                    </text>

                    {/* Horizontal Bar */}
                    <rect
                      x={barX}
                      y={y}
                      width={Math.max(2, barW)}
                      height={barH}
                      fill={barColor}
                      fillOpacity={isHovered ? 0.95 : 0.75}
                      stroke={barColor}
                      strokeWidth={1}
                      rx="3"
                    />

                    {/* Uncertainty Whisker Line */}
                    <line
                      x1={whiskerMinX}
                      y1={y + barH / 2}
                      x2={whiskerMaxX}
                      y2={y + barH / 2}
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    {/* Whisker caps */}
                    <line
                      x1={whiskerMinX}
                      y1={y + barH / 2 - 4}
                      x2={whiskerMinX}
                      y2={y + barH / 2 + 4}
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    <line
                      x1={whiskerMaxX}
                      y1={y + barH / 2 - 4}
                      x2={whiskerMaxX}
                      y2={y + barH / 2 + 4}
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />

                    {/* Value readout label */}
                    <text
                      x={item.percentChange < 0 ? barX - 8 : barX + barW + 8}
                      y={y + barH / 2 + 4}
                      fill={barColor}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="'IBM Plex Mono', monospace"
                      textAnchor={item.percentChange < 0 ? 'end' : 'start'}
                    >
                      {item.percentChange}%
                    </text>
                  </g>
                );
              })}
            </g>
          ) : (
            /* HEATMAP MATRIX VIEW */
            <g>
              {pathways.map((item, idx) => {
                const y = padding.top + idx * rowHeight;
                const cellH = rowHeight - 4;
                const absPct = Math.min(100, Math.abs(item.percentChange) * 2);
                const isHovered = hoveredPathway?.id === item.id;

                return (
                  <g
                    key={item.id}
                    onMouseEnter={() => setHoveredPathway(item)}
                    onMouseLeave={() => setHoveredPathway(null)}
                    className="cursor-pointer"
                  >
                    <text
                      x={padding.left - 12}
                      y={y + cellH / 2 + 4}
                      fill="#CBD5E1"
                      fontSize="11"
                      fontFamily="'Inter', sans-serif"
                      textAnchor="end"
                    >
                      {item.name}
                    </text>
                    <rect
                      x={padding.left}
                      y={y}
                      width={chartW}
                      height={cellH}
                      fill={`rgba(52, 211, 153, ${0.15 + (absPct / 100) * 0.7})`}
                      stroke="#34D399"
                      strokeWidth={isHovered ? 2 : 0.5}
                      rx="4"
                    />
                    <text
                      x={padding.left + 16}
                      y={y + cellH / 2 + 4}
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="'IBM Plex Mono', monospace"
                    >
                      {item.percentChange}% predicted delta (Uncertainty: ±{item.uncertainty}%)
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Tooltip Bar */}
      {hoveredPathway && (
        <div className="mt-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-cyan-300">{hoveredPathway.name}</span>
            <span className="font-mono-code text-emerald-400 font-bold">
              Delta: {hoveredPathway.percentChange}% (Uncertainty ±{hoveredPathway.uncertainty}%)
            </span>
          </div>
          <p className="text-slate-400">{hoveredPathway.explanation}</p>
        </div>
      )}

      {/* Accessible Text Alternative */}
      <div className="mt-3 text-[11px] text-slate-400 leading-normal border-t border-slate-800/40 pt-2">
        <span className="font-semibold text-slate-300">Accessible Summary:</span> Ranking of modeled pathway shifts. All 7 pathways show predicted reductions ranging from {pathways[0]?.percentChange}% in {pathways[0]?.name} to {pathways[pathways.length - 1]?.percentChange}% in {pathways[pathways.length - 1]?.name}, with individual parameter uncertainty intervals indicated by whiskers.
      </div>
    </div>
  );
};
