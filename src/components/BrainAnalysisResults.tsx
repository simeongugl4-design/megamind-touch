import { useEffect, useState } from "react";
import {
  Brain, Eye, Ear, Heart, BookOpen, Lightbulb, Clock,
  Database, Cpu, Waves, Shield, Activity, Sparkles,
  MessageSquare, Music, Map, Languages, Calculator
} from "lucide-react";

const cognitiveMetrics = [
  { label: "IQ Estimate", value: "142", unit: "", icon: Brain, color: "text-primary" },
  { label: "Memory Capacity", value: "2.5", unit: "PB", icon: Database, color: "text-secondary" },
  { label: "Processing Speed", value: "120", unit: "ms", icon: Cpu, color: "text-primary" },
  { label: "Emotional IQ", value: "138", unit: "", icon: Heart, color: "text-secondary" },
];

const memoryBreakdown = [
  { type: "Episodic Memory", desc: "Personal experiences, autobiographical events, and contextual memories stored in the hippocampus. These are time-stamped memories of specific events you've lived through.", pct: 34, icon: Clock },
  { type: "Semantic Memory", desc: "General knowledge, facts, concepts, and language understanding stored across the neocortex. Includes vocabulary, mathematical concepts, and world knowledge.", pct: 28, icon: BookOpen },
  { type: "Procedural Memory", desc: "Motor skills, habits, and learned behaviors stored in the basal ganglia and cerebellum. Includes walking, typing, driving, and musical instrument skills.", pct: 22, icon: Activity },
  { type: "Working Memory", desc: "Active short-term storage and manipulation of information in the prefrontal cortex. Used for reasoning, decision-making, and real-time problem solving.", pct: 16, icon: Lightbulb },
];

const brainRegions = [
  {
    name: "Prefrontal Cortex",
    function: "Executive Control",
    desc: "The CEO of your brain. Handles decision-making, planning, personality expression, social behavior, and moderating complex cognitive processes. It's what makes you 'you'.",
    activity: 94,
    details: [
      "Decision-making & judgment",
      "Personality expression",
      "Working memory management",
      "Impulse control & focus",
    ],
  },
  {
    name: "Hippocampus",
    function: "Memory Formation",
    desc: "Your brain's search engine and filing system. Converts short-term memories into long-term storage and enables spatial navigation. Critical for learning new information.",
    activity: 88,
    details: [
      "Memory consolidation",
      "Spatial navigation",
      "Pattern recognition",
      "Contextual associations",
    ],
  },
  {
    name: "Amygdala",
    function: "Emotional Processing",
    desc: "Your emotional alarm system. Processes fear, pleasure, and emotional memories. It tags experiences with emotional significance, determining what you remember most vividly.",
    activity: 76,
    details: [
      "Fear & threat detection",
      "Emotional memory tagging",
      "Social signal processing",
      "Fight-or-flight activation",
    ],
  },
  {
    name: "Broca's & Wernicke's Areas",
    function: "Language Processing",
    desc: "Your linguistic powerhouse. Broca's area produces speech and grammar, while Wernicke's area comprehends language. Together they enable all verbal communication.",
    activity: 82,
    details: [
      "Speech production",
      "Language comprehension",
      "Grammar & syntax",
      "Word retrieval",
    ],
  },
  {
    name: "Visual Cortex",
    function: "Image Processing",
    desc: "Processes everything you see — from raw light signals to recognizing faces, reading text, and perceiving depth. Handles ~30% of your brain's total processing power.",
    activity: 91,
    details: [
      "Object recognition",
      "Color & motion detection",
      "Facial recognition",
      "Spatial awareness",
    ],
  },
  {
    name: "Cerebellum",
    function: "Motor Coordination",
    desc: "Your precision engine. Contains more neurons than the rest of the brain combined. Coordinates voluntary movements, balance, posture, and motor learning.",
    activity: 85,
    details: [
      "Balance & posture",
      "Fine motor control",
      "Motor learning",
      "Timing & rhythm",
    ],
  },
];

