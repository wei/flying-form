const { onRequest } = require("firebase-functions/v2/https");

// Proxy to ai& (Kimi K2.7) — the API has no CORS, so the browser calls this
// instead. Key stays server-side. Demo scope: no auth (per PRD).
const AIAND_KEY =
  "sk-43d36d4550b5904e15ff4b204980e5aa1e9d7dd2b4cbdb2b54efabe21f4fbd17";

exports.kimi = onRequest(
  { region: "asia-northeast1", timeoutSeconds: 300, memory: "256MiB", cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "POST only" });
      return;
    }
    try {
      const upstream = await fetch("https://api.aiand.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIAND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });
      const text = await upstream.text();
      res.status(upstream.status).type("application/json").send(text);
    } catch (err) {
      res.status(502).json({ error: String(err) });
    }
  },
);
