import type { MedicationPlan, MedicationRec } from "./medicationAdvisor";
import type { PatientInfo } from "@/components/PatientIntakeForm";

/**
 * Medication Safety Engine
 * ------------------------
 * Performs three layers of safety review on every recommendation produced by
 * `medicationAdvisor`:
 *   1. Absolute & relative CONTRAINDICATIONS (patient-specific: pregnancy,
 *      age, renal/hepatic function, comorbidities, allergies).
 *   2. DRUG–DRUG INTERACTIONS (DDIs) across the recommended regimen.
 *   3. DRUG–DISEASE INTERACTIONS (e.g. β-blocker + asthma).
 *
 * Sources: FDA labels (DailyMed), Lexicomp/Micromedex severity tiers,
 * AHA/ACC, ESC, NICE, BNF, Beers Criteria 2023 (older adults), and the
 * WHO Essential Medicines safety annex.
 *
 * This is decision-support only. A licensed clinician must verify every alert
 * against the patient's full medication list, labs and allergy history before
 * prescribing.
 */

export type SafetySeverity = "info" | "caution" | "major" | "contraindicated";

export type SafetyAlert = {
  severity: SafetySeverity;
  /** Short category tag shown in the UI badge */
  kind: "Contraindication" | "Drug–Drug" | "Drug–Disease" | "Monitoring" | "Special population";
  /** One-line headline */
  title: string;
  /** Plain-language clinician explanation of the risk */
  detail: string;
  /** Concrete action a clinician should take */
  action: string;
  /** Source / guideline citation */
  source: string;
};

export type DrugSafetyReport = {
  drugClass: string;
  example: string;
  alerts: SafetyAlert[];
  /** True if any alert is severity `contraindicated` */
  blocked: boolean;
};

export type PlanSafetyReport = {
  condition: string;
  drugs: DrugSafetyReport[];
  /** Cross-drug DDIs within this plan */
  interactions: SafetyAlert[];
  /** Highest severity surfaced anywhere in the plan */
  worst: SafetySeverity;
};

/* ------------------------------------------------------------------ */
/*  Drug fingerprinting                                                */
/* ------------------------------------------------------------------ */

/**
 * Map a free-text drug class / example to a normalized atomic tag we can
 * reason over for DDI / contraindication lookup.
 */
function tagDrug(rec: MedicationRec): string[] {
  const s = (rec.drugClass + " " + rec.example).toLowerCase();
  const tags: string[] = [];
  if (/ace inhibitor|lisinopril|enalapril|ramipril/.test(s)) tags.push("acei");
  if (/\barb\b|losartan|valsartan|olmesartan/.test(s)) tags.push("arb");
  if (/amlodipine|nifedipine|dihydropyridine/.test(s)) tags.push("dhp-ccb");
  if (/diltiazem|verapamil|non-dihydropyridine/.test(s)) tags.push("nondhp-ccb");
  if (/thiazide|indapamide|chlorthalidone|hydrochlorothiazide/.test(s)) tags.push("thiazide");
  if (/β1-blocker|beta.?blocker|metoprolol|bisoprolol|atenolol|nadolol|propranolol/.test(s)) tags.push("beta-blocker");
  if (/atropine/.test(s)) tags.push("antimuscarinic");
  if (/dopamine|isoproterenol/.test(s)) tags.push("beta-agonist-iv");
  if (/salbutamol|albuterol|saba/.test(s)) tags.push("saba");
  if (/oxygen/.test(s)) tags.push("o2");
  if (/ssri|sertraline|citalopram|escitalopram|fluoxetine|paroxetine/.test(s)) tags.push("ssri");
  if (/snri|venlafaxine|duloxetine/.test(s)) tags.push("snri");
  if (/orexin|lemborexant|suvorexant|dora/.test(s)) tags.push("dora");
  if (/ramelteon|melatonin/.test(s)) tags.push("melatonin-agonist");
  if (/donepezil|rivastigmine|galantamine|cholinesterase/.test(s)) tags.push("ache-inhibitor");
  if (/statin|atorvastatin|rosuvastatin|simvastatin/.test(s)) tags.push("statin");
  if (/aspirin/.test(s)) tags.push("aspirin");
  if (/metformin/.test(s)) tags.push("metformin");
  if (/glp-?1|semaglutide|liraglutide|dulaglutide/.test(s)) tags.push("glp1");
  if (/magnesium|potassium|electrolyte/.test(s)) tags.push("electrolyte");
  return tags;
}

