/**
 * One DSD Equity Program — Agent Frontend Client
 * Manages WebSocket connection, chat UI, activity feed, and streaming responses.
 *
 * Configure AGENT_API_URL to point to your Hostinger VPS backend.
 * Falls back to static mode if backend is unavailable.
 */

// ── Configuration ─────────────────────────────────────────────────────────────
const AGENT_CONFIG = {
  // Change this to your Hostinger VPS IP/domain after deployment
  // e.g. 'https://your-vps-ip:3000' or 'https://agents.yourdomain.com'
  apiUrl: window.AGENT_API_URL || 'http://localhost:3000',
  wsReconnectDelay: 3000,
  maxReconnectAttempts: 5,
};

// ── Agent Display Metadata ────────────────────────────────────────────────────
const AGENT_META = {
  equity_compass:        { emoji: '🧭', color: '#003865', label: 'Equity Compass' },
  policy_navigator:      { emoji: '⚖️', color: '#1d4ed8', label: 'Policy Navigator' },
  workflow_architect:    { emoji: '🏗️', color: '#065f46', label: 'Workflow Architect' },
  metrics_intelligence:  { emoji: '📊', color: '#7c3aed', label: 'Metrics Intelligence' },
  learning_curator:      { emoji: '📚', color: '#d97706', label: 'Learning Curator' },
  risk_action_monitor:   { emoji: '🔍', color: '#dc2626', label: 'Risk & Action Monitor' },
  community_intelligence:{ emoji: '🤝', color: '#059669', label: 'Community Intelligence' },
};

const AGENT_COLORS = ['#003865','#1d4ed8','#065f46','#7c3aed','#d97706','#dc2626','#059669'];

// ── Quick Prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: 'Morning Brief', text: 'Give me a morning briefing: what risks need attention today, any overdue actions, and current workflow status.' },
  { label: 'Policy Question', text: 'What are the key ADA and MN Human Rights Act requirements that apply to our equity analysis work?' },
  { label: 'Workflow Help', text: 'Walk me through the Equity Scan workflow (WF-002). Which stage should I start with for a new request?' },
  { label: 'Metrics Report', text: 'Draft a brief performance summary of our current KPIs, highlighting what\'s on track and what needs attention.' },
  { label: 'Learning Path', text: 'Recommend a learning path for a program manager who needs to strengthen their equity analysis skills.' },
  { label: 'Risk Scan', text: 'Run a full risk scan and tell me which risks are most critical right now and their mitigation status.' },
  { label: 'Community Engagement', text: 'Help me design an accessible community engagement approach for getting input from people with cognitive disabilities.' },
  { label: 'Draft Report', text: 'Draft a quarterly equity program report summary for leadership review using our current metrics and progress.' },
];

// ── State ─────────────────────────────────────────────────────────────────────
const AGENT_STATE = {
  sessionId: localStorage.getItem('agent_session_id') || crypto.randomUUID(),
  conversationId: null,
  ws: null,
  wsReconnectCount: 0,
  isProcessing: false,
  streamBuffer: '',
  streamMsgEl: null,
  activeAgents: new Set(),
  backendAvailable: false,
  agents: [],
  conversations: [],
  insights: [],
};

// Persist session ID
localStorage.setItem('agent_session_id', AGENT_STATE.sessionId);

// ── WebSocket Connection ──────────────────────────────────────────────────────

function connectWebSocket() {
  const wsUrl = AGENT_CONFIG.apiUrl.replace(/^http/, 'ws') + `/ws?session=${AGENT_STATE.sessionId}`;

  try {
    const ws = new WebSocket(wsUrl);
    AGENT_STATE.ws = ws;

    ws.onopen = () => {
      console.log('[Agent WS] Connected');
      AGENT_STATE.wsReconnectCount = 0;
      updateConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        handleWsMessage(JSON.parse(event.data));
      } catch (e) {
        console.warn('[Agent WS] Parse error:', e);
      }
    };

    ws.onclose = () => {
      updateConnectionStatus('disconnected');
      scheduleReconnect();
    };

    ws.onerror = () => {
      updateConnectionStatus('disconnected');
    };
  } catch (e) {
    updateConnectionStatus('disconnected');
  }
}

