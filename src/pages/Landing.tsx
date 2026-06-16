import { Link } from "react-router-dom";
import {
  Activity, Brain, Dna, Heart, ShieldCheck, Sparkles, Stethoscope, Waves, ArrowRight,
  CheckCircle2, FileCheck2, Lock, Cpu, Microscope, Fingerprint, Radar, Pill, FlaskConical,
  Satellite, Network, ScanLine, Atom, Eye, Hexagon, AlertTriangle, Zap,
} from "lucide-react";
import { GlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";
import megamindLogo from "@/assets/megamind-logo.png";
import neuralBg from "@/assets/neural-bg.jpg";
import brainScan from "@/assets/brain-scan.png";
import heartScan from "@/assets/heart-scan.png";
import dnaScan from "@/assets/dna-scan.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Futuristic ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={neuralBg} alt="" className="w-full h-full object-cover opacity-[0.18]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)/0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
        />
        {/* Drifting orbs */}
        <div className="absolute -top-40 -left-40 w-[42rem] h-[42rem] rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -right-40 w-[42rem] h-[42rem] rounded-full bg-secondary/10 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-cyan-400/5 blur-3xl" />
        {/* Vertical scan sweep */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan-line" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-5 border-b border-border/40 backdrop-blur-md bg-background/40">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <img src={megamindLogo} alt="MEGAMIND" width={42} height={42} className="animate-pulse-glow" />
              <div className="absolute -inset-1 rounded-full border border-primary/40 animate-ring-expand pointer-events-none" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-orbitron text-base sm:text-lg font-bold tracking-widest">
                MEGA<span className="text-primary text-glow-cyan">MIND</span>
                <span className="text-muted-foreground/70 ml-1.5 text-xs">AI</span>
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">BioDigital Intelligence · Medical-Grade</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase text-muted-foreground">
            <a href="#platform" className="hover:text-primary transition-colors">Platform</a>
            <a href="#capabilities" className="hover:text-primary transition-colors">Capabilities</a>
            <a href="#modules" className="hover:text-primary transition-colors">Modules</a>
            <a href="#trust" className="hover:text-primary transition-colors">Trust</a>
            <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
          </div>
          <Link to="/scan">
            <GlassButton size="sm" className="font-orbitron tracking-widest text-xs">
              LAUNCH SCAN <ArrowRight className="w-3.5 h-3.5" />
            </GlassButton>
          </Link>
        </nav>

        {/* Hero */}
        <section className="px-4 sm:px-8 lg:px-12 pt-16 pb-24">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 font-mono text-[11px] tracking-widest text-primary uppercase relative overflow-hidden">
                <ShieldCheck className="w-3.5 h-3.5" /> Medical-Grade · ISO 13485 · HIPAA · 100× Clinical
                <span className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-holo-shimmer" />
              </div>
              <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                Clone your{" "}
                <span className="text-primary text-glow-cyan">Brain</span>,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">DNA</span>{" "}
                & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Heart</span>
                <br />
                <span className="text-foreground/90">through a single touch.</span>
              </h1>
              <p className="font-orbitron text-sm sm:text-base tracking-[0.25em] uppercase text-primary/90">
                AI-Powered BioDigital Twin · Medical-Grade Intelligence
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                MEGAMIND AI fuses multimodal biosensing, neuroscience, genomics, cardiology, digital
                pathology, and biometric authentication into a unified BioDigital Intelligence platform —
                delivering real-time disease detection, drug-interaction-checked treatment guidance,
                and forensic-grade clinical reporting.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/scan">
                  <GlassButton size="lg" className="font-orbitron tracking-widest text-sm">
                    BEGIN SCAN <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                </Link>
                <a href="#capabilities">
                  <GlassButton size="lg" className="font-orbitron tracking-widest text-sm" glassColor="oklch(from var(--foreground) l c h / 4%)">
                    EXPLORE PLATFORM
                  </GlassButton>
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/40">
                {[
                  { v: "99.4%", l: "Signal fidelity" },
                  { v: "<1.2s", l: "Time to insight" },
                  { v: "840+", l: "Clinical markers" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-orbitron text-2xl font-bold text-primary text-glow-cyan">{s.v}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              {/* Corner brackets */}
              <div className="absolute -inset-3 pointer-events-none">
                {[
                  "top-0 left-0 border-t-2 border-l-2",
                  "top-0 right-0 border-t-2 border-r-2",
                  "bottom-0 left-0 border-b-2 border-l-2",
                  "bottom-0 right-0 border-b-2 border-r-2",
                ].map((p) => (
                  <span key={p} className={`absolute w-6 h-6 ${p} border-primary text-primary animate-corner-pulse rounded-sm`} />
                ))}
              </div>
              <div className="relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl p-6 box-glow-cyan overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 pointer-events-none" />
                <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-primary/15 to-transparent animate-holo-shimmer pointer-events-none" />
                <div className="grid grid-cols-3 gap-4 relative">
                  {[
                    { img: brainScan, label: "Neural", icon: Brain, color: "text-primary" },
                    { img: heartScan, label: "Cardiac", icon: Heart, color: "text-red-400" },
                    { img: dnaScan, label: "Genomic", icon: Dna, color: "text-green-400" },
                  ].map((m) => (
                    <div key={m.label} className="relative rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col items-center gap-2 overflow-hidden group">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
                      <img src={m.img} alt={m.label} className="w-full h-24 object-contain animate-float" />
                      <div className="flex items-center gap-1.5">
                        <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                        <span className="font-orbitron text-[10px] tracking-widest uppercase">{m.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 relative">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>Live biosignal</span>
                    <span className="text-primary flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Streaming
                    </span>
                  </div>
                  <div className="h-16 rounded-lg bg-background/70 border border-border/50 relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "linear-gradient(hsl(var(--primary)/0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.5) 1px, transparent 1px)",
                        backgroundSize: "20px 16px",
                      }}
                    />
                    <svg viewBox="0 0 400 64" className="absolute inset-0 w-full h-full">
                      <polyline
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="1.5"
                        points="0,32 30,32 40,12 50,52 60,32 100,32 130,32 140,18 150,46 160,32 220,32 250,32 260,10 270,54 280,32 340,32 400,32"
                      />
                    </svg>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { l: "SNR", v: "42 dB" },
                      { l: "HRV", v: "68 ms" },
                      { l: "SpO₂", v: "98%" },
                      { l: "Drift", v: "0.3%" },
                    ].map((m) => (
                      <div key={m.l} className="rounded-md border border-border/50 bg-background/60 px-2 py-1.5">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{m.l}</div>
                        <div className="font-orbitron text-xs text-foreground">{m.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section id="trust" className="px-4 sm:px-8 lg:px-12 pb-16">
          <div className="max-w-7xl mx-auto rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm px-6 py-5 flex flex-wrap items-center justify-between gap-6">
            {[
              { i: ShieldCheck, t: "HIPAA-aligned" },
              { i: Lock, t: "End-to-end encryption" },
              { i: FileCheck2, t: "Evidence-based · NICE / AHA / ESC" },
              { i: Cpu, t: "On-device inference" },
              { i: CheckCircle2, t: "Clinician-reviewed" },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <b.i className="w-4 h-4 text-primary" /> {b.t}
              </div>
            ))}
          </div>
        </section>

        {/* BioDigital Modules — MEGAMIND power grid */}
        <section id="modules" className="px-4 sm:px-8 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <p className="font-mono text-xs tracking-widest text-primary uppercase">BioDigital Intelligence Stack</p>
              <h2 className="font-orbitron text-3xl sm:text-4xl font-bold">
                Twelve <span className="text-primary text-glow-cyan">medical-grade</span> modules. One platform.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A unified AI ecosystem spanning multimodal biosensing, neuroscience, genomics, digital pathology,
                biometric authentication, and forensic intelligence — all on a real-time clinical bus.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { i: Waves,        t: "Multimodal Biosensing",  d: "PPG · ECG · EDA · bioimpedance fusion at 1 kHz." },
                { i: Brain,        t: "Neuroscience Engine",     d: "EEG-grade autonomic and cognitive load mapping." },
                { i: Dna,          t: "Genomic Intelligence",    d: "Hereditary risk + pharmacogenomic profiling." },
                { i: Heart,        t: "Cardiology Suite",        d: "Arrhythmia, HRV, BP & stroke-risk scoring." },
                { i: Microscope,   t: "Digital Pathology",       d: "AI tissue & cellular pattern recognition." },
                { i: Fingerprint,  t: "Biometric Authentication",d: "Forensic-grade identity binding per scan." },
                { i: Pill,         t: "Medication Safety AI",    d: "Contraindication + drug-interaction checks." },
                { i: Radar,        t: "Real-Time Monitoring",    d: "Sub-second anomaly alerts, every scan." },
                { i: FlaskConical, t: "Lab Integration",         d: "HL7 / FHIR · imaging · wearables ingestion." },
                { i: Satellite,    t: "Telemedicine Bridge",     d: "Encrypted clinician hand-off & remote review." },
                { i: Network,      t: "Forensic Intelligence",   d: "Chain-of-custody audit trail per finding." },
                { i: Atom,         t: "Adaptive AI Core",        d: "Self-calibrating models, evidence-graded." },
              ].map((m) => (
                <div key={m.t} className="group relative rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 hover:border-primary/50 hover:box-glow-cyan transition-all overflow-hidden">
                  <span className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-holo-shimmer" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <m.i className="w-5 h-5 text-primary" />
                    </div>
                    <Hexagon className="w-3.5 h-3.5 text-primary/40 ml-auto" />
                  </div>
                  <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider mb-1.5">{m.t}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{m.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Medication Safety highlight */}
        <section className="px-4 sm:px-8 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <p className="font-mono text-xs tracking-widest text-primary uppercase">Real-Time Therapeutic Engine</p>
              <h2 className="font-orbitron text-3xl sm:text-4xl font-bold">
                Every recommendation, <span className="text-primary text-glow-cyan">safety-checked.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MEGAMIND cross-references every real-time treatment suggestion against patient allergies, current
                medications, contraindications, and drug–drug interactions — sourced from NICE, AHA, ESC,
                FDA & WHO formularies.
              </p>
              <ul className="space-y-2.5">
                {[
                  { i: Pill, t: "Contraindication screening per patient profile" },
                  { i: AlertTriangle, t: "Drug–drug interaction warnings with severity tiers" },
                  { i: FileCheck2, t: "Evidence citations attached to every recommendation" },
                  { i: Eye, t: "Clinician override + audit log per decision" },
                ].map((f) => (
                  <li key={f.t} className="flex items-start gap-3 text-sm">
                    <f.i className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {f.t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_60%)] pointer-events-none" />
              <div className="relative space-y-3 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground tracking-widest uppercase">Rx Safety Trace</span>
                  <span className="flex items-center gap-1.5 text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
                  </span>
                </div>
                {[
                  { c: "✓", k: "Lisinopril 10mg", v: "no interaction · ACE-I cleared", ok: true },
                  { c: "!", k: "Ibuprofen 400mg", v: "moderate · reduces ACE-I effect", ok: false },
                  { c: "✓", k: "Atorvastatin 20mg", v: "cleared · CYP3A4 watch", ok: true },
                  { c: "✕", k: "Warfarin + NSAID", v: "severe · bleeding risk · blocked", ok: false, bad: true },
                  { c: "✓", k: "Allergy panel", v: "no flags for current Rx", ok: true },
                ].map((r) => (
                  <div key={r.k} className="flex items-center gap-3 rounded-md border border-border/40 bg-background/50 px-3 py-2">
                    <span className={`font-orbitron text-sm ${r.bad ? "text-red-400" : r.ok ? "text-green-400" : "text-amber-400"}`}>{r.c}</span>
                    <div className="flex-1">
                      <div className="text-foreground">{r.k}</div>
                      <div className="text-muted-foreground text-[10px]">{r.v}</div>
                    </div>
                    <ScanLine className="w-3.5 h-3.5 text-primary/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section id="capabilities" className="px-4 sm:px-8 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <p className="font-mono text-xs tracking-widest text-primary uppercase">Capabilities</p>
              <h2 className="font-orbitron text-3xl sm:text-4xl font-bold">
                One scan. <span className="text-primary text-glow-cyan">Three systems.</span> Complete clinical context.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                MediBAL fuses multi-modal biosensing with AI anomaly detection to surface conditions
                long before symptoms — and pairs every finding with vetted treatment guidance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Heart,
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                  title: "Cardiac Intelligence",
                  desc: "PPG-derived HRV, arrhythmia screening, blood-pressure trends, and cardiovascular risk scoring.",
                  points: ["Atrial fibrillation detection", "Hypertensive trend alerts", "Stroke risk index"],
                },
                {
                  icon: Brain,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  title: "Neural Diagnostics",
                  desc: "Bioelectric pulse analysis for autonomic balance, cognitive load, and neurological anomalies.",
                  points: ["Autonomic dysregulation", "Cognitive load index", "Seizure-risk biomarkers"],
                },
                {
                  icon: Dna,
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                  title: "Genomic Insights",
                  desc: "Epithelial DNA pattern analysis surfaces hereditary risk and pharmacogenomic flags.",
                  points: ["Hereditary disease risk", "Drug-metabolism profile", "Carrier status indicators"],
                },
              ].map((c) => (
                <div key={c.title} className="group rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/40 hover:box-glow-cyan transition-all">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                    <c.icon className={`w-6 h-6 ${c.color}`} />
                  </div>
                  <h3 className="font-orbitron text-lg font-bold mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{c.desc}</p>
                  <ul className="space-y-2">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-foreground/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="px-4 sm:px-8 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <p className="font-mono text-xs tracking-widest text-primary uppercase">Clinical Workflow</p>
              <h2 className="font-orbitron text-3xl sm:text-4xl font-bold">From touch to treatment in seconds.</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-5">
              {[
                { n: "01", icon: Stethoscope, t: "Patient Intake", d: "Capture demographics, allergies, and history with a clinician-grade intake form." },
                { n: "02", icon: Waves, t: "Multi-Signal Capture", d: "PPG, bioelectric, and epithelial pattern data acquired in a single fingertip session." },
                { n: "03", icon: Activity, t: "AI Analysis", d: "Anomaly models flag arrhythmias, neural irregularities, and DNA risk markers in real time." },
                { n: "04", icon: Sparkles, t: "Guided Action", d: "Evidence-based recommendations with safety checks, contraindications, and exportable PDF." },
              ].map((s) => (
                <div key={s.n} className="relative rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
                  <div className="font-orbitron text-xs text-primary tracking-widest mb-3">{s.n}</div>
                  <s.icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-orbitron text-sm font-bold mb-2 uppercase tracking-wider">{s.t}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="platform" className="px-4 sm:px-8 lg:px-12 pb-24">
          <div className="max-w-5xl mx-auto rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/40 to-secondary/10 backdrop-blur-xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_60%)] pointer-events-none" />
            <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-holo-shimmer pointer-events-none" />
            <div className="relative space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-background/60 font-mono text-[10px] tracking-widest text-primary uppercase">
                <Zap className="w-3 h-3" /> MEGAMIND AI · v10.0 BioDigital Core
              </div>
              <h2 className="font-orbitron text-3xl sm:text-4xl font-bold">
                Ready to scan your first <span className="text-primary text-glow-cyan">patient?</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Launch the MEGAMIND clinical console and capture a full biosignal screening — neural, cardiac, genomic — in under two seconds.
              </p>
              <Link to="/scan" className="inline-block">
                <GlassButton size="lg" className="font-orbitron tracking-widest text-sm">
                  OPEN CLINICAL CONSOLE <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/40 px-4 sm:px-8 lg:px-12 py-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-mono text-xs text-muted-foreground">© 2026 MEGAMIND AI · BioDigital Intelligence · Medical-Grade</span>
            <span className="font-mono text-xs text-muted-foreground">For clinical decision support. Not a substitute for professional diagnosis.</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;