import { useEffect, useRef } from "react";

/**
 * Real-time ECG waveform — continuously streams a synthesized Lead-II trace
 * (P-QRS-T morphology) on a calibrated medical grid, scrolling right-to-left.
 *
 * Designed to look like a hospital bedside monitor: 25 mm/s sweep speed,
 * 10 mm/mV gain, fine + coarse grid, glowing trace, baseline noise,
 * and gentle HR variability driven by `bpm`.
 */
type Props = {
  active: boolean;
  bpm?: number;
  /** Stroke color (HSL or hex). */
  color?: string;
  height?: number;
};

const ECGWaveform = ({ active, bpm = 72, color = "hsl(0 84% 60%)", height = 64 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef(0); // beat phase 0..1
  const timeRef = useRef(0);
  const lastRef = useRef(0);
  const bufferRef = useRef<number[]>([]); // y values, newest at end

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      const rect = cvs.getBoundingClientRect();
      cvs.width = Math.floor(rect.width * dpr);
      cvs.height = Math.floor(rect.height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cvs);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      bufferRef.current = [];
      const cvs = canvasRef.current;
      if (cvs) {
        const ctx = cvs.getContext("2d");
        ctx?.clearRect(0, 0, cvs.width, cvs.height);
      }
      return;
    }

    const cvs = canvasRef.current!;
    const ctx = cvs.getContext("2d")!;
    lastRef.current = performance.now();
    timeRef.current = 0;
    phaseRef.current = 0;

    // Synthesize Lead-II PQRST sample at phase t in [0,1) of a beat
    const sample = (t: number) => {
      const gauss = (mu: number, sigma: number, amp: number) => {
        const x = (t - mu) / sigma;
        return amp * Math.exp(-0.5 * x * x);
      };
      // P wave, Q dip, R spike, S dip, T wave
      let v = 0;
      v += gauss(0.16, 0.025, 0.15);   // P
      v += gauss(0.30, 0.008, -0.10);  // Q
      v += gauss(0.33, 0.010, 1.0);    // R (dominant)
      v += gauss(0.36, 0.012, -0.25);  // S
      v += gauss(0.55, 0.045, 0.25);   // T
      return v;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastRef.current) / 1000);
      lastRef.current = now;
      timeRef.current += dt;

      const w = cvs.width;
      const h = cvs.height;
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      // beat advance — small HRV jitter on bpm
      const hrv = 1 + Math.sin(timeRef.current * 0.6) * 0.015;
      const beatHz = (bpm * hrv) / 60;
      phaseRef.current = (phaseRef.current + beatHz * dt) % 1;

      // sweep speed — pixels per second (25 mm/s @ ~6 px/mm = 150 px/s scaled by dpr)
      const pxPerSec = 160 * dpr;
      const samplesPerSec = 240; // synthesis rate
      const newSamples = Math.max(1, Math.round(samplesPerSec * dt));
      const subPhaseStep = (beatHz * dt) / newSamples;
      let p = phaseRef.current - beatHz * dt;
      const baselineNoise = () => (Math.random() - 0.5) * 0.015;
      for (let i = 0; i < newSamples; i++) {
        p = (p + subPhaseStep + 1) % 1;
        const v = sample(p) + baselineNoise();
        bufferRef.current.push(v);
      }

      // Trim buffer to viewport width worth of samples
      const visibleSamples = Math.ceil((w / pxPerSec) * samplesPerSec) + 8;
      if (bufferRef.current.length > visibleSamples) {
        bufferRef.current.splice(0, bufferRef.current.length - visibleSamples);
      }

      // ---- Draw ----
      ctx.clearRect(0, 0, w, h);

      // Grid (fine 1mm + coarse 5mm)
      const mm = 6 * dpr;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "hsla(0, 60%, 35%, 0.18)";
      ctx.beginPath();
      for (let x = 0; x < w; x += mm) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += mm) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();
      ctx.strokeStyle = "hsla(0, 70%, 45%, 0.32)";
      ctx.beginPath();
      for (let x = 0; x < w; x += mm * 5) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += mm * 5) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Trace
      const baseline = h * 0.62;
      const gain = h * 0.38; // 10mm/mV scaled to canvas
      const buf = bufferRef.current;
      const n = buf.length;
      const stepX = w / Math.max(1, n - 1);

      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 * dpr;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = i * stepX;
        const y = baseline - buf[i] * gain;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Leading-edge dot (sweep cursor)
      if (n > 0) {
        const x = (n - 1) * stepX;
        const y = baseline - buf[n - 1] * gain;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12 * dpr;
        ctx.beginPath();
        ctx.arc(x, y, 2.5 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, bpm, color]);

  return (
    <div
      className="relative w-full rounded-md overflow-hidden border border-red-500/30 bg-black/60 backdrop-blur-sm"
      style={{ height, boxShadow: "inset 0 0 24px hsl(0 84% 60% / 0.18)" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Lead label + speed/gain badges */}
      <div className="absolute top-1 left-1.5 font-mono text-[8px] text-red-300/80 tracking-wider">
        ECG · II
      </div>
      <div className="absolute top-1 right-1.5 font-mono text-[8px] text-red-300/60 tracking-wider tabular-nums">
        25mm/s · 10mm/mV · {Math.round(bpm)} bpm
      </div>
      {/* Subtle scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0 2px, hsla(0,0%,100%,0.03) 2px 3px)",
        }}
      />
    </div>
  );
};

export default ECGWaveform;