function scheduleReconnect() {
  if (AGENT_STATE.wsReconnectCount >= AGENT_CONFIG.maxReconnectAttempts) return;
  AGENT_STATE.wsReconnectCount++;
  setTimeout(connectWebSocket, AGENT_CONFIG.wsReconnectDelay * AGENT_STATE.wsReconnectCount);
}

function handleWsMessage(msg) {
  switch (msg.type) {
    case 'connected':
      AGENT_STATE.backendAvailable = true;
      AGENT_STATE.agents = msg.agents || [];
      renderAgentTeamPanel();
      break;

    case 'token':
      appendStreamToken(msg.char);
      break;

    case 'agent_activity':
      handleAgentActivity(msg);
      break;

    case 'tool_call':
      addActivityItem({
        icon: '🔧',
        iconBg: '#fef3c7',
        text: `<strong>${msg.agent}</strong> used <strong>${msg.tool.replace(/_/g, ' ')}</strong>`
      });
      break;

    case 'response_complete':
      finalizeStreamMessage();
      break;

    case 'scheduled_monitor_complete':
      addActivityItem({
        icon: '⏰',
        iconBg: '#d1fae5',
        text: `<strong>Scheduled scan</strong> complete — Risk & Action Monitor`
      });
      loadInsights();
      break;

    case 'error':
      finalizeStreamMessage(msg.error);
      break;
  }
}

// ── Backend API ───────────────────────────────────────────────────────────────

async function checkBackendHealth() {
  try {
    const res = await fetch(`${AGENT_CONFIG.apiUrl}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      AGENT_STATE.backendAvailable = true;
      updateConnectionStatus('connected');
      // Sync app data to backend entity cache
      syncAppDataToBackend();
      return true;
    }
  } catch (e) {
    // Backend not available — will use static fallback
  }
  AGENT_STATE.backendAvailable = false;
  updateConnectionStatus('disconnected');
  return false;
}

async function syncAppDataToBackend() {
  if (!window.APP_DATA || !AGENT_STATE.backendAvailable) return;
  try {
    await fetch(`${AGENT_CONFIG.apiUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appData: window.APP_DATA })
    });
  } catch (e) {
    console.warn('[Agent] App data sync failed:', e.message);
  }
}

