import { useState, useEffect, useRef } from "react";
import { Fingerprint, Brain, Zap, Sparkles } from "lucide-react";

const FingerprintScanner = ({ onScanningChange, onScanComplete }: { onScanningChange?: (scanning: boolean) => void; onScanComplete?: () => void }) => {
  const [scanning, setScanningState] = useState(false);
  const onScanCompleteRef = useRef(onScanComplete);
  onScanCompleteRef.current = onScanComplete;
  const setScanning = (v: boolean) => {
    setScanningState(v);
    onScanningChange?.(v);
  };
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "scanning" | "analyzing" | "complete">("idle");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number; color: string }>>([]);

  useEffect(() => {
    if (scanning) {
      const p = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 260,
        y: Math.random() * 260,
        delay: Math.random() * 2,
        size: 2 + Math.random() * 4,
        color: ["hsl(180,100%,50%)", "hsl(270,80%,65%)", "hsl(300,80%,60%)", "hsl(200,100%,60%)", "hsl(160,100%,45%)"][Math.floor(Math.random() * 5)],
      }));
      setParticles(p);
    } else {
      setParticles([]);
    }
  }, [scanning]);

  useEffect(() => {
    if (!scanning) return;
    setPhase("scanning");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setPhase("complete");
          onScanCompleteRef.current?.();
          setTimeout(() => {
            setScanning(false);
            setPhase("idle");
            setProgress(0);
          }, 3000);
          return 100;
        }
        if (p >= 60) setPhase("analyzing");
        return p + 1.5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [scanning]);

  const phaseColor = phase === "analyzing" ? "hsl(270,80%,65%)" : phase === "complete" ? "hsl(120,80%,50%)" : "hsl(180,100%,50%)";

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Scanner Ring */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Floating particles */}
        {scanning && particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-float"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: 0.7,
              animationDelay: `${p.delay}s`,
              animationDuration: `${1.5 + p.delay}s`,
              filter: `blur(${p.size > 4 ? 1 : 0}px)`,
            }}
          />
        ))}

        {/* Outer expanding rings */}
        {scanning && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ring-expand" />
            <div className="absolute inset-2 rounded-full border border-secondary/30 animate-ring-expand" style={{ animationDelay: "0.4s" }} />
            <div className="absolute inset-4 rounded-full border border-pink-500/20 animate-ring-expand" style={{ animationDelay: "0.8s" }} />
          </>
        )}

        {/* Orbiting dots */}
        {scanning && [0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-full h-full"
            style={{ animation: `spin ${3 + i}s linear infinite`, animationDirection: i % 2 === 0 ? "normal" : "reverse" }}
          >
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: ["hsl(180,100%,50%)", "hsl(270,80%,65%)", "hsl(300,80%,60%)"][i],
                boxShadow: `0 0 10px ${["hsl(180,100%,50%)", "hsl(270,80%,65%)", "hsl(300,80%,60%)"][i]}`,
              }}
            />
          </div>
        ))}

        {/* Main circle */}
        <div
          className={`relative w-52 h-52 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-500 ${
            scanning
              ? phase === "analyzing"
                ? "border-secondary box-glow-purple"
                : phase === "complete"
                ? "border-green-400"
                : "border-primary box-glow-cyan"
              : "border-muted hover:border-primary/50 hover:shadow-[0_0_30px_hsl(180,100%,50%,0.15)]"
          }`}
          onClick={() => !scanning && setScanning(true)}
          style={phase === "complete" ? { boxShadow: "0 0 30px hsl(120,80%,50%,0.4), 0 0 60px hsl(120,80%,50%,0.2)" } : {}}
        >
          {/* Inner glow gradient */}
          {scanning && (
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: phase === "analyzing"
                  ? "radial-gradient(circle, hsl(270,80%,65%), transparent 70%)"
                  : phase === "complete"
                  ? "radial-gradient(circle, hsl(120,80%,50%), transparent 70%)"
                  : "radial-gradient(circle, hsl(180,100%,50%), transparent 70%)",
              }}
            />
          )}

          {/* Scan line */}
          {scanning && phase !== "complete" && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="w-full h-1.5 animate-scan-line"
                style={{
                  background: phase === "analyzing"
                    ? "linear-gradient(to right, transparent, hsl(270,80%,65%), hsl(300,80%,60%), transparent)"
                    : "linear-gradient(to right, transparent, hsl(180,100%,50%), hsl(200,100%,60%), transparent)",
                }}
              />
            </div>
          )}

          {/* Icon */}
          <div className={`transition-all duration-500 ${scanning ? "animate-pulse-glow" : ""}`}>
            {phase === "complete" ? (
              <Sparkles className="w-16 h-16 text-green-400" />
            ) : phase === "analyzing" ? (
              <Brain className="w-16 h-16 text-secondary" />
            ) : (
              <Fingerprint className="w-16 h-16 text-primary" />
            )}
          </div>

          {/* Progress arc (SVG) */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 208 208">
            <circle cx="104" cy="104" r="98" fill="none" stroke="hsl(220,40%,18%)" strokeWidth="2" />
            <circle
              cx="104" cy="104" r="98"
              fill="none"
              stroke="url(#scanGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 98}`}
              strokeDashoffset={`${2 * Math.PI * 98 * (1 - progress / 100)}`}
              className="transition-all duration-100"
              style={{ filter: "drop-shadow(0 0 6px " + phaseColor + ")" }}
            />
            <defs>
              <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={phase === "complete" ? "hsl(120,80%,50%)" : "hsl(180,100%,50%)"} />
                <stop offset="50%" stopColor={phase === "analyzing" ? "hsl(300,80%,60%)" : "hsl(270,80%,65%)"} />
                <stop offset="100%" stopColor={phase === "complete" ? "hsl(160,100%,45%)" : "hsl(270,80%,65%)"} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-2">
        <p className="font-orbitron text-sm tracking-widest uppercase">
          {phase === "idle" && <span className="text-muted-foreground">Touch to Scan</span>}
          {phase === "scanning" && <span className="text-primary text-glow-cyan">Reading Neural Fingerprint...</span>}
          {phase === "analyzing" && <span className="text-secondary text-glow-purple">Cloning Brain Patterns...</span>}
          {phase === "complete" && (
            <span className="text-green-400 flex items-center justify-center gap-2" style={{ textShadow: "0 0 10px hsl(120,80%,50%,0.8)" }}>
              <Zap className="w-4 h-4" /> Neural Clone Complete
            </span>
          )}
        </p>
        {scanning && (
          <div className="space-y-1">
            <p className="font-mono text-xs text-muted-foreground">
              {Math.floor(progress)}% — {phase === "complete" ? "Clone ready" : phase === "analyzing" ? "Synaptic mapping" : "Dermal analysis"}
            </p>
            {/* Mini progress bar */}
            <div className="w-48 h-1 mx-auto bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: phase === "analyzing"
                    ? "linear-gradient(90deg, hsl(270,80%,65%), hsl(300,80%,60%))"
                    : phase === "complete"
                    ? "linear-gradient(90deg, hsl(120,80%,50%), hsl(160,100%,45%))"
                    : "linear-gradient(90deg, hsl(180,100%,50%), hsl(200,100%,60%))",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FingerprintScanner;
