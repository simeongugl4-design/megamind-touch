import { useEffect, useRef, useState } from "react";

export type SensorChannel = {
  /** Stable key */
  key: string;
  /** UI label */
  label: string;
  /** Unit suffix (rendered after value) */
  unit?: string;
  /** Baseline value */
  base: number;
  /** Allowed clinical range — used for clamping + confidence */
  min: number;
  max: number;
  /** Standard deviation of physiological noise per second */
  noise: number;
  /** Slow drift amplitude (sinusoidal) */
  drift?: number;
  /** Drift period in seconds */
  driftPeriod?: number;
  /** Decimal places when formatting */
  decimals?: number;
  /** Optional formatter that overrides default number rendering */
  format?: (v: number) => string;
};

export type SensorReading = {
  key: string;
  label: string;
  unit: string;
  value: number;
  display: string;
};

/**
 * Smooth, continuous biomedical sensor stream.
 *
 * Each channel uses a low-pass filtered random walk (Ornstein-Uhlenbeck-ish)
 * around a baseline plus a slow sinusoidal drift to mimic real hospital
 * monitor traces (HR variability, EEG band fluctuation, SpO₂ jitter, etc).
 *
 * Updates happen on every animation frame while `active` is true so the
 * UI gets ~60fps continuous values rather than discrete 800ms steps.
 *
 * Returns: live readings + an aggregate confidence score (0-100) that
 * climbs as the signal stabilizes inside its clinical range and the
 * sample count grows — matching how real medical scanners report
 * acquisition quality.
 */
export function useLiveSensor(channels: SensorChannel[], active: boolean) {
  const [readings, setReadings] = useState<SensorReading[]>(() =>
    channels.map((c) => toReading(c, c.base))
  );
  const [confidence, setConfidence] = useState(0);

  // Mutable per-channel state (kept in ref to avoid re-renders)
  const stateRef = useRef(
    channels.map((c) => ({ value: c.base, target: c.base }))
  );
  const startRef = useRef(0);
  const lastRef = useRef(0);
  const samplesRef = useRef(0);
  const inRangeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      // Reset confidence so each new scan starts from 0
      setConfidence(0);
      samplesRef.current = 0;
      inRangeRef.current = 0;
      return;
    }

    startRef.current = performance.now();
    lastRef.current = startRef.current;
    samplesRef.current = 0;
    inRangeRef.current = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastRef.current) / 1000); // seconds, clamp jank
      lastRef.current = now;
      const elapsed = (now - startRef.current) / 1000;

      const next: SensorReading[] = channels.map((c, i) => {
        const s = stateRef.current[i];
        // Slow drift around baseline (sinusoidal)
        const driftAmp = c.drift ?? 0;
        const period = c.driftPeriod ?? 8;
        const drift = driftAmp * Math.sin((2 * Math.PI * elapsed) / period);

        // Stochastic noise scaled by sqrt(dt) (Brownian-style)
        const shock = (Math.random() * 2 - 1) * c.noise * Math.sqrt(dt);

        // Pull toward (base + drift) — mean reversion keeps signal physiological
        const target = c.base + drift;
        const pull = (target - s.value) * Math.min(1, dt * 1.8);

        s.value = clamp(s.value + pull + shock, c.min - c.noise, c.max + c.noise);

        const inRange = s.value >= c.min && s.value <= c.max;
        if (inRange) inRangeRef.current += 1;
        samplesRef.current += 1;

        return toReading(c, s.value);
      });

      setReadings(next);

      // Confidence: ratio of in-range samples × acquisition maturity
      const ratio = samplesRef.current
        ? inRangeRef.current / samplesRef.current
        : 0;
      const maturity = Math.min(1, elapsed / 3); // ramps over first 3s
      const conf = Math.min(99.97, ratio * maturity * 100);
      setConfidence(conf);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, channels]);

  return { readings, confidence };
}

function toReading(c: SensorChannel, v: number): SensorReading {
  return {
    key: c.key,
    label: c.label,
    unit: c.unit ?? "",
    value: v,
    display: c.format ? c.format(v) : v.toFixed(c.decimals ?? 1),
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
