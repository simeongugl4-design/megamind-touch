import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const cognitiveMetrics = [
  ["IQ Estimate (WAIS-equiv.)", "142", "85-145", "High"],
  ["Working Memory Index", "138", "85-130", "Superior"],
  ["Processing Speed", "120 ms", "150-250 ms", "Above avg"],
  ["Emotional IQ (MSCEIT-est.)", "138", "90-130", "Superior"],
  ["Creativity Index (TTCT-est.)", "91%", "50-90%", "High"],
  ["Neural Efficiency (BOLD)", "96.3%", "70-95%", "High"],
];

const brainRegions = [
  ["Prefrontal Cortex", "Executive function", "94%", "Normal"],
  ["Hippocampus", "Memory consolidation", "88%", "Normal"],
  ["Amygdala", "Emotional processing", "76%", "Normal"],
  ["Broca's / Wernicke's", "Language", "82%", "Normal"],
  ["Visual Cortex (V1-V5)", "Visual processing", "91%", "Normal"],
  ["Cerebellum", "Motor coordination", "85%", "Normal"],
];

const eegBands = [
  ["Delta (0.5-4 Hz)", "8.2 µV", "Low (awake)", "Normal"],
  ["Theta (4-8 Hz)", "12.4 µV", "Moderate", "Normal"],
  ["Alpha (8-13 Hz)", "24.7 µV", "Dominant occipital", "Normal"],
  ["Beta (13-30 Hz)", "18.3 µV", "Frontal dominant", "Normal"],
  ["Gamma (30-100 Hz)", "6.1 µV", "Active cognition", "Normal"],
];

const geneticTraits = [
  ["Eye Color", "Brown (heterozygous)", "OCA2/HERC2", "97%"],
  ["Hair Type", "Wavy", "TCHH/WNT10A", "89%"],
  ["Caffeine Metabolism", "Fast metabolizer", "CYP1A2 *1A/*1A", "91%"],
  ["Muscle Fiber Type", "Mixed (endurance)", "ACTN3 RX", "86%"],
  ["Lactose Tolerance", "Tolerant", "MCM6/LCT", "98%"],
  ["Alcohol Flush", "Normal", "ALDH2/ADH1B", "93%"],
  ["Circadian Rhythm", "Morning type", "PER2/CLOCK", "82%"],
];

const healthRisks = [
  ["Type 2 Diabetes", "Below Avg (0.7x)", "TCF7L2/PPARG", "Lifestyle modifiable"],
  ["Coronary Heart Disease", "Average (1.0x)", "9p21.3/LPA", "Routine screening"],
  ["Alzheimer's Disease", "Below Avg (0.6x)", "APOE e3/e3", "No additional action"],
  ["Macular Degeneration", "Slightly Elev. (1.4x)", "CFH/ARMS2", "Annual ophthalmology"],
  ["Celiac Disease", "Below Avg (0.5x)", "HLA-DQ2/DQ8 neg", "No additional action"],
  ["Parkinson's Disease", "Average (1.0x)", "LRRK2/GBA wt", "Routine"],
];

const ancestry = [
  ["European", "62%"],
  ["South Asian", "18%"],
  ["East Asian", "11%"],
  ["Middle Eastern", "6%"],
  ["Sub-Saharan African", "3%"],
];

const cardiacData = [
  ["Resting Heart Rate", "72 bpm", "60-100 bpm", "Normal"],
  ["Systolic BP", "120 mmHg", "<130 mmHg", "Optimal"],
  ["Diastolic BP", "80 mmHg", "<85 mmHg", "Optimal"],
  ["SpO2", "98%", ">=95%", "Normal"],
  ["Ejection Fraction", "62%", "55-70%", "Normal"],
  ["Cardiac Output", "5.2 L/min", "4-8 L/min", "Normal"],
  ["Stroke Volume", "72 mL", "60-100 mL", "Normal"],
  ["VO2 Max", "42 mL/kg/min", "35-45", "Above avg"],
  ["HRV (RMSSD)", "62 ms", "30-100 ms", "Good"],
  ["QTc (Bazett)", "410 ms", "350-440 ms", "Normal"],
  ["PR Interval", "160 ms", "120-200 ms", "Normal"],
  ["QRS Duration", "88 ms", "70-110 ms", "Normal"],
];

