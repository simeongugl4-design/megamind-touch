import { CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert, Activity, Stethoscope, Pill, ExternalLink, ShieldX, ShieldCheck } from "lucide-react";
import type { BiometricProfile } from "@/lib/biometricProfile";
import { interpretCalibration, screenSickness, type MetricVerdict, type SicknessSeverity } from "@/lib/calibrationNarrative";
import { buildMedicationPlan, MEDICATION_DISCLAIMER } from "@/lib/medicationAdvisor";
import { reviewPlan, SAFETY_DISCLAIMER, type SafetySeverity } from "@/lib/medicationSafety";
import type { PatientInfo } from "@/components/PatientIntakeForm";

const verdictStyle: Record<MetricVerdict, { color: string; bg: string; border: string; Icon: typeof CheckCircle2; label: string }> = {
  excellent: { color: "text-emerald-300", bg: "bg-emerald-400/10", border: "border-emerald-400/40", Icon: CheckCircle2, label: "Excellent" },
  good:      { color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/40",     Icon: CheckCircle2, label: "Good" },
  marginal:  { color: "text-amber-300",   bg: "bg-amber-400/10",   border: "border-amber-400/40",   Icon: AlertTriangle, label: "Marginal" },
  poor:      { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/40", Icon: AlertCircle, label: "Sub-clinical" },
};

const sevStyle: Record<SicknessSeverity, { color: string; bg: string; label: string }> = {
  normal:   { color: "text-emerald-300", bg: "bg-emerald-400/10", label: "Normal" },
  watch:    { color: "text-primary",     bg: "bg-primary/10",     label: "Watch" },
  elevated: { color: "text-amber-300",   bg: "bg-amber-400/10",   label: "Elevated" },
  critical: { color: "text-destructive", bg: "bg-destructive/10", label: "Critical" },
};

const CalibrationNarrative = ({
  visible,
  profile,
  patient,
}: {
  visible: boolean;
  profile: BiometricProfile | null;
  patient?: PatientInfo | null;
}) => {
  if (!visible || !profile) return null;
  const q = profile.quality;
  const narrative = interpretCalibration(q.snrDb, q.driftMvS, q.alignmentPct, q.confidence);
  const sickness = screenSickness(profile);
  const top = verdictStyle[narrative.overallVerdict];
  const TopIcon = top.Icon;

  const triageColor =
    sickness.triageBand === "Urgent consult" ? "text-destructive border-destructive/50 bg-destructive/10"
    : sickness.triageBand === "Same-week consult" ? "text-amber-300 border-amber-400/50 bg-amber-400/10"
    : sickness.triageBand === "Routine follow-up" ? "text-primary border-primary/40 bg-primary/10"
    : "text-emerald-300 border-emerald-400/40 bg-emerald-400/10";

  const safetyStyle: Record<SafetySeverity, { color: string; bg: string; border: string; label: string }> = {
    info:            { color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/40",     label: "Info" },
    caution:         { color: "text-amber-300",   bg: "bg-amber-400/10",   border: "border-amber-400/40",   label: "Caution" },
    major:           { color: "text-orange-300",  bg: "bg-orange-400/10",  border: "border-orange-400/40",  label: "Major" },
    contraindicated: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/50", label: "Contraindicated" },
  };

  return (
    <section className="px-4 sm:px-6 lg:px-12 pb-8">
      <div className="max-w-7xl mx-auto rounded-xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
        {/* Calibration narrative */}
        <div className="p-5 border-b border-border/60">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-lg border ${top.border} ${top.bg} flex items-center justify-center`}>
              <TopIcon className={`w-4 h-4 ${top.color}`} />
            </div>
            <div>
              <h3 className="font-orbitron text-sm font-bold tracking-wider uppercase">
                Calibration Quality Narrative
              </h3>
              <p className={`text-[11px] ${top.color}`}>{narrative.headline}</p>
            </div>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground mb-4 leading-relaxed">
            {narrative.summary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {narrative.lines.map((l) => {
              const s = verdictStyle[l.verdict];
              const Icon = s.Icon;
              return (
                <div key={l.metric} className={`rounded-lg border ${s.border} ${s.bg} p-3`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-orbitron text-[10px] tracking-wider uppercase text-foreground flex items-center gap-1.5">
                      <Icon className={`w-3 h-3 ${s.color}`} /> {l.metric}
                    </span>
                    <span className={`font-mono text-[10px] tabular-nums ${s.color}`}>
                      {l.value} · {s.label}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-foreground/85 leading-relaxed mb-1">{l.plain}</p>
                  <p className="font-mono text-[10px] text-muted-foreground italic">▶ {l.action}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sickness screening */}
        <div className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" />
              <h3 className="font-orbitron text-sm font-bold tracking-wider uppercase">
                Sickness Screening · Brain · Heart · DNA
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-orbitron text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md border ${triageColor}`}>
                <ShieldAlert className="inline w-3 h-3 mr-1" />
                Triage: {sickness.triageBand}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                Composite risk {sickness.composite}/100
              </span>
            </div>
          </div>
          <ul className="space-y-2">
            {sickness.findings.map((x, i) => {
              const s = sevStyle[x.severity];
              return (
                <li key={i} className={`rounded-lg border border-border ${s.bg} p-3`}>
                  <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                    <span className="font-orbitron text-[10px] tracking-wider uppercase text-foreground flex items-center gap-1.5">
                      <Activity className={`w-3 h-3 ${s.color}`} />
                      {x.system} · {x.condition}
                      {x.icd10 && (
                        <span className="ml-1 font-mono text-[9px] text-muted-foreground">[{x.icd10}]</span>
                      )}
                    </span>
                    <span className={`font-mono text-[9px] uppercase ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground mb-0.5">▸ {x.evidence}</p>
                  <p className="font-mono text-[10px] text-foreground/85 mb-0.5 leading-relaxed">{x.explanation}</p>
                  <p className="font-mono text-[10px] text-primary/90 italic">▶ {x.recommendation}</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 font-mono text-[9px] text-muted-foreground italic leading-relaxed border-t border-border/50 pt-2">
            {sickness.disclaimer}
          </p>
        </div>

        {/* Evidence-based medication advisor */}
        {(() => {
          const plans = buildMedicationPlan(sickness.findings);
          if (plans.length === 0) return null;
          return (
            <div className="p-5 border-t border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-4 h-4 text-primary" />
                <h3 className="font-orbitron text-sm font-bold tracking-wider uppercase">
                  Evidence-Based Medication Advisor
                </h3>
              </div>
              <div className="space-y-4">
                {plans.map((p, i) => (
                  <div key={i} className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
                      <span className="font-orbitron text-[11px] tracking-wider uppercase text-foreground">
                        {p.finding.system} · {p.finding.condition}
                      </span>
                      <span className="font-mono text-[9px] uppercase text-muted-foreground">
                        {p.finding.severity}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-emerald-300 mb-2">
                      ▶ Lifestyle: <span className="text-foreground/90">{p.lifestyle}</span>
                    </p>
                    <div className="space-y-2">
                      {p.options.map((o, j) => (
                        <div key={j} className="rounded-md border border-border/60 bg-card/40 p-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="font-orbitron text-[10px] tracking-wider uppercase text-primary">
                              {o.drugClass}
                            </span>
                            <span className="font-mono text-[9px] uppercase text-amber-300">{o.line}</span>
                          </div>
                          <p className="font-mono text-[10px] text-foreground mt-0.5">
                            <span className="text-primary/80">Rx:</span> {o.example}
                          </p>
                          <p className="font-mono text-[10px] text-foreground/80 mt-0.5">
                            <span className="text-muted-foreground">MoA:</span> {o.mechanism}
                          </p>
                          <p className="font-mono text-[10px] text-foreground/80 mt-0.5">
                            <span className="text-muted-foreground">Why:</span> {o.rationale}
                          </p>
                          <p className="font-mono text-[10px] text-amber-300/90 mt-0.5">
                            ⚠ {o.cautions}
                          </p>
                          <p className="font-mono text-[10px] mt-1">
                            <span className="text-muted-foreground">Source:</span>{" "}
                            {o.source.url ? (
                              <a
                                href={o.source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {o.source.name} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-primary">{o.source.name}</span>
                            )}
                            <span className="text-muted-foreground"> — {o.source.ref}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="font-mono text-[10px] text-destructive mt-2">
                      🚨 Red flags: {p.redFlags}
                    </p>
                    {(() => {
                      const report = reviewPlan(p, patient ?? null);
                      const hasAny = report.drugs.some((d) => d.alerts.length) || report.interactions.length > 0;
                      const headerStyle = safetyStyle[report.worst];
                      return (
                        <div className={`mt-3 rounded-md border ${headerStyle.border} ${headerStyle.bg} p-2.5`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`font-orbitron text-[10px] tracking-wider uppercase ${headerStyle.color} flex items-center gap-1.5`}>
                              {hasAny ? <ShieldX className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                              Medication Safety Check
                            </span>
                            <span className={`font-mono text-[9px] uppercase ${headerStyle.color}`}>
                              {hasAny ? `${headerStyle.label} · ${report.drugs.reduce((n, d) => n + d.alerts.length, 0) + report.interactions.length} alert(s)` : "Clear"}
                            </span>
                          </div>
                          {!hasAny && (
                            <p className="font-mono text-[10px] text-foreground/80">
                              No contraindications or drug–drug interactions detected for the recommended options given the patient's recorded profile. Clinician must still reconcile full medication list and labs.
                            </p>
                          )}
                          {report.drugs.map((d, k) =>
                            d.alerts.length === 0 ? null : (
                              <div key={`d${k}`} className="mt-1.5">
                                <p className="font-mono text-[10px] text-foreground/90">
                                  <span className="text-primary">{d.drugClass}</span>
                                  {d.blocked && (
                                    <span className="ml-1 text-[9px] uppercase text-destructive">[blocked]</span>
                                  )}
                                </p>
                                <ul className="mt-1 space-y-1">
                                  {d.alerts.map((a, m) => {
                                    const s = safetyStyle[a.severity];
                                    return (
                                      <li key={m} className={`rounded border ${s.border} ${s.bg} p-1.5`}>
                                        <div className="flex items-center justify-between gap-2">
                                          <span className={`font-mono text-[10px] ${s.color}`}>
                                            ⚠ {a.kind} · {a.title}
                                          </span>
                                          <span className={`font-mono text-[9px] uppercase ${s.color}`}>{s.label}</span>
                                        </div>
                                        <p className="font-mono text-[10px] text-foreground/85 mt-0.5">{a.detail}</p>
                                        <p className="font-mono text-[10px] text-primary/90 mt-0.5">▶ {a.action}</p>
                                        <p className="font-mono text-[9px] text-muted-foreground mt-0.5 italic">Source: {a.source}</p>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ),
                          )}
                          {report.interactions.length > 0 && (
                            <div className="mt-2">
                              <p className="font-orbitron text-[9px] tracking-wider uppercase text-foreground/80">
                                Cross-drug interactions in this regimen
                              </p>
                              <ul className="mt-1 space-y-1">
                                {report.interactions.map((a, m) => {
                                  const s = safetyStyle[a.severity];
                                  return (
                                    <li key={m} className={`rounded border ${s.border} ${s.bg} p-1.5`}>
                                      <div className="flex items-center justify-between gap-2">
                                        <span className={`font-mono text-[10px] ${s.color}`}>↔ {a.title}</span>
                                        <span className={`font-mono text-[9px] uppercase ${s.color}`}>{s.label}</span>
                                      </div>
                                      <p className="font-mono text-[10px] text-foreground/85 mt-0.5">{a.detail}</p>
                                      <p className="font-mono text-[10px] text-primary/90 mt-0.5">▶ {a.action}</p>
                                      <p className="font-mono text-[9px] text-muted-foreground mt-0.5 italic">Source: {a.source}</p>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
              <p className="mt-3 font-mono text-[9px] text-muted-foreground italic leading-relaxed border-t border-border/50 pt-2">
                {MEDICATION_DISCLAIMER}
              </p>
              <p className="mt-2 font-mono text-[9px] text-muted-foreground italic leading-relaxed">
                {SAFETY_DISCLAIMER}
              </p>
            </div>
          );
        })()}
      </div>
    </section>
  );
};

export default CalibrationNarrative;