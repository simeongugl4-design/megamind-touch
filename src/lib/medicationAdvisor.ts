import type { SicknessFinding } from "./calibrationNarrative";

/**
 * Evidence-based medication advisor.
 *
 * Maps each SicknessFinding (condition + severity) onto first-line / adjunct
 * pharmacological options drawn from MAJOR PUBLISHED CLINICAL GUIDELINES.
 * Every recommendation carries:
 *   • drug class + representative generic agent (with typical adult dose range)
 *   • mechanism of action
 *   • a guideline citation (AHA/ACC, ESC, NICE, WHO, ADA, FDA label, etc.)
 *
 * This is a SCREENING / DECISION-SUPPORT layer. It does NOT prescribe.
 * Final selection, dosing, and contraindication review must be done by a
 * licensed clinician using the patient's full history, labs, allergies and
 * concomitant medications.
 */

export type MedicationRec = {
  /** Drug class (e.g. "ACE inhibitor", "Selective β1-blocker") */
  drugClass: string;
  /** A representative approved generic agent + typical adult dose */
  example: string;
  /** Mechanism of action — one sentence */
  mechanism: string;
  /** Why this is appropriate for the finding */
  rationale: string;
  /** Guideline / regulatory citation backing the recommendation */
  source: { name: string; ref: string; url?: string };
  /** Important contraindications / cautions */
  cautions: string;
  /** Line of therapy */
  line: "first-line" | "second-line" | "adjunct" | "lifestyle-first";
};

export type MedicationPlan = {
  finding: SicknessFinding;
  /** Non-pharmacological / lifestyle intervention (always shown first) */
  lifestyle: string;
  /** Ordered list of pharmacological options */
  options: MedicationRec[];
  /** When to escalate to emergency / specialist */
  redFlags: string;
};

const SRC = {
  AHA_HTN_2017: {
    name: "ACC/AHA 2017 Hypertension Guideline",
    ref: "Whelton PK et al. J Am Coll Cardiol 2018;71(19):e127–e248",
    url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065",
  },
  ESC_HTN_2023: {
    name: "ESC 2024 Guidelines on Elevated BP & Hypertension",
    ref: "McEvoy JW et al. Eur Heart J 2024;45(38):3912–4018",
    url: "https://academic.oup.com/eurheartj/article/45/38/3912/7741010",
  },
  ESC_VA_2022: {
    name: "ESC 2022 Guidelines on Ventricular Arrhythmias",
    ref: "Zeppenfeld K et al. Eur Heart J 2022;43(40):3997–4126",
    url: "https://academic.oup.com/eurheartj/article/43/40/3997/6675633",
  },
  AHA_BRADY_2018: {
    name: "ACC/AHA/HRS 2018 Bradycardia Guideline",
    ref: "Kusumoto FM et al. Circulation 2019;140:e382–e482",
    url: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000628",
  },
  GOLD_2024: {
    name: "GOLD 2024 COPD Strategy",
    ref: "Global Initiative for Chronic Obstructive Lung Disease, 2024 report",
    url: "https://goldcopd.org/2024-gold-report/",
  },
  WHO_O2_2023: {
    name: "WHO clinical care for severe hypoxaemia",
    ref: "WHO Interim Guidance, Oxygen sources & distribution, 2023",
    url: "https://www.who.int/publications/i/item/9789240059139",
  },
  NICE_CG181: {
    name: "NICE CG181 — Cardiovascular disease: risk assessment & lipid modification",
    ref: "NICE Clinical Guideline CG181 (updated 2023)",
    url: "https://www.nice.org.uk/guidance/ng238",
  },
  NICE_NG134: {
    name: "NICE NG136 — Hypertension in adults",
    ref: "NICE Guideline NG136 (updated 2022)",
    url: "https://www.nice.org.uk/guidance/ng136",
  },
  ADA_2024: {
    name: "ADA Standards of Care 2024",
    ref: "American Diabetes Association. Diabetes Care 2024;47(Suppl 1)",
    url: "https://diabetesjournals.org/care/issue/47/Supplement_1",
  },
  APA_GAD_2024: {
    name: "APA Practice Guideline — Generalized Anxiety Disorder",
    ref: "American Psychiatric Association, 2024 update",
    url: "https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines",
  },
  AASM_INSOMNIA: {
    name: "AASM Clinical Practice Guideline — Chronic Insomnia",
    ref: "Sateia MJ et al. J Clin Sleep Med 2017;13(2):307–349",
    url: "https://jcsm.aasm.org/doi/10.5664/jcsm.6470",
  },
  FDA_DONEPEZIL: {
    name: "FDA label — Donepezil (Aricept)",
    ref: "FDA approved label, NDA 020690",
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2012/020690s035,021720s008,022568s005lbl.pdf",
  },
  AHA_HF_2022: {
    name: "AHA/ACC/HFSA 2022 Heart Failure Guideline",
    ref: "Heidenreich PA et al. J Am Coll Cardiol 2022;79(17):e263–e421",
    url: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063",
  },
} as const;

