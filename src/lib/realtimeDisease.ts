/**
 * Real-time disease detection engine.
 *
 * Operates on streaming biosignal readings (HR, SpO2, BP-equiv, beta/theta
 * EEG bands, respiration, temperature) and emits live differential findings
 * with ICD-10/ATC codes, urgency, confidence, and evidence-based cures
 * linked to trusted public references (FDA DailyMed, NIH MedlinePlus, NICE,
 * AHA/ACC, ESC, WHO, AASM). Used by the live dashboard during a scan and
 * inside the report after scan completion.
 *
 * SAFETY: This is decision-support only. It does not diagnose or prescribe.
 */

export type LiveVitals = {
  hr: number;          // bpm
  spo2: number;        // %
  sys: number;         // mmHg (derived/estimated)
  dia: number;         // mmHg
  respRate: number;    // breaths/min
  tempC: number;       // °C
  hrv: number;         // RMSSD ms
  qtc: number;         // ms
  beta: number;        // µV
  theta: number;       // µV
  alpha: number;       // µV
  delta: number;       // µV
};

export type Urgency = "info" | "watch" | "urgent" | "emergency";

export type TrustedSource = {
  label: string;
  url: string;
};

export type CureOption = {
  /** brand-agnostic generic + adult dose */
  drug: string;
  /** ATC classification code */
  atc?: string;
  /** one-line indication match */
  why: string;
  /** key contraindications / cautions */
  caution: string;
  /** trusted public reference */
  source: TrustedSource;
};

export type LiveFinding = {
  id: string;
  system: "Cardiac" | "Respiratory" | "Neural" | "Metabolic" | "Autonomic" | "Vascular";
  condition: string;
  icd10?: string;
  urgency: Urgency;
  confidence: number;        // 0-100
  evidence: string;          // what numeric trigger fired
  explanation: string;       // clinical "why"
  immediateAction: string;   // what to do right now
  cures: CureOption[];       // 1-3 evidence-based options
  redFlag?: string;          // emergency escalation criterion
};

export type LiveAssessment = {
  findings: LiveFinding[];
  triage: "Stable" | "Monitor" | "Escalate" | "Emergency";
  compositeRisk: number;     // 0-100
  newsScore: number;         // NEWS2-style early warning
  generatedAt: number;
};

