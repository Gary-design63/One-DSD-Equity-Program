/* ============================================================
   One DSD Equity Platform — Local Server
   Serves the static app and proxies Claude API calls.
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

// ── Claude API proxy ─────────────────────────────────────────
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

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }],
    });
    res.json({ response: message.content[0].text });
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to get response from Claude' });
  }
});

app.listen(PORT, () => {
  console.log(`\n  One DSD Equity Platform`);
  console.log(`  Local:  http://localhost:${PORT}`);
  console.log(`  Claude: ${process.env.ANTHROPIC_API_KEY ? 'API key loaded' : 'WARNING: no ANTHROPIC_API_KEY'}\n`);
});