const neuralFacts = [
  { icon: Waves, label: "Neurons", value: "86 Billion", desc: "Individual nerve cells forming the brain's computational network" },
  { icon: Sparkles, label: "Synapses", value: "100 Trillion", desc: "Connection points between neurons enabling signal transmission" },
  { icon: Cpu, label: "Operations/sec", value: "10^16", desc: "Estimated computational operations per second" },
  { icon: Activity, label: "Brain Waves", value: "12-30 Hz", desc: "Beta waves detected — alert, focused state" },
  { icon: Shield, label: "Blood-Brain Barrier", value: "Active", desc: "Protective layer filtering harmful substances from brain tissue" },
  { icon: Database, label: "Data Throughput", value: "1 TB/sec", desc: "Estimated sensory data processed every second" },
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

const BrainAnalysisResults = ({ visible }: { visible: boolean }) => {
  const [expandedRegion, setExpandedRegion] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setAnimateIn(true), 300);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <section className="px-6 lg:px-12 pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className={`text-center transition-all duration-700 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="font-orbitron text-2xl lg:text-3xl font-bold mb-3">
            Neural Clone <span className="text-primary text-glow-cyan">Analysis</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Complete cognitive mapping of your neural architecture. Below is everything MegaMind discovered about how your brain stores information, processes thoughts, and generates consciousness.
          </p>
        </div>

        {/* Cognitive Metrics */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {cognitiveMetrics.map((m) => (
            <div key={m.label} className="p-5 rounded-lg border border-border bg-card/50 backdrop-blur-sm text-center">
              <m.icon className={`w-6 h-6 ${m.color} mx-auto mb-2`} />
              <p className="font-orbitron text-2xl font-bold text-foreground">
                {m.value}<span className="text-sm text-muted-foreground ml-1">{m.unit}</span>
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">{m.label}</p>
            </div>
          ))}
        </div>

        {/* How Your Brain Works */}
        <div className={`p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-200 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary mb-4">
            How Your Brain Works
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-4">
              <p>
                <span className="text-foreground font-semibold">Your brain is a biological supercomputer</span> weighing approximately 1.4 kg, consuming 20% of your body's energy despite being only 2% of your body weight. It operates on roughly 20 watts — less than a dim light bulb — yet outperforms the world's most powerful computers at pattern recognition, creative thinking, and emotional intelligence.
              </p>
              <p>
                <span className="text-foreground font-semibold">Information travels through neurons</span> as electrical impulses at speeds up to 120 m/s. When a signal reaches a synapse, neurotransmitters (dopamine, serotonin, GABA) carry the message to the next neuron. This electrochemical process is how every thought, feeling, and memory is generated.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                <span className="text-foreground font-semibold">Memories are not stored in one place</span> — they're distributed across neural networks. When you recall a memory, your brain reconstructs it by activating the same pattern of neurons that fired during the original experience. This is why memories can change over time.
              </p>
              <p>
                <span className="text-foreground font-semibold">Your brain rewires itself constantly</span> through neuroplasticity. Every new skill you learn, every conversation you have, physically changes your brain's structure. Frequently used neural pathways become stronger (myelination), while unused connections are pruned away.
              </p>
            </div>
          </div>
        </div>

        {/* Neural Facts Grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 delay-300 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {neuralFacts.map((fact) => (
            <div key={fact.label} className="p-4 rounded-lg border border-border bg-card/30 backdrop-blur-sm group hover:box-glow-cyan transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <fact.icon className="w-4 h-4 text-primary group-hover:text-secondary transition-colors" />
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{fact.label}</span>
              </div>
              <p className="font-orbitron text-lg font-bold text-foreground">{fact.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{fact.desc}</p>
            </div>
          ))}
        </div>

        {/* Memory Breakdown */}
        <div className={`p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-400 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-secondary mb-6">
            Memory Storage Breakdown
          </h3>
          <div className="space-y-6">
            {memoryBreakdown.map((mem, i) => (
              <div key={mem.type}>
                <div className="flex items-center gap-3 mb-2">
                  <mem.icon className="w-4 h-4 text-primary" />
                  <span className="font-orbitron text-xs font-bold text-foreground">{mem.type}</span>
                  <span className="font-mono text-xs text-primary ml-auto">{mem.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${i % 2 === 0 ? "bg-primary" : "bg-secondary"}`}
                    style={{ width: animateIn ? `${mem.pct}%` : "0%", transitionDelay: `${i * 150 + 500}ms` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">{mem.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Abilities */}
        <div className={`p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-500 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary mb-6">
            Cognitive Skills Detected
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {skillsDetected.map((skill, i) => (
              <div key={skill.name} className="text-center p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(220 40% 18%)" strokeWidth="3" />
                    <circle
                      cx="32" cy="32" r="28" fill="none"
                      stroke={i % 2 === 0 ? "hsl(180 100% 50%)" : "hsl(270 80% 65%)"}
                      strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={animateIn ? `${2 * Math.PI * 28 * (1 - skill.level / 100)}` : `${2 * Math.PI * 28}`}
                      className="transition-all duration-1000"
                      style={{ transitionDelay: `${i * 100 + 600}ms` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <skill.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <p className="font-mono text-xs text-foreground">{skill.name}</p>
                <p className="font-orbitron text-xs text-primary">{skill.level}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Brain Regions Detail */}
        <div className={`transition-all duration-700 delay-[600ms] ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-secondary mb-4 px-1">
            Brain Region Deep Dive
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brainRegions.map((region, i) => (
              <div
                key={region.name}
                className={`p-5 rounded-lg border bg-card/50 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                  expandedRegion === i ? "border-primary box-glow-cyan" : "border-border hover:border-primary/30"
                }`}
                onClick={() => setExpandedRegion(expandedRegion === i ? null : i)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-orbitron text-xs font-bold text-foreground">{region.name}</span>
                  <span className="font-mono text-xs text-primary">{region.activity}%</span>
                </div>
                <p className="font-mono text-[10px] text-secondary uppercase tracking-wider mb-2">{region.function}</p>
                <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${i % 2 === 0 ? "bg-primary" : "bg-secondary"}`}
                    style={{ width: animateIn ? `${region.activity}%` : "0%", transitionDelay: `${i * 100 + 700}ms` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{region.desc}</p>
                {expandedRegion === i && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                    {region.details.map((d) => (
                      <div key={d} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary" />
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
        <div className={`p-6 rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm transition-all duration-700 delay-[700ms] ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary mb-4">
            How MegaMind Reads Your Brain Through Touch
          </h3>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              <span className="text-foreground font-semibold">Step 1 — Dermal Neural Mapping:</span> Your fingertips contain over 3,000 nerve endings per square centimeter, directly connected to the somatosensory cortex. MegaMind's quantum-capacitive sensors detect the bioelectric signatures flowing through these neural terminals, capturing your unique brain-to-finger signal patterns.
            </p>
            <p>
              <span className="text-foreground font-semibold">Step 2 — Synaptic Pattern Extraction:</span> By analyzing the micro-variations in your neural electrical field (measured in femtovolts), MegaMind reconstructs the firing patterns of your cortical neurons. Each person's synaptic signature is as unique as their fingerprint — encoding personality, memories, and cognitive style.
            </p>
            <p>
              <span className="text-foreground font-semibold">Step 3 — Cognitive Architecture Cloning:</span> The extracted neural patterns are mapped onto a digital neural network that mirrors your brain's architecture. This clone preserves your thinking patterns, problem-solving approaches, and creative tendencies — creating a digital twin of your cognitive self.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrainAnalysisResults;
