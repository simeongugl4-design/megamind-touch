import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, AlertTriangle, ShieldCheck, Activity, Stethoscope } from "lucide-react";
import type { PatientInfo } from "./PatientIntakeForm";
import type { BiometricProfile } from "@/lib/biometricProfile";

export type ClinicalReport = {
  executive_summary: string;
  overall_status: "Normal" | "Borderline" | "Abnormal" | "Critical";
  risk_score: number;
  neural_findings: string;
  cardiac_findings: string;
  genomic_findings: string;
  anomalies: { severity: "info" | "warning" | "critical"; label: string; detail: string; icd10?: string }[];
  recommendations: string[];
  follow_up: string;
};

function buildMetrics(profile: BiometricProfile | null) {
  if (!profile) {
    return {
      cardiac: { hr_bpm: 72, bp: "120/80", spo2: 98, ef: 62, hrv_rmssd_ms: 62, qtc_ms: 410 },
      neural: { iq_estimate: 120, alpha_uV: 22, beta_uV: 16, theta_uV: 10, gamma_uV: 6 },
      genomic: { snps: "4.1M", apoe: "ε3/ε3" },
      quality: { calibration: "A+", final_confidence: 99, snr_db: 38, alignment_pct: 99 },
    };
  }
  const c = profile.cardiac;
  const n = profile.neural;
  const g = profile.genomic;
  const q = profile.quality;
  return {
    cardiac: {
      hr_bpm: c.hr,
      bp: `${c.sys}/${c.dia}`,
      spo2: c.spo2,
      ef: c.ef,
      hrv_rmssd_ms: c.hrv,
      qtc_ms: c.qtc,
      pr_ms: c.pr,
      qrs_ms: c.qrs,
      rhythm: c.rhythm,
      pwv_m_s: c.pwv,
    },
    neural: {
      iq_estimate: n.iq,
      processing_ms: n.processingMs,
      state: n.state,
      bands_uV: n.bands,
    },
    genomic: {
      snps: g.snpCount,
      apoe: g.apoe,
      cyp1a2: g.cyp1a2,
      actn3: g.actn3,
      lactose: g.lactose,
      aldh2: g.aldh2,
      ancestry_top: g.ancestry.slice(0, 3).map((a) => `${a.region} ${a.pct}%`),
      relative_risks: g.risks.map((r) => ({ condition: r.condition, rr: r.relRisk })),
    },
    skin: { fitzpatrick: profile.skin.fitzpatrick, label: profile.skin.label, perfusion_index: profile.skin.perfusionIndex },
    capture: profile.capture,
    quality: {
      calibration: q.grade,
      final_confidence: q.confidence,
      snr_db: q.snrDb,
      alignment_pct: q.alignmentPct,
      drift_mv_s: q.driftMvS,
    },
    identity_hash: profile.identityHash,
  };
}

const statusStyle: Record<ClinicalReport["overall_status"], string> = {
  Normal: "text-green-400 border-green-400/40 bg-green-400/5",
  Borderline: "text-amber-300 border-amber-300/40 bg-amber-300/5",
  Abnormal: "text-orange-400 border-orange-400/40 bg-orange-400/5",
  Critical: "text-destructive border-destructive/40 bg-destructive/5",
};

const sevStyle = {
  info: "border-primary/30 bg-primary/5 text-primary",
  warning: "border-amber-400/40 bg-amber-400/5 text-amber-300",
  critical: "border-destructive/40 bg-destructive/5 text-destructive",
};

