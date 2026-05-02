import { useState, useEffect, useMemo } from "react";
import heartImg from "@/assets/heart-scan.png";
import { useScanFx } from "@/hooks/useScanFx";
import { useLiveSensor, type SensorChannel } from "@/hooks/useLiveSensor";
import ECGWaveform from "./ECGWaveform";

const scanFeedLines = [
  "Left ventricle wall: 11mm — normal",
  "Aortic valve: tricuspid, no regurg",
  "Ejection fraction: 62% — healthy",
  "Coronary calcium score: 0",
  "Mitral valve: competent closure",
  "Right atrial pressure: 5 mmHg",
  "Pulmonary artery flow: laminar",
  "Pericardium: normal thickness",
  "Septum intact — no defects",
  "QTc interval: 410ms — normal",
];

const Heart3D = ({ scanning = false }: { scanning?: boolean }) => {
  const [scanY, setScanY] = useState(0);
  const [feedIdx, setFeedIdx] = useState(0);
  const [heartbeat, setHeartbeat] = useState(false);
  useScanFx(scanning, "heart");

  // Hospital-grade cardiac channels with realistic clinical ranges (AHA reference)
  const channels = useMemo<SensorChannel[]>(() => [
    { key: "hr", label: "HR", unit: "bpm", base: 72, min: 60, max: 100, noise: 3, drift: 2.5, driftPeriod: 9, decimals: 0 },
    { key: "sbp", label: "SBP", unit: "mmHg", base: 120, min: 110, max: 130, noise: 2, drift: 3, driftPeriod: 12, decimals: 0 },
    { key: "dbp", label: "DBP", unit: "mmHg", base: 80, min: 70, max: 85, noise: 1.5, drift: 2, driftPeriod: 11, decimals: 0 },
    { key: "spo2", label: "SpO₂", unit: "%", base: 98, min: 95, max: 100, noise: 0.4, drift: 0.5, driftPeriod: 7, decimals: 1 },
    { key: "ef", label: "EF", unit: "%", base: 62, min: 55, max: 70, noise: 0.6, drift: 1.5, driftPeriod: 14, decimals: 0 },
    { key: "co", label: "CO", unit: "L/min", base: 5.2, min: 4.0, max: 8.0, noise: 0.15, drift: 0.3, driftPeriod: 10, decimals: 2 },
  ], []);
  const { readings, confidence } = useLiveSensor(channels, scanning);
  const liveBpm = readings.find((r) => r.key === "hr")?.value ?? 72;

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

  // Heartbeat pulse effect
  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setHeartbeat(true);
      setTimeout(() => setHeartbeat(false), 200);
    }, 830); // ~72 BPM
    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <div className="w-full h-full min-h-[280px] sm:min-h-[350px] rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden relative group">
      {/* Background image with heartbeat pulse */}
      <div className="absolute inset-0">
        <img
          src={heartImg}
          alt="Heart Clone"
          className={`w-full h-full object-cover transition-all duration-300 ${
            scanning ? "opacity-90 animate-heartbeat-pulse" : "opacity-40"
          }`}
          style={{
            filter: scanning ? "brightness(1.15) saturate(1.3)" : "brightness(0.5) saturate(0.5)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80" />
      </div>

      {/* Scan line */}
      {scanning && (
        <div
          className="absolute left-0 right-0 h-[2px] z-20 pointer-events-none"
          style={{
            top: `${scanY}%`,
            background: "linear-gradient(90deg, transparent, hsl(0 84% 60% / 0.8), hsl(180 100% 50% / 0.8), transparent)",
            boxShadow: "0 0 20px hsl(0 84% 60% / 0.6), 0 0 60px hsl(180 100% 50% / 0.3)",
          }}
        />
      )}

      {/* Grid overlay */}
      {scanning && (
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(0 84% 60% / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(0 84% 60% / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />
      )}

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-400/60 z-20" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-400/60 z-20" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-400/60 z-20" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-400/60 z-20" />

      {/* Title */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${scanning ? "bg-red-400 animate-pulse" : "bg-muted-foreground"}`} />
          <h3 className="font-orbitron text-xs sm:text-sm tracking-widest uppercase text-red-400" style={{ textShadow: "0 0 10px hsl(0 84% 60% / 0.6)" }}>
            Heart Clone
          </h3>
        </div>
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1 ml-4">
          {scanning ? "⚡ Cloning cardiac structure..." : "Idle — awaiting scan"}
        </p>
      </div>

      {/* Live feed */}
      {scanning && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 text-right">
          <p className="font-mono text-[9px] text-red-400/70 animate-pulse">● LIVE</p>
          <p className="font-mono text-[8px] sm:text-[9px] text-red-300/90 mt-1 max-w-[120px] truncate">
            {scanFeedLines[feedIdx]}
          </p>
        </div>
      )}

      {/* Holographic shimmer sweep */}
      {scanning && (
        <div className="absolute inset-0 z-[12] pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-1/3 animate-holo-shimmer"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(0 84% 75% / 0.18), transparent)",
            }}
          />
        </div>
      )}

      {/* Stats */}
      {scanning && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-30">
          {/* Real-time ECG strip */}
          <div className="mb-2">
            <ECGWaveform active={scanning} bpm={liveBpm} color="hsl(0 84% 65%)" height={56} />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] text-red-400">HEART CLONE ACTIVE</span>
            <div className="flex-1 h-px bg-gradient-to-r from-red-400/50 to-transparent" />
            <span className="font-mono text-[9px] sm:text-[10px] text-red-300 tabular-nums">
              {confidence.toFixed(2)}%
            </span>
          </div>
          {/* Confidence bar */}
          <div className="h-1 mb-2 rounded-full bg-background/60 overflow-hidden">
            <div
              className="h-full transition-[width] duration-100 ease-linear"
              style={{
                width: `${confidence}%`,
                background: "linear-gradient(90deg, hsl(0 84% 60%), hsl(0 84% 75%))",
                boxShadow: "0 0 8px hsl(0 84% 60% / 0.7)",
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {readings.map((s) => (
              <div key={s.key} className="px-1.5 sm:px-2 py-1 rounded bg-background/70 backdrop-blur-md border border-red-400/20">
                <p className="font-mono text-[7px] sm:text-[8px] text-muted-foreground uppercase">{s.label}</p>
                <p className="font-orbitron text-[10px] sm:text-[11px] font-bold text-red-400 tabular-nums">
                  {s.display}<span className="text-[7px] text-muted-foreground ml-0.5">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanning ring */}
      {scanning && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[15] pointer-events-none animate-spin-slow">
            <svg width="160" height="160" className="opacity-40">
              <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(0 84% 60% / 0.5)" strokeWidth="1" strokeDasharray="8 4" />
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[15] pointer-events-none animate-spin-reverse">
            <svg width="120" height="120" className="opacity-30">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(180 100% 50% / 0.5)" strokeWidth="1" strokeDasharray="4 8" />
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[15] pointer-events-none animate-radar-sweep">
            <div
              className="w-[140px] h-[2px]"
              style={{
                background: "linear-gradient(90deg, hsl(0 84% 60% / 0.95), transparent)",
                boxShadow: "0 0 14px hsl(0 84% 60% / 0.9)",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Heart3D;
