import {
  Patient,
  Simulation,
  Report,
  AppSettings,
} from '../types';
import { runGeneDosageSimulation } from './simulationEngine';

const PATIENTS_KEY = 'neurogenex_patients_v1';
const SIMULATIONS_KEY = 'neurogenex_simulations_v1';
const REPORTS_KEY = 'neurogenex_reports_v1';
const SETTINGS_KEY = 'neurogenex_settings_v1';
const AUTH_KEY = 'neurogenex_auth_session';
const DISCLAIMER_ACK_KEY = 'neurogenex_disclaimer_ack';

export const DEFAULT_SETTINGS: AppSettings = {
  clinicalMode: false,
  soundEnabled: false,
  reducedMotion: false,
  scanlines: true,
  filmGrain: true,
  particleDensity: 'medium',
  autoSaveSimulations: true,
};

export const INITIAL_DEMO_PATIENTS: Patient[] = [
  {
    id: 'NGX-P-0001',
    createdAt: '2026-09-15T08:30:00Z',
    updatedAt: '2026-10-02T14:15:00Z',
    age: 9,
    sex: 'Female',
    trisomy21Status: 'Reported Trisomy 21',
    karyotypeNotation: '47,XX,+21',
    trisomyType: 'Free trisomy 21',
    geneticFindings: 'Constitutional G-banded karyotype confirms non-disjunction free trisomy 21 in all 30 examined metaphase spreads. Array CGH demonstrates copy number duplication spanning the q-arm of chromosome 21 without structural breaks.',
    medicalHistory: 'History of closed atrial septal defect (percutaneously repaired at age 3). Stable euthyroid state maintained on replacement therapy. Routine pediatric ophthalmology review indicates mild hyperopia.',
    medicalHistoryTags: ['cardiac', 'thyroid', 'vision'],
    testResults: [
      {
        id: 't-001',
        name: 'Serum Free T4',
        date: '2026-08-14',
        value: '1.24',
        unit: 'ng/dL',
        notes: 'Within age-adjusted target range',
      },
      {
        id: 't-002',
        name: 'Transthoracic Echocardiogram',
        date: '2026-06-20',
        value: 'Normal LVEF 64%',
        unit: '%',
        notes: 'No residual shunt; normal pulmonary pressures',
      },
      {
        id: 't-003',
        name: 'High-Sensitivity CRP',
        date: '2026-08-14',
        value: '0.8',
        unit: 'mg/L',
        notes: 'Baseline inflammatory marker nominal',
      },
    ],
    clinicianNotes: 'Patient engages actively in multimodal educational therapy. Demonstrates progressive expressive language acquisition with speech therapy support. Monitored biannually.',
    dataSources: [
      'NCBI Genome Data Viewer (Homo sapiens GRCh38.p14)',
      'GeneReviews: Down Syndrome (Trisomy 21)',
      'Clinical Cytogenetics Reference Standards (ACMG)',
    ],
    status: 'Simulated',
    isDemo: true,
  },
  {
    id: 'NGX-P-0002',
    createdAt: '2026-09-18T10:15:00Z',
    updatedAt: '2026-10-04T11:45:00Z',
    age: 28,
    sex: 'Male',
    trisomy21Status: 'Reported mosaic',
    karyotypeNotation: '47,XY,+21[35]/46,XY[65]',
    trisomyType: 'Mosaic',
    mosaicismPercent: 35,
    geneticFindings: 'Peripheral blood lymphocyte karyotype (100 metaphases scored): 35 cells demonstrate 47,XY,+21 and 65 cells demonstrate 46,XY. Consistent with post-zygotic mitotic non-disjunction mosaicism.',
    medicalHistory: 'Obstructive sleep apnea managed with continuous positive airway pressure (CPAP). Moderate bilateral high-frequency sensorineural hearing threshold shift monitored annually.',
    medicalHistoryTags: ['sleep', 'hearing'],
    testResults: [
      {
        id: 't-004',
        name: 'Polysomnography (AHI)',
        date: '2026-05-11',
        value: '4.2',
        unit: 'events/hr',
        notes: 'Adequately controlled on nightly CPAP at 9 cm H2O',
      },
      {
        id: 't-005',
        name: 'Pure Tone Audiometry',
        date: '2026-07-02',
        value: '28',
        unit: 'dB threshold',
        notes: 'Bilateral mild sensorineural threshold shift',
      },
      {
        id: 't-006',
        name: 'Thyroid Stimulating Hormone',
        date: '2026-09-01',
        value: '2.45',
        unit: 'mIU/L',
        notes: 'Normal euthyroid profile',
      },
    ],
    clinicianNotes: 'Works in community botanical nursery. Excellent social engagement and adaptive functioning skills. Regular annual sleep clinic and audiogram follow-up.',
    dataSources: [
      'Ensembl GRCh38 Cytogenetic Mapping',
      'OMIM #190685 (Down Syndrome)',
    ],
    status: 'Simulated',
    isDemo: true,
  },
  {
    id: 'NGX-P-0003',
    createdAt: '2026-09-22T09:00:00Z',
    updatedAt: '2026-10-06T16:20:00Z',
    age: 17,
    sex: 'Female',
    trisomy21Status: 'Reported translocation',
    karyotypeNotation: '46,XX,rob(14;21)(q10;q10),+21',
    trisomyType: 'Robertsonian translocation',
    geneticFindings: 'Unbalanced Robertsonian translocation involving the long arms of chromosome 14 and chromosome 21, resulting in effective three functional gene copies of 21q.',
    medicalHistory: 'Mild subclinical hypothyroidism with anti-TPO positivity; managed with low-dose levothyroxine. Normal cardiac structure on baseline congenital echocardiogram.',
    medicalHistoryTags: ['thyroid', 'cognitive'],
    testResults: [
      {
        id: 't-007',
        name: 'Anti-Thyroid Peroxidase (TPO)',
        date: '2026-06-19',
        value: '78',
        unit: 'IU/mL',
        notes: 'Elevated autoimmune antibody titer',
      },
      {
        id: 't-008',
        name: 'Serum Free T4',
        date: '2026-09-10',
        value: '1.18',
        unit: 'ng/dL',
        notes: 'Euthyroid target attained on 50 mcg levothyroxine',
      },
      {
        id: 't-009',
        name: 'Cognitive Composite Inventory',
        date: '2026-04-12',
        value: '68',
        unit: 'standard score',
        notes: 'Strong visual-spatial reasoning relative to verbal sequencing',
      },
    ],
    clinicianNotes: 'Completing secondary vocational curriculum. Family genetic counseling completed regarding parental carrier testing (maternal karyotype confirmed de novo translocation).',
    dataSources: [
      'UCSC Genome Browser hg38',
      'GeneReviews: Robertsonian Translocation Down Syndrome',
    ],
    status: 'Simulated',
    isDemo: true,
  },
  {
    id: 'NGX-P-0004',
    createdAt: '2026-09-25T13:40:00Z',
    updatedAt: '2026-10-07T09:10:00Z',
    age: 41,
    sex: 'Male',
    trisomy21Status: 'Reported Trisomy 21',
    karyotypeNotation: '47,XY,+21',
    trisomyType: 'Free trisomy 21',
    geneticFindings: 'Confirmed standard non-disjunction 47,XY,+21 across peripheral metaphases. Baseline genomic array review documents consistent triplication across the 21q21-q22.3 critical region.',
    medicalHistory: 'Early neurocognitive baseline evaluation initiated. Baseline euthyroid profile. History of cervical spine radiograph clearance (normal atlantodens interval without craniocervical instability).',
    medicalHistoryTags: ['cognitive', 'thyroid', 'vision'],
    testResults: [
      {
        id: 't-010',
        name: 'Baseline MoCA (Adapted for DS)',
        date: '2026-08-05',
        value: '22',
        unit: '/30',
        notes: 'Stable longitudinal baseline established',
      },
      {
        id: 't-011',
        name: 'Plasma Amyloid Beta 42/40 Ratio',
        date: '2026-08-05',
        value: '0.088',
        unit: 'ratio',
        notes: 'Biomarker research assay; illustrative baseline',
      },
      {
        id: 't-012',
        name: 'Serum Vitamin B12',
        date: '2026-07-22',
        value: '450',
        unit: 'pg/mL',
        notes: 'Adequate micronutrient stores',
      },
    ],
    clinicianNotes: 'Enrolled in longitudinal adult health surveillance. Active participant in community supported employment. Memory and daily living function assessed annually.',
    dataSources: [
      'GeneReviews: Down Syndrome Adult Care Guidelines',
      'OMIM #190685',
    ],
    status: 'Simulated',
    isDemo: true,
  },
  {
    id: 'NGX-P-0005',
    createdAt: '2026-09-29T11:20:00Z',
    updatedAt: '2026-10-07T15:00:00Z',
    age: 2,
    sex: 'Female',
    trisomy21Status: 'Reported Trisomy 21',
    karyotypeNotation: '47,XX,+21',
    trisomyType: 'Free trisomy 21',
    geneticFindings: 'Postnatal cytogenetic confirmation of 47,XX,+21 in 20/20 peripheral blood lymphocytes. Fluorescent in situ hybridization (FISH) with locus-specific probe confirms three hybridization signals.',
    medicalHistory: 'Complete atrioventricular septal defect (AVSD) successfully repaired at 4 months of age; postoperative recovery uneventful. Currently enrolled in early intervention occupational and physical therapy.',
    medicalHistoryTags: ['cardiac', 'hearing'],
    testResults: [
      {
        id: 't-013',
        name: 'Postoperative Pediatric Echo',
        date: '2026-07-15',
        value: 'Mild mitral valve regurgitation',
        unit: 'grade I',
        notes: 'Good biventricular function, no residual shunt',
      },
      {
        id: 't-014',
        name: 'Auditory Brainstem Response (ABR)',
        date: '2026-08-02',
        value: 'Bilateral wave V at 25 dB',
        unit: 'dB nHL',
        notes: 'Adequate auditory neural pathway transmission',
      },
    ],
    clinicianNotes: 'Milestones progressing steadily with weekly pediatric physical and speech therapy. Pediatric cardiology follow-up scheduled in 6 months.',
    dataSources: [
      'AAP Health Supervision for Children with Down Syndrome',
      'NCBI Genome Data Viewer',
    ],
    status: 'Complete',
    isDemo: true,
  },
];

