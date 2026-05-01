import { useState, useEffect, useRef } from "react";
import { Fingerprint, Brain, Zap, Sparkles, Dna, HeartPulse, Lock } from "lucide-react";
import { useScanFx } from "@/hooks/useScanFx";

const FingerprintScanner = ({ onScanningChange, onScanComplete }: { onScanningChange?: (scanning: boolean) => void; onScanComplete?: () => void }) => {
  const [scanning, setScanningState] = useState(false);
  const onScanCompleteRef = useRef(onScanComplete);
  onScanCompleteRef.current = onScanComplete;
  const setScanning = (v: boolean) => {
    setScanningState(v);
    onScanningChange?.(v);
  };
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "dermal" | "neural" | "dna" | "cardiac" | "cloning" | "complete">("idle");
  // Lockout: blocks restart while scanning OR during post-scan cooldown
  const COOLDOWN_MS = 5000;
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [denied, setDenied] = useState(false);
  const cooldownUntilRef = useRef(0);
  const locked = scanning || cooldownLeft > 0;
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
            setPhase("idle");
            setProgress(0);
            setDetectedData([]);
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
    setScanning(true);
  };

  const phaseConfig: Record<string, { color: string; label: string; icon: typeof Fingerprint; glow: string }> = {
    idle: { color: "hsl(180,100%,50%)", label: "Touch to Begin Scan", icon: Fingerprint, glow: "" },
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

          {/* Icon */}
          <div className={`transition-all duration-500 ${scanning ? "animate-pulse-glow" : ""}`}>
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
              strokeDashoffset={`${2 * Math.PI * 98 * (1 - progress / 100)}`}
              className="transition-all duration-100"
              style={{ filter: `drop-shadow(0 0 6px ${cfg.color})` }}
            />
          </svg>
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-2 min-h-[80px]">
        <p className="font-orbitron text-sm tracking-widest uppercase" style={{ color: cfg.color, textShadow: scanning ? `0 0 10px ${cfg.color}80` : "none" }}>
          {phase === "complete" && <Zap className="w-4 h-4 inline mr-1" />}
          {cfg.label}
        </p>
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