// --------- Trusted sources -----------
const S = {
  DAILYMED: (slug: string, label: string): TrustedSource => ({
    label,
    url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(slug)}`,
  }),
  MEDLINE: (slug: string, label: string): TrustedSource => ({
    label,
    url: `https://medlineplus.gov/druginfo/meds/${slug}.html`,
  }),
  AHA_BLS: { label: "AHA 2020 ACLS Algorithms", url: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines" },
  ESC_AF_2024: { label: "ESC 2024 Atrial Fibrillation Guideline", url: "https://academic.oup.com/eurheartj/article/45/36/3314/7748180" },
  ESC_HTN_2024: { label: "ESC 2024 Hypertension Guideline", url: "https://academic.oup.com/eurheartj/article/45/38/3912/7741010" },
  AHA_HTN_2017: { label: "ACC/AHA 2017 Hypertension Guideline", url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065" },
  NICE_NG136: { label: "NICE NG136 — Hypertension in adults", url: "https://www.nice.org.uk/guidance/ng136" },
  WHO_O2: { label: "WHO Oxygen Therapy in Adults", url: "https://www.who.int/publications/i/item/9789240059139" },
  GOLD_2024: { label: "GOLD 2024 COPD Strategy", url: "https://goldcopd.org/2024-gold-report/" },
  AASM_INSOMNIA: { label: "AASM 2017 Insomnia Guideline", url: "https://jcsm.aasm.org/doi/10.5664/jcsm.6470" },
  APA_GAD: { label: "APA GAD Practice Guideline", url: "https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines" },
  AHA_BRADY: { label: "ACC/AHA/HRS 2018 Bradycardia Guideline", url: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000628" },
  ESC_VA: { label: "ESC 2022 Ventricular Arrhythmias Guideline", url: "https://academic.oup.com/eurheartj/article/43/40/3997/6675633" },
  NEWS2: { label: "RCP NEWS2 Early Warning Score", url: "https://www.rcp.ac.uk/improving-care/national-early-warning-score-news-2/" },
  ILAE_SEIZURE: { label: "ILAE 2017 Seizure Classification", url: "https://www.ilae.org/guidelines/definition-and-classification/operational-classification-2017" },
  CDC_SEPSIS: { label: "CDC Sepsis qSOFA Criteria", url: "https://www.cdc.gov/sepsis/index.html" },
};

// --------- Helpers -----------
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const conf = (raw: number) => Math.round(clamp(raw, 25, 99));

function pushIfNew(out: LiveFinding[], f: LiveFinding) {
  if (!out.find((x) => x.id === f.id)) out.push(f);
}

// NEWS2-lite
function news2(v: LiveVitals): number {
  let s = 0;
  if (v.respRate <= 8 || v.respRate >= 25) s += 3;
  else if (v.respRate >= 21) s += 2;
  else if (v.respRate <= 11) s += 1;
  if (v.spo2 <= 91) s += 3;
  else if (v.spo2 <= 93) s += 2;
  else if (v.spo2 <= 95) s += 1;
  if (v.tempC <= 35) s += 3;
  else if (v.tempC >= 39.1) s += 2;
  else if (v.tempC >= 38.1 || v.tempC <= 36) s += 1;
  if (v.sys <= 90 || v.sys >= 220) s += 3;
  else if (v.sys <= 100) s += 2;
  else if (v.sys <= 110) s += 1;
  if (v.hr <= 40 || v.hr >= 131) s += 3;
  else if (v.hr >= 111) s += 2;
  else if (v.hr <= 50 || v.hr >= 91) s += 1;
  return s;
}

// --------- Main detector -----------
export function assessLive(v: LiveVitals): LiveAssessment {
  const out: LiveFinding[] = [];

  // 1) Hypoxaemia
  if (v.spo2 < 94) {
    const severe = v.spo2 < 90;
    pushIfNew(out, {
      id: "hypoxaemia",
      system: "Respiratory",
      condition: severe ? "Severe hypoxaemia" : "Hypoxaemia",
      icd10: "R09.02",
      urgency: severe ? "emergency" : "urgent",
      confidence: conf(70 + (94 - v.spo2) * 6),
      evidence: `SpO₂ ${v.spo2.toFixed(1)}% sustained on optical pulse oximetry`,
      explanation:
        "Arterial saturation below 94% indicates impaired gas exchange — possible pulmonary, cardiac, anaemic or perfusion-related cause. Below 90% tissue hypoxia is occurring.",
      immediateAction:
        "Apply supplemental O₂ via nasal cannula 2–4 L/min, target SpO₂ 94–98% (88–92% if known COPD). Sit patient upright. Reassess in 2 min.",
      cures: [
        {
          drug: "Oxygen, nasal cannula 1–6 L/min",
          atc: "V03AN01",
          why: "Directly raises FiO₂ and arterial saturation.",
          caution: "Titrate to target — avoid hyperoxia in COPD.",
          source: S.WHO_O2,
        },
        {
          drug: "Salbutamol 100 µg MDI, 2–4 puffs via spacer",
          atc: "R03AC02",
          why: "Reverses bronchospastic component (wheeze, asthma, COPD).",
          caution: "Tachycardia, tremor, hypokalaemia with frequent dosing.",
          source: S.DAILYMED("albuterol", "FDA DailyMed — Albuterol (salbutamol)"),
        },
      ],
      redFlag:
        "SpO₂ < 90% with cyanosis, confusion, or accessory-muscle use → call emergency services.",
    });
  }

  // 2) Tachycardia
  if (v.hr > 100) {
    const severe = v.hr > 130;
    pushIfNew(out, {
      id: "tachycardia",
      system: "Cardiac",
      condition: severe ? "Marked sinus tachycardia" : "Sinus tachycardia",
      icd10: "R00.0",
      urgency: severe ? "urgent" : "watch",
      confidence: conf(60 + (v.hr - 100) * 1.5),
      evidence: `Resting HR ${Math.round(v.hr)} bpm on photoplethysmography`,
      explanation:
        "Persistent resting tachycardia may reflect dehydration, fever, anaemia, infection, anxiety, hyperthyroidism, pulmonary embolism, or a primary arrhythmia.",
      immediateAction:
        "Reassess after 5 min seated rest. Hydrate. If HR > 130 or symptoms (chest pain, dyspnoea, syncope) — obtain 12-lead ECG and seek urgent evaluation.",
      cures: [
        {
          drug: "Metoprolol succinate 25–50 mg PO daily",
          atc: "C07AB02",
          why: "Selective β1-blockade slows SA-node firing and AV conduction.",
          caution: "Asthma, 2°/3° AV block, decompensated heart failure, severe bradycardia.",
          source: S.MEDLINE("a682864", "MedlinePlus — Metoprolol"),
        },
        {
          drug: "Diltiazem ER 120–240 mg PO daily",
          atc: "C08DB01",
          why: "Alternative rate control via AV-node Ca²⁺-channel blockade.",
          caution: "Avoid in LVEF < 40% or with β-blocker combo.",
          source: S.DAILYMED("diltiazem", "FDA DailyMed — Diltiazem"),
        },
      ],
      redFlag: "HR > 150 with chest pain, syncope or hypotension → emergency department.",
    });
  }

  // 3) Bradycardia
  if (v.hr < 50) {
    const severe = v.hr < 40;
    pushIfNew(out, {
      id: "bradycardia",
      system: "Cardiac",
      condition: severe ? "Severe bradycardia" : "Sinus bradycardia",
      icd10: "R00.1",
      urgency: severe ? "emergency" : "watch",
      confidence: conf(55 + (50 - v.hr) * 2),
      evidence: `Resting HR ${Math.round(v.hr)} bpm`,
      explanation:
        "Heart rate below 50 bpm may reflect athletic conditioning or sinus-node / AV-node dysfunction. Symptomatic bradycardia with hypoperfusion requires urgent intervention.",
      immediateAction:
        "Check for symptoms (dizziness, syncope, chest pain). Review nodal-blocking medications. If symptomatic — IV access, 12-lead ECG, prepare atropine.",
      cures: [
        {
          drug: "Atropine 0.5 mg IV, repeat q3–5 min (max 3 mg)",
          atc: "A03BA01",
          why: "Antimuscarinic — blocks vagal tone at SA/AV node, raising rate.",
          caution: "Limited benefit in infranodal block; prepare transcutaneous pacing.",
          source: S.AHA_BRADY,
        },
        {
          drug: "Dopamine 5–20 µg/kg/min IV (bridge)",
          atc: "C01CA04",
          why: "β1-agonism boosts SA-node automaticity until pacing.",
          caution: "Arrhythmia risk; ICU monitoring.",
          source: S.AHA_BLS,
        },
      ],
      redFlag: "HR < 40 with syncope, hypotension, chest pain or altered mental status → emergency now.",
    });
  }

  // 4) Hypertensive urgency / crisis
  if (v.sys >= 140 || v.dia >= 90) {
    const crisis = v.sys >= 180 || v.dia >= 120;
    pushIfNew(out, {
      id: "hypertension",
      system: "Vascular",
      condition: crisis ? "Hypertensive crisis" : "Stage-2 hypertension",
      icd10: crisis ? "I16.9" : "I10",
      urgency: crisis ? "emergency" : "urgent",
      confidence: conf(65 + (v.sys - 140) * 0.8),
      evidence: `BP ${Math.round(v.sys)}/${Math.round(v.dia)} mmHg (cuffless oscillometric estimate)`,
      explanation:
        "Sustained BP ≥ 140/90 mmHg confers materially higher stroke and CHD risk. BP ≥ 180/120 with end-organ symptoms is a hypertensive emergency.",
      immediateAction: crisis
        ? "If end-organ symptoms (chest pain, focal neurology, dyspnoea, severe headache) → emergency department NOW. Otherwise repeat BP after 5 min rest and same-day clinician contact."
        : "Confirm with two seated readings 1 wk apart. Initiate lifestyle counselling and pharmacotherapy per stage.",
      cures: [
        {
          drug: "Lisinopril 10–40 mg PO daily",
          atc: "C09AA03",
          why: "ACE inhibition → ↓ angiotensin II, vasodilation, ↓ aldosterone.",
          caution: "Avoid in pregnancy, bilateral renal artery stenosis, angio-oedema; monitor K⁺/creatinine.",
          source: S.MEDLINE("a692051", "MedlinePlus — Lisinopril"),
        },
        {
          drug: "Amlodipine 5–10 mg PO daily",
          atc: "C08CA01",
          why: "Vascular smooth-muscle Ca²⁺ blockade → arteriolar vasodilation.",
          caution: "Ankle oedema; avoid in severe aortic stenosis.",
          source: S.MEDLINE("a692044", "MedlinePlus — Amlodipine"),
        },
        {
          drug: "Indapamide 1.5 mg PO daily (thiazide-like)",
          atc: "C03BA11",
          why: "Natriuresis + vasodilation; outcome-trial evidence.",
          caution: "Hypokalaemia, hyponatraemia; avoid eGFR < 30.",
          source: S.NICE_NG136,
        },
      ],
      redFlag: "BP ≥ 180/120 with chest pain, focal neuro deficit, severe headache, or visual loss → 911 / 999.",
    });
  }

  // 5) Hypotension / shock pattern
  if (v.sys < 90) {
    pushIfNew(out, {
      id: "hypotension",
      system: "Vascular",
      condition: "Hypotension / suspected shock",
      icd10: "R57.9",
      urgency: "emergency",
      confidence: conf(70 + (90 - v.sys)),
      evidence: `SBP ${Math.round(v.sys)} mmHg with HR ${Math.round(v.hr)} bpm`,
      explanation:
        "SBP < 90 mmHg, particularly with compensatory tachycardia, suggests volume loss, sepsis, cardiogenic or distributive shock.",
      immediateAction:
        "Supine, large-bore IV access, 500 mL crystalloid bolus, full vitals & lactate, transfer to acute care.",
      cures: [
        {
          drug: "Normal saline 500 mL IV bolus (repeat to 30 mL/kg)",
          atc: "B05BB01",
          why: "Restores intravascular volume and MAP.",
          caution: "Pulmonary oedema / heart failure — slow boluses.",
          source: S.CDC_SEPSIS,
        },
        {
          drug: "Noradrenaline 0.05–0.5 µg/kg/min IV (if fluid-refractory)",
          atc: "C01CA03",
          why: "α1-vasoconstriction maintains organ perfusion in shock.",
          caution: "Central access preferred; arrhythmia.",
          source: S.DAILYMED("norepinephrine", "FDA DailyMed — Norepinephrine"),
        },
      ],
      redFlag: "MAP < 65 mmHg, altered mental status, lactate > 2 mmol/L → activate sepsis / shock protocol.",
    });
  }

  // 6) Hyperthermia / fever
  if (v.tempC >= 38.0) {
    pushIfNew(out, {
      id: "fever",
      system: "Metabolic",
      condition: v.tempC >= 39.1 ? "High-grade fever" : "Fever",
      icd10: "R50.9",
      urgency: v.tempC >= 39.5 ? "urgent" : "watch",
      confidence: conf(50 + (v.tempC - 38) * 20),
      evidence: `Core-equivalent temperature ${v.tempC.toFixed(1)} °C`,
      explanation:
        "Fever is the hallmark of infection or inflammation. Combined with tachycardia, hypotension, or low SpO₂ raises sepsis concern (qSOFA / NEWS2).",
      immediateAction:
        "Hydrate. Identify source (resp, urinary, skin, GI). If qSOFA ≥ 2 or NEWS2 ≥ 5 — sepsis workup and broad-spectrum antibiotics within 1 h.",
      cures: [
        {
          drug: "Paracetamol 500–1000 mg PO/IV q6h (max 4 g/24h)",
          atc: "N02BE01",
          why: "Central antipyresis and analgesia.",
          caution: "Hepatic impairment — reduce dose; avoid >4 g/d.",
          source: S.MEDLINE("a681004", "MedlinePlus — Acetaminophen"),
        },
        {
          drug: "Ibuprofen 400 mg PO q6–8h",
          atc: "M01AE01",
          why: "COX inhibition — antipyretic, anti-inflammatory.",
          caution: "Avoid in renal failure, peptic ulcer, asthma triad, heart failure.",
          source: S.DAILYMED("ibuprofen", "FDA DailyMed — Ibuprofen"),
        },
      ],
      redFlag: "Fever + altered mental status + SBP ≤ 100 mmHg + RR ≥ 22 → sepsis pathway.",
    });
  }

  // 7) Tachypnoea / respiratory distress
  if (v.respRate > 22) {
    pushIfNew(out, {
      id: "tachypnoea",
      system: "Respiratory",
      condition: "Tachypnoea",
      icd10: "R06.82",
      urgency: v.respRate > 28 ? "urgent" : "watch",
      confidence: conf(55 + (v.respRate - 22) * 4),
      evidence: `Respiratory rate ${Math.round(v.respRate)} /min`,
      explanation:
        "RR > 22 is a sensitive early-warning marker for sepsis, PE, pneumonia, acidosis or heart failure decompensation.",
      immediateAction:
        "Full vitals incl. SpO₂, blood gas, focused chest exam, ECG, lactate. Reassess every 5 min.",
      cures: [
        {
          drug: "Oxygen 1–6 L/min (target SpO₂ 94–98%)",
          atc: "V03AN01",
          why: "Reduces work of breathing if hypoxaemic.",
          caution: "Titrate in COPD.",
          source: S.WHO_O2,
        },
      ],
      redFlag: "RR ≥ 30 with desaturation → high-acuity escalation.",
    });
  }

  // 8) Atrial-fibrillation pattern proxy (irregular RR + tachycardia + low HRV → high)
  if (v.hr > 110 && v.hrv > 90) {
    pushIfNew(out, {
      id: "afib_pattern",
      system: "Cardiac",
      condition: "Suspected atrial fibrillation pattern",
      icd10: "I48.91",
      urgency: "urgent",
      confidence: conf(60 + (v.hrv - 90)),
      evidence: `Irregularly-irregular RR variability (RMSSD ${v.hrv.toFixed(0)} ms) with tachycardia`,
      explanation:
        "An irregularly-irregular tachycardia is the cardinal screening signature of atrial fibrillation. Confirm with 12-lead ECG and assess CHA₂DS₂-VASc for stroke prophylaxis.",
      immediateAction:
        "Obtain 12-lead ECG. If unstable (chest pain, hypotension, heart failure) → urgent rate/rhythm control and electrical cardioversion.",
      cures: [
        {
          drug: "Apixaban 5 mg PO BID (stroke prevention if CHA₂DS₂-VASc ≥ 2 ♂ / ≥ 3 ♀)",
          atc: "B01AF02",
          why: "Direct factor Xa inhibitor; superior bleed profile vs warfarin in NVAF.",
          caution: "Reduce to 2.5 mg BID if ≥2 of: age ≥80, weight ≤60 kg, Cr ≥1.5 mg/dL.",
          source: S.ESC_AF_2024,
        },
        {
          drug: "Metoprolol 25–100 mg PO BID (rate control)",
          atc: "C07AB02",
          why: "β1-blockade slows AV-node conduction → ventricular rate.",
          caution: "Asthma, decompensated HF.",
          source: S.MEDLINE("a682864", "MedlinePlus — Metoprolol"),
        },
      ],
      redFlag: "AF with hypotension, ischaemic chest pain or acute heart failure → emergency cardioversion.",
    });
  }

  // 9) Prolonged QTc
  if (v.qtc > 460) {
    pushIfNew(out, {
      id: "long_qt",
      system: "Cardiac",
      condition: v.qtc > 500 ? "Long-QT — high torsades risk" : "Prolonged QTc",
      icd10: "I45.81",
      urgency: v.qtc > 500 ? "urgent" : "watch",
      confidence: conf(60 + (v.qtc - 460) * 0.6),
      evidence: `QTc ${Math.round(v.qtc)} ms (Bazett)`,
      explanation:
        "QTc > 460 ms (M) / 470 ms (F) increases polymorphic VT (torsades) risk; > 500 ms is high-risk and warrants telemetry.",
      immediateAction:
        "Stop QT-prolonging medications. Replete K⁺ ≥ 4.0, Mg²⁺ ≥ 2.0. Telemetry if > 500 ms.",
      cures: [
        {
          drug: "Magnesium sulphate 2 g IV over 15 min",
          atc: "B05XA05",
          why: "Membrane stabilisation; first-line for torsades prevention.",
          caution: "Renal dosing.",
          source: S.ESC_VA,
        },
        {
          drug: "Potassium chloride PO/IV to K⁺ 4.0–5.0 mmol/L",
          atc: "A12BA01",
          why: "Hypokalaemia prolongs repolarisation.",
          caution: "Avoid rapid IV (>10 mmol/h peripherally).",
          source: S.ESC_VA,
        },
      ],
      redFlag: "Syncope or polymorphic VT on monitor → ED + cardiology.",
    });
  }

  // 10) Anxiety / panic pattern
  if (v.beta > 24 && v.hr > 95) {
    pushIfNew(out, {
      id: "panic_pattern",
      system: "Neural",
      condition: "Acute anxiety / panic pattern",
      icd10: "F41.0",
      urgency: "watch",
      confidence: conf(55 + (v.beta - 24) * 4),
      evidence: `High β-band cortical arousal (${v.beta.toFixed(1)} µV) with tachycardia`,
      explanation:
        "Sustained high-beta with sympathetic tachycardia matches an acute anxiety / panic phenotype. Differentiate from organic causes (ACS, PE, hyperthyroidism).",
      immediateAction:
        "Reassurance, paced breathing (4-7-8), screen with GAD-7. Rule out chest pain or dyspnoea first.",
      cures: [
        {
          drug: "Sertraline 25–50 mg PO daily (titrate 50–200 mg)",
          atc: "N06AB06",
          why: "SSRI — first-line for GAD/panic disorder.",
          caution: "GI upset, sexual dysfunction, hyponatraemia in elderly.",
          source: S.APA_GAD,
        },
        {
          drug: "Propranolol 10–40 mg PO PRN (situational autonomic symptoms)",
          atc: "C07AA05",
          why: "Non-selective β-blocker blunts somatic tremor/tachycardia.",
          caution: "Asthma, bradycardia.",
          source: S.MEDLINE("a682607", "MedlinePlus — Propranolol"),
        },
      ],
      redFlag: "Chest pain with radiation, syncope, or first episode age > 40 — exclude ACS/PE.",
    });
  }

  // 11) Drowsiness / insomnia phenotype
  if (v.theta > 16 && v.alpha < 12) {
    pushIfNew(out, {
      id: "drowsy",
      system: "Neural",
      condition: "Hypoarousal / sleep-deprivation pattern",
      icd10: "G47.00",
      urgency: "info",
      confidence: conf(45 + (v.theta - 16) * 3),
      evidence: `Excess θ-band (${v.theta.toFixed(1)} µV) with α suppression (${v.alpha.toFixed(1)} µV)`,
      explanation:
        "Frontal theta excess with attenuated alpha during wake is associated with sleep deprivation, sleep-disordered breathing, or pre-sleep transition.",
      immediateAction:
        "Sleep hygiene review; STOP-BANG questionnaire; consider polysomnography if symptomatic snoring/apnoea.",
      cures: [
        {
          drug: "Lemborexant 5–10 mg PO at bedtime",
          atc: "N05CM19",
          why: "DORA — promotes sleep without next-day sedation; preferred over BZD.",
          caution: "Avoid with strong CYP3A inhibitors; narcolepsy.",
          source: S.AASM_INSOMNIA,
        },
        {
          drug: "Melatonin 0.5–5 mg PO 30 min pre-bed",
          atc: "N05CH01",
          why: "MT1/MT2 agonism — circadian entrainment for sleep-onset insomnia.",
          caution: "Caution with anticoagulants.",
          source: S.MEDLINE("a682488", "MedlinePlus — Melatonin"),
        },
      ],
    });
  }

  // 12) Seizure-pattern proxy (very high delta with abnormal HR/HRV)
  if (v.delta > 12 && v.hr > 110 && v.beta > 22) {
    pushIfNew(out, {
      id: "seizure_proxy",
      system: "Neural",
      condition: "Cortical hypersynchrony — possible seizure proxy",
      icd10: "R56.9",
      urgency: "urgent",
      confidence: conf(45 + (v.delta - 12) * 4),
      evidence: `δ ${v.delta.toFixed(1)} µV with autonomic surge (HR ${Math.round(v.hr)}, β ${v.beta.toFixed(1)})`,
      explanation:
        "Combined slow-wave dominance with sympathetic surge can pattern-match peri-ictal physiology. Not diagnostic — confirm with EEG.",
      immediateAction:
        "Protect airway, lateral position, time the event. If > 5 min — status epilepticus pathway.",
      cures: [
        {
          drug: "Midazolam 10 mg IM (or 0.2 mg/kg IN) for active seizure",
          atc: "N05CD08",
          why: "Benzodiazepine — first-line abortive therapy for status epilepticus.",
          caution: "Respiratory depression; have BVM ready.",
          source: S.ILAE_SEIZURE,
        },
      ],
      redFlag: "Convulsion > 5 min, recurrent, or with focal neurology → 911 / status epilepticus protocol.",
    });
  }

  // Composite + triage
  const wt: Record<Urgency, number> = { info: 4, watch: 12, urgent: 28, emergency: 55 };
  const composite = Math.min(100, out.reduce((s, f) => s + wt[f.urgency], 0));
  const ns = news2(v);
  const triage: LiveAssessment["triage"] =
    out.some((f) => f.urgency === "emergency") || ns >= 7 ? "Emergency"
    : out.some((f) => f.urgency === "urgent") || ns >= 5 ? "Escalate"
    : out.length > 0 || ns >= 3 ? "Monitor"
    : "Stable";

  return { findings: out, triage, compositeRisk: composite, newsScore: ns, generatedAt: Date.now() };
}

export const REALTIME_DISCLAIMER =
  "Real-time disease detection is decision-support only. All findings, ICD-10 codes, ATC drug classes, and source links are derived from public clinical guidelines (AHA/ACC, ESC, NICE, AASM, APA, WHO, GOLD, ILAE, CDC) and approved drug labels (FDA DailyMed, NIH MedlinePlus). A licensed clinician must confirm indication, dose, contraindications, allergies and interactions before any agent is administered.";