import React, { useState } from 'react';
import { ExternalLink, Info, BookOpen } from 'lucide-react';

interface GeneAnnotation {
  id: string;
  name: string;
  locus: string;
  fullName: string;
  description: string;
  positionPercent: number; // 0-100 along the 21q arm
  widthPercent: number;
}

const RESEARCH_GENES: GeneAnnotation[] = [
  {
    id: 'app',
    name: 'APP',
    locus: '21q21.3',
    fullName: 'Amyloid Beta Precursor Protein',
    description: 'Integral membrane protein whose cleaved peptides are investigated in synaptic vesicle trafficking and cerebral amyloid dynamics. Illustrative research annotation.',
    positionPercent: 28,
    widthPercent: 6,
  },
  {
    id: 'synj1',
    name: 'SYNJ1',
    locus: '21q22.11',
    fullName: 'Synaptojanin 1',
    description: 'Polyphosphoinositide phosphatase involved in clathrin-mediated synaptic vesicle endocytosis and membrane recycling. Illustrative research annotation.',
    positionPercent: 48,
    widthPercent: 5,
  },
  {
    id: 'ifnar',
    name: 'IFNAR1/2',
    locus: '21q22.11',
    fullName: 'Interferon Alpha/Beta Receptor Cluster',
    description: 'Subunits of the type I interferon receptor complex investigated in innate immune cytokine sensitivity and antiviral signaling pathways. Illustrative research annotation.',
    positionPercent: 56,
    widthPercent: 7,
  },
  {
    id: 'sod1',
    name: 'SOD1',
    locus: '21q22.11',
    fullName: 'Superoxide Dismutase 1',
    description: 'Soluble cytoplasmic antioxidant enzyme converting superoxide radicals into molecular oxygen and hydrogen peroxide. Illustrative research annotation.',
    positionPercent: 66,
    widthPercent: 5,
  },
  {
    id: 'rcan1',
    name: 'RCAN1',
    locus: '21q22.12',
    fullName: 'Regulator of Calcineurin 1',
    description: 'Modulator of calcineurin/NFAT signaling cascades studied in synaptic plasticity, mitochondrial dynamics, and angiogenesis. Illustrative research annotation.',
    positionPercent: 74,
    widthPercent: 6,
  },
  {
    id: 'dyrk1a',
    name: 'DYRK1A',
    locus: '21q22.13',
    fullName: 'Dual Specificity Tyrosine Phosphorylation Regulated Kinase 1A',
    description: 'Proline-directed serine/threonine protein kinase investigated in dendritic arborization, cell cycle exit, and neurogenesis signaling. Illustrative research annotation.',
    positionPercent: 84,
    widthPercent: 8,
  },
];