export function seedInitialSimulations(patients: Patient[]): Simulation[] {
  const sims: Simulation[] = [];

  // Patient 1 (NGX-P-0001) - Run 1
  const p1 = patients[0];
  const sim1 = runGeneDosageSimulation(
    p1,
    {
      geneDosageSensitivity: 1.0,
      modelUncertainty: 15,
      ageModifierStrength: 0.5,
      mosaicismEffectScaling: 1.0,
      randomSeed: 4091,
    },
    'NGX-S-0001'
  );
  sim1.createdAt = '2026-09-20T10:12:00Z';
  sim1.userNotes = [
    {
      id: 'n-1',
      text: 'Baseline gene-dosage run with default uncertainty bounds. Illustrates expected 33% copy ratio attenuation.',
      createdAt: '2026-09-20T10:20:00Z',
    },
  ];
  sims.push(sim1);

  // Patient 1 (NGX-P-0001) - Run 2 with higher dosage sensitivity
  const sim2 = runGeneDosageSimulation(
    p1,
    {
      geneDosageSensitivity: 1.25,
      modelUncertainty: 20,
      ageModifierStrength: 0.6,
      mosaicismEffectScaling: 1.0,
      randomSeed: 7721,
    },
    'NGX-S-0002'
  );
  sim2.createdAt = '2026-09-28T14:40:00Z';
  sim2.userNotes = [
    {
      id: 'n-2',
      text: 'Exploratory sensitivity analysis evaluating higher kinase dosage impact (sensitivity 1.25).',
      createdAt: '2026-09-28T14:45:00Z',
    },
  ];
  sims.push(sim2);

  // Patient 2 (NGX-P-0002) - Mosaic simulation
  const p2 = patients[1];
  const sim3 = runGeneDosageSimulation(
    p2,
    {
      geneDosageSensitivity: 1.0,
      modelUncertainty: 18,
      ageModifierStrength: 0.5,
      mosaicismEffectScaling: 1.0,
      randomSeed: 5543,
    },
    'NGX-S-0003'
  );
  sim3.createdAt = '2026-10-01T09:25:00Z';
  sim3.userNotes = [
    {
      id: 'n-3',
      text: 'Evaluated with 35% mosaicism scaling. Attenuation is proportional to trisomic cellular fraction.',
      createdAt: '2026-10-01T09:30:00Z',
    },
  ];
  sims.push(sim3);

  // Patient 3 (NGX-P-0003) - Translocation
  const p3 = patients[2];
  const sim4 = runGeneDosageSimulation(
    p3,
    {
      geneDosageSensitivity: 0.95,
      modelUncertainty: 14,
      ageModifierStrength: 0.5,
      mosaicismEffectScaling: 1.0,
      randomSeed: 6319,
    },
    'NGX-S-0004'
  );
  sim4.createdAt = '2026-10-03T16:10:00Z';
  sims.push(sim4);

  // Patient 4 (NGX-P-0004) - Adult 41yo (amyloid pathway focus)
  const p4 = patients[3];
  const sim5 = runGeneDosageSimulation(
    p4,
    {
      geneDosageSensitivity: 1.1,
      modelUncertainty: 16,
      ageModifierStrength: 0.8,
      mosaicismEffectScaling: 1.0,
      randomSeed: 8812,
    },
    'NGX-S-0005'
  );
  sim5.createdAt = '2026-10-05T11:05:00Z';
  sim5.userNotes = [
    {
      id: 'n-4',
      text: 'Higher age-modifier strength reflects modeled amyloid processing dynamics in mature adulthood.',
      createdAt: '2026-10-05T11:15:00Z',
    },
  ];
  sims.push(sim5);

  // Patient 5 (NGX-P-0005) - Infant 2yo (neurodev focus)
  const p5 = patients[4];
  const sim6 = runGeneDosageSimulation(
    p5,
    {
      geneDosageSensitivity: 1.0,
      modelUncertainty: 12,
      ageModifierStrength: 0.7,
      mosaicismEffectScaling: 1.0,
      randomSeed: 2209,
    },
    'NGX-S-0006'
  );
  sim6.createdAt = '2026-10-07T13:30:00Z';
  sims.push(sim6);

  return sims;
}

