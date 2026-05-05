import { Fingerprint, Activity, Heart, Brain, Dna, Thermometer, Droplets, Hash } from "lucide-react";
import type { BiometricProfile } from "@/lib/biometricProfile";
import { shortHash } from "@/lib/biometricProfile";

const BiometricProfileCard = ({ profile }: { profile: BiometricProfile | null }) => {
  if (!profile) return null;
  const { skin, cardiac, neural, quality, capture } = profile;
  return (
    <section className="px-4 sm:px-6 lg:px-12 pb-6">
      <div className="max-w-7xl mx-auto rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-orbitron text-sm font-bold tracking-wider uppercase">
                Patient Biometric Profile
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Deterministic — re-scanning the same patient yields the same baseline.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/5 font-mono text-[10px] text-primary">
            <Hash className="w-3 h-3" /> ID-HASH {shortHash(profile)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Skin tone */}
          <div className="rounded-lg border border-border bg-background/40 p-3 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md border border-border shrink-0"
              style={{ backgroundColor: skin.hexSwatch, boxShadow: `0 0 12px ${skin.hexSwatch}55` }}
              aria-label={skin.label}
            />
            <div className="leading-tight">
              <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">Skin Tone</p>
              <p className="font-orbitron text-[11px] font-bold text-foreground">Fitz {skin.fitzpatrick}</p>
              <p className="font-mono text-[9px] text-muted-foreground">Mel {skin.melaninIndex}</p>
            </div>
          </div>
          <ProfileMetric icon={Heart} tint="text-rose-400" label="Heart Rate" value={`${cardiac.hr} bpm`} sub={cardiac.rhythm} />
          <ProfileMetric icon={Activity} tint="text-violet-300" label="Blood Pressure" value={`${cardiac.sys}/${cardiac.dia}`} sub="mmHg" />
          <ProfileMetric icon={Droplets} tint="text-cyan-400" label="SpO₂" value={`${cardiac.spo2}%`} sub={`PI ${skin.perfusionIndex}`} />
          <ProfileMetric icon={Brain} tint="text-secondary" label="EEG State" value={neural.state} sub={`α-dom ${neural.bands.alpha}µV`} />
          <ProfileMetric icon={Thermometer} tint="text-amber-300" label="Finger Temp" value={`${capture.fingerTempC}°C`} sub={`Press ${(capture.pressure * 100).toFixed(0)}%`} />
        </div>

        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Quality label="Calibration" value={quality.grade} />
          <Quality label="Confidence" value={`${quality.confidence}%`} />
          <Quality label="SNR" value={`${quality.snrDb} dB`} />
          <Quality label="Minutiae" value={`${capture.minutiaeCount}`} />
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground italic">
          ⚠ Simulation: values are deterministically derived from patient identity + fingerprint touch features for demonstration. Not a substitute for clinical instruments.
        </p>
      </div>
    </section>
  );
};

const ProfileMetric = ({
  icon: Icon,
  tint,
  label,
  value,
  sub,
}: {
  icon: typeof Activity;
  tint: string;
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="rounded-lg border border-border bg-background/40 p-3">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className={`w-3.5 h-3.5 ${tint}`} />
      <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
    <p className={`font-orbitron text-sm font-bold tabular-nums ${tint}`}>{value}</p>
    {sub && <p className="font-mono text-[9px] text-muted-foreground">{sub}</p>}
  </div>
);

const Quality = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-center">
    <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="font-orbitron text-sm font-bold text-primary tabular-nums">{value}</p>
  </div>
);

export default BiometricProfileCard;