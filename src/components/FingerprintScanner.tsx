import { useState, useEffect, useRef } from "react";
import { Fingerprint, Brain, Zap, Sparkles, Dna, HeartPulse, Lock, Activity } from "lucide-react";
import { useScanFx } from "@/hooks/useScanFx";
import type { FingerprintCapture } from "@/lib/biometricProfile";

const FingerprintScanner = ({
  onScanningChange,
  onScanComplete,
  onCapture,
}: {
  onScanningChange?: (scanning: boolean) => void;
  onScanComplete?: () => void;
  onCapture?: (cap: FingerprintCapture) => void;
}) => {
  const [scanning, setScanningState] = useState(false);
  const onScanCompleteRef = useRef(onScanComplete);
  onScanCompleteRef.current = onScanComplete;
  const setScanning = (v: boolean) => {
    setScanningState(v);
    onScanningChange?.(v);
  };
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "calibrating" | "dermal" | "neural" | "dna" | "cardiac" | "cloning" | "complete">("idle");
  // Pre-scan calibration state
  const CALIBRATION_MS = 3000;
  const [calibrating, setCalibrating] = useState(false);
  const [calibProgress, setCalibProgress] = useState(0);
  const [calibMetrics, setCalibMetrics] = useState({
    snr: 0,        // dB, higher is better (target ≥ 35)
    drift: 1.0,    // mV/s, lower is better (target ≤ 0.05)
    alignment: 0,  // %, higher is better
    confidence: 0, // %, overall quality
  });
  const [calibReport, setCalibReport] = useState<null | {
    grade: "A+" | "A" | "B" | "C";
    snr: number;
    drift: number;
    alignment: number;
    confidence: number;
  }>(null);
  // Lockout: blocks restart while scanning OR during post-scan cooldown
  const COOLDOWN_MS = 5000;
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [denied, setDenied] = useState(false);
  const cooldownUntilRef = useRef(0);
  // Captured touch micro-features from the most recent press
  const captureRef = useRef<FingerprintCapture | null>(null);
  const pressStartRef = useRef<number>(0);
  const pressSamplesRef = useRef<{ p: number; t: number }[]>([]);
  const locked = scanning || calibrating || cooldownLeft > 0;
  // Layer scanner-side FX matching the active phase
  const fxProfile = phase === "cardiac" ? "heart" : phase === "dna" ? "dna" : "brain";
  useScanFx(scanning && phase !== "complete", fxProfile as "dna" | "brain" | "heart");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number; color: string }>>([]);
  const [detectedData, setDetectedData] = useState<string[]>([]);

  const dataPoints = [
    "Dermal ridge patterns captured...",
    "Sweat pore mapping complete...",
    "Nerve ending density: 3,247/cm²",
    "Bioelectric signature acquired...",
    "Neural pathway tracing...",
    "Synaptic firing rate: 200Hz",
    "Extracting DNA from epithelial cells...",
    "Chromosome pairs identified: 23",
    "Mitochondrial DNA sequenced...",
    "SNP markers: 4.1M detected",
    "Pulse wave analysis initiated...",
    "Heart rate detected: 72 BPM",
    "Ejection fraction: 62%",
    "Coronary arteries mapped...",
    "Cardiac digital twin synced...",
    "Gene expression profile built...",
    "Telomere length: 7,800 bp",
    "Cognitive architecture mapping...",
    "Brain clone initialization...",
    "Digital twin synchronized...",
    "Brain clone initialization...",
    "Digital twin synchronized...",
  ];

  useEffect(() => {
    if (scanning) {
      const p = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 280,
        y: Math.random() * 280,
        delay: Math.random() * 2,
        size: 2 + Math.random() * 5,
        color: ["hsl(180,100%,50%)", "hsl(270,80%,65%)", "hsl(300,80%,60%)", "hsl(140,70%,50%)", "hsl(45,100%,55%)"][Math.floor(Math.random() * 5)],
      }));
      setParticles(p);
    } else {
      setParticles([]);
    }
  }, [scanning]);

  // Pre-scan CALIBRATION sweep — runs before the 10s acquisition.
  // Streams synthetic SNR / drift / alignment metrics that converge toward
  // hospital-grade targets, then publishes a calibration report and starts
  // the real scan. UI is locked out during this phase.
  useEffect(() => {
    if (!calibrating) return;
    setPhase("calibrating");
    setCalibProgress(0);
    setCalibReport(null);
    setCalibMetrics({ snr: 12, drift: 0.85, alignment: 32, confidence: 0 });

    const start = performance.now();
    const id = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / CALIBRATION_MS);
      // Eased convergence toward clinical targets with small jitter
      const ease = 1 - Math.pow(1 - t, 2.2);
      const snr = 12 + ease * 26 + (Math.random() - 0.5) * 0.6;        // → ~38 dB
      const drift = 0.85 - ease * 0.81 + (Math.random() - 0.5) * 0.01;  // → ~0.04 mV/s
      const alignment = 32 + ease * 67 + (Math.random() - 0.5) * 0.4;   // → ~99 %
      // Composite calibration confidence — weighted blend of normalized metrics
      const snrScore = Math.min(1, Math.max(0, (snr - 15) / 25));
      const driftScore = Math.min(1, Math.max(0, (0.85 - drift) / 0.8));
      const alignScore = Math.min(1, Math.max(0, (alignment - 30) / 65));
      const confidence = (snrScore * 0.4 + driftScore * 0.3 + alignScore * 0.3) * 100;
      setCalibProgress(t * 100);
      setCalibMetrics({ snr, drift: Math.max(0.02, drift), alignment, confidence });

      if (t >= 1) {
        window.clearInterval(id);
        const finalConf = confidence;
        const grade: "A+" | "A" | "B" | "C" =
          finalConf >= 95 ? "A+" : finalConf >= 88 ? "A" : finalConf >= 75 ? "B" : "C";
        setCalibReport({
          grade,
          snr,
          drift: Math.max(0.02, drift),
          alignment,
          confidence: finalConf,
        });
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([20, 30, 20]);
        }
        // Brief hold so the user reads the calibration result, then start scan
        window.setTimeout(() => {
          setCalibrating(false);
          setScanning(true);
        }, 700);
      }
    }, 60);

    return () => window.clearInterval(id);
  }, [calibrating]);

  useEffect(() => {
    if (!scanning) return;
    setPhase("dermal");
    setProgress(0);
    setDetectedData([]);

    let dataIdx = 0;
    const dataInterval = setInterval(() => {
      if (dataIdx < dataPoints.length) {
        setDetectedData(prev => [...prev.slice(-4), dataPoints[dataIdx]]);
        dataIdx++;
      }
    }, 450);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          clearInterval(dataInterval);
          setPhase("complete");
          onScanCompleteRef.current?.();
          // Start post-scan cooldown so SFX/haptics can't relaunch immediately
          cooldownUntilRef.current = Date.now() + COOLDOWN_MS;
          setCooldownLeft(COOLDOWN_MS);
          setTimeout(() => {
            setScanning(false);
            // Keep the completed snapshot frozen on screen — do NOT reset
            // phase/progress/feed. The ring stays at 100% filled, the
            // "Clone Complete" badge remains, and animations stop because
            // `scanning` is now false (particles, rings, scan-line, orbiters
            // are all gated on `scanning`).
          }, 4000);
          return 100;
        }
        if (p >= 85) setPhase("cloning");
        else if (p >= 65) setPhase("cardiac");
        else if (p >= 40) setPhase("dna");
        else if (p >= 20) setPhase("neural");
        return p + 0.8;
      });
    }, 80);

    return () => { clearInterval(interval); clearInterval(dataInterval); };
  }, [scanning]);

  // Cooldown countdown ticker
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, cooldownUntilRef.current - Date.now());
      setCooldownLeft(remaining);
      if (remaining <= 0) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [cooldownLeft > 0]);

  const handleScanClick = () => {
    if (locked) {
      // Reject: short shake + denied haptic, no audio re-trigger
      setDenied(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([30, 40, 30]);
      }
      window.setTimeout(() => setDenied(false), 450);
      return;
    }
    // Synthesize a touch capture profile (deterministic randomness shouldn't
    // affect the patient profile — patient identity drives that — but the
    // capture is reported for UI realism + report log).
    const cap: FingerprintCapture = {
      ridgeDensity: +(20 + Math.random() * 5).toFixed(1),
      minutiaeCount: Math.round(110 + Math.random() * 60),
      contactArea: Math.round(140 + Math.random() * 80),
      pressure: +(0.55 + Math.random() * 0.3).toFixed(2),
      dwellMs: Math.round(2200 + Math.random() * 800),
      moisture: +(0.3 + Math.random() * 0.4).toFixed(2),
      fingerTempC: +(31 + Math.random() * 3).toFixed(1),
    };
    captureRef.current = cap;
    onCapture?.(cap);
    // Run pre-scan calibration first; the calibration effect will hand off to scanning
    setCalibrating(true);
  };

  const phaseConfig: Record<string, { color: string; label: string; icon: typeof Fingerprint; glow: string }> = {
    idle: { color: "hsl(180,100%,50%)", label: "Touch to Begin Scan", icon: Fingerprint, glow: "" },
    calibrating: { color: "hsl(45,100%,55%)", label: "Calibrating Sensors...", icon: Activity, glow: "" },
    dermal: { color: "hsl(180,100%,50%)", label: "Scanning Dermal Patterns...", icon: Fingerprint, glow: "box-glow-cyan" },
    neural: { color: "hsl(270,80%,65%)", label: "Mapping Neural Pathways...", icon: Brain, glow: "box-glow-purple" },
    dna: { color: "hsl(140,70%,50%)", label: "Extracting DNA Sequence...", icon: Dna, glow: "" },
    cardiac: { color: "hsl(0,80%,55%)", label: "Cloning Cardiac Structure...", icon: HeartPulse, glow: "" },
    cloning: { color: "hsl(300,80%,60%)", label: "Finalizing Biological Clone...", icon: Sparkles, glow: "" },
    complete: { color: "hsl(120,80%,50%)", label: "Clone Complete", icon: Sparkles, glow: "" },
  };

  const cfg = phaseConfig[phase] || phaseConfig.idle;
  const PhaseIcon = cfg.icon;

  const getPhaseGlow = () => {
    if (phase === "dna") return { boxShadow: "0 0 20px hsl(140,70%,50%,0.4), 0 0 50px hsl(140,70%,50%,0.15)" };
    if (phase === "cardiac") return { boxShadow: "0 0 20px hsl(0,80%,55%,0.4), 0 0 50px hsl(0,80%,55%,0.15)" };
    if (phase === "cloning") return { boxShadow: "0 0 20px hsl(300,80%,60%,0.4), 0 0 50px hsl(300,80%,60%,0.15)" };
    if (phase === "complete") return { boxShadow: "0 0 30px hsl(120,80%,50%,0.5), 0 0 60px hsl(120,80%,50%,0.2)" };
    return {};
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Scanner Ring */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Floating particles */}
        {scanning && particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-float"
            style={{
              left: p.x, top: p.y,
              width: p.size, height: p.size,
              backgroundColor: p.color, opacity: 0.7,
              animationDelay: `${p.delay}s`,
              animationDuration: `${1.5 + p.delay}s`,
              filter: `blur(${p.size > 4 ? 1 : 0}px)`,
            }}
          />
        ))}

        {/* Expanding rings */}
        {scanning && (
          <>
            <div className="absolute inset-0 rounded-full border-2 animate-ring-expand" style={{ borderColor: cfg.color + "66" }} />
            <div className="absolute inset-2 rounded-full border animate-ring-expand" style={{ borderColor: cfg.color + "44", animationDelay: "0.4s" }} />
            <div className="absolute inset-4 rounded-full border animate-ring-expand" style={{ borderColor: cfg.color + "22", animationDelay: "0.8s" }} />
          </>
        )}

        {/* Orbiting dots */}
        {scanning && [0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute w-full h-full"
            style={{ animation: `spin ${2.5 + i * 0.7}s linear infinite`, animationDirection: i % 2 === 0 ? "normal" : "reverse" }}
          >
            <div
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                top: 0, left: "50%", transform: "translateX(-50%)",
                backgroundColor: [cfg.color, "hsl(270,80%,65%)", "hsl(300,80%,60%)", "hsl(45,100%,55%)"][i],
                boxShadow: `0 0 12px ${[cfg.color, "hsl(270,80%,65%)", "hsl(300,80%,60%)", "hsl(45,100%,55%)"][i]}`,
              }}
            />
          </div>
        ))}

        {/* DNA Helix Ring (during DNA phase) */}
        {(phase === "dna" || phase === "cardiac" || phase === "cloning") && (
          <div className="absolute inset-[-8px] rounded-full border-2 border-dashed animate-spin-slow" style={{ borderColor: phase === "cardiac" ? "hsl(0,80%,55%,0.5)" : "hsl(140,70%,50%,0.5)", animationDuration: "8s" }} />
        )}

        {/* Main circle */}
        <div
          className={`relative w-52 h-52 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
            locked ? "cursor-not-allowed" : "cursor-pointer"
          } ${
            !scanning && !locked ? "border-muted hover:border-primary/50 hover:shadow-[0_0_30px_hsl(180,100%,50%,0.15)]" : cfg.glow
          } ${denied ? "animate-shake" : ""}`}
          onClick={handleScanClick}
          aria-disabled={locked}
          style={{
            ...(scanning && !cfg.glow ? getPhaseGlow() : {}),
            ...(phase === "complete" ? getPhaseGlow() : {}),
            borderColor: scanning ? cfg.color : cooldownLeft > 0 ? "hsl(45,100%,55%)" : undefined,
            opacity: cooldownLeft > 0 && !scanning ? 0.7 : 1,
          }}
        >
          {/* Inner glow */}
          {scanning && (
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{ background: `radial-gradient(circle, ${cfg.color}, transparent 70%)` }}
            />
          )}

          {/* Scan line */}
          {scanning && phase !== "complete" && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="w-full h-1.5 animate-scan-line"
                style={{
                  background: `linear-gradient(to right, transparent, ${cfg.color}, transparent)`,
                }}
              />
            </div>
          )}

          {/* Calibration ring sweep */}
          {calibrating && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="w-full h-1.5 animate-scan-line"
                style={{ background: "linear-gradient(to right, transparent, hsl(45,100%,55%), transparent)" }}
              />
            </div>
          )}

          {/* Icon */}
          <div className={`transition-all duration-500 ${scanning || calibrating ? "animate-pulse-glow" : ""}`}>
            <PhaseIcon className="w-16 h-16" style={{ color: cfg.color }} />
          </div>

          {/* Progress arc */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 208 208">
            <circle cx="104" cy="104" r="98" fill="none" stroke="hsl(220,40%,18%)" strokeWidth="2" />
            <circle
              cx="104" cy="104" r="98"
              fill="none"
              stroke={cfg.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 98}`}
              strokeDashoffset={`${2 * Math.PI * 98 * (1 - (calibrating ? calibProgress : progress) / 100)}`}
              className="transition-all duration-100"
              style={{ filter: `drop-shadow(0 0 6px ${cfg.color})` }}
            />
          </svg>
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-2 min-h-[80px]">
        {!scanning && cooldownLeft > 0 ? (
          <p className="font-orbitron text-sm tracking-widest uppercase flex items-center justify-center gap-2"
            style={{ color: "hsl(45,100%,55%)", textShadow: "0 0 10px hsl(45,100%,55%,0.5)" }}>
            <Lock className="w-4 h-4" />
            System Cooling Down — {(cooldownLeft / 1000).toFixed(1)}s
          </p>
        ) : (
          <p className="font-orbitron text-sm tracking-widest uppercase" style={{ color: cfg.color, textShadow: scanning ? `0 0 10px ${cfg.color}80` : "none" }}>
            {phase === "complete" && <Zap className="w-4 h-4 inline mr-1" />}
            {cfg.label}
          </p>
        )}
        {denied && (
          <p className="font-mono text-[10px] text-destructive animate-fade-in">
            ⚠ Scanner locked — wait for current cycle to finish
          </p>
        )}

        {/* Pre-scan calibration live readout */}
        {calibrating && (
          <div className="mt-3 max-w-[280px] mx-auto rounded-lg border border-amber-400/30 bg-amber-400/5 p-2.5 animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-amber-300/90">
                Calibration · {calibProgress.toFixed(0)}%
              </span>
              <span className="font-mono text-[9px] text-amber-300/70 tabular-nums">
                Confidence {calibMetrics.confidence.toFixed(1)}%
              </span>
            </div>
            <div className="h-1 mb-2 rounded-full bg-background/60 overflow-hidden">
              <div
                className="h-full transition-[width] duration-100 ease-linear"
                style={{
                  width: `${calibProgress}%`,
                  background: "linear-gradient(90deg, hsl(45,100%,55%), hsl(120,80%,55%))",
                  boxShadow: "0 0 8px hsl(45,100%,55%,0.6)",
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "SNR", value: calibMetrics.snr.toFixed(1), unit: "dB" },
                { label: "Drift", value: calibMetrics.drift.toFixed(2), unit: "mV/s" },
                { label: "Align", value: calibMetrics.alignment.toFixed(1), unit: "%" },
              ].map((m) => (
                <div key={m.label} className="rounded bg-background/60 border border-amber-400/20 px-1.5 py-1">
                  <p className="font-mono text-[7px] uppercase text-muted-foreground">{m.label}</p>
                  <p className="font-orbitron text-[10px] font-bold text-amber-300 tabular-nums">
                    {m.value}<span className="text-[7px] text-muted-foreground ml-0.5">{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calibration result handoff */}
        {calibReport && (
          <div className="mt-2 max-w-[280px] mx-auto rounded-lg border border-green-400/40 bg-green-400/5 p-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-orbitron text-[10px] tracking-widest uppercase text-green-300">
                Calibration {calibReport.grade} · {calibReport.confidence.toFixed(1)}%
              </span>
              <span className="font-mono text-[9px] text-green-300/80 tabular-nums">
                SNR {calibReport.snr.toFixed(1)}dB · Drift {calibReport.drift.toFixed(2)}
              </span>
            </div>
            <p className="font-mono text-[9px] text-green-300/70 mt-0.5">
              Sensors locked — initiating 10s acquisition...
            </p>
          </div>
        )}

        {scanning && (
          <div className="space-y-1">
            <p className="font-mono text-xs text-muted-foreground">
              {Math.floor(progress)}% — {phase === "dermal" ? "Dermal analysis" : phase === "neural" ? "Neural mapping" : phase === "dna" ? "DNA extraction" : phase === "cardiac" ? "Cardiac cloning" : phase === "cloning" ? "Finalizing" : "Complete"}
            </p>
            {/* Phase indicators */}
            <div className="flex items-center justify-center gap-1 mt-2">
              {["dermal", "neural", "dna", "cardiac", "cloning", "complete"].map((p, i) => {
                const phases = ["dermal", "neural", "dna", "cardiac", "cloning", "complete"];
                const currentIdx = phases.indexOf(phase);
                const isActive = i <= currentIdx;
                return (
                  <div key={p} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? "scale-100" : "scale-75 opacity-40"}`}
                      style={{ backgroundColor: isActive ? cfg.color : "hsl(220,40%,18%)" }}
                    />
                    {i < 5 && <div className="w-3 h-px" style={{ backgroundColor: isActive ? cfg.color + "60" : "hsl(220,40%,18%)" }} />}
                  </div>
                );
              })}
            </div>
            {/* Mini progress bar */}
            <div className="w-48 h-1 mx-auto bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full rounded-full transition-all duration-100"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }}
              />
            </div>
          </div>
        )}

        {/* Live data feed */}
        {scanning && detectedData.length > 0 && (
          <div className="mt-3 space-y-1 max-w-[260px] mx-auto">
            {detectedData.slice(-3).map((d, i) => (
              <p key={i} className="font-mono text-[10px] text-muted-foreground animate-fade-in truncate"
                style={{ opacity: i === detectedData.slice(-3).length - 1 ? 1 : 0.5 }}>
                {'>'} {d}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FingerprintScanner;
