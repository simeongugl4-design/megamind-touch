import { useState, useEffect } from "react";
import heartImg from "@/assets/heart-scan.png";

const liveHeartData = [
  { label: "BPM", value: "72", unit: "" },
  { label: "EF", value: "62", unit: "%" },
  { label: "BP", value: "120/80", unit: "" },
  { label: "O₂ Sat", value: "98.2", unit: "%" },
  { label: "CO", value: "5.2", unit: "L/min" },
  { label: "SV", value: "70", unit: "mL" },
];

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
  const [dataValues, setDataValues] = useState(liveHeartData);

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

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setDataValues((prev) =>
        prev.map((d) => ({
          ...d,
          value:
            d.label === "BPM"
              ? String(70 + Math.floor(Math.random() * 6))
              : d.label === "EF"
              ? (60 + Math.random() * 5).toFixed(0)
              : d.label === "BP"
              ? `${118 + Math.floor(Math.random() * 6)}/${78 + Math.floor(Math.random() * 4)}`
              : d.label === "O₂ Sat"
              ? (97.5 + Math.random() * 1.5).toFixed(1)
              : d.label === "CO"
              ? (4.8 + Math.random() * 0.8).toFixed(1)
              : String(68 + Math.floor(Math.random() * 6)),
        }))
      );
    }, 800);
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
            scanning ? "opacity-90" : "opacity-40"
          }`}
          style={{
            filter: scanning ? "brightness(1.1) saturate(1.2)" : "brightness(0.5) saturate(0.5)",
            transform: heartbeat ? "scale(1.02)" : "scale(1)",
            transition: "transform 0.15s ease-out",
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

      {/* ECG waveform overlay */}
      {scanning && (
        <div className="absolute top-1/2 left-0 right-0 z-20 pointer-events-none -translate-y-1/2">
          <svg width="100%" height="40" viewBox="0 0 300 40" preserveAspectRatio="none" className="opacity-30">
            <path
              d="M0,20 L30,20 L40,20 L50,15 L55,30 L60,5 L65,35 L70,18 L80,20 L100,20 L110,20 L120,15 L125,30 L130,5 L135,35 L140,18 L150,20 L170,20 L180,20 L190,15 L195,30 L200,5 L205,35 L210,18 L220,20 L240,20 L250,20 L260,15 L265,30 L270,5 L275,35 L280,18 L290,20 L300,20"
              fill="none"
              stroke="hsl(0 84% 60%)"
              strokeWidth="1.5"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}

      {/* Stats */}
      {scanning && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] text-red-400">HEART CLONE ACTIVE</span>
            <div className="flex-1 h-px bg-gradient-to-r from-red-400/50 to-transparent" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {dataValues.map((s) => (
              <div key={s.label} className="px-1.5 sm:px-2 py-1 rounded bg-background/70 backdrop-blur-md border border-red-400/20">
                <p className="font-mono text-[7px] sm:text-[8px] text-muted-foreground uppercase">{s.label}</p>
                <p className="font-orbitron text-[10px] sm:text-[11px] font-bold text-red-400">
                  {s.value}<span className="text-[7px] text-muted-foreground ml-0.5">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanning ring */}
      {scanning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-15 pointer-events-none">
          <svg width="120" height="120" className="animate-spin-slow opacity-25">
            <circle cx="60" cy="60" r="55" fill="none" stroke="hsl(0 84% 60% / 0.4)" strokeWidth="1" strokeDasharray="8 4" />
            <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(180 100% 50% / 0.3)" strokeWidth="1" strokeDasharray="4 8" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Heart3D;
