import { useEffect, useRef, useState } from "react";
import { Activity, Brain, Dna, HeartPulse, Gauge, TrendingUp, AlertTriangle, Wind, Thermometer, Droplet, Play, Pause } from "lucide-react";
import type { BiometricProfile } from "@/lib/biometricProfile";

type Sample = { t: number; conf: number; snr: number; drift: number; align: number };
type TabKey = "overview" | "ecg" | "eeg" | "dna";
type Modality = "ecg" | "eeg" | "dna" | "all";
type Anomaly = {
  t: number;
  sev: "info" | "warning" | "critical";
  msg: string;
  modality: Modality;
  detail: string;
};

const MAX_POINTS = 120;

const LiveDashboard = ({
  scanning,
  scanComplete,
  profile,
}: {
  scanning: boolean;
  scanComplete: boolean;
  profile?: BiometricProfile | null;
}) => {
  const [tab, setTab] = useState<TabKey>("overview");
  const [samples, setSamples] = useState<Sample[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [focusT, setFocusT] = useState<number | null>(null);
  const [activeAnomaly, setActiveAnomaly] = useState<Anomaly | null>(null);
  const baseHr = profile?.cardiac.hr ?? 72;
  const baseSys = profile?.cardiac.sys ?? 120;
  const baseDia = profile?.cardiac.dia ?? 80;
  const baseSpo2 = profile?.cardiac.spo2 ?? 98;
  const baseHrv = profile?.cardiac.hrv ?? 62;
  const baseTemp = profile?.capture.fingerTempC ? profile.capture.fingerTempC - 4.2 : 36.8;
  const [vitals, setVitals] = useState({ hr: baseHr, spo2: baseSpo2, sys: baseSys, dia: baseDia, resp: 14, temp: baseTemp });
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const ecgRef = useRef<HTMLCanvasElement>(null);
  const eegRef = useRef<HTMLCanvasElement>(null);
  const dnaRef = useRef<HTMLCanvasElement>(null);

  // Build a deterministic, fingerprint-driven anomaly timeline
  function buildTimeline(): Anomaly[] {
    const cap = profile?.capture;
    const moisture = cap?.moisture ?? 0.45;
    const pressure = cap?.pressure ?? 0.7;
    const ridge = cap?.ridgeDensity ?? 22;
    const tempF = cap?.fingerTempC ?? 32.5;
    const hash = profile?.identityHash ?? "————";
    return [
      {
        t: 1.2,
        sev: "info",
        modality: "all",
        msg: "Sensor handshake · capacitive contact established",
        detail: `Identity hash ${hash}. Capacitive contact area ${(cap?.contactArea ?? 0)} px², dwell ${(cap?.dwellMs ?? 0)} ms. Sensor confirms a single-finger press (no edge artefacts).`,
      },
      {
        t: 3.0,
        sev: "info",
        modality: "all",
        msg: "Calibration locked · handoff to acquisition",
        detail: `SNR converged ≥ 38 dB and baseline drift dropped below 0.05 mV/s. Skin moisture ${(moisture * 100).toFixed(0)}% and contact pressure ${(pressure * 100).toFixed(0)}% are within optimal envelope — minimal motion artefact expected.`,
      },
      {
        t: 4.4,
        sev: "info",
        modality: "ecg",
        msg: "Sinus rhythm confirmed · QRS 88 ms",
        detail: `Pulse-wave reconstruction yields HR ${baseHr.toFixed(0)} bpm with consistent P-QRS-T morphology. Axis is normal (+30°). No ectopy in first acquisition window.`,
      },
      {
        t: 5.8,
        sev: ridge > 23 ? "info" : "warning",
        modality: "eeg",
        msg: `Cortical baseline · α band ${(profile?.neural.bands.alpha ?? 18).toFixed(1)} µV`,
        detail: `Posterior alpha rhythm reconstructed from microvascular pulsation envelope. Ridge density ${ridge.toFixed(1)} ridges/mm gives ${ridge > 23 ? "excellent" : "acceptable"} spatial sampling for the surrogate EEG model.`,
      },
      {
        t: 7.1,
        sev: "warning",
        modality: "ecg",
        msg: "Transient T-wave variance · within tolerance",
        detail: `Subtle T-wave amplitude oscillation (±8%) detected during respiratory cycle (RSA). Not pathological, consistent with healthy autonomic tone (HRV ${baseHrv} ms). Flagged for clinician awareness.`,
      },
      {
        t: 8.6,
        sev: "info",
        modality: "dna",
        msg: "Epithelial yield sufficient · sequencing started",
        detail: `Estimated ${Math.round((cap?.contactArea ?? 180) * 1.4)} epithelial cells lifted. Nanopore Q-score 38, GC content 50.2%. ${profile?.genomic.ancestry ?? "Mixed"} ancestry priors loaded.`,
      },
      {
        t: 10.2,
        sev: tempF < 31.5 ? "warning" : "info",
        modality: "all",
        msg: `Perfusion check · finger temp ${tempF.toFixed(1)}°C`,
        detail: tempF < 31.5
          ? `Cool finger temperature may reduce SpO₂ accuracy by 1–2%. Recommend warming hand and re-acquiring if SpO₂ trends below 95%.`
          : `Peripheral perfusion is good. SpO₂ readings are reliable; PWV-derived BP estimate is high-confidence.`,
      },
      {
        t: 11.8,
        sev: "info",
        modality: "all",
        msg: "Final confidence ≥ 99.9% · scan complete",
        detail: `All modalities crossed acceptance thresholds. Composite confidence locked. Report queued for AI clinical interpretation and PDF export.`,
      },
    ];
  }

  // Trend collection — anomaly timeline is deterministic from fingerprint
  useEffect(() => {
    if (!scanning) return;
    startRef.current = performance.now();
    setSamples([]);
    const timeline = buildTimeline();
    setAnomalies([]);
    setFocusT(null);
    setActiveAnomaly(null);
    const fired = new Set<number>();
    const id = window.setInterval(() => {
      const t = (performance.now() - startRef.current) / 1000;
      const inCalib = t < 3;
      const snr = inCalib ? 12 + (t / 3) * 26 + (Math.random() - 0.5) : 38 + Math.sin(t * 1.2) * 1.5;
      const drift = inCalib ? 0.85 - (t / 3) * 0.81 : 0.04 + Math.random() * 0.01;
      const align = inCalib ? 32 + (t / 3) * 67 : 99 + Math.sin(t) * 0.4;
      const conf = inCalib
        ? (t / 3) * 70 + Math.random() * 2
        : Math.min(99.97, 70 + (1 - Math.exp(-(t - 3) / 3)) * 29.7);
      setSamples((s) => [...s, { t, conf, snr, drift, align }].slice(-MAX_POINTS));
      // Live vitals jitter — anchored to deterministic patient baseline
      setVitals(() => ({
        hr: clamp(baseHr + Math.sin(t * 1.1) * 2.5 + (Math.random() - 0.5) * 1.2, 45, 130),
        spo2: clamp(baseSpo2 + (Math.random() - 0.5) * 0.5, 90, 100),
        sys: clamp(baseSys + Math.sin(t * 0.6) * 3.5 + (Math.random() - 0.5), 90, 160),
        dia: clamp(baseDia + Math.sin(t * 0.7) * 2.5 + (Math.random() - 0.5), 55, 100),
        resp: clamp(14 + Math.sin(t * 0.4) * 1.2, 10, 22),
        temp: clamp(baseTemp + Math.sin(t * 0.2) * 0.12, 35.8, 37.6),
      }));
      timeline.forEach((a, i) => {
        if (!fired.has(i) && t >= a.t) {
          fired.add(i);
          setAnomalies((prev) => [...prev, a]);
        }
      });
    }, 120);
    return () => window.clearInterval(id);
  }, [scanning, profile?.identityHash]);

  // When scan completes, ensure full timeline is present (in case unmount)
  useEffect(() => {
    if (scanComplete && anomalies.length === 0) {
      setAnomalies(buildTimeline());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanComplete]);

  // Drill-down canvases
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!scanning && !scanComplete) return;
    const draw = () => {
      const t = focusT !== null ? focusT + 100 : performance.now() / 1000;
      if (tab === "ecg" || tab === "overview") drawECG(ecgRef.current, t);
      if (tab === "eeg" || tab === "overview") drawEEG(eegRef.current, t);
      if (tab === "dna" || tab === "overview") drawDNA(dnaRef.current, t);
      if (focusT === null) rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tab, scanning, scanComplete, focusT]);

  const last = samples[samples.length - 1];
  const SCAN_DURATION = 13;

  const jumpTo = (a: Anomaly) => {
    setActiveAnomaly(a);
    setFocusT(a.t);
    if (a.modality === "ecg" || a.modality === "eeg" || a.modality === "dna") {
      setTab(a.modality);
    }
  };

  const markersFor = (m: Modality) =>
    anomalies.filter((a) => a.modality === m || a.modality === "all");

  return (
    <section className="px-4 sm:px-6 lg:px-12 pb-8">
      <div className="max-w-7xl mx-auto rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Gauge className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-orbitron text-sm font-bold tracking-wider uppercase">
                Live Clinical Dashboard
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Real-time calibration, confidence trend & modality drill-down
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot active={scanning} done={scanComplete} />
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-4 border-b border-border/50">
          <Kpi label="Confidence" value={last ? `${last.conf.toFixed(1)}%` : "—"} accent="text-primary" />
          <Kpi label="SNR" value={last ? `${last.snr.toFixed(1)} dB` : "—"} accent="text-secondary" />
          <Kpi label="Drift" value={last ? `${last.drift.toFixed(2)} mV/s` : "—"} accent="text-amber-300" />
          <Kpi label="Alignment" value={last ? `${last.align.toFixed(1)}%` : "—"} accent="text-green-400" />
        </div>

        {/* Vital Signs strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 px-5 py-3 border-b border-border/50">
          <Vital icon={HeartPulse} label="HR" value={`${vitals.hr.toFixed(0)} bpm`} tint="text-rose-400" />
          <Vital icon={Droplet} label="SpO₂" value={`${vitals.spo2.toFixed(0)}%`} tint="text-cyan-400" />
          <Vital icon={Activity} label="BP" value={`${vitals.sys.toFixed(0)}/${vitals.dia.toFixed(0)}`} tint="text-violet-300" />
          <Vital icon={Wind} label="Resp" value={`${vitals.resp.toFixed(0)}/min`} tint="text-emerald-300" />
          <Vital icon={Thermometer} label="Temp" value={`${vitals.temp.toFixed(1)}°C`} tint="text-amber-300" />
          <Vital icon={Gauge} label="HRV" value={`${baseHrv} ms`} tint="text-primary" />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 px-3 pt-3">
          {([
            { k: "overview", label: "Overview", icon: TrendingUp },
            { k: "ecg", label: "ECG", icon: HeartPulse },
            { k: "eeg", label: "EEG", icon: Brain },
            { k: "dna", label: "DNA", icon: Dna },
          ] as { k: TabKey; label: string; icon: typeof Activity }[]).map((t) => {
            const Icon = t.icon;
            const active = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-orbitron text-[10px] tracking-wider uppercase transition-colors ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/40"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className="w-3 h-3" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-4">
          {tab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Confidence Score Trend" subtitle="Calibration ▒ → Acquisition">
                <TrendChart samples={samples} field="conf" color="hsl(180,100%,50%)" min={0} max={100} unit="%" />
              </ChartCard>
              <ChartCard title="Calibration Quality (SNR)" subtitle="Higher is better">
                <TrendChart samples={samples} field="snr" color="hsl(45,100%,55%)" min={0} max={45} unit="dB" />
              </ChartCard>
              <MiniCanvas refEl={ecgRef} title="ECG Stream" tint="hsl(0,80%,55%)" />
              <MiniCanvas refEl={eegRef} title="EEG Stream" tint="hsl(270,80%,65%)" />
              <div className="lg:col-span-2 rounded-lg border border-border bg-background/40 p-3">
                <p className="font-orbitron text-[10px] tracking-wider uppercase text-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-300" /> Live Event Feed
                </p>
                {anomalies.length === 0 ? (
                  <p className="font-mono text-[10px] text-muted-foreground">No events yet — start a scan.</p>
                ) : (
                  <ul className="space-y-1">
                    {anomalies.slice().reverse().map((a, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 font-mono text-[10px] px-2 py-1 rounded ${
                          a.sev === "critical"
                            ? "bg-destructive/10 text-destructive"
                            : a.sev === "warning"
                            ? "bg-amber-400/10 text-amber-300"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <span className="opacity-60 tabular-nums">t+{a.t.toFixed(1)}s</span>
                        <span>›</span>
                        <span className="text-foreground/90">{a.msg}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          {tab === "ecg" && (
            <DrillCanvas
              refEl={ecgRef}
              tint="hsl(0,80%,55%)"
              title="ECG · Lead II Reconstruction"
              meta={["25 mm/s", "10 mm/mV", `HR ${last ? 72 : "—"} bpm`, "Sinus rhythm"]}
              markers={markersFor("ecg")}
              duration={SCAN_DURATION}
              focusT={focusT}
              onMarkerClick={jumpTo}
              onResume={() => { setFocusT(null); setActiveAnomaly(null); }}
              activeAnomaly={activeAnomaly}
            />
          )}
          {tab === "eeg" && (
            <DrillCanvas
              refEl={eegRef}
              tint="hsl(270,80%,65%)"
              title="EEG · 4-Channel Band Map"
              meta={["Fp1 α 24.7 µV", "Cz β 18.3 µV", "O1 γ 6.1 µV", "T3 θ 12.4 µV"]}
              markers={markersFor("eeg")}
              duration={SCAN_DURATION}
              focusT={focusT}
              onMarkerClick={jumpTo}
              onResume={() => { setFocusT(null); setActiveAnomaly(null); }}
              activeAnomaly={activeAnomaly}
            />
          )}
          {tab === "dna" && (
            <DrillCanvas
              refEl={dnaRef}
              tint="hsl(140,70%,50%)"
              title="DNA · Sequence Streaming"
              meta={["GC 50%", "20 bp/window", "Q-score 38", "4.1M SNPs"]}
              markers={markersFor("dna")}
              duration={SCAN_DURATION}
              focusT={focusT}
              onMarkerClick={jumpTo}
              onResume={() => { setFocusT(null); setActiveAnomaly(null); }}
              activeAnomaly={activeAnomaly}
            />
          )}
        </div>
      </div>
    </section>
  );
};

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const Vital = ({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  tint: string;
}) => (
  <div className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 py-1.5">
    <Icon className={`w-3.5 h-3.5 ${tint}`} />
    <div className="leading-tight">
      <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-orbitron text-[11px] font-bold tabular-nums ${tint}`}>{value}</p>
    </div>
  </div>
);

/* ---------- subcomponents ---------- */

const StatusDot = ({ active, done }: { active: boolean; done: boolean }) => (
  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
    <span
      className={`w-2 h-2 rounded-full ${
        active ? "bg-green-400 animate-pulse" : done ? "bg-primary" : "bg-muted-foreground/40"
      }`}
      style={{ boxShadow: active ? "0 0 8px hsl(140,70%,50%)" : undefined }}
    />
    {active ? "Streaming" : done ? "Snapshot" : "Idle"}
  </span>
);

const Kpi = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={`font-orbitron text-base font-bold tabular-nums ${accent}`}>{value}</p>
  </div>
);

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-border bg-background/40 p-3">
    <div className="flex items-center justify-between mb-2">
      <p className="font-orbitron text-[10px] tracking-wider uppercase text-foreground">{title}</p>
      {subtitle && <p className="font-mono text-[9px] text-muted-foreground">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const TrendChart = ({
  samples,
  field,
  color,
  min,
  max,
  unit,
}: {
  samples: Sample[];
  field: keyof Sample;
  color: string;
  min: number;
  max: number;
  unit: string;
}) => {
  const w = 320;
  const h = 100;
  const path = samples
    .map((s, i) => {
      const x = (i / Math.max(1, MAX_POINTS - 1)) * w;
      const v = (s[field] as number);
      const y = h - ((v - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = samples[samples.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
      {/* calibration shading: first 3s */}
      <rect x={0} y={0} width={(3 / 13) * w} height={h} fill="hsl(45,100%,55%)" opacity={0.08} />
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={0} x2={w} y1={h * p} y2={h * p} stroke="hsl(220,40%,18%)" strokeWidth={0.5} />
      ))}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <text x={w - 4} y={12} textAnchor="end" fill={color} fontSize={10} fontFamily="monospace">
        {last ? `${(last[field] as number).toFixed(1)} ${unit}` : "—"}
      </text>
    </svg>
  );
};

const MiniCanvas = ({
  refEl,
  title,
  tint,
}: {
  refEl: React.RefObject<HTMLCanvasElement>;
  title: string;
  tint: string;
}) => (
  <div className="rounded-lg border border-border bg-background/40 p-3">
    <p className="font-orbitron text-[10px] tracking-wider uppercase mb-2" style={{ color: tint }}>
      {title}
    </p>
    <canvas ref={refEl} width={640} height={140} className="w-full h-24 rounded" />
  </div>
);

const DrillCanvas = ({
  refEl,
  tint,
  title,
  meta,
  markers = [],
  duration = 13,
  focusT,
  onMarkerClick,
  onResume,
  activeAnomaly,
}: {
  refEl: React.RefObject<HTMLCanvasElement>;
  tint: string;
  title: string;
  meta: string[];
  markers?: Anomaly[];
  duration?: number;
  focusT?: number | null;
  onMarkerClick?: (a: Anomaly) => void;
  onResume?: () => void;
  activeAnomaly?: Anomaly | null;
}) => {
  const sevColor = (s: Anomaly["sev"]) =>
    s === "critical" ? "hsl(0,80%,60%)" : s === "warning" ? "hsl(45,100%,55%)" : tint;
  return (
    <div className="rounded-lg border border-border bg-background/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="font-orbitron text-xs tracking-wider uppercase" style={{ color: tint }}>
          {title}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {meta.map((m) => (
            <span
              key={m}
              className="font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-border bg-background/60 text-muted-foreground"
            >
              {m}
            </span>
          ))}
          {focusT !== null && focusT !== undefined && onResume && (
            <button
              onClick={onResume}
              className="inline-flex items-center gap-1 font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Play className="w-2.5 h-2.5" /> Resume Live
            </button>
          )}
        </div>
      </div>
      <div className="relative">
        <canvas ref={refEl} width={1200} height={280} className="w-full h-56 rounded" />
        {/* Frozen-frame veil when paused on a timepoint */}
        {focusT !== null && focusT !== undefined && (
          <div className="pointer-events-none absolute inset-0 rounded ring-1 ring-amber-300/40 bg-amber-300/[0.03]" />
        )}
        {/* Anomaly markers — clickable, jump to exact timepoint */}
        {markers.map((a, i) => {
          const left = `${Math.max(0, Math.min(100, (a.t / duration) * 100))}%`;
          const isActive = activeAnomaly?.t === a.t && activeAnomaly?.msg === a.msg;
          const c = sevColor(a.sev);
          return (
            <button
              key={i}
              onClick={() => onMarkerClick?.(a)}
              title={`t+${a.t.toFixed(1)}s · ${a.msg}`}
              className="group absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left }}
            >
              <span
                className="w-px flex-1 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ background: c }}
              />
              <span
                className={`absolute top-1 w-2.5 h-2.5 rounded-full border-2 transition-transform ${
                  isActive ? "scale-125" : "group-hover:scale-110"
                }`}
                style={{
                  background: c,
                  borderColor: "hsl(220,40%,6%)",
                  boxShadow: `0 0 8px ${c}`,
                }}
              />
              <span
                className="absolute top-5 font-mono text-[8px] tabular-nums px-1 rounded bg-background/80 border border-border text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100"
              >
                t+{a.t.toFixed(1)}s
              </span>
            </button>
          );
        })}
      </div>
      {/* Deep clinical explanation panel for the active anomaly */}
      {activeAnomaly && (
        <div
          className="mt-3 rounded-md border p-3 animate-fade-in"
          style={{
            borderColor: sevColor(activeAnomaly.sev) + "66",
            background: sevColor(activeAnomaly.sev) + "0F",
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <p
              className="font-orbitron text-[10px] tracking-wider uppercase"
              style={{ color: sevColor(activeAnomaly.sev) }}
            >
              <Pause className="inline w-3 h-3 mr-1" />
              Frame frozen at t+{activeAnomaly.t.toFixed(1)}s · {activeAnomaly.sev.toUpperCase()}
            </p>
            <span className="font-mono text-[9px] uppercase text-muted-foreground">
              {activeAnomaly.modality === "all" ? "system" : activeAnomaly.modality}
            </span>
          </div>
          <p className="font-mono text-[11px] text-foreground/90 mb-1">{activeAnomaly.msg}</p>
          <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
            {activeAnomaly.detail}
          </p>
        </div>
      )}
      {/* Marker legend */}
      {markers.length > 0 && (
        <p className="mt-2 font-mono text-[9px] text-muted-foreground">
          {markers.length} event{markers.length === 1 ? "" : "s"} on timeline · click a marker to jump to that timepoint
        </p>
      )}
    </div>
  );
};

/* ---------- canvas drawers ---------- */

function clearGrid(ctx: CanvasRenderingContext2D, w: number, h: number, gridColor: string) {
  ctx.fillStyle = "hsl(220, 40%, 6%)";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawECG(canvas: HTMLCanvasElement | null, t: number) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  clearGrid(ctx, w, h, "rgba(239,68,68,0.08)");
  ctx.strokeStyle = "hsl(0,80%,55%)";
  ctx.lineWidth = 1.8;
  ctx.shadowColor = "hsl(0,80%,55%)";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  const mid = h / 2;
  for (let x = 0; x < w; x++) {
    const phase = ((x + t * 120) % 180) / 180; // beat cycle
    let y = mid;
    if (phase < 0.1) y = mid - Math.sin(phase / 0.1 * Math.PI) * 6;       // P
    else if (phase < 0.18) y = mid;
    else if (phase < 0.2) y = mid + 6;                                     // Q
    else if (phase < 0.22) y = mid - h * 0.36;                             // R
    else if (phase < 0.24) y = mid + 12;                                   // S
    else if (phase < 0.4) y = mid;
    else if (phase < 0.55) y = mid - Math.sin((phase - 0.4) / 0.15 * Math.PI) * 14; // T
    else y = mid + Math.sin(x * 0.05 + t * 4) * 0.6;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawEEG(canvas: HTMLCanvasElement | null, t: number) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  clearGrid(ctx, w, h, "rgba(167,139,250,0.08)");
  const channels = [
    { color: "hsl(210,100%,65%)", freq: 10, amp: 14, label: "Fp1 α" },
    { color: "hsl(270,80%,65%)", freq: 22, amp: 9, label: "Cz β" },
    { color: "hsl(190,100%,60%)", freq: 40, amp: 6, label: "O1 γ" },
    { color: "hsl(230,80%,65%)", freq: 6, amp: 12, label: "T3 θ" },
  ];
  const chH = h / channels.length;
  channels.forEach((ch, i) => {
    const baseY = chH * (i + 0.5);
    ctx.strokeStyle = ch.color;
    ctx.shadowColor = ch.color;
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const phase = (x / w) * Math.PI * 2 * ch.freq * 0.5 + t * 4;
      const y =
        baseY -
        Math.sin(phase) * ch.amp -
        Math.sin(phase * 1.7 + 1.2) * ch.amp * 0.4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = ch.color;
    ctx.font = "10px monospace";
    ctx.fillText(ch.label, 6, baseY - chH / 2 + 12);
  });
}

const BASES = ["A", "T", "G", "C"];
function drawDNA(canvas: HTMLCanvasElement | null, t: number) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  clearGrid(ctx, w, h, "rgba(16,185,129,0.08)");
  const mid = h / 2;
  const amp = h / 2 - 30;
  ctx.lineWidth = 2;
  // Two backbones
  for (const sign of [1, -1]) {
    ctx.strokeStyle = sign > 0 ? "hsl(140,70%,50%)" : "hsl(45,100%,55%)";
    ctx.shadowColor = ctx.strokeStyle as string;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = mid + sign * Math.sin((x + t * 60) * 0.02) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  // Rungs
  for (let x = 0; x < w; x += 24) {
    const y1 = mid + Math.sin((x + t * 60) * 0.02) * amp;
    const y2 = mid - Math.sin((x + t * 60) * 0.02) * amp;
    ctx.strokeStyle = "rgba(180,200,220,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
    const base = BASES[Math.floor((x + t * 60) / 24) % 4];
    ctx.fillStyle = "hsl(140,70%,75%)";
    ctx.font = "10px monospace";
    ctx.fillText(base, x - 3, h - 6);
  }
}

export default LiveDashboard;