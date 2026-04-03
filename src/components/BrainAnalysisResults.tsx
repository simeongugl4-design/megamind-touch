import { useEffect, useState, useRef } from "react";
import {
  Brain, Eye, Ear, Heart, BookOpen, Lightbulb, Clock,
  Database, Cpu, Waves, Shield, Activity, Sparkles,
  MessageSquare, Music, Map, Languages, Calculator,
  Download, ChevronDown, ChevronUp, Dna, Gauge, Zap,
  BarChart3, TrendingUp, Wifi
} from "lucide-react";

const cognitiveMetrics = [
  { label: "IQ Estimate", value: "142", unit: "", icon: Brain, color: "text-primary", gradient: "from-cyan-500 to-blue-500" },
  { label: "Memory Capacity", value: "2.5", unit: "PB", icon: Database, color: "text-secondary", gradient: "from-purple-500 to-pink-500" },
  { label: "Processing Speed", value: "120", unit: "ms", icon: Cpu, color: "text-primary", gradient: "from-cyan-500 to-teal-500" },
  { label: "Emotional IQ", value: "138", unit: "", icon: Heart, color: "text-secondary", gradient: "from-pink-500 to-rose-500" },
  { label: "Creativity Index", value: "91", unit: "%", icon: Sparkles, color: "text-primary", gradient: "from-amber-400 to-orange-500" },
  { label: "Neural Efficiency", value: "96.3", unit: "%", icon: Gauge, color: "text-secondary", gradient: "from-green-400 to-emerald-500" },
];

const memoryBreakdown = [
  { type: "Episodic Memory", desc: "Personal experiences, autobiographical events, and contextual memories stored in the hippocampus.", pct: 34, icon: Clock, color: "hsl(180,100%,50%)" },
  { type: "Semantic Memory", desc: "General knowledge, facts, concepts, and language understanding stored across the neocortex.", pct: 28, icon: BookOpen, color: "hsl(270,80%,65%)" },
  { type: "Procedural Memory", desc: "Motor skills, habits, and learned behaviors stored in the basal ganglia and cerebellum.", pct: 22, icon: Activity, color: "hsl(300,80%,60%)" },
  { type: "Working Memory", desc: "Active short-term storage and manipulation of information in the prefrontal cortex.", pct: 16, icon: Lightbulb, color: "hsl(200,100%,60%)" },
];

const brainRegions = [
  { name: "Prefrontal Cortex", function: "Executive Control", desc: "The CEO of your brain. Handles decision-making, planning, personality expression, social behavior.", activity: 94, color: "hsl(180,100%,50%)", details: ["Decision-making & judgment", "Personality expression", "Working memory management", "Impulse control & focus", "Abstract thinking", "Social behavior modulation"] },
  { name: "Hippocampus", function: "Memory Formation", desc: "Your brain's search engine and filing system. Converts short-term memories into long-term storage.", activity: 88, color: "hsl(270,80%,65%)", details: ["Memory consolidation", "Spatial navigation", "Pattern recognition", "Contextual associations", "Learning new skills", "Dream processing"] },
  { name: "Amygdala", function: "Emotional Processing", desc: "Your emotional alarm system. Processes fear, pleasure, and emotional memories.", activity: 76, color: "hsl(300,80%,60%)", details: ["Fear & threat detection", "Emotional memory tagging", "Social signal processing", "Fight-or-flight activation", "Reward processing", "Anxiety regulation"] },
  { name: "Broca's & Wernicke's", function: "Language Processing", desc: "Your linguistic powerhouse. Broca's area produces speech and grammar, while Wernicke's comprehends language.", activity: 82, color: "hsl(200,100%,60%)", details: ["Speech production", "Language comprehension", "Grammar & syntax", "Word retrieval", "Reading comprehension", "Foreign language processing"] },
  { name: "Visual Cortex", function: "Image Processing", desc: "Processes everything you see — handles ~30% of your brain's total processing power.", activity: 91, color: "hsl(160,100%,45%)", details: ["Object recognition", "Color & motion detection", "Facial recognition", "Spatial awareness", "Depth perception", "Visual memory encoding"] },
  { name: "Cerebellum", function: "Motor Coordination", desc: "Your precision engine. Contains more neurons than the rest of the brain combined.", activity: 85, color: "hsl(45,100%,55%)", details: ["Balance & posture", "Fine motor control", "Motor learning", "Timing & rhythm", "Muscle memory", "Coordination refinement"] },
];

