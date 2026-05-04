import { useState } from "react";
import { User, Stethoscope, ShieldCheck, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PatientInfo = {
  patientName: string;
  dob: string;
  sex: string;
  patientId: string;
  contact: string;
  doctorName: string;
  doctorPosition: string;
  doctorLicense: string;
  facility: string;
};

const empty: PatientInfo = {
  patientName: "",
  dob: "",
  sex: "",
  patientId: "",
  contact: "",
  doctorName: "",
  doctorPosition: "",
  doctorLicense: "",
  facility: "",
};

const PatientIntakeForm = ({
  onSubmit,
  current,
  locked,
}: {
  onSubmit: (info: PatientInfo) => void;
  current: PatientInfo | null;
  locked: boolean;
}) => {
  const [form, setForm] = useState<PatientInfo>(current ?? empty);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientInfo, string>>>({});

  const set = (k: keyof PatientInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value.slice(0, 80) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.patientName.trim()) next.patientName = "Required";
    if (!form.dob) next.dob = "Required";
    if (!form.sex.trim()) next.sex = "Required";
    if (!form.doctorName.trim()) next.doctorName = "Required";
    if (!form.doctorPosition.trim()) next.doctorPosition = "Required";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      ...form,
      patientId: form.patientId.trim() || `PT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-12 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-orbitron text-sm sm:text-base font-bold tracking-wider uppercase text-foreground">
                Pre-Scan Intake
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Patient & clinician details — required before scanning. Embedded into the medical report.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Patient */}
            <fieldset className="rounded-lg border border-border bg-background/40 p-4 space-y-3">
              <legend className="px-2 font-orbitron text-[11px] tracking-widest uppercase text-primary inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Patient
              </legend>
              <Field label="Full Name *" error={errors.patientName}>
                <Input value={form.patientName} onChange={set("patientName")} placeholder="Jane A. Doe" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth *" error={errors.dob}>
                  <Input type="date" value={form.dob} onChange={set("dob")} max={new Date().toISOString().split("T")[0]} />
                </Field>
                <Field label="Sex *" error={errors.sex}>
                  <Input value={form.sex} onChange={set("sex")} placeholder="Female / Male / Other" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Patient ID / MRN">
                  <Input value={form.patientId} onChange={set("patientId")} placeholder="auto-generated" />
                </Field>
                <Field label="Contact (phone/email)">
                  <Input value={form.contact} onChange={set("contact")} placeholder="optional" />
                </Field>
              </div>
            </fieldset>

            {/* Doctor */}
            <fieldset className="rounded-lg border border-border bg-background/40 p-4 space-y-3">
              <legend className="px-2 font-orbitron text-[11px] tracking-widest uppercase text-secondary inline-flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" /> Attending Clinician
              </legend>
              <Field label="Doctor Name *" error={errors.doctorName}>
                <Input value={form.doctorName} onChange={set("doctorName")} placeholder="Dr. Alex Morgan, MD" />
              </Field>
              <Field label="Position / Specialty *" error={errors.doctorPosition}>
                <Input value={form.doctorPosition} onChange={set("doctorPosition")} placeholder="Consultant Cardiologist" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="License #">
                  <Input value={form.doctorLicense} onChange={set("doctorLicense")} placeholder="MD-12345" />
                </Field>
                <Field label="Facility / Clinic">
                  <Input value={form.facility} onChange={set("facility")} placeholder="MegaMind Medical Center" />
                </Field>
              </div>
            </fieldset>

            <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Captured at scan time and embedded in the PDF report header.
              </p>
              <button
                type="submit"
                disabled={locked}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary font-orbitron text-[11px] font-bold tracking-wider uppercase text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {current ? "Update & Lock Intake" : "Save & Enable Scanner"}
              </button>
            </div>
          </form>

          {current && (
            <div className="mt-4 p-3 rounded-lg border border-green-500/30 bg-green-500/5 text-[11px] font-mono text-green-300/90">
              ✓ Intake locked for <span className="font-bold">{current.patientName}</span> ({current.dob}) ·
              Clinician: <span className="font-bold">{current.doctorName}</span> — {current.doctorPosition}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
    {children}
    {error && <p className="text-[10px] text-destructive">{error}</p>}
  </div>
);

export default PatientIntakeForm;