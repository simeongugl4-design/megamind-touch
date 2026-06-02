import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertTriangle, ShieldAlert, Pill, ExternalLink, Stethoscope, HeartPulse, Brain, Wind } from "lucide-react";
import { useLiveSensor, type SensorChannel } from "@/hooks/useLiveSensor";
import { assessLive, REALTIME_DISCLAIMER, type LiveAssessment, type LiveFinding, type LiveVitals, type Urgency } from "@/lib/realtimeDisease";
import type { BiometricProfile } from "@/lib/biometricProfile";

const urgStyle: Record<Urgency, { bg: string; border: string; text: string; chip: string; label: string }> = {
  info:      { bg: "bg-primary/10",      border: "border-primary/40",     text: "text-primary",     chip: "bg-primary/20",     label: "INFO" },
  watch:    { bg: "bg-amber-400/10",     border: "border-amber-400/40",   text: "text-amber-300",   chip: "bg-amber-400/20",   label: "WATCH" },
  urgent:   { bg: "bg-orange-500/10",    border: "border-orange-500/40",  text: "text-orange-300",  chip: "bg-orange-500/25",  label: "URGENT" },
  emergency:{ bg: "bg-destructive/10",   border: "border-destructive/50", text: "text-destructive", chip: "bg-destructive/25", label: "EMERGENCY" },
};

const sysIcon: Record<LiveFinding["system"], typeof Activity> = {
  Cardiac: HeartPulse,
  Respiratory: Wind,
  Neural: Brain,
  Metabolic: Activity,
  Autonomic: Activity,
  Vascular: Activity,
};

/** Builds sensor channels seeded by the patient profile so the same person
 *  yields the same live findings across rounds. */
function buildChannels(p: BiometricProfile | null): SensorChannel[] {
  const c = p?.cardiac;
  const n = p?.neural?.bands;
  return [
    { key: "hr",       label: "HR",     unit: " bpm", base: c?.hr ?? 72,  min: 40, max: 150, noise: 1.4, drift: 1.2, driftPeriod: 9, decimals: 0 },
    { key: "spo2",     label: "SpO₂",   unit: " %",   base: c?.spo2 ?? 97, min: 88, max: 100, noise: 0.25, drift: 0.4, driftPeriod: 14, decimals: 1 },
    { key: "sys",      label: "SBP",    unit: " mmHg",base: c?.sys ?? 122, min: 80, max: 200, noise: 1.1, drift: 2.2, driftPeriod: 17, decimals: 0 },
    { key: "dia",      label: "DBP",    unit: " mmHg",base: c?.dia ?? 78,  min: 50, max: 130, noise: 0.8, drift: 1.6, driftPeriod: 17, decimals: 0 },
    { key: "respRate", label: "RR",     unit: " /min",base: 16,           min: 8,  max: 30,  noise: 0.6, drift: 0.8, driftPeriod: 11, decimals: 0 },
    { key: "tempC",    label: "Temp",   unit: " °C",  base: 36.7,         min: 35, max: 40,  noise: 0.04, drift: 0.10, driftPeriod: 25, decimals: 1 },
    { key: "hrv",      label: "RMSSD",  unit: " ms",  base: c?.hrv ?? 55, min: 8,  max: 130, noise: 1.8, drift: 3,   driftPeriod: 13, decimals: 0 },
    { key: "qtc",      label: "QTc",    unit: " ms",  base: c?.qtc ?? 410,min: 340,max: 540, noise: 1.0, drift: 2,   driftPeriod: 19, decimals: 0 },
    { key: "beta",     label: "β-EEG",  unit: " µV",  base: n?.beta ?? 18,min: 4,  max: 35,  noise: 0.5, drift: 1,   driftPeriod: 8,  decimals: 1 },
    { key: "theta",    label: "θ-EEG",  unit: " µV",  base: n?.theta ?? 12,min: 2, max: 26,  noise: 0.4, drift: 0.8, driftPeriod: 9,  decimals: 1 },
    { key: "alpha",    label: "α-EEG",  unit: " µV",  base: n?.alpha ?? 18,min: 4, max: 34,  noise: 0.4, drift: 0.8, driftPeriod: 10, decimals: 1 },
    { key: "delta",    label: "δ-EEG",  unit: " µV",  base: n?.delta ?? 8, min: 1, max: 22,  noise: 0.3, drift: 0.5, driftPeriod: 12, decimals: 1 },
  ];
}

const triageStyle = (t: LiveAssessment["triage"]) =>
  t === "Emergency" ? "border-destructive/60 bg-destructive/15 text-destructive"
  : t === "Escalate" ? "border-orange-500/50 bg-orange-500/15 text-orange-300"
  : t === "Monitor"  ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
  : "border-emerald-400/50 bg-emerald-400/10 text-emerald-300";