const neuralFacts = [
  { icon: Waves, label: "Neurons", value: "86 Billion", desc: "Individual nerve cells forming the brain's computational network" },
  { icon: Sparkles, label: "Synapses", value: "100 Trillion", desc: "Connection points between neurons enabling signal transmission" },
  { icon: Cpu, label: "Operations/sec", value: "10¹⁶", desc: "Estimated computational operations per second" },
  { icon: Activity, label: "Brain Waves", value: "12-30 Hz", desc: "Beta waves detected — alert, focused state" },
  { icon: Shield, label: "Blood-Brain Barrier", value: "Active", desc: "Protective layer filtering harmful substances" },
  { icon: Database, label: "Data Throughput", value: "1 TB/sec", desc: "Estimated sensory data processed every second" },
  { icon: Dna, label: "Neurotransmitters", value: "100+", desc: "Chemical messengers including dopamine, serotonin, GABA" },
  { icon: Wifi, label: "Signal Speed", value: "120 m/s", desc: "Maximum neural impulse transmission speed" },
];

const skillsDetected = [
  { icon: Languages, name: "Language", level: 87 },
  { icon: Calculator, name: "Logic & Math", level: 92 },
  { icon: Music, name: "Musical Ability", level: 68 },
  { icon: Eye, name: "Visual Processing", level: 95 },
  { icon: MessageSquare, name: "Communication", level: 84 },
  { icon: Map, name: "Spatial Reasoning", level: 79 },
  { icon: Ear, name: "Auditory Processing", level: 73 },
  { icon: Heart, name: "Empathy", level: 88 },
];

const realTimeMetrics = [
  { label: "Oxygen Saturation", value: 98.2, unit: "%", trend: "+0.3%" },
  { label: "Glucose Utilization", value: 5.4, unit: "mg/min", trend: "+1.2%" },
  { label: "Cortisol Level", value: 12.3, unit: "μg/dL", trend: "-0.5%" },
  { label: "Dopamine Activity", value: 84, unit: "%", trend: "+2.1%" },
  { label: "Serotonin Level", value: 72, unit: "%", trend: "+0.8%" },
  { label: "Neural Temp", value: 37.1, unit: "°C", trend: "0.0%" },
];

