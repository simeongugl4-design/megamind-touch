import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

const cognitiveMetrics = [
  { label: "IQ Estimate", value: "142" },
  { label: "Memory Capacity", value: "2.5 PB" },
  { label: "Processing Speed", value: "120 ms" },
  { label: "Emotional IQ", value: "138" },
  { label: "Creativity Index", value: "91%" },
  { label: "Neural Efficiency", value: "96.3%" },
];

const brainRegions = [
  { name: "Prefrontal Cortex", activity: "94%" },
  { name: "Hippocampus", activity: "88%" },
  { name: "Amygdala", activity: "76%" },
  { name: "Broca's & Wernicke's", activity: "82%" },
  { name: "Visual Cortex", activity: "91%" },
  { name: "Cerebellum", activity: "85%" },
];

const geneticTraits = [
  { trait: "Eye Color", value: "Brown (heterozygous)", gene: "OCA2/HERC2", confidence: "97%" },
  { trait: "Hair Type", value: "Wavy", gene: "TCHH/WNT10A", confidence: "89%" },
  { trait: "Skin Pigmentation", value: "Medium", gene: "SLC24A5/MC1R", confidence: "94%" },
  { trait: "Caffeine Metabolism", value: "Fast metabolizer", gene: "CYP1A2", confidence: "91%" },
  { trait: "Muscle Fiber Type", value: "Mixed (endurance bias)", gene: "ACTN3", confidence: "86%" },
  { trait: "Lactose Tolerance", value: "Tolerant", gene: "MCM6/LCT", confidence: "98%" },
  { trait: "Alcohol Flush", value: "Normal metabolism", gene: "ALDH2/ADH1B", confidence: "93%" },
  { trait: "Circadian Rhythm", value: "Moderate morning type", gene: "PER2/CLOCK", confidence: "82%" },
];

const healthRisks = [
  { condition: "Type 2 Diabetes", risk: "Below Average", gene: "TCF7L2/PPARG" },
  { condition: "Coronary Heart Disease", risk: "Average", gene: "9p21.3/LPA" },
  { condition: "Alzheimer's Disease", risk: "Below Average", gene: "APOE ε3/ε3" },
  { condition: "Macular Degeneration", risk: "Slightly Elevated", gene: "CFH/ARMS2" },
  { condition: "Celiac Disease", risk: "Below Average", gene: "HLA-DQ2/DQ8" },
  { condition: "Parkinson's Disease", risk: "Average", gene: "LRRK2/GBA" },
];

const ancestry = [
  { region: "European", pct: "62%" },
  { region: "South Asian", pct: "18%" },
  { region: "East Asian", pct: "11%" },
  { region: "Middle Eastern", pct: "6%" },
  { region: "Sub-Saharan African", pct: "3%" },
];

const cardiacData = [
  { metric: "Resting Heart Rate", value: "72 BPM" },
  { metric: "Ejection Fraction", value: "62%" },
  { metric: "Blood Pressure", value: "120/80 mmHg" },
  { metric: "Cardiac Output", value: "5.2 L/min" },
  { metric: "Stroke Volume", value: "72 mL" },
  { metric: "VO₂ Max", value: "42 mL/kg/min" },
];

const valveData = [
  { name: "Mitral Valve", status: "Normal", regurgitation: "None" },
  { name: "Aortic Valve", status: "Normal", regurgitation: "None" },
  { name: "Tricuspid Valve", status: "Normal", regurgitation: "Trace" },
  { name: "Pulmonary Valve", status: "Normal", regurgitation: "None" },
];

const coronaryData = [
  { artery: "Left Anterior Descending", blockage: "0%" },
  { artery: "Right Coronary Artery", blockage: "2%" },
  { artery: "Left Circumflex", blockage: "0%" },
  { artery: "Left Main Coronary", blockage: "0%" },
];

const skills = [
  { name: "Language", level: "87%" },
  { name: "Logic & Math", level: "92%" },
  { name: "Musical Ability", level: "68%" },
  { name: "Visual Processing", level: "95%" },
  { name: "Communication", level: "84%" },
  { name: "Spatial Reasoning", level: "79%" },
  { name: "Auditory Processing", level: "73%" },
  { name: "Empathy", level: "88%" },
];