const RealTimeDiseaseMonitor = ({
  active,
  profile,
}: {
  active: boolean;
  profile: BiometricProfile | null;
}) => {
  const channels = useMemo(() => buildChannels(profile), [profile]);
  const { readings } = useLiveSensor(channels, active);
  const [assessment, setAssessment] = useState<LiveAssessment | null>(null);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!active || readings.length === 0) return;
    const now = performance.now();
    if (now - lastRef.current < 700) return; // throttle to ~1.4 Hz
    lastRef.current = now;
    const map = Object.fromEntries(readings.map((r) => [r.key, r.value]));
    const v: LiveVitals = {
      hr: map.hr ?? 72,
      spo2: map.spo2 ?? 97,
      sys: map.sys ?? 120,
      dia: map.dia ?? 78,
      respRate: map.respRate ?? 16,
      tempC: map.tempC ?? 36.7,
      hrv: map.hrv ?? 55,
      qtc: map.qtc ?? 410,
      beta: map.beta ?? 18,
      theta: map.theta ?? 12,
      alpha: map.alpha ?? 18,
      delta: map.delta ?? 8,
    };
    setAssessment(assessLive(v));
  }, [readings, active]);

  if (!active && !assessment) return null;

  const a = assessment;
  const ts = a ? triageStyle(a.triage) : triageStyle("Stable");

  return (
    <section className="px-4 sm:px-6 lg:px-12 pb-8">
      <div className="max-w-7xl mx-auto rounded-xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Stethoscope className="w-4 h-4 text-primary" />
              {active && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-destructive animate-ping" />}
            </div>
            <div>
              <h3 className="font-orbitron text-sm font-bold tracking-wider uppercase">
                Real-Time Disease Detection · Cure Engine
              </h3>
              <p className="font-mono text-[10px] text-muted-foreground">
                Streaming differential diagnosis with evidence-based therapy from FDA, NIH, NICE, AHA, ESC, AASM, APA, WHO
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-orbitron text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md border ${ts}`}>
              <ShieldAlert className="inline w-3 h-3 mr-1" />
              Triage: {a?.triage ?? "Stable"}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground px-2 py-1 rounded-md border border-border bg-background/40">
              NEWS2 {a?.newsScore ?? 0}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground px-2 py-1 rounded-md border border-border bg-background/40">
              Risk {a?.compositeRisk ?? 0}/100
            </span>
          </div>
        </div>

        {/* Vitals row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 px-5 py-3 border-b border-border/40">
          {readings.map((r) => (
            <div key={r.key} className="rounded border border-border/60 bg-background/50 p-1.5">
              <div className="font-orbitron text-[8px] tracking-wider uppercase text-muted-foreground">{r.label}</div>
              <div className="font-mono text-[11px] tabular-nums text-foreground">
                {r.display}<span className="text-muted-foreground">{r.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Findings */}
        <div className="p-5">
          {!a || a.findings.length === 0 ? (
            <p className="font-mono text-[11px] text-emerald-300">
              ✓ No abnormal pattern detected in real-time stream. Continue monitoring.
            </p>
          ) : (
            <ul className="space-y-3">
              {a.findings.map((f) => {
                const s = urgStyle[f.urgency];
                const Icon = sysIcon[f.system];
                return (
                  <li key={f.id} className={`rounded-lg border ${s.border} ${s.bg} p-3`}>
                    <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${s.text}`} />
                        <span className="font-orbitron text-[11px] tracking-wider uppercase text-foreground">
                          {f.system} · {f.condition}
                        </span>
                        {f.icd10 && (
                          <span className="font-mono text-[9px] text-muted-foreground">[{f.icd10}]</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-orbitron text-[9px] uppercase ${s.text} ${s.chip} px-1.5 py-0.5 rounded`}>
                          {s.label}
                        </span>
                        <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
                          conf {f.confidence}%
                        </span>
                      </div>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mb-0.5">▸ {f.evidence}</p>
                    <p className="font-mono text-[10px] text-foreground/85 mb-1 leading-relaxed">{f.explanation}</p>
                    <p className="font-mono text-[10px] text-primary/90 mb-2">
                      <AlertTriangle className="inline w-3 h-3 mr-1" />
                      <span className="text-primary">Act now:</span> {f.immediateAction}
                    </p>
                    <div className="space-y-1.5">
                      {f.cures.map((c, i) => (
                        <div key={i} className="rounded-md border border-border/60 bg-background/40 p-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-foreground">
                              <Pill className="inline w-3 h-3 mr-1 text-primary" />
                              <span className="text-primary">Rx:</span> {c.drug}
                              {c.atc && <span className="ml-1 text-muted-foreground">[ATC {c.atc}]</span>}
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-foreground/80 mt-0.5">
                            <span className="text-muted-foreground">Why:</span> {c.why}
                          </p>
                          <p className="font-mono text-[10px] text-amber-300/90 mt-0.5">⚠ {c.caution}</p>
                          <p className="font-mono text-[10px] mt-0.5">
                            <span className="text-muted-foreground">Source:</span>{" "}
                            <a
                              href={c.source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              {c.source.label} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </p>
                        </div>
                      ))}
                    </div>
                    {f.redFlag && (
                      <p className="font-mono text-[10px] text-destructive mt-2">🚨 {f.redFlag}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 font-mono text-[9px] text-muted-foreground italic leading-relaxed border-t border-border/50 pt-2">
            {REALTIME_DISCLAIMER}
          </p>
        </div>
      </div>
    </section>
  );
};

export default RealTimeDiseaseMonitor;