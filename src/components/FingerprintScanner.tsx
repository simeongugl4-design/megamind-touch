import { useState, useEffect } from "react";
import { Fingerprint, Brain, Zap } from "lucide-react";

const FingerprintScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "scanning" | "analyzing" | "complete">("idle");

  useEffect(() => {
    if (!scanning) return;
    setPhase("scanning");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setPhase("complete");
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

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Scanner Ring */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer rings */}
        {scanning && (
          <>
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-ring-expand" />
            <div className="absolute inset-4 rounded-full border border-secondary/30 animate-ring-expand" style={{ animationDelay: "0.5s" }} />
          </>
        )}

        {/* Main circle */}
        <div
          className={`relative w-48 h-48 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-500 ${
            scanning
              ? "border-primary box-glow-cyan"
              : "border-muted hover:border-primary/50"
          }`}
          onClick={() => !scanning && setScanning(true)}
        >
          {/* Scan line */}
          {scanning && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
            </div>
          )}

          {/* Icon */}
          <div className={`transition-all duration-300 ${scanning ? "animate-pulse-glow" : ""}`}>
            {phase === "analyzing" || phase === "complete" ? (
              <Brain className="w-16 h-16 text-secondary" />
            ) : (
              <Fingerprint className="w-16 h-16 text-primary" />
            )}
          </div>

          {/* Progress arc (SVG) */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 192 192">
            <circle
              cx="96" cy="96" r="90"
              fill="none"
              stroke="hsl(180 100% 50% / 0.1)"
              strokeWidth="2"
            />
            <circle
              cx="96" cy="96" r="90"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              className="transition-all duration-100"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(180 100% 50%)" />
                <stop offset="100%" stopColor="hsl(270 80% 65%)" />
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
            <span className="text-primary text-glow-cyan flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> Neural Clone Complete
            </span>
          )}
        </p>
        {scanning && (
          <p className="font-mono text-xs text-muted-foreground">
            {Math.floor(progress)}% — {phase === "analyzing" ? "Synaptic mapping" : "Dermal analysis"}
          </p>
        )}
      </div>
    </div>
  );
};

export default FingerprintScanner;