const valveData = [
  ["Mitral Valve", "Normal", "None", "Competent closure"],
  ["Aortic Valve", "Normal (tricuspid)", "None", "No stenosis"],
  ["Tricuspid Valve", "Normal", "Trace (physiologic)", "Within normal"],
  ["Pulmonary Valve", "Normal", "None", "No stenosis"],
];

const coronaryData = [
  ["Left Anterior Descending (LAD)", "0%", "Patent"],
  ["Right Coronary Artery (RCA)", "2%", "Minimal, non-obstructive"],
  ["Left Circumflex (LCx)", "0%", "Patent"],
  ["Left Main Coronary (LM)", "0%", "Patent"],
];

const calibrationLog = [
  ["00:00.0", "Sensor init", "—", "—", "—", "OK"],
  ["00:00.6", "Baseline drift", "0.42 mV/s", "0.81", "84%", "OK"],
  ["00:01.2", "SNR ramp", "0.31 mV/s", "1.94", "91%", "OK"],
  ["00:01.8", "Alignment lock", "0.22 mV/s", "3.71", "96%", "OK"],
  ["00:02.4", "Channel calib", "0.18 mV/s", "5.82", "98%", "OK"],
  ["00:03.0", "Handoff to scan", "0.15 mV/s", "7.41", "99%", "PASS A+"],
];

// Helpers ---------------------------------------------------------------
const C = {
  primary: [0, 180, 216] as [number, number, number],
  dna: [16, 185, 129] as [number, number, number],
  heart: [239, 68, 68] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  line: [203, 213, 225] as [number, number, number],
  bgSoft: [241, 245, 249] as [number, number, number],
};

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

function sectionHeader(doc: jsPDF, title: string, y: number, color: [number, number, number]) {
  doc.setFillColor(...color);
  doc.rect(14, y, 3, 7, "F");
  doc.setTextColor(...C.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title.toUpperCase(), 20, y + 5.2);
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.2);
  doc.line(14, y + 8.5, 196, y + 8.5);
  return y + 12;
}

function ensureSpace(doc: jsPDF, y: number, needed = 40) {
  if (y + needed > 285) {
    doc.addPage();
    return 20;
  }
  return y;
}

// Synthetic ECG/EEG/DNA waveforms drawn directly to PDF -----------------
function drawECG(doc: jsPDF, x: number, y: number, w: number, h: number) {
  // Grid
  doc.setDrawColor(254, 226, 226);
  doc.setLineWidth(0.1);
  for (let i = 0; i <= w; i += 4) doc.line(x + i, y, x + i, y + h);
  for (let j = 0; j <= h; j += 4) doc.line(x, y + j, x + w, y + j);
  // PQRST trace
  doc.setDrawColor(...C.heart);
  doc.setLineWidth(0.5);
  const mid = y + h / 2;
  let prev = { x, y: mid };
  const beats = 5;
  const beatW = w / beats;
  for (let b = 0; b < beats; b++) {
    const bx = x + b * beatW;
    const pts: [number, number][] = [
      [bx, mid],
      [bx + beatW * 0.1, mid],
      [bx + beatW * 0.15, mid - 1.5], // P
      [bx + beatW * 0.2, mid],
      [bx + beatW * 0.3, mid],
      [bx + beatW * 0.32, mid + 1], // Q
      [bx + beatW * 0.35, mid - h * 0.45], // R
      [bx + beatW * 0.38, mid + 2], // S
      [bx + beatW * 0.45, mid],
      [bx + beatW * 0.6, mid],
      [bx + beatW * 0.7, mid - 2.5], // T
      [bx + beatW * 0.8, mid],
      [bx + beatW, mid],
    ];
    for (const p of pts) {
      doc.line(prev.x, prev.y, p[0], p[1]);
      prev = { x: p[0], y: p[1] };
    }
  }
  // Border
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("Lead II  •  25 mm/s  •  10 mm/mV", x + 1, y - 1);
}