const BrainAnalysisResults = ({ visible }: { visible: boolean }) => {
  const [expandedRegion, setExpandedRegion] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState(realTimeMetrics);
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-scroll to results
  useEffect(() => {
    if (visible && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setAnimateIn(true), 300);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [visible]);

  // Real-time metric fluctuation
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setLiveMetrics(prev => prev.map(m => ({
        ...m,
        value: +(m.value + (Math.random() - 0.5) * (m.value * 0.02)).toFixed(1),
        trend: `${Math.random() > 0.5 ? "+" : "-"}${(Math.random() * 2).toFixed(1)}%`,
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, [visible]);

  const exportReport = () => {
    const report = {
      title: "MegaMind Neural Clone Report",
      timestamp: new Date().toISOString(),
      subject: "Neural Scan Analysis",
      cognitiveMetrics: cognitiveMetrics.map(m => ({ label: m.label, value: m.value + m.unit })),
      memoryBreakdown: memoryBreakdown.map(m => ({ type: m.type, percentage: m.pct })),
      brainRegions: brainRegions.map(r => ({ name: r.name, function: r.function, activity: r.activity + "%" })),
      neuralFacts: neuralFacts.map(f => ({ label: f.label, value: f.value })),
      skillsDetected: skillsDetected.map(s => ({ name: s.name, level: s.level + "%" })),
      realTimeMetrics: liveMetrics.map(m => ({ label: m.label, value: m.value + " " + m.unit })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `megamind-neural-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!visible) return null;

  return (
    <section ref={sectionRef} className="px-6 lg:px-12 pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className={`text-center transition-all duration-700 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 font-mono text-xs text-primary mb-4">
            <Sparkles className="w-3 h-3" /> ANALYSIS COMPLETE
          </div>
          <h2 className="font-orbitron text-2xl lg:text-4xl font-bold mb-3">
            Neural Clone <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">Analysis</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Complete cognitive mapping of your neural architecture. Below is everything MegaMind discovered about your brain.
          </p>
          <button
            onClick={exportReport}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 font-orbitron text-xs font-bold tracking-wider uppercase text-background hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" /> Export Brain Report
          </button>
        </div>

        {/* Cognitive Metrics - enhanced */}
        <div className={`grid grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 delay-100 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {cognitiveMetrics.map((m, i) => (
            <div key={m.label} className="relative p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-center overflow-hidden group hover:border-primary/50 transition-all duration-300">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${m.gradient}`} />
              <m.icon className={`w-7 h-7 ${m.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
              <p className="font-orbitron text-3xl font-bold text-foreground">
                {m.value}<span className="text-sm text-muted-foreground ml-1">{m.unit}</span>
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">{m.label}</p>
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-primary/10 rounded-tr-xl" />
            </div>
          ))}
        </div>

        {/* Real-Time Vital Metrics */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-150 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary">Real-Time Neural Vitals</h3>
            <span className="font-mono text-[10px] text-muted-foreground ml-auto">LIVE</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMetrics.map((m) => (
              <div key={m.label} className="p-3 rounded-lg border border-border/50 bg-background/30">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-orbitron text-lg font-bold text-foreground">{m.value}</span>
                  <span className="text-xs text-muted-foreground">{m.unit}</span>
                  <span className={`text-[10px] font-mono ml-auto ${m.trend.startsWith("+") ? "text-green-400" : m.trend.startsWith("-") ? "text-red-400" : "text-muted-foreground"}`}>
                    {m.trend.startsWith("+") ? <TrendingUp className="w-3 h-3 inline" /> : null} {m.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How Your Brain Works */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-200 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary mb-4">
            How Your Brain Works
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-4">
              <p><span className="text-foreground font-semibold">Your brain is a biological supercomputer</span> weighing approximately 1.4 kg, consuming 20% of your body's energy despite being only 2% of your body weight. It operates on roughly 20 watts — yet outperforms the world's most powerful computers at pattern recognition.</p>
              <p><span className="text-foreground font-semibold">Information travels through neurons</span> as electrical impulses at speeds up to 120 m/s. Neurotransmitters (dopamine, serotonin, GABA) carry messages across synapses — this electrochemical process generates every thought and feeling.</p>
            </div>
            <div className="space-y-4">
              <p><span className="text-foreground font-semibold">Memories are distributed across neural networks.</span> When you recall a memory, your brain reconstructs it by activating the same neuron pattern from the original experience. This is why memories evolve over time.</p>
              <p><span className="text-foreground font-semibold">Your brain rewires itself constantly</span> through neuroplasticity. Every new skill physically changes your brain's structure. Used pathways strengthen via myelination, while unused connections are pruned.</p>
            </div>
          </div>
        </div>

        {/* Neural Facts Grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-300 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {neuralFacts.map((fact, i) => (
            <div key={fact.label} className="p-4 rounded-xl border border-border bg-card/30 backdrop-blur-sm group hover:box-glow-cyan transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <fact.icon className="w-4 h-4 text-primary group-hover:text-secondary transition-colors" />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{fact.label}</span>
              </div>
              <p className="font-orbitron text-lg font-bold text-foreground">{fact.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{fact.desc}</p>
            </div>
          ))}
        </div>

        {/* Memory Breakdown */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-400 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-secondary mb-6">
            <BarChart3 className="w-4 h-4 inline mr-2" />Memory Storage Breakdown
          </h3>
          <div className="space-y-6">
            {memoryBreakdown.map((mem, i) => (
              <div key={mem.type}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: mem.color + "20" }}>
                    <mem.icon className="w-3.5 h-3.5" style={{ color: mem.color }} />
                  </div>
                  <span className="font-orbitron text-xs font-bold text-foreground">{mem.type}</span>
                  <span className="font-mono text-xs ml-auto font-bold" style={{ color: mem.color }}>{mem.pct}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: animateIn ? `${mem.pct}%` : "0%",
                      transitionDelay: `${i * 150 + 500}ms`,
                      background: `linear-gradient(90deg, ${mem.color}, ${mem.color}88)`,
                      boxShadow: `0 0 10px ${mem.color}40`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-9">{mem.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Abilities */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-500 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary mb-6">
            <Zap className="w-4 h-4 inline mr-2" />Cognitive Skills Detected
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {skillsDetected.map((skill, i) => {
              const colors = ["hsl(180,100%,50%)", "hsl(270,80%,65%)", "hsl(300,80%,60%)", "hsl(200,100%,60%)", "hsl(160,100%,45%)", "hsl(45,100%,55%)", "hsl(330,80%,60%)", "hsl(120,80%,50%)"];
              const c = colors[i % colors.length];
              return (
                <div key={skill.name} className="text-center p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(220,40%,18%)" strokeWidth="4" />
                      <circle
                        cx="40" cy="40" r="34" fill="none"
                        stroke={c}
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={animateIn ? `${2 * Math.PI * 34 * (1 - skill.level / 100)}` : `${2 * Math.PI * 34}`}
                        className="transition-all duration-1000"
                        style={{ transitionDelay: `${i * 100 + 600}ms`, filter: `drop-shadow(0 0 4px ${c})` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <skill.icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                  <p className="font-mono text-xs text-foreground font-medium">{skill.name}</p>
                  <p className="font-orbitron text-sm font-bold" style={{ color: c }}>{skill.level}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brain Regions Detail */}
        <div className={`transition-all duration-700 delay-[600ms] ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-secondary mb-4 px-1">
            <Brain className="w-4 h-4 inline mr-2" />Brain Region Deep Dive
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brainRegions.map((region, i) => (
              <div
                key={region.name}
                className={`p-5 rounded-xl border bg-card/50 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                  expandedRegion === i ? "border-primary/60" : "border-border hover:border-primary/30"
                }`}
                style={expandedRegion === i ? { boxShadow: `0 0 20px ${region.color}30, 0 0 40px ${region.color}10` } : {}}
                onClick={() => setExpandedRegion(expandedRegion === i ? null : i)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-orbitron text-xs font-bold text-foreground">{region.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold" style={{ color: region.color }}>{region.activity}%</span>
                    {expandedRegion === i ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                  </div>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: region.color }}>{region.function}</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: animateIn ? `${region.activity}%` : "0%",
                      transitionDelay: `${i * 100 + 700}ms`,
                      background: `linear-gradient(90deg, ${region.color}, ${region.color}88)`,
                      boxShadow: `0 0 8px ${region.color}40`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{region.desc}</p>
                {expandedRegion === i && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Key Functions</p>
                    {region.details.map((d) => (
                      <div key={d} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: region.color }} />
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How MegaMind Clones Your Brain */}
        <div className={`p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-pink-500/5 backdrop-blur-sm transition-all duration-700 delay-[700ms] ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary mb-4">
            <Dna className="w-4 h-4 inline mr-2" />How MegaMind Reads Your Brain Through Touch
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Dermal Neural Mapping", desc: "3,000+ nerve endings per cm² in your fingertips are scanned by quantum-capacitive sensors, capturing unique brain-to-finger bioelectric signatures." },
              { step: "02", title: "Synaptic Pattern Extraction", desc: "Micro-variations in your neural electrical field (femtovolts) reconstruct cortical neuron firing patterns — as unique as your fingerprint." },
              { step: "03", title: "Cognitive Architecture Cloning", desc: "Extracted neural patterns map onto a digital neural network mirroring your brain — preserving thinking patterns, creativity, and cognitive style." },
            ].map((s, i) => (
              <div key={s.step} className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center font-orbitron text-sm font-bold text-primary">
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

export default BrainAnalysisResults;