function planFor(f: SicknessFinding): MedicationPlan {
  const cond = f.condition.toLowerCase();

  // --- HYPERTENSION ---
  if (cond.includes("hypertension")) {
    return {
      finding: f,
      lifestyle:
        "DASH-style diet, sodium < 1.5 g/d, ≥150 min/wk moderate aerobic exercise, weight loss 1 kg → ≈1 mmHg SBP drop, alcohol ≤ 2 drinks/d (M) / 1 (F).",
      options: [
        {
          drugClass: "ACE inhibitor",
          example: "Lisinopril 10–40 mg PO daily",
          mechanism: "Blocks ACE → ↓ angiotensin II → vasodilation + ↓ aldosterone.",
          rationale: "First-line in non-Black adults < 60 y or with diabetes/CKD; reduces stroke + MI.",
          source: SRC.AHA_HTN_2017,
          cautions: "Avoid in pregnancy, bilateral renal artery stenosis, prior angio-oedema; monitor K⁺ & creatinine.",
          line: "first-line",
        },
        {
          drugClass: "Dihydropyridine calcium-channel blocker",
          example: "Amlodipine 5–10 mg PO daily",
          mechanism: "Blocks L-type Ca²⁺ channels in vascular smooth muscle → arteriolar vasodilation.",
          rationale: "First-line in Black adults and patients ≥ 60 y; combines well with ACEi/ARB.",
          source: SRC.ESC_HTN_2023,
          cautions: "Ankle oedema, gingival hyperplasia; avoid in severe aortic stenosis.",
          line: "first-line",
        },
        {
          drugClass: "Thiazide-like diuretic",
          example: "Indapamide 1.5 mg PO daily (or chlorthalidone 12.5–25 mg)",
          mechanism: "Inhibits Na⁺/Cl⁻ cotransport in distal tubule → natriuresis + vasodilation.",
          rationale: "Preferred add-on; outcome-trial evidence (ALLHAT, SPRINT).",
          source: SRC.NICE_NG134,
          cautions: "Hypokalaemia, hyponatraemia, hyperuricaemia; avoid in significant CKD (eGFR < 30).",
          line: "second-line",
        },
      ],
      redFlags:
        "BP ≥ 180/120 mmHg with end-organ symptoms (chest pain, focal neuro deficit, dyspnoea) → emergency dept now.",
    };
  }

  // --- TACHYCARDIA ---
  if (cond.includes("tachycardia")) {
    return {
      finding: f,
      lifestyle:
        "Hydration, caffeine/nicotine/stimulant reduction, treat underlying anxiety, fever, anaemia or thyroid disease.",
      options: [
        {
          drugClass: "Cardioselective β1-blocker",
          example: "Metoprolol succinate 25–100 mg PO daily",
          mechanism: "Selective β1-adrenergic blockade → ↓ SA-node firing rate and AV-node conduction.",
          rationale: "First-line rate control once secondary causes (volume loss, sepsis, thyroid) are excluded.",
          source: SRC.ESC_VA_2022,
          cautions: "Asthma (relative), 2°/3° AV block, decompensated heart failure, severe bradycardia.",
          line: "first-line",
        },
        {
          drugClass: "Non-dihydropyridine Ca²⁺ blocker",
          example: "Diltiazem ER 120–360 mg PO daily",
          mechanism: "Slows AV-node conduction via L-type Ca²⁺ channel blockade.",
          rationale: "Alternative when β-blockers are contraindicated; effective for SVT rate control.",
          source: SRC.ESC_VA_2022,
          cautions: "Avoid with LV dysfunction (LVEF < 40%) or with β-blocker combination.",
          line: "second-line",
        },
      ],
      redFlags:
        "HR > 150 with chest pain, syncope, hypotension or dyspnoea → 12-lead ECG + emergency evaluation.",
    };
  }

  // --- BRADYCARDIA ---
  if (cond.includes("bradycardia")) {
    return {
      finding: f,
      lifestyle:
        "Review nodal-blocking drugs (β-blockers, diltiazem, digoxin, donepezil); exclude hypothyroidism & electrolyte derangements.",
      options: [
        {
          drugClass: "Antimuscarinic (acute)",
          example: "Atropine 0.5 mg IV q3–5 min (max 3 mg)",
          mechanism: "Blocks vagal M2 receptors at SA/AV node → ↑ rate and conduction.",
          rationale: "ACLS first-line for symptomatic bradycardia (HR < 50 with hypoperfusion).",
          source: SRC.AHA_BRADY_2018,
          cautions: "Limited benefit in infranodal block; transcutaneous pacing if no response.",
          line: "first-line",
        },
        {
          drugClass: "β-adrenergic agonist (bridge)",
          example: "Dopamine 5–20 µg/kg/min IV or isoproterenol 2–10 µg/min",
          mechanism: "β1 stimulation → ↑ SA-node automaticity until pacing.",
          rationale: "Bridge therapy while arranging transvenous or permanent pacemaker.",
          source: SRC.AHA_BRADY_2018,
          cautions: "Arrhythmia risk; ICU monitoring required.",
          line: "second-line",
        },
      ],
      redFlags:
        "Syncope, chest pain, altered mental status, hypotension, or HR < 40 → immediate ED + telemetry.",
    };
  }

  // --- HYPOXAEMIA ---
  if (cond.includes("hypoxaemia") || cond.includes("hypoxemia")) {
    return {
      finding: f,
      lifestyle:
        "Smoking cessation, upright positioning, breathing exercises, evaluate for sleep-disordered breathing.",
      options: [
        {
          drugClass: "Supplemental oxygen",
          example: "O₂ via nasal cannula 1–4 L/min, target SpO₂ 94–98% (88–92% if COPD)",
          mechanism: "Increases FiO₂ → ↑ PaO₂ and tissue oxygen delivery.",
          rationale: "Universal first intervention for SpO₂ < 92% pending work-up.",
          source: SRC.WHO_O2_2023,
          cautions: "Avoid hyperoxia in COPD (risk of CO₂ retention).",
          line: "first-line",
        },
        {
          drugClass: "Inhaled short-acting β2-agonist (if bronchospasm)",
          example: "Salbutamol 100 µg MDI × 2 puffs q4–6 h PRN",
          mechanism: "β2 stimulation → bronchial smooth muscle relaxation.",
          rationale: "Reverses bronchospasm component of hypoxaemia.",
          source: SRC.GOLD_2024,
          cautions: "Tachycardia, tremor, hypokalaemia with frequent use.",
          line: "adjunct",
        },
      ],
      redFlags:
        "SpO₂ < 90% with cyanosis, confusion, or accessory-muscle use → call emergency services immediately.",
    };
  }

  // --- PROLONGED QTc ---
  if (cond.includes("qtc")) {
    return {
      finding: f,
      lifestyle:
        "Stop QT-prolonging agents (macrolides, fluoroquinolones, ondansetron, methadone, antipsychotics); replete K⁺ ≥ 4.0, Mg²⁺ ≥ 2.0.",
      options: [
        {
          drugClass: "Electrolyte repletion",
          example: "Magnesium sulphate 2 g IV over 15 min; KCl PO/IV to K⁺ 4.0–5.0",
          mechanism: "Stabilises cardiac membrane and shortens repolarisation.",
          rationale: "Cornerstone of acute QTc management and torsades prevention.",
          source: SRC.ESC_VA_2022,
          cautions: "Renal dysfunction — adjust dosing.",
          line: "first-line",
        },
        {
          drugClass: "β-blocker (long-QT syndrome)",
          example: "Nadolol 40–80 mg PO daily or propranolol 2–3 mg/kg/d",
          mechanism: "Blunts adrenergic triggers of polymorphic VT in congenital LQTS.",
          rationale: "Class I recommendation for congenital LQTS irrespective of symptoms.",
          source: SRC.ESC_VA_2022,
          cautions: "Bradycardia, fatigue, bronchospasm.",
          line: "second-line",
        },
      ],
      redFlags:
        "QTc > 500 ms, syncope, or polymorphic VT on monitor → ED, continuous telemetry, electrophysiology consult.",
    };
  }

  // --- HRV / AUTONOMIC ---
  if (cond.includes("hrv") || cond.includes("autonomic")) {
    return {
      finding: f,
      lifestyle:
        "Aerobic training 150 min/wk, paced breathing 6 breaths/min × 10 min/d, sleep ≥ 7 h, mindfulness/CBT-based stress reduction.",
      options: [
        {
          drugClass: "No pharmacotherapy indicated",
          example: "Behavioural & lifestyle first; reassess at 4–6 wks.",
          mechanism: "Vagal-tone restoration via training and recovery.",
          rationale: "Reduced HRV alone is a biomarker, not a disease — pharmacotherapy reserved for underlying anxiety/depression.",
          source: SRC.APA_GAD_2024,
          cautions: "—",
          line: "lifestyle-first",
        },
      ],
      redFlags: "If accompanied by syncope or chest pain, refer for cardiac autonomic testing.",
    };
  }

  // --- ELEVATED CORTICAL AROUSAL / ANXIETY ---
  if (cond.includes("cortical arousal") || cond.includes("anxiety")) {
    return {
      finding: f,
      lifestyle:
        "CBT first-line; sleep hygiene, caffeine reduction < 200 mg/d, regular aerobic exercise, mindfulness-based stress reduction.",
      options: [
        {
          drugClass: "SSRI",
          example: "Sertraline 25–50 mg PO daily, titrate to 50–200 mg",
          mechanism: "Selective serotonin re-uptake inhibition → ↑ synaptic 5-HT.",
          rationale: "First-line pharmacotherapy for GAD; 4–6 wk to full effect.",
          source: SRC.APA_GAD_2024,
          cautions: "GI upset, sexual dysfunction, hyponatraemia (elderly); QTc monitoring with citalopram.",
          line: "first-line",
        },
        {
          drugClass: "SNRI",
          example: "Venlafaxine XR 75–225 mg PO daily",
          mechanism: "Dual 5-HT and NE re-uptake inhibition.",
          rationale: "Second SSRI alternative or after partial response.",
          source: SRC.APA_GAD_2024,
          cautions: "BP elevation > 150 mg/d; discontinuation syndrome.",
          line: "second-line",
        },
      ],
      redFlags: "Suicidal ideation, panic with chest pain, or psychosis → urgent psychiatric evaluation.",
    };
  }

  // --- DROWSINESS / INSOMNIA ---
  if (cond.includes("drows") || cond.includes("hypoarousal") || cond.includes("sleep")) {
    return {
      finding: f,
      lifestyle:
        "Fixed wake-time, < 30 min daytime nap, blue-light curfew 1 h pre-bed, CBT-I (cognitive-behavioural therapy for insomnia).",
      options: [
        {
          drugClass: "Dual orexin-receptor antagonist (DORA)",
          example: "Lemborexant 5–10 mg PO at bedtime",
          mechanism: "Blocks orexin-1/2 receptors → promotes natural sleep onset.",
          rationale: "Preferred over benzodiazepines; lower dependence and next-day sedation.",
          source: SRC.AASM_INSOMNIA,
          cautions: "Avoid with strong CYP3A inhibitors; narcolepsy.",
          line: "first-line",
        },
        {
          drugClass: "Melatonin-receptor agonist",
          example: "Ramelteon 8 mg PO 30 min pre-bed",
          mechanism: "MT1/MT2 agonism → entrains circadian rhythm.",
          rationale: "Useful for sleep-onset insomnia; no controlled-substance schedule.",
          source: SRC.AASM_INSOMNIA,
          cautions: "Avoid with fluvoxamine (CYP1A2 inhibition).",
          line: "second-line",
        },
      ],
      redFlags: "Witnessed apnoeas, morning headaches, refractory daytime hypersomnolence → polysomnography.",
    };
  }

  // --- PROCESSING / COGNITIVE / APOE-ε4 ---
  if (cond.includes("processing speed") || cond.includes("apoe")) {
    return {
      finding: f,
      lifestyle:
        "Mediterranean / MIND diet, 150 min/wk aerobic + 2× strength training, BP < 130/80, LDL < 70 mg/dL if high vascular risk, sleep 7–9 h, social engagement.",
      options: [
        {
          drugClass: "Cholinesterase inhibitor (only if MCI/dementia diagnosed)",
          example: "Donepezil 5 mg PO daily × 4 wk → 10 mg",
          mechanism: "Inhibits acetylcholinesterase → ↑ synaptic ACh in cortex.",
          rationale: "FDA-approved for mild-to-moderate Alzheimer's; NOT indicated for screening-level findings.",
          source: SRC.FDA_DONEPEZIL,
          cautions: "Bradycardia, syncope, GI upset, weight loss; baseline ECG.",
          line: "second-line",
        },
        {
          drugClass: "High-intensity statin (vascular protection)",
          example: "Atorvastatin 40–80 mg PO daily (if 10-y ASCVD risk ≥ 7.5 %)",
          mechanism: "HMG-CoA reductase inhibition → ↓ LDL-C.",
          rationale: "Optimises midlife vascular risk — strongest modifiable protector of cognition.",
          source: SRC.NICE_CG181,
          cautions: "Myopathy, transaminitis; check baseline CK & LFTs.",
          line: "adjunct",
        },
      ],
      redFlags: "Rapid memory decline over weeks, focal neurology, or new aphasia → urgent neurology referral.",
    };
  }

  // --- GENOMIC: T2DM susceptibility ---
  if (cond.includes("diabetes")) {
    return {
      finding: f,
      lifestyle:
        "Weight loss ≥ 7 %, ≥ 150 min/wk activity, Mediterranean diet, annual HbA1c & fasting glucose, smoking cessation.",
      options: [
        {
          drugClass: "Biguanide (if HbA1c ≥ 6.5 %)",
          example: "Metformin XR 500 mg PO daily, titrate to 2 g/d",
          mechanism: "Activates AMPK → ↓ hepatic gluconeogenesis, ↑ peripheral insulin sensitivity.",
          rationale: "First-line oral agent for T2DM; cardiovascular benefit, weight-neutral.",
          source: SRC.ADA_2024,
          cautions: "eGFR < 30, acute illness; B12 monitoring annually.",
          line: "first-line",
        },
        {
          drugClass: "GLP-1 receptor agonist (CVD or weight indication)",
          example: "Semaglutide 0.25 mg SC weekly → 1 mg",
          mechanism: "Mimics incretin → ↑ glucose-dependent insulin secretion, ↓ glucagon, ↓ appetite.",
          rationale: "Adds CV and renal benefit + weight loss.",
          source: SRC.ADA_2024,
          cautions: "Personal/family history of medullary thyroid carcinoma or MEN2; pancreatitis.",
          line: "adjunct",
        },
      ],
      redFlags: "Polyuria + polydipsia + weight loss, or random glucose > 250 mg/dL → urgent assessment.",
    };
  }

  // --- GENOMIC: CHD susceptibility ---
  if (cond.includes("coronary") || cond.includes("heart disease") || cond.includes("chd")) {
    return {
      finding: f,
      lifestyle:
        "Mediterranean diet, ≥ 150 min/wk moderate aerobic exercise, BMI 18.5–24.9, smoking cessation, alcohol moderation.",
      options: [
        {
          drugClass: "High-intensity statin",
          example: "Rosuvastatin 20–40 mg PO daily",
          mechanism: "HMG-CoA reductase inhibition → ↓ LDL-C ≥ 50 %.",
          rationale: "Primary prevention if 10-y ASCVD risk ≥ 7.5 % or LDL ≥ 190 mg/dL.",
          source: SRC.NICE_CG181,
          cautions: "Myopathy, transaminitis, new-onset diabetes.",
          line: "first-line",
        },
        {
          drugClass: "Antiplatelet (only if 10-y risk ≥ 10 % and low bleed risk)",
          example: "Aspirin 75–100 mg PO daily",
          mechanism: "Irreversible COX-1 inhibition → ↓ thromboxane A2.",
          rationale: "Selective primary prevention per ESC/AHA shared decision making.",
          source: SRC.AHA_HF_2022,
          cautions: "GI bleed risk; not routine over age 70 for primary prevention.",
          line: "adjunct",
        },
      ],
      redFlags: "Exertional chest pain, dyspnoea, or syncope → ED + troponin/ECG.",
    };
  }

  // --- DEFAULT: wellness / no action ---
  return {
    finding: f,
    lifestyle:
      "Maintain Mediterranean-style diet, ≥ 150 min/wk aerobic + 2× strength, sleep 7–9 h, annual primary-care review.",
    options: [
      {
        drugClass: "No pharmacotherapy indicated",
        example: "—",
        mechanism: "—",
        rationale: "Screening did not identify a finding warranting medication.",
        source: SRC.NICE_CG181,
        cautions: "—",
        line: "lifestyle-first",
      },
    ],
    redFlags: "New chest pain, focal neuro deficit, syncope, severe dyspnoea → emergency services.",
  };
}

export function buildMedicationPlan(findings: SicknessFinding[]): MedicationPlan[] {
  return findings
    .filter((f) => f.severity !== "normal")
    .map(planFor);
}

export const MEDICATION_DISCLAIMER =
  "Medication suggestions are decision-support only. They are derived from published clinical guidelines (AHA/ACC, ESC, NICE, ADA, WHO, AASM, APA, FDA labels) and do NOT constitute a prescription. A licensed clinician must verify indications, contraindications, drug interactions, renal/hepatic dosing, and patient-specific factors before any agent is prescribed.";