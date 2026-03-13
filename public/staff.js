/**
 * One DSD Equity Program — Staff Portal
 * Simplified agent interface for 150 DSD staff members.
 * Role-aware, non-admin, focused on equity support and information.
 */

(function () {
  'use strict';

  const API_URL = window.STAFF_API_URL || window.AGENT_API_URL || 'http://localhost:3000';

  // ── State ────────────────────────────────────────────────────────────────────

  let ws = null;
  let sessionId = localStorage.getItem('staff_session_id') || crypto.randomUUID();
  let conversationId = null;
  let isStreaming = false;
  let currentStreamEl = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT = 5;

  localStorage.setItem('staff_session_id', sessionId);

  // ── DOM Refs ─────────────────────────────────────────────────────────────────

  const chatEl = document.getElementById('staff-chat');
  const inputEl = document.getElementById('staff-input');
  const sendBtn = document.getElementById('staff-send-btn');
  const typingEl = document.getElementById('staff-typing');
  const statusText = document.getElementById('staff-status-text');
  const statusDot = document.querySelector('.staff-status__dot');
  const welcomeEl = document.getElementById('staff-welcome');
  const topicsEl = document.getElementById('staff-topics');
  const newChatBtn = document.getElementById('staff-new-chat');
  const themeToggle = document.getElementById('theme-toggle');

  // ── Theme ────────────────────────────────────────────────────────────────────

  const html = document.documentElement;
  let theme = localStorage.getItem('staff_theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  html.setAttribute('data-theme', theme);

  themeToggle?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', theme);
    localStorage.setItem('staff_theme', theme);
    themeToggle.innerHTML = theme === 'dark'
      ? '<i data-lucide="sun" style="width:18px;height:18px"></i>'
      : '<i data-lucide="moon" style="width:18px;height:18px"></i>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });

  // ── WebSocket ─────────────────────────────────────────────────────────────────

  function connectWS() {
    const wsUrl = API_URL.replace(/^http/, 'ws') + `/ws?session=${sessionId}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      reconnectAttempts = 0;
      setStatus('connected', 'AI assistant ready');
      sendBtn.disabled = false;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleWSMessage(msg);
      } catch (_) {}
    };

    ws.onclose = () => {
      setStatus('disconnected', 'Reconnecting…');
      sendBtn.disabled = true;
      if (reconnectAttempts < MAX_RECONNECT) {
        reconnectAttempts++;
        setTimeout(connectWS, Math.min(1000 * 2 ** reconnectAttempts, 30000));
      } else {
        setStatus('offline', 'Offline — using local responses');
        sendBtn.disabled = false; // Allow fallback
      }
    };

    ws.onerror = () => { ws.close(); };
  }

  function handleWSMessage(msg) {
    switch (msg.type) {
      case 'connected':
        setStatus('connected', 'AI assistant ready');
        break;
      case 'token':
        if (isStreaming && currentStreamEl) {
          appendToken(msg.char);
        }
        break;
      case 'response_complete':
        finalizeStream();
        break;
      case 'error':
        finalizeStream();
        appendSystemMessage('I encountered an issue. Please try again.', 'error');
        break;
    }
  }

  // ── Status ────────────────────────────────────────────────────────────────────

  function setStatus(state, text) {
    statusText.textContent = text;
    statusDot.className = `staff-status__dot staff-status__dot--${state}`;
  }

  // ── Message Sending ───────────────────────────────────────────────────────────

  async function sendMessage(text) {
    if (!text.trim() || isStreaming) return;

    // Hide welcome/topics on first message
    if (welcomeEl) welcomeEl.style.display = 'none';
    if (topicsEl) topicsEl.style.display = 'none';

    appendUserMessage(text);
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    showTyping(true);

    // Try backend first
    const online = ws && ws.readyState === WebSocket.OPEN;

    if (online) {
      isStreaming = true;
      currentStreamEl = startAgentMessage();

      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `[STAFF PORTAL] ${text}`,
            conversationId,
            sessionId,
            appData: window.APP_DATA || null
          })
        });
        const data = await response.json();
        conversationId = data.conversationId;

        // Response is already streamed via WebSocket; HTTP response confirms routing
        showTyping(false);
      } catch (err) {
        isStreaming = false;
        showTyping(false);
        finalizeStream();
        useFallback(text);
      }
    } else {
      // Offline fallback
      showTyping(false);
      useFallback(text);
    }
  }

  // ── Streaming ─────────────────────────────────────────────────────────────────

  function startAgentMessage() {
    showTyping(false);
    const el = document.createElement('div');
    el.className = 'staff-msg staff-msg--agent';
    el.innerHTML = `
      <div class="staff-msg__avatar">🧭</div>
      <div class="staff-msg__body">
        <div class="staff-msg__content" id="stream-content"></div>
        <span class="staff-msg__cursor" id="stream-cursor">▊</span>
      </div>`;
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
    return el;
  }

  let streamBuffer = '';

  function appendToken(char) {
    streamBuffer += char;
    const contentEl = currentStreamEl?.querySelector('#stream-content');
    if (contentEl) {
      contentEl.innerHTML = renderMarkdown(streamBuffer);
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  function finalizeStream() {
    isStreaming = false;
    if (currentStreamEl) {
      const cursor = currentStreamEl.querySelector('#stream-cursor');
      if (cursor) cursor.remove();
      const contentEl = currentStreamEl.querySelector('#stream-content');
      if (contentEl && streamBuffer) {
        contentEl.innerHTML = renderMarkdown(streamBuffer);
      }
      currentStreamEl = null;
    }
    streamBuffer = '';
    sendBtn.disabled = false;
    chatEl.scrollTop = chatEl.scrollHeight;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Static Fallback ───────────────────────────────────────────────────────────

  function useFallback(query) {
    const q = query.toLowerCase();
    let response = '';

    if (!window.APP_DATA) {
      response = 'I\'m not able to connect to the AI backend right now. Please try again in a moment, or contact the Equity and Inclusion Operations Consultant directly for support.';
    } else {
      const D = window.APP_DATA;

      if (q.includes('right') || q.includes('accommodat') || q.includes('ada') || q.includes('disability')) {
        const docs = D.documents.filter(d =>
          d.batch === 'Accessibility and Language Access' || d.authorityRank <= 2
        ).slice(0, 4);
        response = `**Your Rights and Accommodations**\n\nAs a DSD staff member, you are protected by several key laws and policies:\n\n${docs.map(d => `• **${d.shortTitle || d.title}** — ${d.purpose}`).join('\n')}\n\nFor accommodation requests, contact your supervisor or HR. The Equity and Inclusion Operations Consultant can also provide guidance.`;

      } else if (q.includes('training') || q.includes('learning') || q.includes('course')) {
        const required = D.learningAssets.filter(a => a.requiredOrOptional === 'Required').slice(0, 5);
        response = `**Training & Learning Resources**\n\n**Required Training:**\n${required.map(a => `• **${a.title}** (${a.estimatedDuration || 'Self-paced'}) — ${a.description.slice(0, 100)}`).join('\n')}\n\nFor the full learning catalog, ask the Equity and Inclusion Operations Consultant.`;

      } else if (q.includes('concern') || q.includes('report') || q.includes('bias') || q.includes('discriminat')) {
        response = `**Raising an Equity Concern**\n\nYou have several options for raising equity concerns at DSD:\n\n1. **Speak with the Equity and Inclusion Operations Consultant** — your primary resource for equity support\n2. **Contact your supervisor** — for workplace concerns\n3. **HR Business Partner** — for formal complaints\n4. **MNDHR (Minnesota Department of Human Rights)** — for civil rights complaints\n5. **ADA Coordinator** — for disability-related concerns\n\nAll concerns can be raised confidentially. You are protected from retaliation for raising equity concerns in good faith.`;

      } else if (q.includes('accessibility') || q.includes('language access') || q.includes('interpreter')) {
        const docs = D.documents.filter(d => d.batch === 'Accessibility and Language Access').slice(0, 4);
        response = `**Accessibility & Language Access Resources**\n\n${docs.map(d => `• **${d.shortTitle || d.title}** — ${d.purpose}`).join('\n')}\n\nFor language interpretation services or accessibility accommodations for clients, contact the Equity and Inclusion Operations Consultant.`;

      } else if (q.includes('polic') || q.includes('framework') || q.includes('law') || q.includes('regulation')) {
        const policies = D.documents.filter(d => d.authorityRank <= 3).slice(0, 5);
        response = `**Equity Policies & Frameworks**\n\nThe following governing sources shape our equity work at DSD:\n\n${policies.map(d => `• **${d.shortTitle || d.title}** (Authority Rank ${d.authorityRank}) — ${d.purpose}`).join('\n')}`;

      } else {
        response = `I can help you with:\n\n• **Rights & Accommodations** — disability rights, ADA, workplace accommodations\n• **Training & Learning** — required and optional equity training\n• **Raising a Concern** — how to report equity issues safely\n• **Accessibility Resources** — language access, physical accessibility\n• **Equity Policies** — the frameworks governing our work\n• **Supporting People We Serve** — resources for community members\n\nTry asking a more specific question, or select one of the topic buttons above.`;
      }
    }

    // Simulate streaming for fallback
    const el = document.createElement('div');
    el.className = 'staff-msg staff-msg--agent';
    el.innerHTML = `
      <div class="staff-msg__avatar">🧭</div>
      <div class="staff-msg__body"><div class="staff-msg__content"></div></div>`;
    chatEl.appendChild(el);
    const contentEl = el.querySelector('.staff-msg__content');
    let i = 0;
    const words = response.split('');
    function typeNext() {
      if (i < words.length) {
        streamBuffer += words[i++];
        contentEl.innerHTML = renderMarkdown(streamBuffer);
        chatEl.scrollTop = chatEl.scrollHeight;
        setTimeout(typeNext, 8);
      } else {
        streamBuffer = '';
        sendBtn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
    typeNext();
  }

  // ── Rendering Helpers ─────────────────────────────────────────────────────────

  function appendUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'staff-msg staff-msg--user';
    el.innerHTML = `<div class="staff-msg__body"><div class="staff-msg__content">${escapeHtml(text)}</div></div>`;
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function appendSystemMessage(text, type = 'info') {
    const el = document.createElement('div');
    el.className = `staff-system-msg staff-system-msg--${type}`;
    el.textContent = text;
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function showTyping(show) {
    if (typingEl) typingEl.style.display = show ? 'flex' : 'none';
    if (show) chatEl.scrollTop = chatEl.scrollHeight;
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderMarkdown(text) {
    return text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(?!<[h|u|o|l|b|p])(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '');
  }

  // ── Event Listeners ───────────────────────────────────────────────────────────

  sendBtn?.addEventListener('click', () => sendMessage(inputEl.value));

  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  inputEl?.addEventListener('input', () => {
    sendBtn.disabled = !inputEl.value.trim() || isStreaming;
    // Auto-resize
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px';
  });

  // Quick topic buttons
  document.querySelectorAll('.staff-topic-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.prompt));
  });

  // New conversation
  newChatBtn?.addEventListener('click', () => {
    conversationId = null;
    chatEl.innerHTML = '';
    if (welcomeEl) welcomeEl.style.display = '';
    if (topicsEl) topicsEl.style.display = '';
    streamBuffer = '';
    isStreaming = false;
  });

  // ── Init ──────────────────────────────────────────────────────────────────────

  if (typeof lucide !== 'undefined') lucide.createIcons();
  setStatus('connecting', 'Connecting…');
  connectWS();

})();
