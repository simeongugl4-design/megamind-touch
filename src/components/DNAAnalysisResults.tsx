import { useState, useEffect } from "react";
import {
  Dna, Heart, Shield, Eye, Activity, Sparkles,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  Microscope, Fingerprint, Gauge, Zap
} from "lucide-react";

const chromosomeData = [
  { pair: 1, genes: 2058, size: "249 Mb", notable: "Neuroblastoma susceptibility genes" },
  { pair: 2, genes: 1309, size: "243 Mb", notable: "Lactase persistence gene (LCT)" },
  { pair: 6, genes: 1557, size: "171 Mb", notable: "HLA immune system complex" },
  { pair: 7, genes: 989, size: "159 Mb", notable: "FOXP2 — language & speech gene" },
  { pair: 11, genes: 1316, size: "135 Mb", notable: "Olfactory receptor cluster" },
  { pair: 17, genes: 1197, size: "83 Mb", notable: "BRCA1 tumor suppressor" },
  { pair: 19, genes: 1461, size: "59 Mb", notable: "APOE — Alzheimer's risk factor" },
  { pair: 23, genes: 867, size: "155 Mb", notable: "Sex determination region" },
];

const geneticTraits = [
  { trait: "Eye Color", value: "Brown (heterozygous)", gene: "OCA2, HERC2", confidence: 97 },
  { trait: "Hair Type", value: "Wavy", gene: "TCHH, WNT10A", confidence: 89 },
  { trait: "Skin Pigmentation", value: "Medium", gene: "SLC24A5, MC1R", confidence: 94 },
  { trait: "Caffeine Metabolism", value: "Fast metabolizer", gene: "CYP1A2", confidence: 91 },
  { trait: "Muscle Fiber Type", value: "Mixed (endurance bias)", gene: "ACTN3", confidence: 86 },
  { trait: "Lactose Tolerance", value: "Tolerant", gene: "MCM6, LCT", confidence: 98 },
  { trait: "Alcohol Flush", value: "Normal metabolism", gene: "ALDH2, ADH1B", confidence: 93 },
  { trait: "Circadian Rhythm", value: "Moderate morning type", gene: "PER2, CLOCK", confidence: 82 },
];

const healthRisks = [
  { condition: "Type 2 Diabetes", risk: "Below Average", score: 0.7, status: "low", gene: "TCF7L2, PPARG" },
  { condition: "Coronary Heart Disease", risk: "Average", score: 1.0, status: "normal", gene: "9p21.3, LPA" },
  { condition: "Alzheimer's Disease", risk: "Below Average", score: 0.6, status: "low", gene: "APOE ε3/ε3" },
  { condition: "Macular Degeneration", risk: "Slightly Elevated", score: 1.3, status: "mild", gene: "CFH, ARMS2" },
  { condition: "Celiac Disease", risk: "Below Average", score: 0.4, status: "low", gene: "HLA-DQ2/DQ8" },
  { condition: "Parkinson's Disease", risk: "Average", score: 1.0, status: "normal", gene: "LRRK2, GBA" },
];

const ancestryComposition = [
  { region: "European", pct: 62, color: "hsl(180,100%,50%)" },
  { region: "South Asian", pct: 18, color: "hsl(270,80%,65%)" },
  { region: "East Asian", pct: 11, color: "hsl(300,80%,60%)" },
  { region: "Middle Eastern", pct: 6, color: "hsl(45,100%,55%)" },
  { region: "Sub-Saharan African", pct: 3, color: "hsl(140,70%,50%)" },
];

