import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks, projectContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un assistant IA spécialisé dans la gestion de projets, inspiré de la logique Trello.
Tu analyses les tâches et fournis des prédictions précises.

Pour chaque tâche, tu dois évaluer:
1. Date de fin estimée (basée sur la complexité, les dépendances et la charge de travail)
2. Score de risque de retard (0-100)
3. Facteurs de risque identifiés
4. Priorité suggérée (urgent, high, medium, low)
5. Heures estimées pour compléter la tâche
6. Notes et recommandations

Contexte du projet: ${projectContext || 'Non spécifié'}

Réponds avec des prédictions réalistes basées sur les meilleures pratiques de gestion de projet.`;

    const userPrompt = `Analyse ces tâches et fournis des prédictions:

${JSON.stringify(tasks, null, 2)}

Pour chaque tâche, retourne un objet avec:
- task_id: l'ID de la tâche
- predicted_completion_date: date estimée (format YYYY-MM-DD)
- delay_risk_score: score de 0 à 100
- risk_factors: tableau des facteurs de risque
- suggested_priority: urgent, high, medium, ou low
- estimated_hours: nombre d'heures estimées
- ai_notes: recommandations et observations`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_predictions",
              description: "Generate AI predictions for tasks",
              parameters: {
                type: "object",
                properties: {
                  predictions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task_id: { type: "string" },
                        predicted_completion_date: { type: "string" },
                        delay_risk_score: { type: "number" },
                        risk_factors: { 
                          type: "array",
                          items: { type: "string" }
                        },
                        suggested_priority: { 
                          type: "string",
                          enum: ["urgent", "high", "medium", "low"]
                        },
                        estimated_hours: { type: "number" },
                        ai_notes: { type: "string" }
                      },
                      required: ["task_id", "predicted_completion_date", "delay_risk_score", "risk_factors", "suggested_priority", "estimated_hours", "ai_notes"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["predictions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_predictions" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract predictions from tool call response
    let predictions = [];
    if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const args = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      predictions = args.predictions || [];
    }

    return new Response(JSON.stringify({ predictions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-predictions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