/* ------------------------------------------------------------------ */
/*  Per-drug contraindications (patient-specific)                      */
/* ------------------------------------------------------------------ */

function checkContraindications(
  tag: string,
  rec: MedicationRec,
  patient: PatientInfo | null,
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const age = patient?.age ?? 0;
  const sex = (patient?.sex ?? "").toLowerCase();
  const conds = (patient?.conditions ?? []).map((c) => c.toLowerCase());
  const allergies = (patient?.allergies ?? "").toLowerCase();
  const meds = (patient?.medications ?? "").toLowerCase();

  const has = (re: RegExp) => conds.some((c) => re.test(c)) || re.test(meds);
  const allergic = (re: RegExp) => re.test(allergies);

  // Pregnancy-related (female of childbearing age, unless explicitly past menopause)
  const couldBePregnant = sex.startsWith("f") && age >= 12 && age <= 55;

  if (tag === "acei" || tag === "arb") {
    if (couldBePregnant) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "Pregnancy — fetotoxic (FDA boxed warning)",
        detail: "ACE inhibitors and ARBs cause oligohydramnios, renal failure and skull hypoplasia in the 2nd/3rd trimester. Withdraw immediately if pregnancy detected.",
        action: "Confirm pregnancy status; use labetalol, nifedipine or methyldopa instead.",
        source: "FDA boxed warning; ACOG Practice Bulletin 222 (2020)",
      });
    }
    if (has(/renal artery stenosis|bilateral.*stenosis/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "Bilateral renal artery stenosis",
        detail: "Removing angiotensin II support precipitates acute kidney injury.",
        action: "Switch to a CCB or β-blocker; image renal arteries.",
        source: "AHA/ACC 2017 HTN Guideline",
      });
    }
    if (has(/angio[- ]?oedema|angioedema/) || allergic(/ace|lisinopril|enalapril/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "Prior angio-oedema / ACEi hypersensitivity",
        detail: "Recurrence risk ≈10× baseline; airway-threatening.",
        action: "Avoid all ACEi; ARB may be tried with caution.",
        source: "FDA DailyMed — Lisinopril label",
      });
    }
    if (has(/ckd|chronic kidney|egfr/) || has(/hyperkal/)) {
      alerts.push({
        severity: "caution",
        kind: "Monitoring",
        title: "Renal & potassium monitoring required",
        detail: "Risk of AKI and hyperkalaemia, especially with CKD or K-sparing agents.",
        action: "Check creatinine + K⁺ at baseline, 1–2 wk and after each titration.",
        source: "NICE NG136",
      });
    }
  }

  if (tag === "beta-blocker") {
    if (has(/asthma/) || has(/severe copd/)) {
      alerts.push({
        severity: "major",
        kind: "Drug–Disease",
        title: "Bronchospastic disease",
        detail: "Even cardioselective β1-blockers can precipitate bronchospasm in asthma.",
        action: "Prefer a non-DHP CCB (diltiazem) or ivabradine.",
        source: "GINA 2024; FDA Metoprolol label",
      });
    }
    if (has(/2.{0,3}av block|3.{0,3}av block|sick sinus|hr ?< ?50/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "Advanced AV block / severe bradycardia",
        detail: "Further nodal blockade may cause asystole.",
        action: "Pacing first; avoid until rhythm secured.",
        source: "ACC/AHA/HRS 2018 Bradycardia Guideline",
      });
    }
    if (has(/decompensated|acute heart failure/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Drug–Disease",
        title: "Acute decompensated heart failure",
        detail: "Negative inotropy worsens cardiogenic shock.",
        action: "Diurese & stabilise first; start low-dose only when euvolaemic.",
        source: "AHA/ACC/HFSA 2022 HF Guideline",
      });
    }
  }

  if (tag === "nondhp-ccb") {
    if (has(/heart failure|lvef ?< ?40|reduced ejection/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Drug–Disease",
        title: "Heart failure with reduced EF (LVEF < 40 %)",
        detail: "Diltiazem/verapamil are negatively inotropic — increased mortality in HFrEF.",
        action: "Use a β-blocker or DHP-CCB instead.",
        source: "ESC 2021 HF Guidelines",
      });
    }
  }

  if (tag === "thiazide") {
    if (has(/gout/)) {
      alerts.push({
        severity: "caution",
        kind: "Drug–Disease",
        title: "Gout — hyperuricaemia",
        detail: "Thiazides raise urate and precipitate flares.",
        action: "Prefer losartan (uricosuric) or amlodipine.",
        source: "ACR 2020 Gout Guideline",
      });
    }
    if (has(/egfr ?< ?30|ckd stage [45]/)) {
      alerts.push({
        severity: "major",
        kind: "Drug–Disease",
        title: "Severe CKD (eGFR < 30)",
        detail: "Thiazides lose efficacy below eGFR 30; switch to loop diuretic.",
        action: "Use furosemide 20–40 mg PO BID.",
        source: "KDIGO 2024",
      });
    }
  }

  if (tag === "ssri" || tag === "snri") {
    if (allergic(/ssri|sertraline|citalopram/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "Documented SSRI/SNRI hypersensitivity",
        detail: "—",
        action: "Choose a different class (e.g. bupropion).",
        source: "FDA labels",
      });
    }
    if (age < 25) {
      alerts.push({
        severity: "caution",
        kind: "Special population",
        title: "Suicidality risk in patients < 25 y (FDA boxed warning)",
        detail: "Increased suicidal ideation in the first weeks of therapy.",
        action: "Weekly safety check-ins for 4 wk; document risk-benefit.",
        source: "FDA boxed warning — all SSRIs/SNRIs",
      });
    }
    if (has(/bipolar/)) {
      alerts.push({
        severity: "major",
        kind: "Drug–Disease",
        title: "Bipolar disorder — mania risk",
        detail: "Unopposed antidepressants can induce mania.",
        action: "Co-prescribe a mood stabiliser; psychiatry consult.",
        source: "APA 2024 Mood Disorders",
      });
    }
  }

  if (tag === "ache-inhibitor") {
    if (has(/bradycardia|sick sinus|av block/)) {
      alerts.push({
        severity: "major",
        kind: "Drug–Disease",
        title: "Bradyarrhythmia risk",
        detail: "Cholinergic effect → syncope and bradycardia.",
        action: "Baseline ECG; avoid if HR < 50.",
        source: "FDA Donepezil label",
      });
    }
  }

  if (tag === "statin") {
    if (couldBePregnant) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "Pregnancy",
        detail: "Statins are contraindicated in pregnancy and lactation.",
        action: "Defer until post-partum and post-lactation.",
        source: "FDA Atorvastatin label (2021 update)",
      });
    }
    if (has(/active liver|hepatitis|alt ?> ?3/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Drug–Disease",
        title: "Active liver disease",
        detail: "Statins are contraindicated with ALT > 3× ULN.",
        action: "Treat hepatic disease first.",
        source: "AHA/ACC 2018 Cholesterol Guideline",
      });
    }
  }

  if (tag === "aspirin") {
    if (age >= 70) {
      alerts.push({
        severity: "major",
        kind: "Special population",
        title: "Age ≥ 70 — primary-prevention bleeding risk",
        detail: "Net harm in ASPREE trial for primary prevention in older adults.",
        action: "Avoid routine ASA for primary prevention.",
        source: "USPSTF 2022; ASPREE NEJM 2018",
      });
    }
    if (has(/peptic ulcer|gi bleed|haemophil|warfarin|doac/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "Active bleeding / high bleed risk",
        detail: "Significantly increases major GI/intracranial bleed.",
        action: "Avoid; consider PPI if absolutely needed.",
        source: "ACC/AHA 2019 Primary Prevention",
      });
    }
  }

  if (tag === "metformin") {
    if (has(/egfr ?< ?30|severe ckd|stage [45] ckd/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "eGFR < 30 mL/min/1.73 m²",
        detail: "Lactic-acidosis risk.",
        action: "Avoid; use DPP-4 inhibitor or GLP-1 RA.",
        source: "FDA Metformin label (2016 update); ADA 2024",
      });
    }
    if (has(/contrast|iv contrast/)) {
      alerts.push({
        severity: "caution",
        kind: "Monitoring",
        title: "IV iodinated contrast",
        detail: "Hold metformin 48 h around contrast if eGFR < 60.",
        action: "Pause and recheck creatinine post-procedure.",
        source: "ACR Contrast Manual 2024",
      });
    }
  }

  if (tag === "glp1") {
    if (has(/medullary thyroid|men ?2|pancreatitis/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "Personal/family MTC, MEN-2, or prior pancreatitis",
        detail: "FDA boxed warning for thyroid C-cell tumours.",
        action: "Use an SGLT2 inhibitor instead.",
        source: "FDA Semaglutide label",
      });
    }
  }

  if (tag === "dora") {
    if (has(/narcolepsy/)) {
      alerts.push({
        severity: "contraindicated",
        kind: "Contraindication",
        title: "Narcolepsy",
        detail: "Orexin antagonism worsens cataplexy.",
        action: "Use sleep-hygiene + CBT-I.",
        source: "FDA Lemborexant label",
      });
    }
  }

  if (tag === "saba") {
    if (has(/tachyarrhythmia|long qt|hyperthyroid/)) {
      alerts.push({
        severity: "caution",
        kind: "Drug–Disease",
        title: "Tachyarrhythmia / long-QT",
        detail: "β2-agonists can ↑HR and prolong QT.",
        action: "Monitor ECG; minimise dose.",
        source: "GINA 2024",
      });
    }
  }

  // Allergy free-text match against the example drug name
  const generic = rec.example.toLowerCase().split(/[\s,]/)[0];
  if (generic && generic.length > 3 && allergic(new RegExp(generic.slice(0, 6)))) {
    alerts.push({
      severity: "contraindicated",
      kind: "Contraindication",
      title: `Documented allergy to ${generic}`,
      detail: "Patient intake form records a hypersensitivity.",
      action: "Choose an alternative agent.",
      source: "Patient-reported allergy",
    });
  }

  // Beers Criteria — older adults
  if (age >= 65) {
    if (tag === "ssri" || tag === "snri") {
      alerts.push({
        severity: "caution",
        kind: "Special population",
        title: "Age ≥ 65 — hyponatraemia & fall risk (Beers 2023)",
        detail: "SSRIs/SNRIs ↑ SIADH and orthostatic falls in older adults.",
        action: "Check baseline Na⁺; start low, titrate slowly.",
        source: "AGS Beers Criteria 2023",
      });
    }
    if (tag === "antimuscarinic") {
      alerts.push({
        severity: "caution",
        kind: "Special population",
        title: "Anticholinergic burden in older adults",
        detail: "Delirium and urinary retention risk.",
        action: "Use lowest effective dose; reassess daily.",
        source: "AGS Beers Criteria 2023",
      });
    }
  }

  return alerts;
}

