import type { BiometricProfile } from "./biometricProfile";

export type MetricVerdict = "excellent" | "good" | "marginal" | "poor";
export type CalibrationLine = {
  metric: "SNR" | "Drift" | "Alignment" | "Confidence";
  value: string;
  verdict: MetricVerdict;
  plain: string;        // clinician-friendly explanation
  action: string;       // actionable recommendation
};

export type CalibrationNarrative = {
  headline: string;
  overallVerdict: MetricVerdict;
  lines: CalibrationLine[];
  summary: string;
  recommendations: string[];
};

const verdictWeight: Record<MetricVerdict, number> = {
  excellent: 3, good: 2, marginal: 1, poor: 0,
};

function pickWorst(a: MetricVerdict, b: MetricVerdict): MetricVerdict {
  return verdictWeight[a] <= verdictWeight[b] ? a : b;
}

/** Convert raw acquisition metrics into clinician-friendly narrative. */
export function interpretCalibration(
  snrDb: number,
  driftMvS: number,
  alignmentPct: number,
  confidence: number,
): CalibrationNarrative {
  const lines: CalibrationLine[] = [];

  // SNR — clinical-grade signal targets ≥ 35 dB (typical bedside monitor)
  const snrV: MetricVerdict =
    snrDb >= 38 ? "excellent" : snrDb >= 32 ? "good" : snrDb >= 25 ? "marginal" : "poor";
  lines.push({
    metric: "SNR",
    value: `${snrDb.toFixed(1)} dB`,
    verdict: snrV,
    plain:
      snrV === "excellent"
        ? "Signal-to-noise is at hospital-grade. Waveform features (P, QRS, T, EEG bands) can be read with high fidelity."
        : snrV === "good"
        ? "Signal is clean enough for routine clinical interpretation. Subtle morphology changes remain detectable."
        : snrV === "marginal"
        ? "Background noise is encroaching on the signal envelope. Low-amplitude features (P-wave, T-wave inversion, gamma EEG) may be missed."
        : "Noise floor exceeds clinical tolerance. Findings should not be acted on until reacquired.",
    action:
      snrV === "excellent" || snrV === "good"
        ? "No action required."
        : "Reseat the finger, ensure dry skin contact, and shield the sensor from EMI sources before re-running.",
  });

  // Drift — baseline wander; target ≤ 0.05 mV/s
  const driftV: MetricVerdict =
    driftMvS <= 0.05 ? "excellent" : driftMvS <= 0.10 ? "good" : driftMvS <= 0.20 ? "marginal" : "poor";
  lines.push({
    metric: "Drift",
    value: `${driftMvS.toFixed(2)} mV/s`,
    verdict: driftV,
    plain:
      driftV === "excellent"
        ? "Baseline is stable. ST-segment and EEG slow-wave morphology are trustworthy."
        : driftV === "good"
        ? "Mild baseline wander present, well within tolerance for rhythm and rate analysis."
        : driftV === "marginal"
        ? "Baseline wander may distort ST-segment elevation/depression and EEG delta-band readings. Interpret these with caution."
        : "Severe baseline drift — ST analysis is unreliable; treat slow-wave readings as artefactual.",
    action:
      driftV === "excellent" || driftV === "good"
        ? "No action required."
        : "Ask the patient to keep the finger still, confirm warm skin temperature, and re-run for 13 s.",
  });

  // Alignment — sensor/feature alignment, target ≥ 98%
  const alignV: MetricVerdict =
    alignmentPct >= 98 ? "excellent" : alignmentPct >= 94 ? "good" : alignmentPct >= 88 ? "marginal" : "poor";
  lines.push({
    metric: "Alignment",
    value: `${alignmentPct.toFixed(1)} %`,
    verdict: alignV,
    plain:
      alignV === "excellent"
        ? "Sensor lattice and minutiae are perfectly registered. Spatial sampling for the surrogate EEG/ECG models is optimal."
        : alignV === "good"
        ? "Acceptable registration. Lead-equivalent reconstructions are accurate to within ±1 mm."
        : alignV === "marginal"
        ? "Misregistration may shift derived ECG axis or EEG channel mapping by 1–2 leads. Confirm channel labels before interpretation."
        : "Severe misalignment — derived channel locations cannot be trusted; do not infer focal pathology.",
    action:
      alignV === "excellent" || alignV === "good"
        ? "No action required."
        : "Recapture with full pad contact, centred on the sensor; verify minutiae count > 100.",
  });

  // Composite confidence
  const confV: MetricVerdict =
    confidence >= 99 ? "excellent" : confidence >= 95 ? "good" : confidence >= 88 ? "marginal" : "poor";
  lines.push({
    metric: "Confidence",
    value: `${confidence.toFixed(1)} %`,
    verdict: confV,
    plain:
      confV === "excellent"
        ? "Composite acquisition score is at the top decile. Findings can be reported with high diagnostic confidence."
        : confV === "good"
        ? "Composite quality is clinically acceptable. Routine findings can be reported."
        : confV === "marginal"
        ? "Composite quality is at the floor of clinical acceptability. Flag any positive findings for repeat testing before clinical action."
        : "Composite quality is sub-clinical. Do not report findings; reacquire.",
    action:
      confV === "excellent"
        ? "Approve for reporting."
        : confV === "good"
        ? "Approve for reporting; note any single sub-optimal metric in the chart."
        : confV === "marginal"
        ? "Repeat acquisition recommended before final report sign-off."
        : "Reacquire — do not sign off this scan.",
  });

  const overall = lines.reduce<MetricVerdict>((acc, l) => pickWorst(acc, l.verdict), "excellent");
  const headline =
    overall === "excellent"
      ? "Calibration: Hospital-grade — safe to report."
      : overall === "good"
      ? "Calibration: Clinically acceptable — routine reporting permitted."
      : overall === "marginal"
      ? "Calibration: Marginal — confirm findings before clinical action."
      : "Calibration: Sub-clinical — do not report, reacquire.";
  const summary =
    overall === "excellent" || overall === "good"
      ? `Acquisition met clinical-grade thresholds across SNR (${snrDb.toFixed(1)} dB), drift (${driftMvS.toFixed(2)} mV/s) and alignment (${alignmentPct.toFixed(1)}%). Composite confidence ${confidence.toFixed(1)}%.`
      : `One or more acquisition channels fell outside clinical-grade thresholds. Composite confidence ${confidence.toFixed(1)}% — see per-metric guidance.`;

  const recommendations: string[] = [];
  lines.forEach((l) => {
    if (l.verdict === "marginal" || l.verdict === "poor") recommendations.push(`${l.metric}: ${l.action}`);
  });
  if (recommendations.length === 0) recommendations.push("Approve scan for clinical reporting and AI interpretation.");

  return { headline, overallVerdict: overall, lines, summary, recommendations };
}

