/**
 * One DSD Equity Program — Agent Backend Server
 * Express + WebSocket server powering the multi-agent AI system.
 *
 * Deploy this on a Hostinger KVM VPS (or any Node.js host).
 * Frontend on GitHub Pages connects to this server for all agent interactions.
 */

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import cron from 'node-cron';

import { initializeAgents, getCoordinator, getAgent, getAgentManifest, suggestRoute } from './agents/index.js';
import { queries, syncEntityCache, audit, getAgentMemory, setAgentMemory } from './db/index.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Parse CORS origins from env
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8080')
  .split(',').map(o => o.trim());

// ── Express Setup ─────────────────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

app.use(express.json({ limit: '2mb' }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin not allowed — ${origin}`));
    }
  },
  credentials: true
}));

// ── WebSocket Setup ───────────────────────────────────────────────────────────

const wss = new WebSocketServer({ server: httpServer });
const clients = new Map(); // sessionId → ws

wss.on('connection', (ws, req) => {
  const sessionId = new URL(req.url, 'http://localhost').searchParams.get('session') || crypto.randomUUID();
  clients.set(sessionId, ws);
  console.log(`[WS] Client connected: ${sessionId}`);

  ws.on('close', () => {
    clients.delete(sessionId);
    console.log(`[WS] Client disconnected: ${sessionId}`);
  });

  ws.send(JSON.stringify({ type: 'connected', sessionId, agents: getAgentManifest() }));
});

function broadcastToSession(sessionId, payload) {
  const ws = clients.get(sessionId);
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcastToAll(payload) {
  for (const [, ws] of clients) {
    if (ws.readyState === 1) ws.send(JSON.stringify(payload));
  }
}

// ── Agent Initialization ──────────────────────────────────────────────────────

const { coordinator, agents } = initializeAgents();

// ── API Routes ────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agents: getAgentManifest().map(a => a.name),
    timestamp: new Date().toISOString()
  });
});

// List available agents
app.get('/api/agents', (req, res) => {
  res.json({ agents: getAgentManifest() });
});

// ── Chat Endpoint ─────────────────────────────────────────────────────────────
// POST /api/chat — Send a message, get an agent response
app.post('/api/chat', async (req, res) => {
  const { message, conversationId, sessionId, appData } = req.body;

  if (!message) return res.status(400).json({ error: 'message is required' });

  // Sync latest app data to entity cache if provided
  if (appData) {
    try { syncEntityCache(appData); } catch (e) { console.warn('[Cache sync error]', e.message); }
  }

  // Ensure conversation exists
  let convId = conversationId;
  if (!convId) {
    convId = crypto.randomUUID();
    queries.createConversation.run(convId, message.slice(0, 80), '{}');
  } else {
    const existing = queries.getConversation.get(convId);
    if (!existing) queries.createConversation.run(convId, message.slice(0, 80), '{}');
  }

  // Store the user message
  const userMsgId = crypto.randomUUID();
  queries.addMessage.run(userMsgId, convId, 'user', null, message, null, null, 0);

  // Retrieve conversation history for context
  const contextCount = parseInt(process.env.CONTEXT_WINDOW_MESSAGES) || 20;
  const history = queries.getMessages.all(convId);
  const recentHistory = history.slice(-contextCount);

  const messages = recentHistory.map(m => ({
    role: m.role === 'agent' ? 'assistant' : m.role,
    content: m.content
  }));

  // Determine routing
  const routing = suggestRoute(message);
  const activeAgent = routing.route === 'direct' && routing.agent
    ? getAgent(routing.agent)
    : coordinator;

  console.log(`[Chat] Routing to: ${activeAgent.displayName} (${routing.route})`);

  audit(activeAgent.name, 'chat_message', null, null, { routing, conversationId: convId });

  // Activity callbacks that push over WebSocket
  const onAgentActivity = (activity) => {
    broadcastToSession(sessionId, { type: 'agent_activity', ...activity, conversationId: convId });
  };

  const tokens = [];
  const onToken = (char) => {
    tokens.push(char);
    broadcastToSession(sessionId, { type: 'token', char, conversationId: convId });
  };

  const onToolCall = (tc) => {
    broadcastToSession(sessionId, {
      type: 'tool_call',
      tool: tc.tool,
      agent: activeAgent.displayName,
      conversationId: convId
    });
  };

  try {
    const result = await activeAgent.process({ messages, conversationId: convId, onToken, onToolCall, onAgentActivity });

    // Store agent response
    const agentMsgId = crypto.randomUUID();
    queries.addMessage.run(
      agentMsgId, convId, 'agent', activeAgent.name,
      result.response,
      result.toolCalls ? JSON.stringify(result.toolCalls.map(t => ({ tool: t.tool, input: t.input }))) : null,
      result.toolCalls ? JSON.stringify(result.toolCalls.map(t => t.result)) : null,
      result.tokensUsed || 0
    );

    // Update conversation title if it's the first real exchange
    if (history.length <= 1) {
      const title = message.slice(0, 60) + (message.length > 60 ? '…' : '');
      queries.updateConversationTitle.run(title, convId);
    }

    // Signal completion over WebSocket
    broadcastToSession(sessionId, { type: 'response_complete', conversationId: convId, agent: activeAgent.name });

    res.json({
      conversationId: convId,
      messageId: agentMsgId,
      agent: { name: activeAgent.name, displayName: activeAgent.displayName },
      response: result.response,
      toolsUsed: result.toolCalls?.map(t => t.tool) || [],
      routing
    });

  } catch (err) {
    console.error(`[Chat Error]`, err);
    broadcastToSession(sessionId, { type: 'error', error: err.message, conversationId: convId });
    res.status(500).json({ error: 'Agent processing failed', detail: err.message });
  }
});

// ── Conversation History ──────────────────────────────────────────────────────
app.get('/api/conversations', (req, res) => {
  const conversations = queries.listConversations.all(50);
  res.json({ conversations });
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const messages = queries.getMessages.all(req.params.id);
  res.json({ messages });
});

// ── Tasks ─────────────────────────────────────────────────────────────────────
app.get('/api/tasks', (req, res) => {
  const tasks = queries.listRecentTasks.all(50);
  res.json({ tasks });
});

app.post('/api/tasks', async (req, res) => {
  const { type = 'triggered', agentName, title, description, priority = 5, scheduledFor, context = {} } = req.body;
  if (!agentName || !title) return res.status(400).json({ error: 'agentName and title required' });

  const taskId = crypto.randomUUID();
  queries.createTask.run(taskId, type, agentName, title, description || null, priority, scheduledFor || null, JSON.stringify(context));

  res.json({ taskId, status: 'created' });
});

// ── Insights ──────────────────────────────────────────────────────────────────
app.get('/api/insights', (req, res) => {
  const { type, limit = 20 } = req.query;
  const insights = type
    ? queries.getInsightsByType.all(type, parseInt(limit))
    : queries.getActiveInsights.all(parseInt(limit));

  res.json({ insights: insights.map(i => ({ ...i, related_entities: JSON.parse(i.related_entities || '[]') })) });
});

// ── Audit Log ─────────────────────────────────────────────────────────────────
app.get('/api/audit', (req, res) => {
  const { limit = 50 } = req.query;
  const log = queries.getAuditLog.all(parseInt(limit));
  res.json({ log });
});

// ── App Data Sync ─────────────────────────────────────────────────────────────
// Frontend calls this on startup to populate the entity cache
app.post('/api/sync', (req, res) => {
  const { appData } = req.body;
  if (!appData) return res.status(400).json({ error: 'appData required' });
  try {
    syncEntityCache(appData);
    res.json({ success: true, message: 'App data synchronized to agent cache' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Direct Agent Endpoint ─────────────────────────────────────────────────────
// Call a specific agent directly (bypasses coordinator routing)
app.post('/api/agents/:agentName/run', async (req, res) => {
  const { agentName } = req.params;
  const { message, context = {} } = req.body;

  const agent = agentName === 'equity_compass' ? coordinator : getAgent(agentName);
  if (!agent) return res.status(404).json({ error: `Agent not found: ${agentName}` });

  try {
    const result = await agent.process({
      messages: [{ role: 'user', content: message }]
    });
    res.json({ agent: agentName, response: result.response, toolsUsed: result.toolCalls?.map(t => t.tool) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Agent Memory ──────────────────────────────────────────────────────────────

app.get('/api/agent-memory/:agentName', (req, res) => {
  const memory = getAgentMemory(req.params.agentName);
  res.json({ agentName: req.params.agentName, memory });
});

app.put('/api/agent-memory/:agentName', (req, res) => {
  const { memoryType, content } = req.body;
  if (!memoryType || content === undefined) return res.status(400).json({ error: 'memoryType and content required' });
  setAgentMemory(req.params.agentName, memoryType, content);
  res.json({ success: true });
});

// ── Learning Completions ───────────────────────────────────────────────────────

app.get('/api/learning/completions', (req, res) => {
  const { assetId, userId } = req.query;
  if (assetId) {
    return res.json({ completions: queries.getCompletionsByAsset.all(assetId) });
  }
  if (userId) {
    return res.json({ completions: queries.getCompletionsByUser.all(userId) });
  }
  const completions = queries.getAllCompletions.all(200);
  const summary = queries.getCompletionSummary.all();
  res.json({ completions, summary });
});

app.post('/api/learning/completions', (req, res) => {
  const { assetId, userId, userName, notes } = req.body;
  if (!assetId || !userId) return res.status(400).json({ error: 'assetId and userId required' });
  const id = crypto.randomUUID();
  queries.addCompletion.run(id, assetId, userId, userName || userId, notes || null);
  audit(null, 'learning_completion', 'learning', assetId, { userId, userName });
  res.json({ id, success: true });
});

app.delete('/api/learning/completions/:id', (req, res) => {
  queries.deleteCompletion.run(req.params.id);
  res.json({ success: true });
});

// ── Document Versions ─────────────────────────────────────────────────────────

app.get('/api/documents/:id/versions', (req, res) => {
  const versions = queries.getDocumentVersions.all(req.params.id);
  res.json({ documentId: req.params.id, versions });
});

app.get('/api/documents/:id/versions/:versionId', (req, res) => {
  const version = queries.getDocumentVersion.get(req.params.versionId);
  if (!version) return res.status(404).json({ error: 'Version not found' });
  res.json({ ...version, content_snapshot: JSON.parse(version.content_snapshot) });
});

app.post('/api/documents/:id/versions', (req, res) => {
  const { version, contentSnapshot, changedBy, changeNote } = req.body;
  if (!version || !contentSnapshot) return res.status(400).json({ error: 'version and contentSnapshot required' });
  const id = crypto.randomUUID();
  queries.addDocumentVersion.run(id, req.params.id, version, JSON.stringify(contentSnapshot), changedBy || null, changeNote || null);
  audit(null, 'document_version_saved', 'document', req.params.id, { version, changedBy });
  res.json({ id, success: true });
});

// ── Report Generation ─────────────────────────────────────────────────────────

app.post('/api/reports/generate', async (req, res) => {
  const { period, audience = 'leadership', sessionId } = req.body;

  const reportAgent = getAgent('metrics_intelligence');
  if (!reportAgent) return res.status(503).json({ error: 'Metrics Intelligence agent not available' });

  const prompt = `Generate a comprehensive ${audience}-level quarterly equity program report${period ? ` for ${period}` : ''}.

Use generate_report_section to build each of these sections in order:
1. metrics_performance — Full KPI performance narrative
2. workflow_status — Active and completed workflows summary
3. risk_actions — Risk registry and action item status
4. learning_progress — Staff learning completion overview

Then synthesize all sections into a cohesive, well-formatted markdown report with:
- Executive summary paragraph
- Each section with headers
- Key findings and trends called out
- Top 3 recommendations for the next period

Format for ${audience} audience.`;

  const onAgentActivity = (activity) => {
    if (sessionId) broadcastToSession(sessionId, { type: 'agent_activity', ...activity });
  };

  try {
    const result = await reportAgent.process({
      messages: [{ role: 'user', content: prompt }],
      onAgentActivity
    });

    if (sessionId) broadcastToSession(sessionId, { type: 'response_complete', agent: 'metrics_intelligence' });

    res.json({
      report: result.response,
      period: period || `Q${Math.ceil((new Date().getMonth() + 1) / 3)} FY${new Date().getFullYear()}`,
      audience,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Scheduled Jobs ────────────────────────────────────────────────────────────

const monitorCron = process.env.MONITOR_CRON || '0 8 * * 1-5'; // Weekdays at 8am

cron.schedule(monitorCron, async () => {
  console.log(`[Cron] Running scheduled risk & action monitor scan`);
  const riskAgent = getAgent('risk_action_monitor');
  if (!riskAgent) return;

  try {
    const result = await riskAgent.runScheduledMonitor((activity) => {
      broadcastToAll({ type: 'scheduled_activity', ...activity });
    });

    broadcastToAll({
      type: 'scheduled_monitor_complete',
      agent: 'risk_action_monitor',
      summary: result.response?.slice(0, 200) + '…',
      timestamp: new Date().toISOString()
    });

    console.log(`[Cron] Monitor scan complete`);
  } catch (err) {
    console.error(`[Cron] Monitor scan failed:`, err.message);
  }
});

// ── Start Server ──────────────────────────────────────────────────────────────

httpServer.listen(PORT, HOST, () => {
  console.log(`\n╔══════════════════════════════════════════════════════════╗`);
  console.log(`║  One DSD Equity Program — Agent Backend                  ║`);
  console.log(`║  Listening on ${HOST}:${PORT}                                 ║`);
  console.log(`║  Agents: Equity Compass + 6 Specialists                  ║`);
  console.log(`╚══════════════════════════════════════════════════════════╝\n`);
});
