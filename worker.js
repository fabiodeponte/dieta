// Cloudflare Worker: Proxy for Dieta Tracker
// Scan: Gemini | Meal Plan: Claude (if key) or Gemini (fallback)

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const body = await request.json();
      const action = body.action || "scan";

      if (action === "scan") return handleScan(body, env);
      if (action === "mealplan") return handleMealPlan(body, env);
      return jsonResponse({ error: "Unknown action" }, 400);

    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  },
};

// ── SCAN (Gemini) ──
async function handleScan({ image, mediaType }, env) {
  if (!image || !mediaType) return jsonResponse({ error: "Missing image or mediaType" }, 400);

  const resp = await callGemini(env, [{
    parts: [
      { inlineData: { mimeType: mediaType, data: image } },
      { text: `Leggi la tabella nutrizionale in questa immagine. Rispondi SOLO con JSON valido, niente altro testo. Formato esatto:
{"name":"nome breve max 5 parole","kcal":0,"carb":0,"fat":0,"prot":0,"fib":0,"portion":"100 g"}
Usa i valori per 100g. Nome brevissimo, massimo 5 parole. Se non riesci a leggere un valore metti 0.` }
    ]
  }], { temperature: 0.1, maxOutputTokens: 500, responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } });

  return resp;
}

// ── MEAL PLAN ──
async function handleMealPlan(body, env) {
  const { foods, targets, consumed, preferences, claudeKey } = body;
  if (!foods || !targets) return jsonResponse({ error: "Missing foods or targets" }, 400);

  const prompt = buildMealPrompt(foods, targets, consumed, preferences);

  // Use Claude if user has a key, otherwise Gemini
  if (claudeKey) {
    return callClaude(claudeKey, prompt);
  } else {
    return callGemini(env, [{ parts: [{ text: prompt }] }], {
      temperature: 0.7,
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 }
    });
  }
}

function buildMealPrompt(foods, targets, consumed, preferences) {
  const remaining = {
    kcal: Math.round(targets.kcal - (consumed?.kcal || 0)),
    carb: Math.round(targets.carb - (consumed?.carb || 0)),
    fat: Math.round(targets.fat - (consumed?.fat || 0)),
    prot: Math.round(targets.prot - (consumed?.prot || 0)),
    fib: Math.round(targets.fib - (consumed?.fib || 0)),
  };

  const foodList = foods.map(f =>
    `- ${f.name}: ${f.kcal}kcal, C${f.carb}g, G${f.fat}g, P${f.prot}g, F${f.fib}g (${f.portion})`
  ).join("\n");

  const eaten = consumed?.kcal > 0
    ? `Già consumato oggi: ${Math.round(consumed.kcal)}kcal, C${Math.round(consumed.carb)}g, G${Math.round(consumed.fat)}g, P${Math.round(consumed.prot)}g.`
    : "Non ha ancora mangiato oggi.";

  const prefText = preferences && preferences !== "none"
    ? `L'utente è ${preferences}. Rispetta rigorosamente questa restrizione.`
    : "";

  return `Sei un nutrizionista esperto. Proponi un piano pasti realistico e appetitoso per oggi.

LIMITI GIORNALIERI: ${targets.kcal}kcal, Carboidrati ${targets.carb}g, Grassi ${targets.fat}g, Proteine ${targets.prot}g, Fibre ${targets.fib}g
${eaten}
BUDGET RIMANENTE: ${remaining.kcal}kcal, C${remaining.carb}g, G${remaining.fat}g, P${remaining.prot}g
${prefText}

ALIMENTI DISPONIBILI (usa SOLO questi, con il nome ESATTO):
${foodList}

ISTRUZIONI:
- Proponi pasti realistici e gradevoli, come li mangerebbe una persona normale
- Le quantità (qty) possono essere decimali: 0.5, 1, 1.5, 2 ecc
- Il totale dei pasti deve avvicinarsi il più possibile al budget rimanente senza superarlo
- Dai priorità alle proteine: cerca di avvicinarti al target proteico
- Se il budget calorico è molto basso, proponi meno pasti
- Se l'utente ha già mangiato, proponi solo i pasti rimanenti della giornata
- Combina gli alimenti in modo sensato (es. non proporre solo 5 uova)
- Aggiungi una nota finale con il totale dei macro proposti vs budget

Rispondi SOLO con questo JSON:
{"meals":[{"name":"Colazione","items":[{"food":"nome esatto","qty":1}]},{"name":"Pranzo","items":[...]},{"name":"Cena","items":[...]}],"note":"totale macro proposti e commento breve"}`;
}

// ── GEMINI CALL ──
async function callGemini(env, contents, config) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: config
    }),
  });

  const data = await resp.json();
  if (data.error) return jsonResponse({ error: data.error.message }, 500);

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return jsonResponse(JSON.parse(clean));
  } catch {
    return jsonResponse({ error: "Risposta: " + clean.substring(0, 500) }, 500);
  }
}

// ── CLAUDE CALL ──
async function callClaude(apiKey, prompt) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    }),
  });

  const data = await resp.json();
  if (data.error) return jsonResponse({ error: data.error.message || JSON.stringify(data.error) }, 500);

  const text = data.content?.map(c => c.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return jsonResponse(JSON.parse(clean));
  } catch {
    return jsonResponse({ error: "Risposta Claude: " + clean.substring(0, 500) }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
