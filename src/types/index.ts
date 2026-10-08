export type Trisomy21Status =
  | 'Reported Trisomy 21'
  | 'Reported mosaic'
  | 'Reported translocation'
  | 'Not reported'
  | 'Unknown';

export type TrisomyType =
  | 'Free trisomy 21'
  | 'Robertsonian translocation'
  | 'Mosaic'
  | 'Not available';

export type PatientSex = 'Female' | 'Male' | 'Intersex' | 'Not specified';
export type PatientStatus = 'Draft' | 'Complete' | 'Simulated';

export interface TestResult {
  id: string;
  name: string;
  date: string;
  value: string;
  unit: string;
  notes?: string;
}

export interface Patient {
  id: string; // e.g. "NGX-P-0001"
  createdAt: string;
  updatedAt: string;
  age: number; // 0 to 120
  sex: PatientSex;
  trisomy21Status: Trisomy21Status; // Clinician-entered data
  karyotypeNotation: string; // e.g. "47,XX,+21"
  trisomyType: TrisomyType;
  mosaicismPercent?: number; // 0 to 100
  geneticFindings: string;
  medicalHistory: string;
  medicalHistoryTags: string[]; // cardiac, thyroid, hearing, vision, sleep, cognitive, other
  testResults: TestResult[];
  clinicianNotes: string;
  dataSources: string[];
  status: PatientStatus;
  isDemo?: boolean;
}

export interface SimulationAssumptions {
  geneDosageSensitivity: number; // 0.5 to 1.5, default 1.0
  modelUncertainty: number; // 5 to 40, default 15 (%)
  ageModifierStrength: number; // 0 to 1, default 0.5
  mosaicismEffectScaling: number; // 0 to 1, default 1.0
  randomSeed: number; // integer
}

export interface ImpactParameter {
  id: string;
  name: string;
  before: number; // normalized index 0-100
  after: number; // normalized index 0-100
  change: number; // after - before
  percentChange: number; // (change / before) * 100
  uncertaintyInterval: [number, number]; // [min, max]
  hedgedNote: string;
}

export interface PathwayChange {
  id: string;
  name: string;
  percentChange: number;
  direction: 'decreased' | 'increased' | 'neutral';
  uncertainty: number;
  explanation: string;
}

export interface SimulationConfidence {
  overall: number; // 35 to 85%
  explanation: string;
  sourcesOfUncertainty: string[];
}

export interface ResearchInsights {
  whatSimulationPredicts: string[];
  biologicalAreasChanging: string[];
  findingsForFurtherResearch: string[];
  whatRemainsUncertain: string[];
}

export interface SimulationNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Simulation {
  id: string; // e.g. "NGX-S-0001"
  patientId: string;
  createdAt: string; // ISO date-time
  assumptions: SimulationAssumptions;
  seed: number;
  currentState: {
    chromosomeCount: number;
    chr21Copies: number;
    effectiveTrisomicFraction: number;
    description: string;
  };
  simulatedState: {
    chromosomeCount: number;
    chr21Copies: number;
    effectiveTrisomicFraction: number;
    description: string;
  };
  impactParameters: ImpactParameter[];
  pathwayChanges: PathwayChange[];
  confidence: SimulationConfidence;
  insights: ResearchInsights;
  limitations: string[];
  userNotes: SimulationNote[];
  tags: string[];
  runDurationMs?: number;
}

export interface Report {
  id: string; // e.g. "NGX-R-20261008-0101"
  patientId: string;
  simulationId: string;
  createdAt: string;
  title: string;
  notes?: string;
  includedSections?: {
    patientInfo: boolean;
    geneticFindings: boolean;
    simulationDetails: boolean;
    graphs: boolean;
    impactTable: boolean;
    pathwayTable: boolean;
    insights: boolean;
    confidence: boolean;
    limitations: boolean;
    notes: boolean;
    references: boolean;
  };
}

export interface AppSettings {
  clinicalMode: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  scanlines: boolean;
  filmGrain: boolean;
  particleDensity: 'low' | 'medium' | 'high';
  autoSaveSimulations: boolean;
}

export const EXACT_DISCLAIMER =
  "NeuroGeneX is a computational research simulation and record-management prototype. It does not diagnose, treat, or genetically modify patients. Simulation results are hypothetical predictions and require laboratory and clinical validation before any medical conclusions can be made.";

export const WHAT_IF_BANNER_TEXT =
  "This is a computational what-if simulation. It does NOT alter DNA and provides NO instructions for genetic modification.";
