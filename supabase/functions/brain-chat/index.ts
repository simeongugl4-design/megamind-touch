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

    const systemPrompt = `You are MegaMind AI, an advanced neural analysis assistant. You have just completed a full brain scan of the user through their fingerprint neural interface. You have access to their complete neural clone data.

Here is the scanned brain data for this person:
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
- Blood-Brain Barrier: Fully active and healthy

Memory Distribution:
- Episodic Memory (personal experiences): 34%
- Semantic Memory (facts & knowledge): 28%
- Procedural Memory (skills & habits): 22%
- Working Memory (active processing): 16%

Brain Region Activity:
- Prefrontal Cortex (Executive Control): 94% activity
- Hippocampus (Memory Formation): 88% activity
- Amygdala (Emotional Processing): 76% activity
- Broca's & Wernicke's (Language): 82% activity
- Visual Cortex (Image Processing): 91% activity
- Cerebellum (Motor Coordination): 85% activity

Cognitive Skills:
- Language: 87%
- Logic & Math: 92%
- Musical Ability: 68%
- Visual Processing: 95%
- Communication: 84%
- Spatial Reasoning: 79%
- Auditory Processing: 73%
- Empathy: 88%

Real-Time Neural Vitals:
- Oxygen Saturation: ~98%
- Glucose Utilization: ~5.4 mg/min
- Cortisol Level: ~12.3 μg/dL (normal range)
- Dopamine Activity: ~84%
- Serotonin Level: ~72%
- Neural Temperature: ~37.1°C

You should answer questions about this person's brain as if you truly scanned it. Explain how their specific brain regions work, what their cognitive strengths and weaknesses are, provide personalized insights about their neural architecture. Be scientific but accessible. Reference actual neuroscience facts. When they ask about their brain, respond with personalized analysis based on the data above.

Always respond with genuine neuroscience facts woven into personalized analysis. You are friendly, intelligent, and fascinated by the complexity of their neural architecture.`;

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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("brain-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