const DNAAnalysisResults = ({ visible }: { visible: boolean }) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [expandedChromosome, setExpandedChromosome] = useState<number | null>(null);
  const [liveSequencing, setLiveSequencing] = useState(0);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setAnimateIn(true), 200);
      return () => clearTimeout(timer);
    } else { setAnimateIn(false); }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setLiveSequencing(prev => prev >= 3200000000 ? 3200000000 : prev + Math.floor(Math.random() * 50000000));
    }, 200);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <section className="px-6 lg:px-12 pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className={`text-center transition-all duration-700 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/5 font-mono text-xs text-green-400 mb-4">
            <Dna className="w-3 h-3 animate-pulse" /> DNA CLONE COMPLETE
          </div>
          <h2 className="font-orbitron text-2xl lg:text-4xl font-bold mb-3">
            DNA <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400">Analysis</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Complete genomic profile extracted from epithelial cells in your fingerprint. 3.2 billion base pairs sequenced and analyzed.
          </p>
        </div>

        {/* Sequencing Progress */}
        <div className={`p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-100 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-orbitron text-xs tracking-widest uppercase text-green-400">Genome Sequencing</span>
            <span className="font-mono text-[10px] text-muted-foreground ml-auto">{(liveSequencing / 1000000000).toFixed(2)} / 3.20 Billion bp</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${(liveSequencing / 3200000000) * 100}%`,
                background: "linear-gradient(90deg, hsl(140,70%,50%), hsl(180,100%,50%), hsl(270,80%,65%))",
                boxShadow: "0 0 10px hsl(140,70%,50%,0.5)",
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[
              { label: "Base Pairs", value: "3.2B" },
              { label: "Genes Identified", value: "20,412" },
              { label: "SNP Markers", value: "4.1M" },
              { label: "Accuracy", value: "99.97%" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-orbitron text-lg font-bold text-foreground">{s.value}</p>
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ancestry Composition */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-200 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary mb-5">
            <Fingerprint className="w-4 h-4 inline mr-2" />Ancestry Composition
          </h3>
          <div className="flex h-6 rounded-full overflow-hidden mb-4">
            {ancestryComposition.map((a, i) => (
              <div key={a.region} className="transition-all duration-1000"
                style={{ width: animateIn ? `${a.pct}%` : "0%", backgroundColor: a.color, transitionDelay: `${i * 100 + 300}ms` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ancestryComposition.map(a => (
              <div key={a.region} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                <div>
                  <p className="font-mono text-xs text-foreground">{a.region}</p>
                  <p className="font-orbitron text-xs font-bold" style={{ color: a.color }}>{a.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genetic Traits */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-300 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-secondary mb-5">
            <Microscope className="w-4 h-4 inline mr-2" />Genetic Trait Profile
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {geneticTraits.map((t, i) => (
              <div key={t.trait} className="p-3 rounded-lg border border-border/50 bg-background/30 flex items-center gap-3 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Gauge className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-orbitron text-[11px] font-bold text-foreground">{t.trait}</p>
                  <p className="font-mono text-[10px] text-primary">{t.value}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">Gene: {t.gene}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-orbitron text-sm font-bold text-green-400">{t.confidence}%</p>
                  <p className="font-mono text-[8px] text-muted-foreground">CONF</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Risk Assessment */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-400 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-pink-400 mb-5">
            <Heart className="w-4 h-4 inline mr-2" />Genetic Health Risk Assessment
          </h3>
          <div className="space-y-4">
            {healthRisks.map((h, i) => {
              const statusColor = h.status === "low" ? "hsl(140,70%,50%)" : h.status === "normal" ? "hsl(180,100%,50%)" : "hsl(45,100%,55%)";
              const StatusIcon = h.status === "low" ? CheckCircle : h.status === "mild" ? AlertTriangle : Shield;
              return (
                <div key={h.condition} className="p-3 rounded-lg border border-border/50 bg-background/30">
                  <div className="flex items-center gap-3 mb-2">
                    <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: statusColor }} />
                    <span className="font-orbitron text-xs font-bold text-foreground flex-1">{h.condition}</span>
                    <span className="font-mono text-xs font-bold" style={{ color: statusColor }}>{h.risk}</span>
                  </div>
                  <div className="flex items-center gap-3 pl-7">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: animateIn ? `${h.score * 50}%` : "0%",
                          transitionDelay: `${i * 100 + 500}ms`,
                          backgroundColor: statusColor,
                          boxShadow: `0 0 6px ${statusColor}40`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[9px] text-muted-foreground">{h.gene}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground text-center italic">
            ⚠️ Genetic risk scores are relative to population averages and should not replace professional medical advice.
          </p>
        </div>

        {/* Chromosome Map */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-500 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary mb-5">
            <Activity className="w-4 h-4 inline mr-2" />Chromosome Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {chromosomeData.map((c, i) => (
              <div
                key={c.pair}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                  expandedChromosome === i ? "border-primary/50 bg-primary/5" : "border-border/50 bg-background/30 hover:border-primary/30"
                }`}
                onClick={() => setExpandedChromosome(expandedChromosome === i ? null : i)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-orbitron text-xs font-bold text-primary">Chr {c.pair}</span>
                  {expandedChromosome === i ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">{c.genes} genes • {c.size}</p>
                {expandedChromosome === i && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
                      {c.notable}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How DNA is Extracted */}
        <div className={`p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-green-500/5 via-cyan-500/5 to-purple-500/5 backdrop-blur-sm transition-all duration-700 delay-[600ms] ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-green-400 mb-4">
            <Dna className="w-4 h-4 inline mr-2" />How MegaMind Clones Your DNA Through Touch
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Cell Collection", desc: "Your fingertip deposits ~300 epithelial cells per touch. MegaMind's nano-collectors capture these cells from sweat pores and skin ridges in under 2 seconds." },
              { step: "02", title: "Rapid Sequencing", desc: "Nanopore sequencing technology reads each DNA strand in real-time, passing individual molecules through protein pores and measuring electrical current changes at each nucleotide." },
              { step: "03", title: "Genomic Assembly", desc: "AI-powered alignment algorithms reconstruct your full 3.2 billion base pair genome from overlapping fragments, identifying SNPs, indels, and structural variants with 99.97% accuracy." },
            ].map(s => (
              <div key={s.step} className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center font-orbitron text-sm font-bold text-green-400">
                  {s.step}
                </div>
                <p className="font-orbitron text-xs font-bold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DNAAnalysisResults;