/* ---------------- Sickness screening (risk-only, not diagnosis) ---------------- */

export type SicknessSeverity = "normal" | "watch" | "elevated" | "critical";
export type SicknessFinding = {
  system: "Cardiac" | "Neural" | "Genomic" | "Metabolic" | "Autonomic";
  condition: string;
  severity: SicknessSeverity;
  evidence: string;     // what in the data triggered this
  explanation: string;  // why it matters
  recommendation: string;
  icd10?: string;
};

export type SicknessReport = {
  findings: SicknessFinding[];
  composite: number;          // 0-100, lower = healthier
  triageBand: "Wellness" | "Routine follow-up" | "Same-week consult" | "Urgent consult";
  disclaimer: string;
};

export function screenSickness(profile: BiometricProfile): SicknessReport {
  const f: SicknessFinding[] = [];
  const c = profile.cardiac;
  const n = profile.neural;
  const g = profile.genomic;

  // ----- Cardiac -----
  if (c.hr < 50) f.push({
    system: "Cardiac", condition: "Sinus bradycardia", severity: c.hr < 40 ? "elevated" : "watch",
    evidence: `Resting HR ${c.hr} bpm`,
    explanation: "Heart rate below 50 bpm at rest can reflect athletic conditioning or sinus node dysfunction; symptoms (dizziness, syncope) are the differentiator.",
    recommendation: "If symptomatic, refer for 12-lead ECG and 24-h Holter monitoring.",
    icd10: "R00.1",
  });
  if (c.hr > 100) f.push({
    system: "Cardiac", condition: "Sinus tachycardia", severity: c.hr > 120 ? "elevated" : "watch",
    evidence: `Resting HR ${c.hr} bpm`,
    explanation: "Persistent tachycardia at rest may reflect dehydration, infection, anaemia, anxiety, hyperthyroidism, or arrhythmia.",
    recommendation: "Recheck after 5 min rest; if persistent, order CBC, TSH, and 12-lead ECG.",
    icd10: "R00.0",
  });
  if (c.sys >= 140 || c.dia >= 90) f.push({
    system: "Cardiac", condition: "Stage-2 hypertension risk",
    severity: c.sys >= 160 || c.dia >= 100 ? "elevated" : "watch",
    evidence: `BP ${c.sys}/${c.dia} mmHg`,
    explanation: "BP ≥ 140/90 across multiple readings increases stroke and CHD risk substantially over 10 years.",
    recommendation: "Confirm with two seated readings 1 wk apart; initiate lifestyle counselling and consider antihypertensive therapy.",
    icd10: "I10",
  });
  if (c.spo2 < 94) f.push({
    system: "Cardiac", condition: "Hypoxaemia",
    severity: c.spo2 < 90 ? "critical" : "elevated",
    evidence: `SpO₂ ${c.spo2}%`,
    explanation: "Resting saturation < 94% suggests impaired gas exchange — pulmonary, cardiac, or perfusion-related.",
    recommendation: "Reassess with proper pulse oximeter; if confirmed < 92%, urgent clinical evaluation.",
    icd10: "R09.02",
  });
  if (c.qtc > 460) f.push({
    system: "Cardiac", condition: "Prolonged QTc",
    severity: c.qtc > 500 ? "critical" : "elevated",
    evidence: `QTc ${c.qtc} ms`,
    explanation: "QTc > 460 ms (M) / > 470 ms (F) increases torsades de pointes risk; > 500 ms is high-risk.",
    recommendation: "Review QT-prolonging medications; obtain electrolytes (K⁺, Mg²⁺); cardiology referral if confirmed.",
    icd10: "I45.81",
  });
  if (c.hrv < 25) f.push({
    system: "Autonomic", condition: "Reduced HRV",
    severity: c.hrv < 15 ? "elevated" : "watch",
    evidence: `RMSSD ${c.hrv} ms`,
    explanation: "Low heart-rate variability reflects sympathetic dominance and is a marker for cardiovascular morbidity, chronic stress, and impaired recovery.",
    recommendation: "Sleep optimisation, paced breathing, aerobic conditioning; reassess in 4 wks.",
  });
  if (c.rhythm === "Sinus arrhythmia") f.push({
    system: "Cardiac", condition: "Respiratory sinus arrhythmia",
    severity: "normal",
    evidence: "Beat-to-beat RR variation aligned with respiration",
    explanation: "A physiological finding in healthy individuals; reflects intact vagal tone.",
    recommendation: "No action required.",
  });

  // ----- Neural -----
  if (n.state === "Stressed" || n.bands.beta > 22) f.push({
    system: "Neural", condition: "Elevated cortical arousal",
    severity: n.bands.beta > 25 ? "elevated" : "watch",
    evidence: `β-band ${n.bands.beta} µV, state "${n.state}"`,
    explanation: "Sustained high-beta activity correlates with anxiety, rumination, and impaired sleep onset.",
    recommendation: "Stress-management screening (PHQ-9 / GAD-7); consider mindfulness or CBT referral.",
  });
  if (n.state === "Drowsy" || n.bands.theta > 16) f.push({
    system: "Neural", condition: "Hypoarousal / drowsiness pattern",
    severity: "watch",
    evidence: `θ-band ${n.bands.theta} µV, state "${n.state}"`,
    explanation: "Excess theta during a wakeful task can reflect sleep deprivation or attention dysregulation.",
    recommendation: "Sleep hygiene review; if persistent, screen for sleep-disordered breathing (STOP-BANG).",
  });
  if (n.processingMs > 200) f.push({
    system: "Neural", condition: "Slowed processing speed",
    severity: n.processingMs > 250 ? "elevated" : "watch",
    evidence: `Processing latency ${n.processingMs} ms`,
    explanation: "Above-range latency may reflect fatigue, medication effect, or, if persistent, early cognitive change.",
    recommendation: "Repeat under rested conditions; if persistent, consider MoCA cognitive screen.",
  });

  // ----- Genomic -----
  g.risks.forEach((r) => {
    if (r.relRisk >= 1.3) f.push({
      system: "Genomic", condition: `${r.condition} (genetic susceptibility)`,
      severity: r.relRisk >= 1.5 ? "elevated" : "watch",
      evidence: `Polygenic relative risk ${r.relRisk}× via ${r.gene}`,
      explanation: "A modest elevation in lifetime relative risk; absolute risk depends on age, sex, lifestyle, and other factors.",
      recommendation: "Discuss with primary care; consider earlier or more frequent screening per current guidelines.",
    });
  });
  if (g.apoe === "ε3/ε4") f.push({
    system: "Genomic", condition: "APOE-ε4 carrier",
    severity: "watch",
    evidence: "APOE genotype ε3/ε4",
    explanation: "ε4 carriers carry ~3× lifetime Alzheimer's risk vs ε3/ε3, modifiable by exercise, sleep, BP, and lipid control.",
    recommendation: "Aggressive cardiovascular risk-factor control; cognitive baseline at age 50.",
  });

  // Composite — weight critical highest
  const sevWeight: Record<SicknessSeverity, number> = { normal: 0, watch: 8, elevated: 22, critical: 45 };
  let composite = f.reduce((s, x) => s + sevWeight[x.severity], 0);
  composite = Math.min(100, composite);
  if (f.length === 0) composite = 4;

  const triageBand: SicknessReport["triageBand"] =
    f.some((x) => x.severity === "critical") ? "Urgent consult"
    : f.some((x) => x.severity === "elevated") ? "Same-week consult"
    : f.some((x) => x.severity === "watch") ? "Routine follow-up"
    : "Wellness";

  return {
    findings: f.length ? f : [{
      system: "Cardiac", condition: "No abnormal findings detected", severity: "normal",
      evidence: "All cardiac, neural and genomic markers within deterministic baseline.",
      explanation: "Screening did not surface markers warranting clinical action.",
      recommendation: "Maintain current lifestyle; rescreen per age-appropriate guidelines.",
    }],
    composite,
    triageBand,
    disclaimer:
      "Screening output only — not a diagnosis. Findings are derived from biometric proxies and AI inference. " +
      "Always corroborate with validated medical-grade instruments and clinician judgement before any clinical action.",
  };
}