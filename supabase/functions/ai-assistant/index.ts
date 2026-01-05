import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: "chat" | "suggestions" | "summary" | "analyze";
  messages?: { role: string; content: string }[];
  context?: {
    tasks?: unknown[];
    project?: unknown;
    workspace?: unknown;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    const { type, messages, context }: AIRequest = await req.json();
    console.log(`AI Assistant request type: ${type}`);

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "chat":
        systemPrompt = `Tu es un assistant IA spécialisé en gestion de projet. Tu aides les utilisateurs à:
- Organiser leurs tâches et projets
- Optimiser leur workflow
- Résoudre les blocages
- Proposer des améliorations de processus

Réponds toujours en français, de manière concise et actionnable.`;
        break;

      case "suggestions":
        systemPrompt = `Tu es un expert en gestion de projet. Analyse les tâches et génère des suggestions.
Réponds UNIQUEMENT en JSON valide:
{
  "suggestions": [
    {
      "type": "priority|deadline|assignee|task",
      "title": "Titre court",
      "description": "Description détaillée",
      "confidence": 0.85,
      "data": {}
    }
  ]
}`;
        userPrompt = `Analyse ces tâches:\n${JSON.stringify(context?.tasks || [])}`;
        break;

      case "summary":
        systemPrompt = `Tu es un analyste de projet. Génère un résumé en JSON:
{
  "summary": "Résumé du projet",
  "keyMetrics": {
    "completionRate": 75,
    "onTrackTasks": 12,
    "delayedTasks": 3,
    "riskLevel": "low"
  },
  "recommendations": ["Rec 1", "Rec 2"]
}`;
        userPrompt = `Résume ce projet:\n${JSON.stringify(context?.project || {})}`;
        break;

      default:
        systemPrompt = "Tu es un assistant IA.";
        userPrompt = JSON.stringify(context || {});
    }

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...(type === "chat" && messages ? messages : [{ role: "user", content: userPrompt }]),
    ];

    if (type === "chat") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (type === "suggestions" || type === "summary") {
      try {
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) jsonContent = jsonMatch[1];
        return new Response(jsonContent, {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ content }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