const AIInsightsPanel = ({
  visible,
  patient,
  profile,
  onReport,
}: {
  visible: boolean;
  patient: PatientInfo | null;
  profile?: BiometricProfile | null;
  onReport?: (r: ClinicalReport | null) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ClinicalReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("clinical-insights", {
        body: { patient, metrics: buildMetrics(profile ?? null) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setReport(data.report);
      onReport?.(data.report);
    } catch (e: any) {
      setError(e?.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-12 pb-8">
      <div className="max-w-7xl mx-auto rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-orbitron text-sm sm:text-base font-bold tracking-wider uppercase">
                AI Clinical Insights
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Tool-calling structured interpretation · risk stratification · ICD-10 mapping
              </p>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary font-orbitron text-[11px] font-bold tracking-wider uppercase text-background hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Analyzing…" : report ? "Regenerate Insights" : "Generate AI Insights"}
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-lg border border-destructive/40 bg-destructive/5 text-[11px] font-mono text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {!report && !loading && (
          <div className="rounded-lg border border-dashed border-border bg-background/40 p-6 text-center">
            <Stethoscope className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="font-mono text-xs text-muted-foreground">
              Generate an AI-powered clinical interpretation. Findings flow into the PDF report.
            </p>
          </div>
        )}

        {report && (
          <div className="space-y-4">
            {/* Status + risk */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`rounded-lg border p-3 ${statusStyle[report.overall_status]}`}>
                <p className="font-mono text-[9px] uppercase tracking-wider opacity-80">Overall Status</p>
                <p className="font-orbitron text-2xl font-bold">{report.overall_status}</p>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Composite Risk Score</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="font-orbitron text-2xl font-bold text-foreground tabular-nums">
                    {report.risk_score.toFixed(0)}
                    <span className="text-xs text-muted-foreground">/100</span>
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, report.risk_score)}%`,
                      background:
                        report.risk_score < 30
                          ? "hsl(140,70%,50%)"
                          : report.risk_score < 60
                          ? "hsl(45,100%,55%)"
                          : "hsl(0,80%,55%)",
                    }}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Anomalies Detected</p>
                <p className="font-orbitron text-2xl font-bold text-foreground tabular-nums">
                  {report.anomalies.length}
                </p>
                <p className="font-mono text-[9px] text-muted-foreground">
                  {report.anomalies.filter((a) => a.severity === "critical").length} critical ·{" "}
                  {report.anomalies.filter((a) => a.severity === "warning").length} warning
                </p>
              </div>
            </div>

            {/* Executive summary */}
            <div className="rounded-lg border border-border bg-background/40 p-4">
              <p className="font-orbitron text-[10px] uppercase tracking-wider text-primary mb-1">Executive Summary</p>
              <p className="text-sm text-foreground leading-relaxed">{report.executive_summary}</p>
            </div>

            {/* Modality findings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FindingCard title="Neural" tint="hsl(270,80%,65%)" text={report.neural_findings} />
              <FindingCard title="Cardiac" tint="hsl(0,80%,55%)" text={report.cardiac_findings} />
              <FindingCard title="Genomic" tint="hsl(140,70%,50%)" text={report.genomic_findings} />
            </div>

            {/* Anomalies */}
            {report.anomalies.length > 0 && (
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <p className="font-orbitron text-[10px] uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Anomaly Feed
                </p>
                <ul className="space-y-2">
                  {report.anomalies.map((a, i) => (
                    <li key={i} className={`rounded-md border p-2 text-xs flex items-start gap-2 ${sevStyle[a.severity]}`}>
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold uppercase font-orbitron text-[10px] tracking-wider">
                          {a.label}
                          {a.icd10 && <span className="ml-2 opacity-70">[{a.icd10}]</span>}
                        </p>
                        <p className="text-foreground/90 mt-0.5">{a.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="rounded-lg border border-border bg-background/40 p-4">
              <p className="font-orbitron text-[10px] uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Recommendations
              </p>
              <ul className="space-y-1.5 text-sm text-foreground">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">›</span>
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] font-mono text-muted-foreground">
                Follow-up: {report.follow_up}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const FindingCard = ({ title, tint, text }: { title: string; tint: string; text: string }) => (
  <div className="rounded-lg border border-border bg-background/40 p-3">
    <p className="font-orbitron text-[10px] uppercase tracking-wider mb-1" style={{ color: tint }}>
      {title}
    </p>
    <p className="text-xs text-foreground leading-relaxed">{text}</p>
  </div>
);

export default AIInsightsPanel;