function drawEEG(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(219, 234, 254);
  doc.setLineWidth(0.1);
  for (let i = 0; i <= w; i += 5) doc.line(x + i, y, x + i, y + h);
  const channels = [
    { name: "Fp1 α", color: [37, 99, 235], freq: 10, amp: 2.4 },
    { name: "Cz  β", color: [124, 58, 237], freq: 22, amp: 1.6 },
    { name: "O1  γ", color: [14, 165, 233], freq: 40, amp: 1.0 },
    { name: "T3  θ", color: [99, 102, 241], freq: 6, amp: 2.0 },
  ];
  const chH = h / channels.length;
  channels.forEach((ch, idx) => {
    const baseY = y + chH * (idx + 0.5);
    doc.setDrawColor(ch.color[0], ch.color[1], ch.color[2]);
    doc.setLineWidth(0.4);
    let prev = { x, y: baseY };
    for (let i = 1; i <= w; i++) {
      const t = i / w;
      const v = baseY - Math.sin(t * Math.PI * 2 * ch.freq * 0.4) * ch.amp
                       - Math.sin(t * Math.PI * 2 * ch.freq * 0.7 + 1.2) * (ch.amp * 0.4);
      doc.line(prev.x, prev.y, x + i, v);
      prev = { x: x + i, y: v };
    }
    doc.setFontSize(6);
    doc.setTextColor(...C.muted);
    doc.text(ch.name, x - 7, baseY + 1.2);
  });
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("EEG (4-channel synthetic)  •  10 s window", x + 1, y - 1);
}

function drawDNA(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);
  const bases = ["A", "T", "G", "C", "T", "A", "C", "G", "A", "T", "G", "C", "T", "A", "G", "C", "A", "T", "C", "G"];
  const step = w / bases.length;
  doc.setLineWidth(0.4);
  for (let i = 0; i < bases.length; i++) {
    const cx = x + step * (i + 0.5);
    const phase = (i / bases.length) * Math.PI * 4;
    const top = y + h / 2 + Math.sin(phase) * (h / 2 - 4);
    const bot = y + h / 2 - Math.sin(phase) * (h / 2 - 4);
    const isFirst = ["A", "T"].includes(bases[i]);
    doc.setDrawColor(...(isFirst ? C.dna : [245, 158, 11] as [number, number, number]));
    doc.line(cx, top, cx, bot);
    doc.setFontSize(6);
    doc.setTextColor(...C.text);
    doc.text(bases[i], cx - 1, y + h + 3);
  }
  // Backbone curves
  doc.setDrawColor(...C.dna);
  doc.setLineWidth(0.5);
  let pTop = { x, y: y + h / 2 };
  let pBot = { x, y: y + h / 2 };
  for (let i = 1; i <= w; i++) {
    const phase = (i / w) * Math.PI * 4;
    const ny1 = y + h / 2 + Math.sin(phase) * (h / 2 - 4);
    const ny2 = y + h / 2 - Math.sin(phase) * (h / 2 - 4);
    doc.line(pTop.x, pTop.y, x + i, ny1);
    doc.line(pBot.x, pBot.y, x + i, ny2);
    pTop = { x: x + i, y: ny1 };
    pBot = { x: x + i, y: ny2 };
  }
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("Sequence excerpt  •  20 bp window  •  GC 50%", x + 1, y - 1);
}

