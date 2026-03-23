// Vercel Serverless Function — proxies AI requests to Anthropic
// Keeps ANTHROPIC_API_KEY server-side only (never exposed to browser)

import type { VercelRequest, VercelResponse } from "@vercel/node";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not configured in environment variables."
    });
  }

  const { messages, system, model, max_tokens, temperature, stream } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const requestBody = {
    model: model || "claude-sonnet-4-5-20250514",
    max_tokens: max_tokens || 4096,
    temperature: temperature ?? 0.3,
    system: system || "",
    messages,
    stream: Boolean(stream)
  };

  try {
    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(requestBody)
    });

    if (!anthropicRes.ok) {
      const errorData = await anthropicRes.json().catch(() => ({}));
      return res.status(anthropicRes.status).json({
        error: errorData?.error?.message || `Anthropic API error: ${anthropicRes.status}`
      });
    }

    // Streaming response
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const reader = anthropicRes.body?.getReader();
      if (!reader) {
        return res.status(500).json({ error: "No response stream" });
      }

      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(decoder.decode(value, { stream: true }));
        }
      } finally {
        reader.releaseLock();
      }
      return res.end();
    }

    // Non-streaming response
    const data = await anthropicRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
}
