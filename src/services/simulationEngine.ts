import {
  Patient,
  Simulation,
  SimulationAssumptions,
  ImpactParameter,
  PathwayChange,
  SimulationConfidence,
  ResearchInsights,
} from '../types';

/**
 * Mulberry32 32-bit PRNG
 * Deterministic and fast with 100% reproducible outcomes for a given seed.
 */
export function createMulberry32(seed: number) {
  let s = seed >>> 0;
  return function nextFloat(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeedFromPatientId(patientId: string): number {
  let hash = 0;
  for (let i = 0; i < patientId.length; i++) {
    hash = (hash << 5) - hash + patientId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 4242;
}

interface PathwayDef {
  id: string;
  name: string;
  weight: number;
  baselineIndex: number;
  pathwayExtraUncertainty: number;
  explanation: string;
}

const PATHWAY_DEFINITIONS: PathwayDef[] = [
  {
    id: 'gene_dosage_burden',
    name: 'Gene-dosage burden for chr21 genes',
    weight: 1.0,
    baselineIndex: 85,
    pathwayExtraUncertainty: 2,
    explanation: 'Illustrative normalized transcription ratio of triplicated chromosome 21 genetic loci.',
  },
  {
    id: 'neurodev_load',
    name: 'Neurodevelopmental pathway load',
    weight: 0.9,
    baselineIndex: 78,
    pathwayExtraUncertainty: 5,
    explanation: 'Model estimation of signaling load across pathways associated with synaptic plasticity and morphogenesis.',
  },
  {
    id: 'synaptic_balance',
    name: 'Synaptic signaling balance',
    weight: 0.8,
    baselineIndex: 72,
    pathwayExtraUncertainty: 4,
    explanation: 'Theoretical equilibrium index of excitatory-inhibitory synaptic receptor expression.',
  },
  {
    id: 'oxidative_stress',
    name: 'Oxidative stress index',
    weight: 0.7,
    baselineIndex: 75,
    pathwayExtraUncertainty: 3,
    explanation: 'Modeled reactive oxygen species clearance dynamics relating to SOD1 dosage stoichiometry.',
  },
  {
    id: 'amyloid_load',
    name: 'Amyloid processing load',
    weight: 0.75,
    baselineIndex: 70,
    pathwayExtraUncertainty: 6,
    explanation: 'Computational approximation of APP cleavage kinetics and substrate burden.',
  },
  {
    id: 'interferon_signaling',
    name: 'Interferon / immune signaling index',
    weight: 0.6,
    baselineIndex: 68,
    pathwayExtraUncertainty: 5,
    explanation: 'Hypothetical cytokine signaling amplification linked to chr21 interferon receptor clusters (IFNAR1/2).',
  },
  {
    id: 'metabolic_load',
    name: 'Metabolic pathway load',
    weight: 0.5,
    baselineIndex: 64,
    pathwayExtraUncertainty: 3,
    explanation: 'Mitochondrial and cellular bioenergetic throughput estimation.',
  },
];

export const STANDARD_LIMITATIONS = [
  'Model is illustrative and computational; real cellular biology exhibits nonlinear interactions not captured in simplified dosage equations.',
  'Real human cells cannot be "corrected" or modified by this software simulation.',
  'Gene-dosage effects vary substantially by individual genetic background, tissue type, epigenetics, and developmental stage.',
  'Biological mosaicism and structural translocations introduce complex cellular heterogeneity that requires empirical cytogenetics.',
  'No experimental, laboratory, or clinical trial data validates these numerical predictions for patient care.',
  'Outputs must never be used for diagnosis, clinical prognostication, therapeutic selection, or medical treatment decisions.',
];

/**
 * Pure deterministic simulation function.
 * Given a patient record and assumptions, yields identical results every execution.
 */
export function runGeneDosageSimulation(
  patient: Patient,
  assumptions: SimulationAssumptions,
  simulationId: string
): Simulation {
  const prng = createMulberry32(assumptions.randomSeed);

  // 1. Calculate effective trisomic fraction f
  let f = 1.0;
  if (patient.trisomyType === 'Mosaic') {
    const rawPct = (patient.mosaicismPercent ?? 30) / 100;
    f = rawPct * Math.min(1.0, Math.max(0.0, assumptions.mosaicismEffectScaling));
  } else if (patient.trisomyType === 'Robertsonian translocation') {
    f = 1.0;
  } else if (patient.trisomyType === 'Free trisomy 21') {
    f = 1.0;
  } else {
    f = 1.0;
  }

  // 2. Dosage ratios
  const currentRatio = 1.0 + 0.5 * f; // e.g. 1.50 for full trisomy
  const simulatedRatio = 1.0; // Baseline disomic diploid state (46 chromosomes)
  const dosageDelta = currentRatio - simulatedRatio; // 0.5 * f

  // 3. Data completeness penalty calculation
  let dataPenalty = 0;
  if (!patient.testResults || patient.testResults.length === 0) dataPenalty += 4;
  if (!patient.karyotypeNotation || patient.karyotypeNotation.trim() === '') dataPenalty += 3;
  if (!patient.geneticFindings || patient.geneticFindings.trim() === '') dataPenalty += 3;

  // 4. Age modifier calculation
  const age = Math.max(0, Math.min(120, patient.age));
  const ageStrength = assumptions.ageModifierStrength;

  // Compute impacts for each pathway
  const impactParameters: ImpactParameter[] = [];
  const pathwayChanges: PathwayChange[] = [];
  const uncertaintyValues: number[] = [];

  for (const p of PATHWAY_DEFINITIONS) {
    // Age factor tailored per biological domain
    let ageFactor = 0;
    if (p.id === 'amyloid_load') {
      ageFactor = age > 35 ? Math.min(0.3, (age - 35) * 0.01) : -0.15;
    } else if (p.id === 'neurodev_load') {
      ageFactor = age < 18 ? 0.2 : -0.05;
    } else if (p.id === 'oxidative_stress') {
      ageFactor = age > 30 ? 0.12 : 0;
    }

    const ageModifier = 1.0 + ageStrength * ageFactor;

    // PRNG noise bounded strictly at ±3%
    const noiseFraction = (prng() * 2 - 1) * 0.03;

    // Scaling constant for index translation
    const rawReduction =
      p.weight *
      assumptions.geneDosageSensitivity *
      dosageDelta *
      ageModifier *
      46 *
      (1 + noiseFraction);

    const before = p.baselineIndex;
    const after = Math.max(20, Math.min(100, Math.round(before - rawReduction)));
    const change = after - before;
    const percentChange = Math.round((change / before) * 1000) / 10;

    // Uncertainty interval for this parameter
    const paramUncertainty = Math.round(
      assumptions.modelUncertainty + dataPenalty + p.pathwayExtraUncertainty
    );
    uncertaintyValues.push(paramUncertainty);

    const intervalHalfWidth = Math.round((paramUncertainty / 100) * after * 0.65);
    const uncertaintyInterval: [number, number] = [
      Math.max(15, after - intervalHalfWidth),
      Math.min(95, after + intervalHalfWidth),
    ];

    let hedgedNote = 'Hypothetical estimate requiring cytogenetic and biochemical assay confirmation.';
    if (change <= -25) {
      hedgedNote = 'Substantial computational downward shift; illustrative model suggests potential attenuation.';
    } else if (change <= -15) {
      hedgedNote = 'Moderate predicted attenuation; contingent on cell-type specific epigenetic expression.';
    } else {
      hedgedNote = 'Modest predicted shift; secondary regulatory feedback loops may buffer effect.';
    }

    impactParameters.push({
      id: p.id,
      name: p.name,
      before,
      after,
      change,
      percentChange,
      uncertaintyInterval,
      hedgedNote,
    });

    pathwayChanges.push({
      id: p.id,
      name: p.name,
      percentChange,
      direction: percentChange < -2 ? 'decreased' : percentChange > 2 ? 'increased' : 'neutral',
      uncertainty: paramUncertainty,
      explanation: p.explanation,
    });
  }

  // Calculate overall confidence (clamped strictly between 35% and 85%)
  const meanUncertainty =
    uncertaintyValues.reduce((acc, v) => acc + v, 0) / uncertaintyValues.length;
  const overallConfidence = Math.max(35, Math.min(85, Math.round(100 - meanUncertainty)));

  const sourcesOfUncertainty = [
    `Baseline model variance slider setting (±${assumptions.modelUncertainty}%)`,
    `Cellular mosaicism and tissue-level expression distribution (${patient.trisomyType})`,
    `Individual variation in compensatory epigenetic regulatory networks`,
    dataPenalty > 0
      ? `Incomplete patient cytogenetic/clinical record documentation (+${dataPenalty}% uncertainty penalty)`
      : `Laboratory validation requirement for patient-specific molecular assays`,
  ];

  // Generate structured research insights using hedged phrasing
  const topDecreased = [...pathwayChanges].sort((a, b) => a.percentChange - b.percentChange);
  const highestUncertainty = [...pathwayChanges].sort((a, b) => b.uncertainty - a.uncertainty);

  const insights: ResearchInsights = {
    whatSimulationPredicts: [
      `A hypothetical normalization from 3 copies (dosage ratio ${currentRatio.toFixed(2)}) to 2 copies of chromosome 21 is predicted to lower aggregate gene-dosage burden by approximately ${Math.abs(topDecreased[0]?.percentChange || 0)}%.`,
      `Neurodevelopmental pathway load is modeled to decrease by an estimated ${Math.abs(pathwayChanges.find((p) => p.id === 'neurodev_load')?.percentChange || 0)}%, reflecting reduced stoichiometric pressure on downstream effectors.`,
      `Metabolic and oxidative stress indicators show an illustrative downward trajectory, but predicted response remains non-uniform across organ systems.`,
    ],
    biologicalAreasChanging: [
      `Primary attenuation occurs in ${topDecreased[0]?.name || 'gene-dosage burden'} and ${topDecreased[1]?.name || 'neurodevelopmental load'}.`,
      `Amyloid processing kinetics (APP gene dosage) show a modeled ${Math.abs(pathwayChanges.find((p) => p.id === 'amyloid_load')?.percentChange || 0)}% decrease, illustrative of reduced peptide production potential.`,
      `Interferon receptor cluster load is predicted to shift toward typical baseline expression levels in this theoretical model.`,
    ],
    findingsForFurtherResearch: [
      `Further in vitro exploration into whether DYRK1A kinase inhibition mirrors simulated dosage reduction effects.`,
      `Investigation of cell-type specific epigenetic buffering that might mitigate predicted gene-dosage changes in cortical neurons vs glia.`,
      `Biomarker profiling of oxidative phosphorylation markers in relation to predicted metabolic load adjustments.`,
    ],
    whatRemainsUncertain: [
      `Wide confidence interval in ${highestUncertainty[0]?.name} (±${highestUncertainty[0]?.uncertainty}%), where tissue heterogeneity may diverge significantly from model assumptions.`,
      `Influence of non-chromosome 21 modifier genes and polygenic background, which are not represented in this single-chromosome model.`,
      `The degree to which developmental timing influences phenotypic expression; prenatal and postnatal trajectories may differ fundamentally.`,
    ],
  };

  const currentChrCount = patient.trisomyType === 'Mosaic' ? 47 : 47;
  const currentChr21Count = 3;

  return {
    id: simulationId,
    patientId: patient.id,
    createdAt: new Date().toISOString(),
    assumptions: { ...assumptions },
    seed: assumptions.randomSeed,
    currentState: {
      chromosomeCount: currentChrCount,
      chr21Copies: currentChr21Count,
      effectiveTrisomicFraction: f,
      description:
        patient.trisomyType === 'Mosaic'
          ? `Clinician-entered mosaic Trisomy 21 (~${patient.mosaicismPercent ?? 30}% cells triplicated)`
          : `Clinician-entered ${patient.trisomyType} (3 copies of chromosome 21)`,
    },
    simulatedState: {
      chromosomeCount: 46,
      chr21Copies: 2,
      effectiveTrisomicFraction: 0,
      description: 'Hypothetical computational what-if scenario (46 chromosomes, 2 copies of chr21)',
    },
    impactParameters,
    pathwayChanges,
    confidence: {
      overall: overallConfidence,
      explanation:
        'Confidence score is an illustrative computational measure calculated inversely from model parameter uncertainty, record completeness, and biological variance bounds. It is not an empirical certainty value.',
      sourcesOfUncertainty,
    },
    insights,
    limitations: STANDARD_LIMITATIONS,
    userNotes: [],
    tags: [patient.trisomyType, `Seed:${assumptions.randomSeed}`],
  };
}
