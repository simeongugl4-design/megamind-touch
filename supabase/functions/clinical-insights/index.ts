import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { patient, metrics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = `You are a board-certified clinician AI generating concise, professional, medical-grade interpretations of multimodal biometric scans (neural EEG-equivalent, cardiac ECG-equivalent + hemodynamics, genomic SNP). 
You MUST:
- Use formal clinical language (no marketing fluff).
- Stratify findings as Normal / Borderline / Abnormal / Critical.
- Reference relevant ICD-10 codes when applicable.
- Give actionable follow-up recommendations.
- Never invent a diagnosis the data doesn't support; mark uncertain items.
- Output strictly via the provided tool schema.`;

    const userPayload = {
      patient: {
        name: patient?.patientName,
        dob: patient?.dob,
        sex: patient?.sex,
        contact: patient?.contact,
      },
      clinician: {
        name: patient?.doctorName,
        position: patient?.doctorPosition,
        license: patient?.doctorLicense,
        facility: patient?.facility,
      },
      metrics,
    };

    const body = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Generate a medical-grade interpretation for this scan session:\n${JSON.stringify(userPayload, null, 2)}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "emit_clinical_report",
            description: "Structured clinical interpretation",
            parameters: {
              type: "object",
              properties: {
                executive_summary: { type: "string", description: "2-3 sentence overall clinical impression" },
                overall_status: { type: "string", enum: ["Normal", "Borderline", "Abnormal", "Critical"] },
                risk_score: { type: "number", description: "0-100 composite risk score" },
                neural_findings: { type: "string" },
                cardiac_findings: { type: "string" },
                genomic_findings: { type: "string" },
                anomalies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      severity: { type: "string", enum: ["info", "warning", "critical"] },
                      label: { type: "string" },
                      detail: { type: "string" },
                      icd10: { type: "string" },
                    },
                    required: ["severity", "label", "detail"],
                  },
                },
                recommendations: { type: "array", items: { type: "string" } },
                follow_up: { type: "string" },
              },
              required: [
                "executive_summary",
                "overall_status",
                "risk_score",
                "neural_findings",
                "cardiac_findings",
                "genomic_findings",
                "anomalies",
                "recommendations",
                "follow_up",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "emit_clinical_report" } },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("AI gateway error", resp.status, text);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please retry shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await resp.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;

    return new Response(JSON.stringify({ report: args }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});