export const INITIAL_DEMO_REPORTS: Report[] = [
  {
    id: 'NGX-R-20261001-0104',
    patientId: 'NGX-P-0001',
    simulationId: 'NGX-S-0001',
    createdAt: '2026-10-01T10:30:00Z',
    title: 'Baseline Gene-Dosage Attenuation Exploration',
    notes: 'Generated for longitudinal genetic research rounds. Comparative assessment against reference karyotype.',
  },
  {
    id: 'NGX-R-20261005-0211',
    patientId: 'NGX-P-0004',
    simulationId: 'NGX-S-0005',
    createdAt: '2026-10-05T14:45:00Z',
    title: 'Adult Neurometabolic Pathway Load Analysis',
    notes: 'Computational exploration of APP cleavage kinetics and oxidative stress indices.',
  },
];

export const storage = {
  getPatients(): Patient[] {
    try {
      const raw = localStorage.getItem(PATIENTS_KEY);
      if (!raw) {
        localStorage.setItem(PATIENTS_KEY, JSON.stringify(INITIAL_DEMO_PATIENTS));
        return INITIAL_DEMO_PATIENTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_PATIENTS;
    }
  },

  savePatient(patient: Patient): void {
    const list = this.getPatients();
    const idx = list.findIndex((p) => p.id === patient.id);
    if (idx >= 0) {
      list[idx] = { ...patient, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...patient, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(list));
  },

  deletePatient(id: string): void {
    const list = this.getPatients().filter((p) => p.id !== id);
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(list));
  },

  getSimulations(): Simulation[] {
    try {
      const raw = localStorage.getItem(SIMULATIONS_KEY);
      if (!raw) {
        const seeded = seedInitialSimulations(this.getPatients());
        localStorage.setItem(SIMULATIONS_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw);
    } catch {
      return seedInitialSimulations(this.getPatients());
    }
  },

  saveSimulation(simulation: Simulation): void {
    const list = this.getSimulations();
    const idx = list.findIndex((s) => s.id === simulation.id);
    if (idx >= 0) {
      list[idx] = simulation;
    } else {
      list.unshift(simulation);
    }
    localStorage.setItem(SIMULATIONS_KEY, JSON.stringify(list));
  },

  deleteSimulation(id: string): void {
    const list = this.getSimulations().filter((s) => s.id !== id);
    localStorage.setItem(SIMULATIONS_KEY, JSON.stringify(list));
  },

  getReports(): Report[] {
    try {
      const raw = localStorage.getItem(REPORTS_KEY);
      if (!raw) {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
        return INITIAL_DEMO_REPORTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_REPORTS;
    }
  },

  saveReport(report: Report): void {
    const list = this.getReports();
    const idx = list.findIndex((r) => r.id === report.id);
    if (idx >= 0) {
      list[idx] = report;
    } else {
      list.unshift(report);
    }
    localStorage.setItem(REPORTS_KEY, JSON.stringify(list));
  },

  deleteReport(id: string): void {
    const list = this.getReports().filter((r) => r.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(list));
  },

  getSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  isDisclaimerAcknowledged(): boolean {
    return localStorage.getItem(DISCLAIMER_ACK_KEY) === 'acknowledged_true';
  },

  setDisclaimerAcknowledged(): void {
    localStorage.setItem(DISCLAIMER_ACK_KEY, 'acknowledged_true');
  },

  isAuthenticated(): boolean {
    return sessionStorage.getItem(AUTH_KEY) === 'auth_session_active';
  },

  setAuthenticated(active: boolean): void {
    if (active) {
      sessionStorage.setItem(AUTH_KEY, 'auth_session_active');
    } else {
      sessionStorage.removeItem(AUTH_KEY);
    }
  },

  resetDemoData(): void {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(INITIAL_DEMO_PATIENTS));
    const seeded = seedInitialSimulations(INITIAL_DEMO_PATIENTS);
    localStorage.setItem(SIMULATIONS_KEY, JSON.stringify(seeded));
    localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  },

  exportAllData(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patients: this.getPatients(),
      simulations: this.getSimulations(),
      reports: this.getReports(),
      settings: this.getSettings(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.patients && Array.isArray(parsed.patients)) {
        localStorage.setItem(PATIENTS_KEY, JSON.stringify(parsed.patients));
      }
      if (parsed.simulations && Array.isArray(parsed.simulations)) {
        localStorage.setItem(SIMULATIONS_KEY, JSON.stringify(parsed.simulations));
      }
      if (parsed.reports && Array.isArray(parsed.reports)) {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(parsed.reports));
      }
      if (parsed.settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.settings));
      }
      return true;
    } catch {
      return false;
    }
  },
};