/* ------------------------------------------------------------------ */
/*  Drug–drug interactions across the recommended regimen              */
/* ------------------------------------------------------------------ */

type DDI = { a: string; b: string; alert: SafetyAlert };

const DDI_TABLE: DDI[] = [
  {
    a: "acei", b: "arb",
    alert: {
      severity: "major", kind: "Drug–Drug",
      title: "ACEi + ARB — dual RAAS blockade",
      detail: "ONTARGET trial showed ↑ AKI, hyperkalaemia, syncope with no mortality benefit.",
      action: "Use one or the other, not both.",
      source: "FDA Lisinopril label; ONTARGET NEJM 2008",
    },
  },
  {
    a: "acei", b: "thiazide",
    alert: {
      severity: "info", kind: "Drug–Drug",
      title: "ACEi + thiazide — synergistic BP lowering",
      detail: "Generally beneficial; watch first-dose hypotension and ↓Na⁺/K⁺.",
      action: "Take first dose at bedtime; recheck electrolytes at 1–2 wk.",
      source: "NICE NG136",
    },
  },
  {
    a: "beta-blocker", b: "nondhp-ccb",
    alert: {
      severity: "major", kind: "Drug–Drug",
      title: "β-blocker + diltiazem/verapamil",
      detail: "Additive AV-nodal blockade — risk of severe bradycardia and AV block.",
      action: "Avoid combination unless under specialist supervision with telemetry.",
      source: "ESC 2020 NSTE-ACS Guideline",
    },
  },
  {
    a: "ssri", b: "snri",
    alert: {
      severity: "major", kind: "Drug–Drug",
      title: "Serotonergic combination — serotonin syndrome",
      detail: "Risk of hyperthermia, clonus, autonomic instability.",
      action: "Do not combine; wash-out ≥ 2 wk (5 wk for fluoxetine).",
      source: "FDA SSRI labels",
    },
  },
  {
    a: "ssri", b: "aspirin",
    alert: {
      severity: "caution", kind: "Drug–Drug",
      title: "SSRI + antiplatelet — bleeding risk",
      detail: "Combined platelet inhibition ↑ GI bleed ~2×.",
      action: "Consider PPI cover; review necessity of ASA.",
      source: "Lexicomp; BMJ 2015;350:h3517",
    },
  },
  {
    a: "beta-blocker", b: "ache-inhibitor",
    alert: {
      severity: "major", kind: "Drug–Drug",
      title: "β-blocker + cholinesterase inhibitor",
      detail: "Additive bradycardia and syncope.",
      action: "Baseline ECG; monitor HR.",
      source: "FDA Donepezil label",
    },
  },
  {
    a: "statin", b: "nondhp-ccb",
    alert: {
      severity: "caution", kind: "Drug–Drug",
      title: "Statin + diltiazem/verapamil — CYP3A4",
      detail: "↑ simvastatin/atorvastatin exposure → myopathy risk.",
      action: "Use pravastatin/rosuvastatin or cap atorvastatin ≤ 20 mg.",
      source: "FDA Atorvastatin label",
    },
  },
  {
    a: "saba", b: "beta-blocker",
    alert: {
      severity: "major", kind: "Drug–Drug",
      title: "Salbutamol + β-blocker",
      detail: "β-blocker antagonises bronchodilator effect.",
      action: "Use cardioselective agent at lowest dose; review necessity.",
      source: "GINA 2024",
    },
  },
  {
    a: "metformin", b: "thiazide",
    alert: {
      severity: "info", kind: "Drug–Drug",
      title: "Metformin + thiazide — glycaemic effect",
      detail: "Thiazides can ↑ glucose; monitor HbA1c.",
      action: "Recheck HbA1c at 3 months.",
      source: "ADA 2024",
    },
  },
  {
    a: "dora", b: "ssri",
    alert: {
      severity: "caution", kind: "Drug–Drug",
      title: "Lemborexant + CYP3A inhibitor (some SSRIs)",
      detail: "Fluvoxamine/fluoxetine ↑ lemborexant exposure → next-day sedation.",
      action: "Use ramelteon instead, or sertraline/escitalopram.",
      source: "FDA Lemborexant label",
    },
  },
  {
    a: "acei", b: "saba",
    alert: {
      severity: "info", kind: "Drug–Drug",
      title: "ACEi cough vs asthma symptoms",
      detail: "ACEi-induced cough can be misread as bronchospasm.",
      action: "If new cough, trial ARB.",
      source: "AHA 2017 HTN Guideline",
    },
  },
];