async function sendMessage(text) {
  if (!text.trim() || AGENT_STATE.isProcessing) return;

  setProcessing(true);

  // Render user message immediately
  appendMessage({ role: 'user', content: text });

  // Start streaming message placeholder
  const streamId = startStreamMessage();

  if (!AGENT_STATE.backendAvailable) {
    // Static fallback mode
    await staticFallbackResponse(text, streamId);
    setProcessing(false);
    return;
  }

  try {
    const res = await fetch(`${AGENT_CONFIG.apiUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        conversationId: AGENT_STATE.conversationId,
        sessionId: AGENT_STATE.sessionId,
        appData: window.APP_DATA
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Request failed');

    AGENT_STATE.conversationId = data.conversationId;

    // If WebSocket delivered the response via streaming, it's already rendered.
    // If not (WebSocket not connected), render it now.
    if (AGENT_STATE.streamBuffer === '') {
      finalizeStreamMessage(null, data.response, data.agent);
    }

    loadConversations();
    loadInsights();

  } catch (err) {
    finalizeStreamMessage(`Error: ${err.message}`);
    console.error('[Agent] Chat error:', err);
  } finally {
    setProcessing(false);
  }
}

async function loadConversations() {
  if (!AGENT_STATE.backendAvailable) return;
  try {
    const res = await fetch(`${AGENT_CONFIG.apiUrl}/api/conversations`);
    const data = await res.json();
    AGENT_STATE.conversations = data.conversations || [];
    renderConversationsPanel();
  } catch (e) { /* ignore */ }
}

async function loadInsights() {
  if (!AGENT_STATE.backendAvailable) return;
  try {
    const res = await fetch(`${AGENT_CONFIG.apiUrl}/api/insights?limit=8`);
    const data = await res.json();
    AGENT_STATE.insights = data.insights || [];
    renderInsightsPanel();
  } catch (e) { /* ignore */ }
}

async function loadConversationMessages(conversationId) {
  if (!AGENT_STATE.backendAvailable) return;
  try {
    const res = await fetch(`${AGENT_CONFIG.apiUrl}/api/conversations/${conversationId}/messages`);
    const data = await res.json();
    AGENT_STATE.conversationId = conversationId;
    renderMessageHistory(data.messages || []);
  } catch (e) { /* ignore */ }
}

// ── Streaming UI ──────────────────────────────────────────────────────────────

function startStreamMessage() {
  AGENT_STATE.streamBuffer = '';

  const messagesEl = document.getElementById('agent-messages');
  if (!messagesEl) return null;

  const agentMeta = AGENT_META.equity_compass;

  const msgEl = document.createElement('div');
  msgEl.className = 'message agent-message';
  msgEl.id = 'stream-message';
  msgEl.innerHTML = `
    <div class="message-avatar" style="background: linear-gradient(135deg, ${agentMeta.color} 0%, var(--accent) 100%)">
      ${agentMeta.emoji}
    </div>
    <div class="message-body">
      <div class="message-meta">
        <span class="agent-name-tag" id="stream-agent-name">${agentMeta.label}</span>
        <span>•</span>
        <span>thinking…</span>
      </div>
      <div class="message-bubble" id="stream-bubble">
        <span class="streaming-cursor"></span>
      </div>
    </div>
  `;

  messagesEl.appendChild(msgEl);
  scrollToBottom();
  AGENT_STATE.streamMsgEl = msgEl;
  return msgEl;
}

function appendStreamToken(char) {
  AGENT_STATE.streamBuffer += char;
  const bubble = document.getElementById('stream-bubble');
  if (!bubble) return;
  bubble.innerHTML = renderMarkdown(AGENT_STATE.streamBuffer) + '<span class="streaming-cursor"></span>';
  scrollToBottom();
}

function finalizeStreamMessage(error = null, staticContent = null, agentData = null) {
  const bubble = document.getElementById('stream-bubble');
  const agentNameEl = document.getElementById('stream-agent-name');

  if (!bubble) return;

  const content = error
    ? `<span style="color:var(--error)">⚠️ ${error}</span>`
    : renderMarkdown(AGENT_STATE.streamBuffer || staticContent || '');

  bubble.innerHTML = content;

  if (agentData && agentNameEl) {
    const meta = AGENT_META[agentData.name] || AGENT_META.equity_compass;
    agentNameEl.textContent = meta.label;
    const avatar = AGENT_STATE.streamMsgEl?.querySelector('.message-avatar');
    if (avatar) {
      avatar.style.background = `linear-gradient(135deg, ${meta.color} 0%, var(--accent) 100%)`;
      avatar.textContent = meta.emoji;
    }
  }

  // Remove the stream ID so it becomes a regular message
  const streamEl = document.getElementById('stream-message');
  if (streamEl) streamEl.removeAttribute('id');

  AGENT_STATE.streamBuffer = '';
  AGENT_STATE.streamMsgEl = null;
  clearActivityBar();
  scrollToBottom();
}

// ── Message Rendering ─────────────────────────────────────────────────────────

function appendMessage({ role, content, agentName, toolsUsed }) {
  const messagesEl = document.getElementById('agent-messages');
  if (!messagesEl) return;

  // Remove welcome screen on first message
  const welcome = document.getElementById('agent-welcome');
  if (welcome) welcome.remove();

  const isUser = role === 'user';
  const agentMeta = AGENT_META[agentName] || AGENT_META.equity_compass;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const toolsHtml = toolsUsed?.length
    ? `<div class="message-tools">${toolsUsed.map(t =>
        `<span class="tool-tag">🔧 ${t.replace(/_/g, ' ')}</span>`
      ).join('')}</div>`
    : '';

  const msgEl = document.createElement('div');
  msgEl.className = `message ${isUser ? 'user-message' : 'agent-message'}`;

  if (isUser) {
    msgEl.innerHTML = `
      <div class="message-avatar">U</div>
      <div class="message-body">
        <div class="message-meta"><span>You</span><span>•</span><span>${time}</span></div>
        <div class="message-bubble">${escapeHtml(content)}</div>
      </div>
    `;
  } else {
    msgEl.innerHTML = `
      <div class="message-avatar" style="background: linear-gradient(135deg, ${agentMeta.color} 0%, var(--accent) 100%)">
        ${agentMeta.emoji}
      </div>
      <div class="message-body">
        <div class="message-meta">
          <span class="agent-name-tag">${agentMeta.label}</span>
          <span>•</span><span>${time}</span>
        </div>
        <div class="message-bubble">${renderMarkdown(content)}</div>
        ${toolsHtml}
      </div>
    `;
  }

  messagesEl.appendChild(msgEl);
  scrollToBottom();
}

function renderMessageHistory(messages) {
  const messagesEl = document.getElementById('agent-messages');
  if (!messagesEl) return;

  messagesEl.innerHTML = '';

  for (const msg of messages) {
    if (msg.role === 'system') continue;
    appendMessage({
      role: msg.role,
      content: msg.content,
      agentName: msg.agent_name,
      toolsUsed: msg.tool_calls ? JSON.parse(msg.tool_calls).map(t => t.tool) : []
    });
  }
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

function handleAgentActivity({ agent, status, tool }) {
  const statusLabels = {
    thinking: 'thinking…',
    analyzing_policy: 'analyzing policy…',
    analyzing_workflows: 'examining workflows…',
    analyzing_metrics: 'pulling metrics…',
    curating_learning: 'curating learning assets…',
    scanning_risks_and_actions: 'scanning risks & actions…',
    synthesizing_community_intelligence: 'synthesizing community data…',
    using_tool: `using ${tool?.replace(/_/g, ' ')}…`,
    delegating: 'delegating to specialist…',
    delegation_complete: 'specialist response received',
  };

  const label = statusLabels[status] || status;
  updateActivityBar(agent, label);

  addActivityItem({
    icon: AGENT_META[agent?.toLowerCase().replace(/ /g, '_')]?.emoji || '🤖',
    iconBg: '#dbeafe',
    text: `<strong>${agent}</strong> ${label}`
  });

  AGENT_STATE.activeAgents.add(agent);
  updateAgentStatusDots();
}

function updateActivityBar(agentName, status) {
  const bar = document.getElementById('agent-activity-bar');
  if (!bar) return;
  bar.classList.add('active');
  bar.innerHTML = `
    <div class="activity-spinner"></div>
    <span class="activity-agent-name">${agentName}</span>
    <span>${status}</span>
  `;
}

function clearActivityBar() {
  const bar = document.getElementById('agent-activity-bar');
  if (!bar) return;
  bar.classList.remove('active');
  bar.innerHTML = '<span>Agents ready</span>';
  AGENT_STATE.activeAgents.clear();
  updateAgentStatusDots();
}

function addActivityItem({ icon, iconBg, text }) {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.innerHTML = `
    <div class="activity-icon" style="background:${iconBg}">${icon}</div>
    <div class="activity-text">${text}</div>
    <div class="activity-time">${time}</div>
  `;

  feed.insertBefore(item, feed.firstChild);

  // Limit feed to 30 items
  while (feed.children.length > 30) feed.removeChild(feed.lastChild);
}

function updateAgentStatusDots() {
  for (const [name] of Object.entries(AGENT_META)) {
    const dot = document.getElementById(`agent-dot-${name}`);
    if (!dot) continue;
    dot.className = 'agent-status-dot ' + (AGENT_STATE.activeAgents.has(AGENT_META[name]?.label) ? 'active' : 'idle');
  }
}

// ── Panel Rendering ───────────────────────────────────────────────────────────

function renderAgentTeamPanel() {
  const list = document.getElementById('agent-team-list');
  if (!list) return;

  const agentEntries = Object.entries(AGENT_META);
  list.innerHTML = agentEntries.map(([name, meta], i) => `
    <div class="agent-team-card" onclick="window.AGENT.directPrompt('${name}')">
      <div class="agent-team-avatar" style="background: ${AGENT_COLORS[i % AGENT_COLORS.length]}; color: white">
        ${meta.emoji}
      </div>
      <div class="agent-team-info">
        <div class="agent-team-name">${meta.label}</div>
        <div class="agent-team-status" id="agent-status-text-${name}">Ready</div>
      </div>
      <div class="agent-status-dot idle" id="agent-dot-${name}"></div>
    </div>
  `).join('');
}

function renderConversationsPanel() {
  const list = document.getElementById('conversations-list');
  if (!list) return;

  if (!AGENT_STATE.conversations.length) {
    list.innerHTML = '<div style="padding:12px;font-size:11px;color:var(--muted);text-align:center">No conversations yet</div>';
    return;
  }

  list.innerHTML = AGENT_STATE.conversations.map(c => {
    const date = c.last_message_at
      ? new Date(c.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
      : '';
    const isActive = c.id === AGENT_STATE.conversationId;
    return `
      <div class="conversation-item ${isActive ? 'active' : ''}" onclick="window.AGENT.loadConversation('${c.id}')">
        <div class="conversation-title">${escapeHtml(c.title || 'Untitled')}</div>
        <div class="conversation-meta">${date}</div>
      </div>
    `;
  }).join('');
}

function renderInsightsPanel() {
  const list = document.getElementById('insights-list');
  if (!list) return;

  if (!AGENT_STATE.insights.length) {
    list.innerHTML = '<div style="padding:12px;font-size:11px;color:var(--muted);text-align:center">No insights yet</div>';
    return;
  }

  list.innerHTML = AGENT_STATE.insights.map(i => {
    const meta = AGENT_META[i.agent_name] || { label: i.agent_name };
    return `
      <div class="insight-item" onclick="window.AGENT.expandInsight('${i.id}')">
        <div class="insight-type-badge ${i.insight_type}">${i.insight_type.replace('_', ' ')}</div>
        <div class="insight-title">${escapeHtml(i.title)}</div>
        <div class="insight-agent">${meta.emoji || '🤖'} ${meta.label}</div>
      </div>
    `;
  }).join('');
}

// ── Connection Status ─────────────────────────────────────────────────────────

function updateConnectionStatus(status) {
  const banner = document.getElementById('connection-banner');
  if (!banner) return;

  const configs = {
    connected:    { cls: 'connected',    icon: '●', text: 'AI Agents connected' },
    disconnected: { cls: 'disconnected', icon: '○', text: 'Backend offline — static mode' },
    connecting:   { cls: 'connecting',   icon: '◌', text: 'Connecting to agents…' },
  };

  const cfg = configs[status] || configs.disconnected;
  banner.className = `connection-banner ${cfg.cls}`;
  banner.innerHTML = `<span>${cfg.icon}</span><span>${cfg.text}</span>`;
}

// ── Static Fallback ───────────────────────────────────────────────────────────
// When backend is unavailable, use the existing app.js static assistant logic

async function staticFallbackResponse(text, streamMsgEl) {
  const lower = text.toLowerCase();
  let response = '';

  if (lower.includes('workflow') || lower.includes('process')) {
    const workflows = window.APP_DATA?.workflows || [];
    response = `**Workflow Guidance** *(static mode — connect backend for full AI responses)*\n\n`;
    response += workflows.slice(0, 3).map(w => `**${w.id}: ${w.title}**\n${w.description || ''}`).join('\n\n');
  } else if (lower.includes('policy') || lower.includes('law') || lower.includes('compliance')) {
    const docs = (window.APP_DATA?.documents || []).filter(d => d.authorityRank <= 3).slice(0, 4);
    response = `**Policy Documents** *(static mode)*\n\n`;
    response += docs.map(d => `**${d.title}**\nAuthority: ${d.authorityType} (Rank ${d.authorityRank})\n${d.purpose || ''}`).join('\n\n');
  } else if (lower.includes('metric') || lower.includes('kpi') || lower.includes('performance')) {
    const kpis = (window.APP_DATA?.kpis || []).slice(0, 5);
    response = `**Metrics Summary** *(static mode)*\n\n`;
    response += kpis.map(k => `**${k.name}**: ${k.currentValue} / ${k.target} (${k.trend})`).join('\n');
  } else if (lower.includes('risk')) {
    const risks = (window.APP_DATA?.risks || []).filter(r => r.severity === 'High' || r.severity === 'Critical');
    response = `**Risk Summary** *(static mode)*\n\n`;
    response += risks.map(r => `**${r.title}** — ${r.severity}\n${r.mitigationPlan || 'No mitigation plan documented.'}`).join('\n\n');
  } else {
    response = `**AI Agent System** *(static mode — backend not connected)*\n\nTo enable full multi-agent AI responses, deploy the backend to a Hostinger VPS and set \`window.AGENT_API_URL\`.\n\nIn static mode, I can help with:\n- Workflow guidance\n- Policy document lookup\n- Metrics overview\n- Risk summary\n\nTry asking about any of these topics.`;
  }

  // Simulate streaming
  for (const char of response) {
    AGENT_STATE.streamBuffer += char;
    const bubble = document.getElementById('stream-bubble');
    if (bubble) bubble.innerHTML = renderMarkdown(AGENT_STATE.streamBuffer) + '<span class="streaming-cursor"></span>';
    await new Promise(r => setTimeout(r, 5));
  }

  finalizeStreamMessage();
}

// ── Main Render — Called by app.js ────────────────────────────────────────────

function renderAssistantPage(el) {
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">AI Agent Team</h1>
      <p class="page-subtitle">Your equity operations team, powered by specialized AI agents</p>
    </div>

    <div id="connection-banner" class="connection-banner connecting">
      <span>◌</span><span>Connecting to agents…</span>
    </div>

    <div class="agent-page">

      <!-- Chat Panel -->
      <div class="agent-chat">
        <div class="agent-chat-header">
          <div class="agent-badge">
            <span class="pulse-dot"></span>
            Equity Compass + 6 Specialists
          </div>
          <button class="btn btn-ghost" onclick="window.AGENT.newConversation()" title="New conversation" style="margin-left:auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>

        <div id="agent-messages" class="agent-messages">
          <div id="agent-welcome" class="agent-welcome">
            <div class="agent-welcome-logo">🧭</div>
            <h2>Equity Agent Team</h2>
            <p>Your AI-powered DEIA operations team. Ask anything about policies, workflows, metrics, learning, risks, or community engagement.</p>
            <div class="quick-prompts">
              ${QUICK_PROMPTS.slice(0, 6).map(p => `
                <button class="quick-prompt-btn" onclick="window.AGENT.usePrompt(${JSON.stringify(p.text)})">
                  <span class="quick-prompt-label">${p.label}</span>
                  ${p.text.slice(0, 55)}…
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div id="agent-activity-bar" class="agent-activity-bar">
          <span>Agents ready</span>
        </div>

        <div class="agent-input-area">
          <div class="agent-input-row">
            <textarea
              id="agent-input"
              class="agent-textarea"
              placeholder="Ask your equity agent team anything…"
              rows="1"
              onkeydown="window.AGENT.handleKeydown(event)"
              oninput="window.AGENT.autoResize(this)"
            ></textarea>
            <button id="agent-send" class="agent-send-btn" onclick="window.AGENT.submitMessage()" title="Send">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
          <div class="agent-input-hints">
            ${QUICK_PROMPTS.slice(0, 4).map(p =>
              `<span class="hint-chip" onclick="window.AGENT.usePrompt(${JSON.stringify(p.text)})">${p.label}</span>`
            ).join('')}
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="agent-sidebar">

        <!-- Agent Team -->
        <div class="agent-panel">
          <div class="agent-panel-header">Agent Team</div>
          <div class="agent-team-list" id="agent-team-list"></div>
        </div>

        <!-- Live Activity Feed -->
        <div class="agent-panel">
          <div class="agent-panel-header">Live Activity</div>
          <div class="activity-feed" id="activity-feed">
            <div class="activity-item">
              <div class="activity-icon" style="background:#d1fae5">🟢</div>
              <div class="activity-text">System initialized</div>
              <div class="activity-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>

        <!-- Agent Insights -->
        <div class="agent-panel">
          <div class="agent-panel-header">Insights</div>
          <div class="insights-list" id="insights-list">
            <div style="padding:12px;font-size:11px;color:var(--muted);text-align:center">
              Insights appear here as agents analyze your program
            </div>
          </div>
        </div>

        <!-- Conversation History -->
        <div class="agent-panel">
          <div class="agent-panel-header">History</div>
          <div class="conversations-list" id="conversations-list">
            <div style="padding:12px;font-size:11px;color:var(--muted);text-align:center">No history yet</div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Initialize
  renderAgentTeamPanel();
  checkBackendHealth().then(available => {
    if (available) {
      connectWebSocket();
      loadConversations();
      loadInsights();
    }
  });
}

// ── Utility Functions ─────────────────────────────────────────────────────────

function setProcessing(processing) {
  AGENT_STATE.isProcessing = processing;
  const sendBtn = document.getElementById('agent-send');
  const input = document.getElementById('agent-input');
  if (sendBtn) sendBtn.disabled = processing;
  if (input) input.disabled = processing;
}

function scrollToBottom() {
  const el = document.getElementById('agent-messages');
  if (el) el.scrollTop = el.scrollHeight;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Lightweight markdown renderer (bold, italic, headers, lists, code, tables)
function renderMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  // Code blocks (before other processing)
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
    `<pre><code>${code.trim()}</code></pre>`);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr>');

  // Line breaks / paragraphs (double newline = paragraph, single = br)
  html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs and wrap lists properly
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<[uh][1-6lo])/g, '$1');
  html = html.replace(/(<\/[uh][1-6lo]>)<\/p>/g, '$1');

  return html;
}

// ── Public API ────────────────────────────────────────────────────────────────

window.AGENT = {
  init: renderAssistantPage,

  submitMessage() {
    const input = document.getElementById('agent-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    this.autoResize(input);
    sendMessage(text);
  },

  handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.submitMessage();
    }
  },

  autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  },

  usePrompt(text) {
    const input = document.getElementById('agent-input');
    if (input) {
      input.value = text;
      input.focus();
      this.autoResize(input);
    }
  },

  directPrompt(agentName) {
    const meta = AGENT_META[agentName];
    if (!meta) return;
    const prompts = {
      policy_navigator: 'What are the most critical equity policies and laws that govern our work?',
      workflow_architect: 'What workflows are currently active and what are the next steps for each?',
      metrics_intelligence: 'Give me a full metrics performance summary with your analysis.',
      learning_curator: 'What are the most critical learning needs for our staff right now?',
      risk_action_monitor: 'Run a full risk and action scan and give me your assessment.',
      community_intelligence: 'Brief me on community engagement priorities and any pending stakeholder considerations.',
    };
    const prompt = prompts[agentName] || `Tell me about your role in the equity program.`;
    this.usePrompt(prompt);
  },

  newConversation() {
    AGENT_STATE.conversationId = null;
    const messagesEl = document.getElementById('agent-messages');
    if (messagesEl) {
      messagesEl.innerHTML = `
        <div id="agent-welcome" class="agent-welcome">
          <div class="agent-welcome-logo">🧭</div>
          <h2>New Conversation</h2>
          <p>What equity challenge can the team help with?</p>
        </div>
      `;
    }
    renderConversationsPanel();
    document.getElementById('agent-input')?.focus();
  },

  loadConversation(id) {
    loadConversationMessages(id);
    renderConversationsPanel();
  },

  expandInsight(id) {
    const insight = AGENT_STATE.insights.find(i => i.id === id);
    if (!insight) return;
    if (window.CRUD?.openModal) {
      window.CRUD.openModal(insight.title, `
        <div style="line-height:1.7;font-size:var(--text-sm)">
          <div class="insight-type-badge ${insight.insight_type}" style="margin-bottom:12px">
            ${insight.insight_type.replace('_', ' ')}
          </div>
          <div>${renderMarkdown(insight.content)}</div>
          <div style="margin-top:16px;font-size:var(--text-xs);color:var(--muted)">
            Source: ${AGENT_META[insight.agent_name]?.label || insight.agent_name} •
            ${new Date(insight.created_at).toLocaleString()}
          </div>
        </div>
      `, '');
    } else {
      alert(`${insight.title}\n\n${insight.content}`);
    }
  }
};
