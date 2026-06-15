import { Link } from "react-router-dom";
import { Activity, Brain, Dna, Heart, ShieldCheck, Sparkles, Stethoscope, Waves, ArrowRight, CheckCircle2, FileCheck2, Lock, Cpu } from "lucide-react";
import megamindLogo from "@/assets/megamind-logo.png";
import neuralBg from "@/assets/neural-bg.jpg";
import brainScan from "@/assets/brain-scan.png";
import heartScan from "@/assets/heart-scan.png";
import dnaScan from "@/assets/dna-scan.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={neuralBg} alt="" className="w-full h-full object-cover opacity-[0.18]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-5 border-b border-border/40 backdrop-blur-md bg-background/40">
          <Link to="/" className="flex items-center gap-3">
            <img src={megamindLogo} alt="MediBAL" width={40} height={40} />
            <div className="flex flex-col leading-none">
              <span className="font-orbitron text-base sm:text-lg font-bold tracking-widest">
                MEDI<span className="text-primary text-glow-cyan">BAL</span>
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Medical-Grade AI</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase text-muted-foreground">
            <a href="#platform" className="hover:text-primary transition-colors">Platform</a>
            <a href="#capabilities" className="hover:text-primary transition-colors">Capabilities</a>
            <a href="#trust" className="hover:text-primary transition-colors">Trust</a>
            <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
          </div>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-orbitron text-xs tracking-widest hover:bg-primary/90 transition-colors"
          >
            LAUNCH SCAN <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>

        {/* Hero */}
        <section className="px-4 sm:px-8 lg:px-12 pt-16 pb-24">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 font-mono text-[11px] tracking-widest text-primary uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> Clinically Calibrated · ISO 13485 Aligned
              </div>
              <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                Medical-grade intelligence,
                <br />
                <span className="text-primary text-glow-cyan">at the touch of a fingertip.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                MediBAL Scan unifies cardiac, neural, and genomic biosignal analysis into a single
                clinician-grade screening platform — delivering real-time disease detection,
                evidence-based treatment guidance, and exportable patient reports.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/scan"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-orbitron text-sm tracking-widest hover:bg-primary/90 transition-all hover:box-glow-cyan"
                >
                  BEGIN SCAN <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#capabilities"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border bg-card/40 backdrop-blur-sm font-orbitron text-sm tracking-widest hover:border-primary/50 hover:text-primary transition-colors"
                >
                  EXPLORE PLATFORM
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/40">
                {[
                  { v: "99.2%", l: "Signal fidelity" },
                  { v: "<1.8s", l: "Time to insight" },
                  { v: "240+", l: "Clinical markers" },
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
              <div className="relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl p-6 box-glow-cyan overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 pointer-events-none" />
                <div className="grid grid-cols-3 gap-4 relative">
                  {[
                    { img: brainScan, label: "Neural", icon: Brain, color: "text-primary" },
                    { img: heartScan, label: "Cardiac", icon: Heart, color: "text-red-400" },
                    { img: dnaScan, label: "Genomic", icon: Dna, color: "text-green-400" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col items-center gap-2">
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
            <div className="relative space-y-5">
              <h2 className="font-orbitron text-3xl sm:text-4xl font-bold">
                Ready to scan your first <span className="text-primary text-glow-cyan">patient?</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Launch the MediBAL clinical console and capture a full biosignal screening in under two seconds.
              </p>
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-orbitron text-sm tracking-widest hover:bg-primary/90 transition-all hover:box-glow-cyan"
              >
                OPEN CLINICAL CONSOLE <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/40 px-4 sm:px-8 lg:px-12 py-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-mono text-xs text-muted-foreground">© 2026 MediBAL Health Systems · Medical-grade AI</span>
            <span className="font-mono text-xs text-muted-foreground">For clinical decision support. Not a substitute for professional diagnosis.</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;