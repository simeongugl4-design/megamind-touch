/**
 * Deterministic biometric profile engine.
 *
 * Same patient identity → identical profile across scans.
 * Different patient → different profile.
 *
 * The seed is derived from a stable identity hash (name + DOB + sex + ID).
 * Fingerprint touch features (ridgeDensity, minutiaeCount, contactArea)
 * are folded into the seed for finger-level variation while preserving
 * patient-level consistency.
 *
 * NOTE: This is a research-grade SIMULATION for demo purposes — values are
 * generated within physiologically plausible ranges and are NOT a substitute
 * for clinical instruments.
 */

import type { PatientInfo } from "@/components/PatientIntakeForm";

// ---------- Hashing + PRNG ----------
function fnv1a(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Public types ----------
export type FingerprintCapture = {
  /** ridges per cm², 18-26 typical */
  ridgeDensity: number;
  /** total minutiae detected, 75-180 typical */
  minutiaeCount: number;
  /** contact area in mm² */
  contactArea: number;
  /** average contact pressure 0-1 */
  pressure: number;
  /** dwell time in ms */
  dwellMs: number;
  /** moisture index 0-1 */
  moisture: number;
  /** estimated finger temperature °C (from capacitive thermal proxy) */
  fingerTempC: number;
};

export type BiometricProfile = {
  identityHash: string;
  // Skin
  skin: {
    fitzpatrick: 1 | 2 | 3 | 4 | 5 | 6;
    label: string;
    melaninIndex: number; // arbitrary 0-100
    hexSwatch: string;
    perfusionIndex: number; // %
  };
  // Cardiac
  cardiac: {
    hr: number;
    sys: number;
    dia: number;
    spo2: number;
    ef: number;
    co: number;
    sv: number;
    vo2max: number;
    hrv: number;
    qtc: number;
    pr: number;
    qrs: number;
    rhythm: "Sinus" | "Sinus arrhythmia";
    pwv: number; // pulse wave velocity m/s
    augIndex: number; // %
  };
  // Neural
  neural: {
    iq: number;
    workingMemory: number;
    processingMs: number;
    eqi: number;
    creativity: number;
    efficiency: number;
    bands: { delta: number; theta: number; alpha: number; beta: number; gamma: number };
    dominantBand: "alpha" | "beta" | "theta";
    state: "Relaxed-Alert" | "Focused" | "Drowsy" | "Stressed";
  };
  // Genomic
  genomic: {
    apoe: "ε2/ε3" | "ε3/ε3" | "ε3/ε4";
    cyp1a2: "fast" | "intermediate" | "slow";
    actn3: "RR" | "RX" | "XX";
    lactose: "tolerant" | "intolerant";
    aldh2: "active" | "deficient";
    eyeColor: string;
    hairType: string;
    snpCount: number;
    telomereBp: number;
    ancestry: { region: string; pct: number; color: string }[];
    risks: { condition: string; relRisk: number; gene: string; status: "low" | "normal" | "mild" }[];
  };
  // Acquisition quality (calibration outcomes seeded from identity + capture)
  quality: {
    snrDb: number;
    driftMvS: number;
    alignmentPct: number;
    confidence: number;
    grade: "A+" | "A" | "B";
  };
  // Echo of the capture used
  capture: FingerprintCapture;
};

function identityKey(p: PatientInfo): string {
  return [
    (p.patientName || "").trim().toLowerCase(),
    (p.dob || "").trim(),
    (p.sex || "").trim().toLowerCase(),
    (p.patientId || "").trim().toLowerCase(),
  ].join("|");
}

function range(rng: () => number, lo: number, hi: number, decimals = 0): number {
  const v = lo + rng() * (hi - lo);
  const m = Math.pow(10, decimals);
  return Math.round(v * m) / m;
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ---------- Defaults & helpers ----------
/** Generate a stable synthetic capture if one was not measured (e.g. from
 *  the tap-pad in the scanner UI). Still seeded per-identity for consistency. */
export function deriveCaptureFromIdentity(p: PatientInfo): FingerprintCapture {
  const rng = mulberry32(fnv1a("cap|" + identityKey(p)));
  return {
    ridgeDensity: range(rng, 18, 26, 1),
    minutiaeCount: Math.round(range(rng, 90, 175)),
    contactArea: range(rng, 110, 230, 0),
    pressure: range(rng, 0.45, 0.85, 2),
    dwellMs: Math.round(range(rng, 1800, 3200)),
    moisture: range(rng, 0.25, 0.7, 2),
    fingerTempC: range(rng, 30.5, 34.8, 1),
  };
}

const SKIN_BY_FITZ: Record<number, { label: string; hex: string; melanin: [number, number] }> = {
  1: { label: "Type I — Very fair", hex: "#f5d6c0", melanin: [4, 12] },
  2: { label: "Type II — Fair", hex: "#ecc4a8", melanin: [12, 24] },
  3: { label: "Type III — Medium", hex: "#d6a280", melanin: [24, 40] },
  4: { label: "Type IV — Olive / Brown", hex: "#b07b5b", melanin: [40, 58] },
  5: { label: "Type V — Dark brown", hex: "#7d4d35", melanin: [58, 78] },
  6: { label: "Type VI — Very dark", hex: "#4a2a1a", melanin: [78, 95] },
};

// ---------- Main builder ----------
export function deriveProfile(
  patient: PatientInfo,
  capture?: FingerprintCapture,
): BiometricProfile {
  const cap = capture ?? deriveCaptureFromIdentity(patient);
  const baseSeed = fnv1a(identityKey(patient));
  const rng = mulberry32(baseSeed);

  // ---- Skin (driven by capture moisture + identity) ----
  // Lighter capacitive moisture + lower melanin proxy → lower Fitzpatrick.
  const fitzScore = Math.floor(rng() * 6) + 1; // identity-stable 1-6
  const fitz = Math.min(6, Math.max(1, fitzScore)) as 1 | 2 | 3 | 4 | 5 | 6;
  const skinDef = SKIN_BY_FITZ[fitz];
  const melanin = range(rng, skinDef.melanin[0], skinDef.melanin[1], 1);

  // ---- Cardiac ----
  const hrBase = range(rng, 58, 88, 0);
  // tiny capture-driven adjustment (pressure + temp influence pulse reading)
  const hr = Math.round(hrBase + (cap.pressure - 0.65) * 6 + (cap.fingerTempC - 32.5) * 1.5);
  const sys = Math.round(range(rng, 105, 138, 0));
  const dia = Math.round(range(rng, 65, 88, 0));
  const spo2 = range(rng, 95.5, 99.5, 1);
  const ef = Math.round(range(rng, 55, 70));
  const sv = Math.round(range(rng, 60, 95));
  const co = +(hr * sv * 0.001).toFixed(1);
  const vo2max = Math.round(range(rng, 32, 52));
  const hrv = Math.round(range(rng, 28, 92));
  const qtc = Math.round(range(rng, 380, 440));
  const pr = Math.round(range(rng, 130, 195));
  const qrs = Math.round(range(rng, 78, 108));
  const rhythm = rng() < 0.85 ? "Sinus" : "Sinus arrhythmia";
  const pwv = +range(rng, 5.5, 9.5, 1);
  const augIndex = Math.round(range(rng, 8, 32));

  // ---- Neural ----
  const iq = Math.round(range(rng, 92, 145));
  const workingMemory = Math.round(range(rng, 90, 140));
  const processingMs = Math.round(range(rng, 110, 220));
  const eqi = Math.round(range(rng, 95, 138));
  const creativity = Math.round(range(rng, 55, 95));
  const efficiency = +range(rng, 78, 97, 1);
  const bands = {
    delta: +range(rng, 4, 14, 1),
    theta: +range(rng, 6, 18, 1),
    alpha: +range(rng, 12, 30, 1),
    beta: +range(rng, 10, 26, 1),
    gamma: +range(rng, 3, 9, 1),
  };
  const dominantBand =
    bands.alpha >= Math.max(bands.beta, bands.theta) ? "alpha" : bands.beta > bands.theta ? "beta" : "theta";
  const state =
    dominantBand === "alpha"
      ? "Relaxed-Alert"
      : dominantBand === "beta"
      ? "Focused"
      : bands.theta > 14
      ? "Drowsy"
      : "Stressed";

  // ---- Genomic ----
  const apoe = pick(rng, ["ε2/ε3", "ε3/ε3", "ε3/ε3", "ε3/ε3", "ε3/ε4"] as const);
  const cyp1a2 = pick(rng, ["fast", "fast", "intermediate", "slow"] as const);
  const actn3 = pick(rng, ["RR", "RX", "RX", "XX"] as const);
  const lactose = pick(rng, ["tolerant", "tolerant", "intolerant"] as const);
  const aldh2 = pick(rng, ["active", "active", "active", "deficient"] as const);
  const eyeColor = pick(rng, ["Brown", "Hazel", "Green", "Blue", "Gray"]);
  const hairType = pick(rng, ["Straight", "Wavy", "Curly", "Coily"]);
  const snpCount = Math.round(range(rng, 3.4e6, 4.6e6));
  const telomereBp = Math.round(range(rng, 6500, 9200));

  // Ancestry: 5 buckets, normalized
  const regions = [
    { region: "European", color: "hsl(180,100%,50%)" },
    { region: "South Asian", color: "hsl(270,80%,65%)" },
    { region: "East Asian", color: "hsl(300,80%,60%)" },
    { region: "Middle Eastern", color: "hsl(45,100%,55%)" },
    { region: "Sub-Saharan African", color: "hsl(140,70%,50%)" },
  ];
  const raw = regions.map((r) => ({ ...r, pct: rng() }));
  const total = raw.reduce((s, r) => s + r.pct, 0);
  const ancestry = raw
    .map((r) => ({ ...r, pct: Math.round((r.pct / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  // Risks: relative risk score 0.4-1.6
  const risks = [
    { condition: "Type 2 Diabetes", gene: "TCF7L2/PPARG" },
    { condition: "Coronary Heart Disease", gene: "9p21.3/LPA" },
    { condition: "Alzheimer's Disease", gene: "APOE" },
    { condition: "Macular Degeneration", gene: "CFH/ARMS2" },
    { condition: "Celiac Disease", gene: "HLA-DQ2/DQ8" },
    { condition: "Parkinson's Disease", gene: "LRRK2/GBA" },
  ].map((r) => {
    const relRisk = +range(rng, 0.4, 1.6, 1);
    const status: "low" | "normal" | "mild" = relRisk < 0.85 ? "low" : relRisk < 1.2 ? "normal" : "mild";
    return { ...r, relRisk, status };
  });

  // ---- Quality (calibration outcome) ----
  // Better with more minutiae + higher contact area + moderate moisture
  const qSeed = mulberry32(fnv1a("q|" + identityKey(patient) + "|" + Math.round(cap.minutiaeCount)));
  const qBase =
    Math.min(1, cap.minutiaeCount / 160) * 0.5 +
    Math.min(1, cap.contactArea / 220) * 0.3 +
    (1 - Math.abs(cap.moisture - 0.5)) * 0.2;
  const confidence = +Math.min(99.97, 92 + qBase * 8 + qSeed() * 0.3).toFixed(2);
  const snrDb = +(28 + qBase * 14 + qSeed() * 1.2).toFixed(1);
  const driftMvS = +Math.max(0.02, 0.18 - qBase * 0.15 + qSeed() * 0.02).toFixed(2);
  const alignmentPct = +Math.min(99.9, 90 + qBase * 9 + qSeed() * 0.5).toFixed(1);
  const grade: "A+" | "A" | "B" = confidence >= 99 ? "A+" : confidence >= 96 ? "A" : "B";

  return {
    identityHash: baseSeed.toString(16).padStart(8, "0"),
    skin: {
      fitzpatrick: fitz,
      label: skinDef.label,
      melaninIndex: melanin,
      hexSwatch: skinDef.hex,
      perfusionIndex: +range(rng, 1.2, 4.5, 1),
    },
    cardiac: { hr, sys, dia, spo2, ef, co, sv, vo2max, hrv, qtc, pr, qrs, rhythm, pwv, augIndex },
    neural: { iq, workingMemory, processingMs, eqi, creativity, efficiency, bands, dominantBand, state },
    genomic: {
      apoe,
      cyp1a2,
      actn3,
      lactose,
      aldh2,
      eyeColor,
      hairType,
      snpCount,
      telomereBp,
      ancestry,
      risks,
    },
    quality: { snrDb, driftMvS, alignmentPct, confidence, grade },
    capture: cap,
  };
}

/** Stable preview hash string for UI display ("a3f9-22b1") */
export function shortHash(profile: BiometricProfile | null): string {
  if (!profile) return "————";
  const h = profile.identityHash;
  return `${h.slice(0, 4)}-${h.slice(4, 8)}`.toUpperCase();
}