export const Chr21Ideogram: React.FC = () => {
  const [selectedGene, setSelectedGene] = useState<GeneAnnotation | null>(RESEARCH_GENES[5]); // default DYRK1A

  return (
    <div className="glass-panel rounded-xl p-5 border border-cyan-500/20 hud-corner">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono-code font-semibold">
            CYTOGENETIC MAP
          </span>
          <h3 className="text-lg font-heading font-semibold text-white tracking-wide">
            Chromosome 21q Banded Ideogram
          </h3>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-md border border-slate-700/60 font-mono-code">
          Homo sapiens GRCh38.p14 · 21p13 → 21q22.3 (~46.7 Mb)
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        Select highlighted loci below to view neutral annotations for genes of research interest.
        <span className="text-cyan-300 font-medium ml-1">
          Loci are presented for research context only, NOT as clinical diagnoses or therapeutic targets.
        </span>
      </p>

      {/* Chromosome Ideogram Bar */}
      <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 my-3">
        {/* Arm indicator */}
        <div className="flex justify-between text-[11px] font-mono-code text-slate-400 mb-1 px-1">
          <span>21p (Short Arm)</span>
          <span className="text-violet-400 font-semibold">CEN</span>
          <span>21q (Long Arm - Critical Region 21q21-q22.3)</span>
          <span>q-ter</span>
        </div>

        {/* Visual chromosome banded strip */}
        <div className="relative h-10 w-full rounded-full bg-slate-900 border border-slate-700 flex overflow-hidden shadow-inner">
          {/* p-arm (short) */}
          <div className="w-[12%] h-full bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-r border-slate-600 flex items-center justify-center text-[10px] font-mono-code text-slate-400">
            p11.2
          </div>
          {/* centromere constriction */}
          <div className="w-[4%] h-full bg-slate-950 border-x border-violet-500/50 flex items-center justify-center">
            <div className="w-1 h-6 bg-violet-400 rounded-full animate-pulse" />
          </div>
          {/* q-arm banded sections */}
          <div className="relative flex-1 h-full bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 flex">
            {/* Band divisions */}
            <div className="w-[18%] h-full border-r border-slate-800 bg-slate-800/40" title="q11.2" />
            <div className="w-[20%] h-full border-r border-slate-800 bg-slate-700/30" title="q21.1-21.3" />
            <div className="w-[25%] h-full border-r border-slate-800 bg-slate-800/50" title="q22.1" />
            <div className="w-[20%] h-full border-r border-slate-800 bg-slate-700/40" title="q22.2" />
            <div className="w-[17%] h-full bg-slate-800/60" title="q22.3" />

            {/* Gene locus markers */}
            {RESEARCH_GENES.map((gene) => {
              const isSelected = selectedGene?.id === gene.id;
              return (
                <button
                  key={gene.id}
                  onClick={() => setSelectedGene(gene)}
                  style={{
                    left: `${gene.positionPercent}%`,
                    width: `${gene.widthPercent}%`,
                  }}
                  className={`absolute top-0 bottom-0 transition-all cursor-pointer flex flex-col items-center justify-center group ${
                    isSelected
                      ? 'bg-fuchsia-500/50 border-x-2 border-fuchsia-300 ring-2 ring-fuchsia-400/40 z-10'
                      : 'bg-cyan-500/25 hover:bg-cyan-400/45 border-x border-cyan-400/40'
                  }`}
                  aria-label={`Gene ${gene.name} at locus ${gene.locus}`}
                >
                  <span
                    className={`text-[10px] font-mono-code font-bold truncate px-0.5 ${
                      isSelected ? 'text-white' : 'text-cyan-200 group-hover:text-white'
                    }`}
                  >
                    {gene.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick select chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono-code">Research Loci:</span>
          {RESEARCH_GENES.map((gene) => (
            <button
              key={gene.id}
              onClick={() => setSelectedGene(gene)}
              className={`text-xs px-2.5 py-1 rounded transition-colors font-mono-code ${
                selectedGene?.id === gene.id
                  ? 'bg-fuchsia-600 text-white font-semibold shadow-sm shadow-fuchsia-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
              }`}
            >
              {gene.name} ({gene.locus})
            </button>
          ))}
        </div>
      </div>

      {/* Selected Gene Detail Card */}
      {selectedGene && (
        <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-700/70 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-fuchsia-300 font-heading">
                {selectedGene.name}
              </span>
              <span className="text-slate-400 font-mono-code">({selectedGene.locus})</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-300 font-medium">{selectedGene.fullName}</span>
            </div>
            <span className="text-[11px] font-mono-code text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              Illustrative Annotation
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">{selectedGene.description}</p>
        </div>
      )}

      {/* References & Sources */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Verified External Reference Portals (<span className="text-slate-400">verify current version</span>):
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono-code text-[11px]">
          <a
            href="https://www.ncbi.nlm.nih.gov/genome/gdv/"
            target="_blank"
            rel="noreferrer noopener"
            className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
          >
            NCBI GDV <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=21"
            target="_blank"
            rel="noreferrer noopener"
            className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
          >
            Ensembl <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.omim.org/entry/190685"
            target="_blank"
            rel="noreferrer noopener"
            className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
          >
            OMIM #190685 <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://genome.ucsc.edu"
            target="_blank"
            rel="noreferrer noopener"
            className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
          >
            UCSC Browser <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export const PlainLanguageExplainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-panel rounded-xl p-4 border border-slate-700/60 text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-semibold text-slate-200 hover:text-white"
      >
        <span className="flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-cyan-400" />
          Understanding Trisomy 21 (Plain-Language Explainer)
        </span>
        <span className="text-xs text-cyan-400 font-mono-code">
          {isOpen ? '[ Collapse − ]' : '[ Read Overview + ]'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-slate-300 space-y-2 leading-relaxed">
          <p>
            Typical human genetic makeup consists of 46 chromosomes organized into 23 pairs in almost every cell. Chromosomes carry genetic instructions (DNA) that guide cellular development and daily biological maintenance.
          </p>
          <p>
            Trisomy 21 occurs when an individual has three copies (either free, translocated, or mosaic) of chromosome 21 instead of two, totaling 47 chromosomes in affected cells. Down syndrome is the set of physical and developmental traits associated with this extra chromosome copy.
          </p>
          <p>
            Because chromosome 21 contains several hundred genes, carrying three copies creates a gene-dosage effect: cells produce proportionally more protein product from those specific genes. Researchers study how this gene dosage influences neurodevelopment, mitochondrial function, and cellular metabolism.
          </p>
          <p className="text-slate-400 italic">
            NeuroGeneX provides a computational "what-if" framework to explore hypothetical cellular gene-dosage mathematical models. It does not alter genetic material or provide clinical treatment advice.
          </p>
        </div>
      )}
    </div>
  );
};
