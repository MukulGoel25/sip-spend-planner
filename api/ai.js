const MAX_PROMPT = 24000;
module.exports = async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (req.method === "GET") return res.status(200).json({ ok: !!key });
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!key) return res.status(500).json({ error: "no_key" });
  const prompt = req.body && req.body.prompt;
  if (typeof prompt !== "string" || prompt.length > MAX_PROMPT ||
      !(prompt.startsWith("You are Saathi") || prompt.startsWith("Categorise Indian UPI merchant names"))) {
    return res.status(400).json({ error: "bad_request" });
  }
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 800, responseMimeType: "application/json" }
      })
    });
    if (r.status === 429) return res.status(429).json({ error: "rate_limited" });
    if (!r.ok) return res.status(502).json({ error: "upstream", status: r.status });
    const d = await r.json();
    const parts = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [];
    return res.status(200).json({ text: parts.map(p => p.text || "").join("") });
  } catch (e) {
    return res.status(502).json({ error: "upstream_unreachable" });
  }
};
