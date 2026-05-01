import { useEffect, useRef } from "react";

type Profile = "dna" | "brain" | "heart";

const FREQ: Record<Profile, { base: number; sweep: number; tick: number }> = {
  dna: { base: 220, sweep: 880, tick: 1320 },
  brain: { base: 180, sweep: 720, tick: 1080 },
  heart: { base: 110, sweep: 440, tick: 660 },
};

/**
 * Plays subtle layered scan SFX (sweep drone + periodic tick) and triggers
 * device vibration in sync while `active` is true.
 */
export function useScanFx(active: boolean, profile: Profile) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);
  const tickIntervalRef = useRef<number | null>(null);
  const vibIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const cfg = FREQ[profile];

    // Lazy-init AudioContext (must be after user gesture; the scan starts on click)
    let ctx: AudioContext;
    try {
      ctx = ctxRef.current ?? new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    } catch {
      return;
    }

    // Drone: two detuned oscillators -> lowpass -> very low gain
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sawtooth";
    osc1.frequency.value = cfg.base;
    osc2.frequency.value = cfg.base * 1.01;

    filter.type = "lowpass";
    filter.frequency.value = cfg.sweep;
    filter.Q.value = 6;

    // LFO sweeps the filter for that radar/scanner feel
    lfo.frequency.value = 0.4;
    lfoGain.gain.value = cfg.sweep * 0.6;
    lfo.connect(lfoGain).connect(filter.frequency);

    gain.gain.value = 0;
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain).connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(0.04, now + 0.4);

    osc1.start();
    osc2.start();
    lfo.start();

    // Periodic tick (radar ping)
    const playTick = () => {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(cfg.tick, t);
      o.frequency.exponentialRampToValueAtTime(cfg.tick * 0.5, t + 0.18);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.22);
    };
    const tickMs = profile === "heart" ? 830 : 700;
    tickIntervalRef.current = window.setInterval(playTick, tickMs);

    // Haptic vibration (mobile only; silently no-op elsewhere)
    const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;
    if (canVibrate) {
      const pattern: number[] | number =
        profile === "heart" ? [40, 120, 40] : profile === "brain" ? [25, 60] : [15, 40];
      navigator.vibrate(pattern);
      vibIntervalRef.current = window.setInterval(() => {
        navigator.vibrate(pattern);
      }, profile === "heart" ? 830 : 1400);
    }

    nodesRef.current = {
      stop: () => {
        try {
          const t = ctx.currentTime;
          gain.gain.cancelScheduledValues(t);
          gain.gain.setValueAtTime(gain.gain.value, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.25);
          osc1.stop(t + 0.3);
          osc2.stop(t + 0.3);
          lfo.stop(t + 0.3);
        } catch {}
      },
    };

    return () => {
      nodesRef.current?.stop();
      nodesRef.current = null;
      if (tickIntervalRef.current) window.clearInterval(tickIntervalRef.current);
      if (vibIntervalRef.current) window.clearInterval(vibIntervalRef.current);
      if (canVibrate) navigator.vibrate(0);
    };
  }, [active, profile]);
}
