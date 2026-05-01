import { useState, useEffect } from "react";
import dnaImg from "@/assets/dna-scan.png";
import { useScanFx } from "@/hooks/useScanFx";

const liveDnaData = [
  { label: "Base Pairs", value: "3.2B", unit: "" },
  { label: "Chromosomes", value: "23", unit: "Pairs" },
  { label: "Accuracy", value: "99.97", unit: "%" },
  { label: "GC Content", value: "41.2", unit: "%" },
  { label: "SNPs Found", value: "4.1M", unit: "" },
  { label: "Telomere", value: "7.8", unit: "kb" },
];

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
  const [dataValues, setDataValues] = useState(liveDnaData);
  useScanFx(scanning, "dna");

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

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setDataValues((prev) =>
        prev.map((d) => ({
          ...d,
          value:
            d.label === "Base Pairs"
              ? "3.2B"
              : d.label === "Chromosomes"
              ? "23"
              : d.label === "Accuracy"
              ? (99.9 + Math.random() * 0.09).toFixed(2)
              : d.label === "GC Content"
              ? (40 + Math.random() * 3).toFixed(1)
              : d.label === "SNPs Found"
              ? `${(4.0 + Math.random() * 0.3).toFixed(1)}M`
              : (7.5 + Math.random() * 0.8).toFixed(1),
        }))
      );
    }, 800);
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
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {dataValues.map((s) => (
              <div key={s.label} className="px-1.5 sm:px-2 py-1 rounded bg-background/70 backdrop-blur-md border border-green-400/20">
                <p className="font-mono text-[7px] sm:text-[8px] text-muted-foreground uppercase">{s.label}</p>
                <p className="font-orbitron text-[10px] sm:text-[11px] font-bold text-green-400">
                  {s.value}<span className="text-[7px] text-muted-foreground ml-0.5">{s.unit}</span>
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
