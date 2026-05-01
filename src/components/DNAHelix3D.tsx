import { useState, useEffect, useMemo } from "react";
import dnaImg from "@/assets/dna-scan.png";
import { useScanFx } from "@/hooks/useScanFx";
import { useLiveSensor, type SensorChannel } from "@/hooks/useLiveSensor";

const scanFeedLines = [
  "Sequencing chromosome 1...",
  "BRCA1 gene: no mutations detected",
  "Telomere length: 7.8 kb — healthy",
  "Mitochondrial DNA: haplogroup H",
  "CYP2D6 metabolism: extensive",
  "APOE genotype: ε3/ε3 — normal risk",
  "HLA typing in progress...",
  "Epigenetic methylation mapping...",
  "Microsatellite analysis: stable",
  "Whole exome coverage: 99.4%",
];

const DNAHelix3D = ({ scanning = false }: { scanning?: boolean }) => {
  const [scanY, setScanY] = useState(0);
  const [feedIdx, setFeedIdx] = useState(0);
  useScanFx(scanning, "dna");

  // Genomic sequencer telemetry — values typical of Illumina/Nanopore runs
  const channels = useMemo<SensorChannel[]>(() => [
    { key: "qscore", label: "Q-Score", unit: "", base: 36, min: 30, max: 40, noise: 0.4, drift: 0.8, driftPeriod: 8, decimals: 1 },
    { key: "cov", label: "Coverage", unit: "x", base: 32, min: 25, max: 40, noise: 0.5, drift: 1.5, driftPeriod: 10, decimals: 1 },
    { key: "gc", label: "GC", unit: "%", base: 41.2, min: 39, max: 43, noise: 0.2, drift: 0.4, driftPeriod: 7, decimals: 2 },
    { key: "snp", label: "SNPs", unit: "M", base: 4.1, min: 3.8, max: 4.4, noise: 0.02, drift: 0.05, driftPeriod: 9, decimals: 2 },
    { key: "telo", label: "Telomere", unit: "kb", base: 7.8, min: 7.0, max: 9.0, noise: 0.05, drift: 0.15, driftPeriod: 11, decimals: 2 },
    { key: "rate", label: "Reads", unit: "k/s", base: 850, min: 750, max: 950, noise: 18, drift: 35, driftPeriod: 6, decimals: 0 },
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
          src={dnaImg}
          alt="DNA Clone"
          className={`w-full h-full object-cover transition-all duration-1000 ${
            scanning ? "opacity-90 animate-scan-spin-img" : "opacity-40 scale-100"
          }`}
          style={{ filter: scanning ? "brightness(1.15) saturate(1.4) hue-rotate(-10deg)" : "brightness(0.5) saturate(0.5)" }}
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
            background: "linear-gradient(90deg, transparent, hsl(142 71% 45% / 0.8), hsl(180 100% 50% / 0.8), transparent)",
            boxShadow: "0 0 20px hsl(142 71% 45% / 0.6), 0 0 60px hsl(180 100% 50% / 0.3)",
          }}
        />
      )}

      {/* Grid overlay */}
      {scanning && (
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(142 71% 45% / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(142 71% 45% / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />
      )}

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-green-400/60 z-20" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-green-400/60 z-20" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-green-400/60 z-20" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-green-400/60 z-20" />

      {/* Title */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${scanning ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
          <h3 className="font-orbitron text-xs sm:text-sm tracking-widest uppercase text-green-400" style={{ textShadow: "0 0 10px hsl(142 71% 45% / 0.6)" }}>
            DNA Clone
          </h3>
        </div>
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1 ml-4">
          {scanning ? "⚡ Sequencing genome in real-time..." : "Idle — awaiting scan"}
        </p>
      </div>

      {/* Live feed */}
      {scanning && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 text-right">
          <p className="font-mono text-[9px] text-green-400/70 animate-pulse">● LIVE</p>
          <p className="font-mono text-[8px] sm:text-[9px] text-green-300/90 mt-1 max-w-[120px] truncate">
            {scanFeedLines[feedIdx]}
          </p>
        </div>
      )}

      {/* Stats */}
      {scanning && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] text-green-400">DNA CLONE ACTIVE</span>
            <div className="flex-1 h-px bg-gradient-to-r from-green-400/50 to-transparent" />
            <span className="font-mono text-[9px] sm:text-[10px] text-green-300 tabular-nums">
              {confidence.toFixed(2)}%
            </span>
          </div>
          <div className="h-1 mb-2 rounded-full bg-background/60 overflow-hidden">
            <div
              className="h-full transition-[width] duration-100 ease-linear"
              style={{
                width: `${confidence}%`,
                background: "linear-gradient(90deg, hsl(142 71% 45%), hsl(180 100% 50%))",
                boxShadow: "0 0 8px hsl(142 71% 45% / 0.7)",
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {readings.map((s) => (
              <div key={s.key} className="px-1.5 sm:px-2 py-1 rounded bg-background/70 backdrop-blur-md border border-green-400/20">
                <p className="font-mono text-[7px] sm:text-[8px] text-muted-foreground uppercase">{s.label}</p>
                <p className="font-orbitron text-[10px] sm:text-[11px] font-bold text-green-400 tabular-nums">
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
          <div className="absolute top-1/2 left-1/2 z-[15] pointer-events-none animate-orbit-spin">
            <svg width="160" height="160" className="opacity-40 -translate-x-1/2 -translate-y-1/2 absolute">
              <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(142 71% 45% / 0.5)" strokeWidth="1" strokeDasharray="10 6" />
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[15] pointer-events-none animate-spin-reverse">
            <svg width="120" height="120" className="opacity-30">
              <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(180 100% 50% / 0.5)" strokeWidth="1" strokeDasharray="4 8" />
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[15] pointer-events-none animate-radar-sweep">
            <div
              className="w-[140px] h-[2px]"
              style={{
                background: "linear-gradient(90deg, hsl(142 71% 45% / 0.9), transparent)",
                boxShadow: "0 0 12px hsl(142 71% 45% / 0.8)",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DNAHelix3D;
