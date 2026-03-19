/* ============================================================
   One DSD Equity Platform — Local Server
   Serves the static app and proxies Claude API calls via SSE streaming.
   ============================================================ */
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '100kb' }));

// Serve static assets from public/
app.use(express.static(join(__dirname, 'public')));

// Serve the main HTML shell
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// ── Claude API proxy — SSE streaming ────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/claude', async (req, res) => {
  const { query, mode, context } = req.body || {};

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'query is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not set. Add it to your .env file and restart the server.',
    });
  }

  const modeLabels = {
    policy: 'Policy Lookup',
    workflow: 'Workflow Guidance',
    learning: 'Learning Recommendations',
  };

  const systemPrompt = `You are the Equity Assistant for the One DSD Equity Program at Minnesota DHS Disability Services Division. You help staff navigate equity policies, workflows, and learning resources.

Current mode: ${modeLabels[mode] || 'General'}

${context ? `Program knowledge base:\n${context}\n` : ''}Guidelines:
- Be clear, concise, and actionable
- Reference specific document names, workflow names, or learning asset titles when relevant
- Focus on practical guidance for DSD staff doing equity work
- Keep responses under 300 words unless detail is genuinely necessary`;

  // SSE headers — stream response back to browser
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 64000,
      thinking: { type: 'adaptive' },
      system: systemPrompt,
      messages: [{ role: 'user', content: query }],
    });

    // Only forward text deltas — thinking blocks are intentionally skipped
    stream.on('text', (delta) => send({ text: delta }));

    await stream.finalMessage();
    res.write('data: [DONE]\n\n');
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      send({ error: 'Invalid API key. Check ANTHROPIC_API_KEY in your .env file.' });
    } else if (err instanceof Anthropic.RateLimitError) {
      send({ error: 'Rate limited — please wait a moment and try again.' });
    } else if (err instanceof Anthropic.APIError) {
      send({ error: `API error ${err.status}: ${err.message}` });
    } else {
      send({ error: 'Unexpected server error. Check the terminal for details.' });
      console.error('Unexpected error:', err);
    }
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`\n  One DSD Equity Platform`);
  console.log(`  Local:  http://localhost:${PORT}`);
  console.log(`  Claude: ${process.env.ANTHROPIC_API_KEY ? 'API key loaded ✓' : 'WARNING — ANTHROPIC_API_KEY not set'}\n`);
});