function drawConfidenceTrend(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);
  // Axes labels
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("100%", x - 7, y + 3);
  doc.text("0%", x - 5, y + h);
  doc.text("0s", x, y + h + 4);
  doc.text("13s", x + w - 5, y + h + 4);
  // Calibration shaded zone (0-3s out of 13s)
  doc.setFillColor(254, 243, 199);
  doc.rect(x, y, (3 / 13) * w, h, "F");
  // Trend line
  const samples = 60;
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.6);
  let prev: [number, number] | null = null;
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 13;
    let conf: number;
    if (t < 3) conf = (t / 3) * 70 + Math.random() * 3;
    else conf = 70 + (1 - Math.exp(-(t - 3) / 3)) * 29.7 + Math.sin(t * 2) * 0.3;
    conf = Math.min(99.97, conf);
    const px = x + (t / 13) * w;
    const py = y + h - (conf / 100) * h;
    if (prev) doc.line(prev[0], prev[1], px, py);
    prev = [px, py];
  }
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("Calibration  ▒▒▒  Acquisition", x + 2, y + 4);
  doc.text("Final confidence: 99.94%", x + w - 42, y + 4);
}

// Main builder ----------------------------------------------------------
function buildPDF(): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const now = new Date();
  const reportId = `MM-${now.getTime().toString(36).toUpperCase()}`;
  const sessionId = `SES-${pad(now.getFullYear() % 100)}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const patientId = `PT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  // ========= COVER =========
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("MEGAMIND", 14, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("Multimodal Biometric Scan Report", 14, 33);
  doc.setFontSize(8);
  doc.text("Neural • Genomic • Cardiac", 14, 39);
  // Right meta
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  const metaX = 196;
  doc.text(`Report ID: ${reportId}`, metaX, 18, { align: "right" });
  doc.text(`Session: ${sessionId}`, metaX, 23, { align: "right" });
  doc.text(`Patient: ${patientId}`, metaX, 28, { align: "right" });
  doc.text(`Generated: ${now.toLocaleString()}`, metaX, 33, { align: "right" });
  doc.text(`Device: MM-Scanner v4.0  •  FW 4.2.1`, metaX, 38, { align: "right" });
  doc.text(`Operator: SYSTEM-AUTO`, metaX, 43, { align: "right" });

  // Summary panel
  let y = 70;
  doc.setFillColor(...C.bgSoft);
  doc.roundedRect(14, y, 182, 36, 2, 2, "F");
  doc.setTextColor(...C.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("EXECUTIVE SUMMARY", 18, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const summary = [
    "Multimodal scan completed across neural (EEG-equivalent), cardiac (ECG-equivalent + cuff-less hemodynamics)",
    "and genomic (epithelial-cell SNP) channels. Acquisition window: 13.0 s (3.0 s calibration + 10.0 s capture).",
    "All three modalities passed quality gates. No critical anomalies detected. Findings within reference ranges",
    "for a healthy adult; minor lifestyle-modifiable predispositions noted (see Genomic Risk section).",
  ];
  summary.forEach((line, i) => doc.text(line, 18, y + 14 + i * 5));

  // Quality gates row
  y += 42;
  const gates = [
    { label: "Calibration", value: "A+", sub: "Conf. 99.0%" },
    { label: "Signal Quality", value: "98.7%", sub: "SNR 7.4" },
    { label: "Acquisition", value: "10.0 s", sub: "60 fps" },
    { label: "Final Confidence", value: "99.94%", sub: "All channels" },
  ];
  const gw = 42;
  gates.forEach((g, i) => {
    const gx = 14 + i * (gw + 4);
    doc.setDrawColor(...C.line);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(gx, y, gw, 22, 2, 2, "FD");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(g.label.toUpperCase(), gx + 3, y + 5);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.primary);
    doc.text(g.value, gx + 3, y + 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(g.sub, gx + 3, y + 18);
  });

  // Confidence trend
  y += 30;
  y = sectionHeader(doc, "Confidence Score Trend", y, C.primary);
  drawConfidenceTrend(doc, 22, y, 168, 36);
  y += 44;

  // Calibration log
  y = sectionHeader(doc, "Pre-Scan Calibration Log", y, C.primary);
  autoTable(doc, {
    startY: y,
    head: [["Time", "Phase", "Drift", "SNR", "Alignment", "Status"]],
    body: calibrationLog,
    theme: "grid",
    headStyles: { fillColor: C.primary, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: C.text },
    margin: { left: 14, right: 14 },
  });

  // ========= NEURAL =========
  doc.addPage();
  y = 20;
  y = sectionHeader(doc, "Neural Assessment", y, C.primary);
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("Acquisition: 10s, 4-channel synthetic EEG band-mapping; cognitive estimates derived from neural-pattern model.", 14, y);
  y += 6;
  drawEEG(doc, 22, y, 168, 36);
  y += 42;

  y = sectionHeader(doc, "Cognitive Metrics", y, C.primary);
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value", "Reference", "Interpretation"]],
    body: cognitiveMetrics,
    theme: "striped",
    headStyles: { fillColor: C.primary, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.text },
    margin: { left: 14, right: 14 },
  });
  // @ts-expect-error jspdf-autotable adds lastAutoTable
  y = doc.lastAutoTable.finalY + 6;

  y = ensureSpace(doc, y, 60);
  y = sectionHeader(doc, "Brain Region Activity", y, C.primary);
  autoTable(doc, {
    startY: y,
    head: [["Region", "Function", "Activity", "Finding"]],
    body: brainRegions,
    theme: "striped",
    headStyles: { fillColor: C.primary, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.text },
    margin: { left: 14, right: 14 },
  });
  // @ts-expect-error
  y = doc.lastAutoTable.finalY + 6;

  y = ensureSpace(doc, y, 60);
  y = sectionHeader(doc, "EEG Band Power", y, C.primary);
  autoTable(doc, {
    startY: y,
    head: [["Band", "Amplitude", "Distribution", "Finding"]],
    body: eegBands,
    theme: "striped",
    headStyles: { fillColor: C.primary, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.text },
    margin: { left: 14, right: 14 },
  });

  // ========= CARDIAC =========
  doc.addPage();
  y = 20;
  y = sectionHeader(doc, "Cardiac Assessment", y, C.heart);
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("Acquisition: pulse-wave + simulated 12-lead reconstruction. ECG strip below is illustrative.", 14, y);
  y += 6;
  drawECG(doc, 22, y, 168, 30);
  y += 36;

  y = sectionHeader(doc, "Hemodynamics & Conduction", y, C.heart);
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value", "Reference", "Finding"]],
    body: cardiacData,
    theme: "striped",
    headStyles: { fillColor: C.heart, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.text },
    margin: { left: 14, right: 14 },
  });
  // @ts-expect-error
  y = doc.lastAutoTable.finalY + 6;

  y = ensureSpace(doc, y, 50);
  y = sectionHeader(doc, "Valve Assessment", y, C.heart);
  autoTable(doc, {
    startY: y,
    head: [["Valve", "Status", "Regurgitation", "Comment"]],
    body: valveData,
    theme: "striped",
    headStyles: { fillColor: C.heart, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.text },
    margin: { left: 14, right: 14 },
  });
  // @ts-expect-error
  y = doc.lastAutoTable.finalY + 6;

  y = ensureSpace(doc, y, 50);
  y = sectionHeader(doc, "Coronary Arteries", y, C.heart);
  autoTable(doc, {
    startY: y,
    head: [["Artery", "Estimated Stenosis", "Comment"]],
    body: coronaryData,
    theme: "striped",
    headStyles: { fillColor: C.heart, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.text },
    margin: { left: 14, right: 14 },
  });

  // ========= GENOMIC =========
  doc.addPage();
  y = 20;
  y = sectionHeader(doc, "Genomic Assessment", y, C.dna);
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("Acquisition: 4.1M SNP markers from epithelial cells. Sequence excerpt below is illustrative.", 14, y);
  y += 6;
  drawDNA(doc, 22, y, 168, 26);
  y += 36;

  y = sectionHeader(doc, "Ancestry Composition", y, C.dna);
  autoTable(doc, {
    startY: y,
    head: [["Region", "Percentage"]],
    body: ancestry,
    theme: "striped",
    headStyles: { fillColor: C.dna, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.text },
    margin: { left: 14, right: 14 },
  });
  // @ts-expect-error
  y = doc.lastAutoTable.finalY + 6;

  y = ensureSpace(doc, y, 70);
  y = sectionHeader(doc, "Phenotypic Genetic Traits", y, C.dna);
  autoTable(doc, {
    startY: y,
    head: [["Trait", "Result", "Gene Locus", "Confidence"]],
    body: geneticTraits,
    theme: "striped",
    headStyles: { fillColor: C.dna, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.text },
    margin: { left: 14, right: 14 },
  });
  // @ts-expect-error
  y = doc.lastAutoTable.finalY + 6;

  y = ensureSpace(doc, y, 70);
  y = sectionHeader(doc, "Polygenic Risk Assessment", y, C.dna);
  autoTable(doc, {
    startY: y,
    head: [["Condition", "Relative Risk", "Loci", "Clinical Action"]],
    body: healthRisks,
    theme: "striped",
    headStyles: { fillColor: C.dna, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.text },
    margin: { left: 14, right: 14 },
  });

  // ========= CLINICAL NOTES + DISCLAIMER =========
  doc.addPage();
  y = 20;
  y = sectionHeader(doc, "Clinician Notes & Recommendations", y, C.text);
  doc.setFontSize(9);
  doc.setTextColor(...C.text);
  const notes = [
    "1. Cardiac: All hemodynamic parameters within reference ranges. Continue routine cardiovascular screening.",
    "2. Neural: EEG band distribution and cognitive markers are within normal limits for age-matched cohort.",
    "3. Genomic: APOE e3/e3 — non-elevated Alzheimer's risk. CFH variant suggests annual ophthalmologic exam.",
    "4. Metabolic: Fast CYP1A2 caffeine metabolism — counsel on caffeine timing if sleep complaints arise.",
    "5. Lifestyle: Below-average T2D risk; reinforce continued physical activity and balanced nutrition.",
    "6. Follow-up: Re-scan recommended in 12 months or upon clinical indication.",
  ];
  notes.forEach((n, i) => doc.text(n, 14, y + i * 6, { maxWidth: 182 }));
  y += notes.length * 6 + 8;

  // Signature block
  doc.setDrawColor(...C.line);
  doc.line(14, y + 18, 90, y + 18);
  doc.line(110, y + 18, 196, y + 18);
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("Reviewing Clinician (Signature & Date)", 14, y + 22);
  doc.text("Reviewed By (Name, Credentials)", 110, y + 22);

  // Disclaimer
  y += 32;
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(234, 179, 8);
  doc.roundedRect(14, y, 182, 36, 2, 2, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(146, 64, 14);
  doc.text("IMPORTANT — RESEARCH-GRADE SIMULATION", 18, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  const disc = [
    "This report is generated from a research-grade biometric simulation system. Values are physiologically",
    "plausible synthetic data produced for visualization, prototyping and clinician workflow demonstration.",
    "It is NOT a medical diagnosis and must not be used as a substitute for clinical evaluation, laboratory",
    "testing, or imaging. Any decision-making for an individual patient must rely on validated diagnostic",
    "instruments, certified labs, and a licensed clinician.",
  ];
  disc.forEach((line, i) => doc.text(line, 18, y + 12 + i * 4.5));

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C.line);
    doc.line(14, 290, 196, 290);
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(`MegaMind Scan Report  •  ${reportId}  •  ${now.toISOString()}`, 14, 294);
    doc.text(`Page ${i} of ${pageCount}`, 196, 294, { align: "right" });
  }

  return doc;
}

const ReportExport = ({ visible }: { visible: boolean }) => {
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const doc = buildPDF();
      doc.save(`MegaMind-Scan-Report-${Date.now()}.pdf`);
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  if (!visible) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-12 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="p-6 rounded-xl border border-primary/20 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-green-500/5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-orbitron text-sm font-bold text-foreground">Clinician PDF Report</h3>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                Multi-page PDF with timestamped session metadata, calibration log, confidence trend, ECG/EEG/DNA
                visualizations, and full neural/cardiac/genomic findings — formatted for clinical review.
              </p>
            </div>
          </div>
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 font-orbitron text-xs font-bold tracking-wider uppercase text-background hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Generating PDF..." : "Download PDF Report"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReportExport;