function checkInteractions(tagsByRec: { rec: MedicationRec; tags: string[] }[]): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  for (let i = 0; i < tagsByRec.length; i++) {
    for (let j = i + 1; j < tagsByRec.length; j++) {
      const A = tagsByRec[i].tags, B = tagsByRec[j].tags;
      for (const ddi of DDI_TABLE) {
        if ((A.includes(ddi.a) && B.includes(ddi.b)) || (A.includes(ddi.b) && B.includes(ddi.a))) {
          alerts.push(ddi.alert);
        }
      }
    }
  }
  return alerts;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

const sevRank: Record<SafetySeverity, number> = {
  info: 0, caution: 1, major: 2, contraindicated: 3,
};

export function reviewPlan(plan: MedicationPlan, patient: PatientInfo | null): PlanSafetyReport {
  const tagged = plan.options.map((rec) => ({ rec, tags: tagDrug(rec) }));
  const drugs: DrugSafetyReport[] = tagged.map(({ rec, tags }) => {
    const alerts = tags.flatMap((t) => checkContraindications(t, rec, patient));
    const blocked = alerts.some((a) => a.severity === "contraindicated");
    return { drugClass: rec.drugClass, example: rec.example, alerts, blocked };
  });
  const interactions = checkInteractions(tagged);
  const all = [...drugs.flatMap((d) => d.alerts), ...interactions];
  const worst = all.reduce<SafetySeverity>(
    (w, a) => (sevRank[a.severity] > sevRank[w] ? a.severity : w),
    "info",
  );
  return { condition: plan.finding.condition, drugs, interactions, worst };
}

export function reviewPlans(plans: MedicationPlan[], patient: PatientInfo | null): PlanSafetyReport[] {
  return plans.map((p) => reviewPlan(p, patient));
}

export const SAFETY_DISCLAIMER =
  "Safety checks combine FDA labels (DailyMed), Lexicomp/Micromedex severity tiers, AHA/ACC, ESC, NICE, BNF and the AGS Beers Criteria 2023. They are decision-support only — a licensed clinician must reconcile the patient's full medication list, allergies, labs and renal/hepatic function before prescribing.";