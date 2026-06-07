import { useState, useEffect, useCallback, useRef } from "react";

export interface SplashScreenOptions {
  /** Minimum time the splash screen stays visible (ms) */
  minDuration?: number;
  /** Maximum time before auto-hiding (ms) */
  maxDuration?: number;
  /** Delay before progress starts moving (ms) */
  startDelay?: number;
}

export interface SplashScreenState {
  /** Whether splash screen is still visible */
  isVisible: boolean;
  /** Progress 0–100 */
  progress: number;
  /** Call when critical assets / data are ready; may hide early */
  markReady: () => void;
  /** Force hide (respects minDuration) */
  hide: () => void;
}

/**
 * useSplashScreen
 * Manages a splash screen with configurable timing:
 * – Shows for at least `minDuration`.
 * – Can finish early via `markReady()` once `minDuration` elapsed.
 * – Always hides by `maxDuration`.
 * – Progress bar fills smoothly from 0 → 100 across the active window.
 */
export function useSplashScreen(options: SplashScreenOptions = {}): SplashScreenState {
  const {
    minDuration = 3000,
    maxDuration = 6000,
    startDelay = 200,
  } = options;

  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const readyRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  const markReady = useCallback(() => {
    readyRef.current = true;
  }, []);

  const hide = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDuration - elapsed);
    if (remaining <= 0) {
      setIsVisible(false);
    } else {
      setTimeout(() => setIsVisible(false), remaining);
    }
  }, [minDuration]);

  useEffect(() => {
    const start = Date.now();
    startTimeRef.current = start;

    let raf = 0;
    let timeout = 0;

    // Delay progress start briefly for visual polish
    const progressStart = start + startDelay;
    const progressEnd = start + minDuration;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - start;

      if (elapsed >= maxDuration) {
        setProgress(100);
        setIsVisible(false);
        return;
      }

      if (readyRef.current && elapsed >= minDuration) {
        setProgress(100);
        setIsVisible(false);
        return;
      }

      // Smooth progress 0 → 100 during [progressStart, progressEnd]
      let p = 0;
      if (now >= progressEnd) {
        p = 100;
      } else if (now > progressStart) {
        p = ((now - progressStart) / (progressEnd - progressStart)) * 100;
      }
      setProgress(Math.min(100, Math.max(0, p)));

      raf = requestAnimationFrame(tick);
    };

    // Kick off the loop after a microtask so React has mounted
    timeout = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 0);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [minDuration, maxDuration, startDelay]);

  return { isVisible, progress, markReady, hide };
}