function generateHTMLReport() {
  const now = new Date();
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>MegaMind Neural & DNA Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0a0e1a; color: #e0f7fa; padding: 40px; }
  .page { max-width: 800px; margin: 0 auto; }
  h1 { font-size: 28px; text-align: center; color: #00F0FF; margin-bottom: 4px; letter-spacing: 4px; }
  .subtitle { text-align: center; color: #8B5CF6; font-size: 12px; letter-spacing: 2px; margin-bottom: 30px; }
  .meta { text-align: center; color: #667; font-size: 11px; margin-bottom: 40px; }
  h2 { font-size: 16px; color: #00F0FF; border-bottom: 1px solid #1a2744; padding-bottom: 8px; margin: 30px 0 16px; letter-spacing: 2px; text-transform: uppercase; }
   h2.dna { color: #00FF88; }
   h2.heart { color: #FF1744; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #111827; color: #00F0FF; padding: 10px 12px; text-align: left; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
  td { padding: 8px 12px; border-bottom: 1px solid #1a2744; font-size: 13px; }
  tr:hover td { background: #111827; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
  .low { background: #064e3b; color: #34d399; }
  .normal { background: #1e3a5f; color: #67e8f9; }
  .mild { background: #78350f; color: #fbbf24; }
  .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #1a2744; color: #555; font-size: 10px; }
  .disclaimer { background: #1a1a2e; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-top: 30px; font-size: 11px; color: #888; }
  @media print { body { background: white; color: #222; } th { background: #f0f0f0; color: #333; } td { border-color: #ddd; } h1, h2 { color: #0066cc; } }
</style>
</head>
<body>
<div class="page">
  <h1>⚡ MEGAMIND</h1>
  <div class="subtitle">NEURAL, GENOMIC & CARDIAC ANALYSIS REPORT</div>
  <div class="meta">Generated: ${now.toLocaleString()} | Report ID: MM-${Date.now().toString(36).toUpperCase()} | Accuracy: 99.97%</div>

  <h2>🧠 Cognitive Metrics</h2>
  <table><tr><th>Metric</th><th>Value</th></tr>
  ${cognitiveMetrics.map(m => `<tr><td>${m.label}</td><td><strong>${m.value}</strong></td></tr>`).join("")}
  </table>

  <h2>🧠 Brain Region Activity</h2>
  <table><tr><th>Region</th><th>Activity</th></tr>
  ${brainRegions.map(r => `<tr><td>${r.name}</td><td><strong>${r.activity}</strong></td></tr>`).join("")}
  </table>

  <h2>⚡ Cognitive Skills</h2>
  <table><tr><th>Skill</th><th>Level</th></tr>
  ${skills.map(s => `<tr><td>${s.name}</td><td><strong>${s.level}</strong></td></tr>`).join("")}
  </table>

  <h2 class="dna">🧬 Ancestry Composition</h2>
  <table><tr><th>Region</th><th>Percentage</th></tr>
  ${ancestry.map(a => `<tr><td>${a.region}</td><td><strong>${a.pct}</strong></td></tr>`).join("")}
  </table>

  <h2 class="dna">🧬 Genetic Traits</h2>
  <table><tr><th>Trait</th><th>Result</th><th>Gene</th><th>Confidence</th></tr>
  ${geneticTraits.map(t => `<tr><td>${t.trait}</td><td><strong>${t.value}</strong></td><td>${t.gene}</td><td>${t.confidence}</td></tr>`).join("")}
  </table>

  <h2 class="dna">🧬 Genetic Health Risk Assessment</h2>
  <table><tr><th>Condition</th><th>Risk Level</th><th>Associated Genes</th></tr>
  ${healthRisks.map(h => {
    const cls = h.risk.includes("Below") ? "low" : h.risk === "Average" ? "normal" : "mild";
    return `<tr><td>${h.condition}</td><td><span class="badge ${cls}">${h.risk}</span></td><td>${h.gene}</td></tr>`;
  }).join("")}
  </table>

  <h2 class="heart">❤️ Cardiac Metrics</h2>
  <table><tr><th>Metric</th><th>Value</th></tr>
  ${cardiacData.map(c => `<tr><td>${c.metric}</td><td><strong>${c.value}</strong></td></tr>`).join("")}
  </table>

  <h2 class="heart">❤️ Valve Health</h2>
  <table><tr><th>Valve</th><th>Status</th><th>Regurgitation</th></tr>
  ${valveData.map(v => `<tr><td>${v.name}</td><td><span class="badge low">${v.status}</span></td><td>${v.regurgitation}</td></tr>`).join("")}
  </table>

  <h2 class="heart">❤️ Coronary Arteries</h2>
  <table><tr><th>Artery</th><th>Blockage</th></tr>
  ${coronaryData.map(c => `<tr><td>${c.artery}</td><td><span class="badge low">${c.blockage}</span></td></tr>`).join("")}
  </table>

  <div class="disclaimer">
    <strong>⚠️ Medical Disclaimer:</strong> This report is generated by MegaMind's neural and genomic analysis system. Genetic risk scores are relative to population averages and represent predispositions, not diagnoses. Results should not replace professional medical advice. Always consult healthcare professionals for medical decisions. Genome sequenced at 99.97% accuracy from fingerprint epithelial cell extraction. Telomere length: 7,800 bp. Mitochondrial DNA haplogroup identified.
  </div>

  <div class="footer">© ${now.getFullYear()} MegaMind Neural Systems — v4.0.0-neural | Confidential</div>
</div>
</body>
</html>`;
}

const ReportExport = ({ visible }: { visible: boolean }) => {
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const html = generateHTMLReport();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MegaMind-Report-${Date.now()}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setExporting(false), 1000);
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
              <h3 className="font-orbitron text-sm font-bold text-foreground">Export Full Report</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download your complete neural + DNA analysis as a printable report with all metrics, traits, and health risks.
              </p>
            </div>
          </div>
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 font-orbitron text-xs font-bold tracking-wider uppercase text-background hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Generating..." : "Download Report"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReportExport;
