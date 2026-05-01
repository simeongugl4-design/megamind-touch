import { useState, useEffect, useMemo } from "react";
import brainImg from "@/assets/brain-scan.png";
import { useScanFx } from "@/hooks/useScanFx";
import { useLiveSensor, type SensorChannel } from "@/hooks/useLiveSensor";

const scanFeedLines = [
  "Mapping prefrontal cortex...",
  "Synapse density: 1.1×10⁴ /mm³",
  "Hippocampus volume: 3.42 cm³",
  "White matter integrity: 97.8%",
  "Broca's area — language center active",
  "Amygdala response calibrated",
  "Neural plasticity index: 0.89",
  "Motor cortex mapping complete",
  "Thalamus relay speed: 12ms",
  "Cerebellum coordination: optimal",
];

const NeuralBrain3D = ({ scanning = false }: { scanning?: boolean }) => {
  const [scanY, setScanY] = useState(0);
  const [feedIdx, setFeedIdx] = useState(0);
  useScanFx(scanning, "brain");

  // EEG band + neurophysiology channels (10-20 system reference values)
  const channels = useMemo<SensorChannel[]>(() => [
    { key: "alpha", label: "α Wave", unit: "Hz", base: 10.2, min: 8, max: 13, noise: 0.3, drift: 0.6, driftPeriod: 6, decimals: 2 },
    { key: "beta", label: "β Wave", unit: "Hz", base: 22, min: 13, max: 30, noise: 0.8, drift: 1.5, driftPeriod: 7, decimals: 1 },
    { key: "gamma", label: "γ Wave", unit: "Hz", base: 42, min: 30, max: 80, noise: 1.5, drift: 3, driftPeriod: 5, decimals: 1 },
    { key: "speed", label: "Signal", unit: "m/s", base: 120, min: 80, max: 130, noise: 1.2, drift: 2, driftPeriod: 9, decimals: 0 },
    { key: "temp", label: "Cortex", unit: "°C", base: 37.0, min: 36.5, max: 37.5, noise: 0.05, drift: 0.1, driftPeriod: 12, decimals: 2 },
    { key: "perf", label: "Perfusion", unit: "ml/100g", base: 54, min: 45, max: 65, noise: 0.6, drift: 1.2, driftPeriod: 10, decimals: 1 },
  ], []);
  const { readings, confidence } = useLiveSensor(channels, scanning);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setScanY((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 30);
    return () => clearInterval(interval);
  }, [scanning]);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setFeedIdx((prev) => (prev + 1) % scanFeedLines.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <div className="w-full h-full min-h-[280px] sm:min-h-[350px] rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden relative group">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={brainImg}
          alt="Neural Clone"
          className={`w-full h-full object-cover transition-all duration-1000 ${
            scanning ? "opacity-90 animate-brain-throb" : "opacity-40 scale-100"
          }`}
          style={{ filter: scanning ? "hue-rotate(0deg) brightness(1.15) saturate(1.35)" : "brightness(0.5) saturate(0.5)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80" />
      </div>

      {/* Scan line animation */}
      {scanning && (
        <div
          className="absolute left-0 right-0 h-[2px] z-20 pointer-events-none"
          style={{
            top: `${scanY}%`,
            background: "linear-gradient(90deg, transparent, hsl(180 100% 50% / 0.8), hsl(270 80% 65% / 0.8), transparent)",
            boxShadow: "0 0 20px hsl(180 100% 50% / 0.6), 0 0 60px hsl(270 80% 65% / 0.3)",
          }}
        />
      )}

      {/* Grid overlay */}
      {scanning && (
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(180 100% 50% / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(180 100% 50% / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />
      )}

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/60 z-20" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/60 z-20" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/60 z-20" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/60 z-20" />

      {/* Title */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${scanning ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
          <h3 className="font-orbitron text-xs sm:text-sm tracking-widest uppercase text-primary text-glow-cyan">
            Neural Clone
          </h3>
        </div>
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1 ml-4">
          {scanning ? "⚡ Mapping neural architecture..." : "Idle — awaiting scan"}
        </p>
      </div>

      {/* Live data feed */}
      {scanning && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 text-right">
          <p className="font-mono text-[9px] text-primary/70 animate-pulse">● LIVE</p>
          <p className="font-mono text-[8px] sm:text-[9px] text-primary/90 mt-1 max-w-[120px] truncate">
            {scanFeedLines[feedIdx]}
          </p>
        </div>
      )}

      {/* Real-time stats overlay */}
      {scanning && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] text-primary">NEURAL CLONE ACTIVE</span>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
            <span className="font-mono text-[9px] sm:text-[10px] text-primary tabular-nums">
              {confidence.toFixed(2)}%
            </span>
          </div>
          <div className="h-1 mb-2 rounded-full bg-background/60 overflow-hidden">
            <div
              className="h-full transition-[width] duration-100 ease-linear"
              style={{
                width: `${confidence}%`,
                background: "linear-gradient(90deg, hsl(180 100% 50%), hsl(270 80% 65%))",
                boxShadow: "0 0 8px hsl(180 100% 50% / 0.7)",
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {readings.map((s) => (
              <div key={s.key} className="px-1.5 sm:px-2 py-1 rounded bg-background/70 backdrop-blur-md border border-primary/20">
                <p className="font-mono text-[7px] sm:text-[8px] text-muted-foreground uppercase">{s.label}</p>
                <p className="font-orbitron text-[10px] sm:text-[11px] font-bold text-primary tabular-nums">
                  {s.display}<span className="text-[7px] text-muted-foreground ml-0.5">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanning progress ring */}
      {scanning && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-spin-slow">
            <svg width="160" height="160" className="opacity-40">
              <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(180 100% 50% / 0.5)" strokeWidth="1" strokeDasharray="8 4" />
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-spin-reverse">
            <svg width="120" height="120" className="opacity-35">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(270 80% 65% / 0.5)" strokeWidth="1" strokeDasharray="4 8" />
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-radar-sweep">
            <div
              className="w-[140px] h-[2px]"
              style={{
                background: "linear-gradient(90deg, hsl(270 80% 65% / 0.9), transparent)",
                boxShadow: "0 0 12px hsl(270 80% 65% / 0.8)",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default NeuralBrain3D;
