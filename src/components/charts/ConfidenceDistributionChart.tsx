import React, { useRef, useState } from 'react';
import { Download, Maximize2, Minimize2, Sliders, TrendingUp } from 'lucide-react';
import { exportSvgAsPng } from '../../utils/chartExport';
import { Simulation } from '../../types';

interface ConfidenceDistributionChartProps {
  simulation?: Simulation;
  comparisonSimulation?: Simulation | null;
  className?: string;
}

export const ConfidenceDistributionChart: React.FC<ConfidenceDistributionChartProps> = ({
  simulation,
  comparisonSimulation,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'distribution' | 'intervals'>('distribution');

  const overallConfidence = simulation?.confidence.overall ?? 68; // 35 to 85%
  const modelUncertainty = simulation?.assumptions.modelUncertainty ?? 15;
  const impactParameters = simulation?.impactParameters ?? [];

  const handleExportPng = () => {
    if (svgRef.current) {
      exportSvgAsPng(svgRef.current, `NeuroGeneX_Graph4_Confidence_Distribution.png`);
    }
  };

  // Dimensions
  const width = 740;
  const height = 360;

  // Gaussian Bell curve generation for probability distribution
  // Mean around -31% overall reduction, standard deviation mapped to model uncertainty
  const meanImpact = -31.5;
  const stdDev = 4.2 + (modelUncertainty / 40) * 5.0;

  const normalPdf = (x: number, mean: number, sd: number) => {
    return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2));
  };

  const xMin = -55;
  const xMax = -5;
  const padding = { top: 40, right: 230, bottom: 50, left: 50 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const getPlotX = (xVal: number) => {
    return padding.left + ((xVal - xMin) / (xMax - xMin)) * plotW;
  };

  const maxDensity = normalPdf(meanImpact, meanImpact, stdDev);
  const getPlotY = (density: number) => {
    return padding.top + plotH - (density / (maxDensity * 1.15)) * plotH;
  };

  // Generate points along the curve
  const curvePoints: Array<{ x: number; y: number; val: number }> = [];
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const val = xMin + (i / steps) * (xMax - xMin);
    const d = normalPdf(val, meanImpact, stdDev);
    curvePoints.push({ x: getPlotX(val), y: getPlotY(d), val });
  }

  const fullPathD =
    `M ${curvePoints[0].x},${getPlotY(0)} ` +
    curvePoints.map((p) => `L ${p.x},${p.y}`).join(' ') +
    ` L ${curvePoints[curvePoints.length - 1].x},${getPlotY(0)} Z`;

  // Shaded confidence interval zones (95%, 80%, 50%)
  const getIntervalPath = (zScore: number) => {
    const low = meanImpact - zScore * stdDev;
    const high = meanImpact + zScore * stdDev;
    const subPoints = curvePoints.filter((p) => p.val >= low && p.val <= high);
    if (subPoints.length < 2) return '';
    return (
      `M ${subPoints[0].x},${getPlotY(0)} ` +
      subPoints.map((p) => `L ${p.x},${p.y}`).join(' ') +
      ` L ${subPoints[subPoints.length - 1].x},${getPlotY(0)} Z`
    );
  };

  const path95 = getIntervalPath(1.96);
  const path80 = getIntervalPath(1.28);
  const path50 = getIntervalPath(0.674);

  // Radial Gauge coordinates (Right panel)
  const gaugeCenterX = width - 110;
  const gaugeCenterY = height / 2 - 10;
  const gaugeRadius = 60;
  const gaugeStartAngle = Math.PI * 0.75;
  const gaugeEndAngle = Math.PI * 2.25;
  const gaugeTotalAngle = gaugeEndAngle - gaugeStartAngle;
  const confidenceFraction = (overallConfidence - 35) / (85 - 35); // normalized between 35% and 85% bounds
  const currentGaugeAngle = gaugeStartAngle + confidenceFraction * gaugeTotalAngle;

  const getGaugeArc = (r: number, a1: number, a2: number) => {
    const x1 = gaugeCenterX + r * Math.cos(a1);
    const y1 = gaugeCenterY + r * Math.sin(a1);
    const x2 = gaugeCenterX + r * Math.cos(a2);
    const y2 = gaugeCenterY + r * Math.sin(a2);
    const largeArc = a2 - a1 > Math.PI ? 1 : 0;
    return `M ${x1},${y1} A ${r},${r} 0 ${largeArc} 1 ${x2},${y2}`;
  };

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
            GRAPH 4 · CONFIDENCE & UNCERTAINTY PROFILE
          </span>
          <h4 className="text-base font-heading font-semibold text-white">
            Model Variance Distribution & 95% Confidence Intervals
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('distribution')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono-code ${
                activeTab === 'distribution' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Distribution Curve
            </button>
            <button
              onClick={() => setActiveTab('intervals')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono-code ${
                activeTab === 'intervals' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Error Intervals
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
          {activeTab === 'distribution' ? (
            /* PROBABILITY DENSITY CURVE */
            <g>
              {/* X Axis ticks */}
              {[-50, -40, -30, -20, -10].map((val) => {
                const x = getPlotX(val);
                return (
                  <g key={val}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + plotH}
                      stroke="rgba(51, 65, 85, 0.3)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={x}
                      y={padding.top + plotH + 16}
                      fill="#64748B"
                      fontSize="10"
                      fontFamily="'IBM Plex Mono', monospace"
                      textAnchor="middle"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Shaded bands */}
              <path d={path95} fill="rgba(34, 211, 238, 0.12)" />
              <path d={path80} fill="rgba(34, 211, 238, 0.22)" />
              <path d={path50} fill="rgba(34, 211, 238, 0.35)" />

              {/* Curve line */}
              <path
                d={curvePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#22D3EE"
                strokeWidth="2.5"
              />

              {/* Mean Center line */}
              <line
                x1={getPlotX(meanImpact)}
                y1={padding.top + 10}
                x2={getPlotX(meanImpact)}
                y2={padding.top + plotH}
                stroke="#F43F5E"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
              <text
                x={getPlotX(meanImpact)}
                y={padding.top - 6}
                fill="#FDA4AF"
                fontSize="10"
                fontFamily="'IBM Plex Mono', monospace"
                textAnchor="middle"
              >
                μ = {meanImpact.toFixed(1)}%
              </text>

              {/* Legend under plot */}
              <g transform={`translate(${padding.left}, ${height - 12})`}>
                <rect x="0" y="-8" width="12" height="8" fill="rgba(34, 211, 238, 0.35)" rx="2" />
                <text x="18" y="-1" fill="#94A3B8" fontSize="9" fontFamily="'IBM Plex Mono', monospace">
                  50% CI
                </text>

                <rect x="75" y="-8" width="12" height="8" fill="rgba(34, 211, 238, 0.22)" rx="2" />
                <text x="93" y="-1" fill="#94A3B8" fontSize="9" fontFamily="'IBM Plex Mono', monospace">
                  80% CI
                </text>

                <rect x="150" y="-8" width="12" height="8" fill="rgba(34, 211, 238, 0.12)" rx="2" />
                <text x="168" y="-1" fill="#94A3B8" fontSize="9" fontFamily="'IBM Plex Mono', monospace">
                  95% Empirical Interval
                </text>
              </g>
            </g>
          ) : (
            /* ERROR BARS & 95% INTERVALS FOR KEY PARAMETERS */
            <g>
              {impactParameters.map((p, idx) => {
                const rowH = plotH / impactParameters.length;
                const y = padding.top + idx * rowH + rowH * 0.5;
                const minX = padding.left + (p.uncertaintyInterval[0] / 100) * plotW;
                const maxX = padding.left + (p.uncertaintyInterval[1] / 100) * plotW;
                const valX = padding.left + (p.after / 100) * plotW;

                return (
                  <g key={p.id}>
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      fill="#CBD5E1"
                      fontSize="10"
                      fontFamily="'Inter', sans-serif"
                      textAnchor="end"
                    >
                      {p.name.length > 20 ? p.name.substring(0, 18) + '…' : p.name}
                    </text>

                    {/* Range Whisker Bar */}
                    <line x1={minX} y1={y} x2={maxX} y2={y} stroke="#38BDF8" strokeWidth="2" />
                    <line x1={minX} y1={y - 5} x2={minX} y2={y + 5} stroke="#38BDF8" strokeWidth="2" />
                    <line x1={maxX} y1={y - 5} x2={maxX} y2={y + 5} stroke="#38BDF8" strokeWidth="2" />

                    {/* Midpoint Dot */}
                    <circle cx={valX} cy={y} r="4" fill="#34D399" stroke="#064E3B" strokeWidth="1.5" />

                    {/* Readout */}
                    <text
                      x={maxX + 8}
                      y={y + 4}
                      fill="#94A3B8"
                      fontSize="9"
                      fontFamily="'IBM Plex Mono', monospace"
                    >
                      [{p.uncertaintyInterval[0]}–{p.uncertaintyInterval[1]}]
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* RIGHT SIDE: OVERALL CONFIDENCE RADIAL GAUGE */}
          <g>
            {/* Background Arch */}
            <path
              d={getGaugeArc(gaugeRadius, gaugeStartAngle, gaugeEndAngle)}
              fill="none"
              stroke="#1E293B"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Active Confidence Arch */}
            <path
              d={getGaugeArc(gaugeRadius, gaugeStartAngle, currentGaugeAngle)}
              fill="none"
              stroke="#22D3EE"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Overall Score Number */}
            <text
              x={gaugeCenterX}
              y={gaugeCenterY}
              fill="#FFFFFF"
              fontSize="24"
              fontWeight="bold"
              fontFamily="'Orbitron', sans-serif"
              textAnchor="middle"
            >
              {overallConfidence}%
            </text>
            <text
              x={gaugeCenterX}
              y={gaugeCenterY + 16}
              fill="#94A3B8"
              fontSize="9"
              fontFamily="'IBM Plex Mono', monospace"
              textAnchor="middle"
            >
              CONFIDENCE
            </text>

            <text
              x={gaugeCenterX}
              y={gaugeCenterY + 54}
              fill="#64748B"
              fontSize="9"
              fontFamily="'IBM Plex Mono', monospace"
              textAnchor="middle"
            >
              Model Uncertainty: ±{modelUncertainty}%
            </text>
          </g>
        </svg>
      </div>

      {/* Accessible Text Alternative */}
      <div className="mt-3 text-[11px] text-slate-400 leading-normal border-t border-slate-800/40 pt-2">
        <span className="font-semibold text-slate-300">Accessible Summary:</span> Calculated overall model confidence score is {overallConfidence}% (derived inversely from model uncertainty setting of {modelUncertainty}% and cytogenetic completeness). The modeled probability density curve estimates mean aggregate pathway shift centered at {meanImpact.toFixed(1)}% with shaded 50%, 80%, and 95% confidence intervals.
      </div>
    </div>
  );
};
