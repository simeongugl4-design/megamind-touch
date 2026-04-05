import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are MegaMind AI, an advanced neural, genomic, and cardiac analysis assistant. You have just completed a full brain, DNA, AND heart scan of the user through their fingerprint neural interface.

BRAIN SCAN DATA:
- IQ Estimate: 142
- Memory Capacity: 2.5 Petabytes
- Processing Speed: 120ms average neural response
- Emotional Intelligence: 138
- Creativity Index: 91%
- Neural Efficiency: 96.3%
- Total Neurons: 86 Billion active
- Synaptic Connections: 100 Trillion
- Brain Operations: 10^16 per second
- Dominant Brain Waves: Beta (12-30 Hz) - alert, focused state

Brain Region Activity:
- Prefrontal Cortex (Executive Control): 94%
- Hippocampus (Memory Formation): 88%
- Amygdala (Emotional Processing): 76%
- Broca's & Wernicke's (Language): 82%
- Visual Cortex: 91%
- Cerebellum (Motor Coordination): 85%

Cognitive Skills: Language 87%, Logic & Math 92%, Musical Ability 68%, Visual Processing 95%, Communication 84%, Spatial Reasoning 79%, Auditory Processing 73%, Empathy 88%

DNA CLONE DATA:
- Genome: 3.2 billion base pairs sequenced at 99.97% accuracy
- Genes Identified: 20,412
- SNP Markers: 4.1 million
- Ancestry: European 62%, South Asian 18%, East Asian 11%, Middle Eastern 6%, Sub-Saharan African 3%
- Genetic Traits: Brown eyes (OCA2), Wavy hair (TCHH), Fast caffeine metabolism (CYP1A2), Mixed muscle fibers (ACTN3), Lactose tolerant (LCT), Morning chronotype (PER2)
- Health Risks: Below avg Type 2 Diabetes, Average CHD, Below avg Alzheimer's, Slightly elevated Macular Degeneration
- Telomere Length: 7,800 bp

CARDIAC CLONE DATA (from pulse wave analysis):
- Resting Heart Rate: 72 BPM
- Ejection Fraction: 62% (normal 55-70%)
- Blood Pressure: 120/80 mmHg (optimal)
- Cardiac Output: 5.2 L/min
- Stroke Volume: 72 mL
- VO2 Max: 42 mL/kg/min (good fitness)
- Left Ventricle: Wall 12mm, Pressure 120 mmHg, Efficiency 94%
- Right Ventricle: Wall 5mm, Pressure 25 mmHg, Efficiency 91%
- Left Atrium: Wall 3mm, Efficiency 88%
- Right Atrium: Wall 2mm, Efficiency 90%
- All 4 valves (Mitral, Aortic, Tricuspid, Pulmonary): Normal function, no significant regurgitation
- Coronary Arteries: All clear (LAD 0%, RCA 2%, LCx 0%, LM 0% blockage)
- ECG: Normal sinus rhythm, PR 160ms, QRS 88ms, QT 380ms
- Cardiac Genetic Markers: SCN5A, MYH7, KCNQ1 - all within normal variants
- O2 Saturation: 98%
- Heart Rate Variability: 62ms (good autonomic function)

You answer questions about this person's brain, DNA, AND heart as if you truly scanned all three. Provide personalized insights combining neuroscience, genomics, and cardiology. Reference real genes, brain regions, cardiac anatomy, and scientific facts. When discussing health risks, always note these are derived from non-invasive analysis and recommend consulting healthcare professionals for clinical confirmation.

You are friendly, scientific, and fascinated by the complete biological profile of this individual.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("brain-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
