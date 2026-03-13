import { useState, useEffect, useRef, useCallback } from 'react';
import type { AgentMessage, Conversation, Insight, WsMessage } from '../types';

export const AGENT_META: Record<string, { emoji: string; color: string; label: string }> = {
  equity_compass:         { emoji: '🧭', color: '#003865', label: 'Equity Compass' },
  policy_navigator:       { emoji: '⚖️', color: '#1d4ed8', label: 'Policy Navigator' },
  workflow_architect:     { emoji: '🏗️', color: '#065f46', label: 'Workflow Architect' },
  metrics_intelligence:   { emoji: '📊', color: '#7c3aed', label: 'Metrics Intelligence' },
  learning_curator:       { emoji: '📚', color: '#d97706', label: 'Learning Curator' },
  risk_action_monitor:    { emoji: '🔍', color: '#dc2626', label: 'Risk & Action Monitor' },
  community_intelligence: { emoji: '🤝', color: '#059669', label: 'Community Intelligence' },
};

export const AGENT_COLORS = ['#003865','#1d4ed8','#065f46','#7c3aed','#d97706','#dc2626','#059669'];

export const QUICK_PROMPTS = [
  { label: 'Morning Brief', text: 'Give me a morning briefing: what risks need attention today, any overdue actions, and current workflow status.' },
  { label: 'Policy Question', text: 'What are the key ADA and MN Human Rights Act requirements that apply to our equity analysis work?' },
  { label: 'Workflow Help', text: 'Walk me through the Equity Scan workflow (WF-002). Which stage should I start with for a new request?' },
  { label: 'Metrics Report', text: "Draft a brief performance summary of our current KPIs, highlighting what's on track and what needs attention." },
  { label: 'Learning Path', text: 'Recommend a learning path for a program manager who needs to strengthen their equity analysis skills.' },
  { label: 'Risk Scan', text: 'Run a full risk scan and tell me which risks are most critical right now and their mitigation status.' },
  { label: 'Community Engagement', text: 'Help me design an accessible community engagement approach for getting input from people with cognitive disabilities.' },
  { label: 'Draft Report', text: 'Draft a quarterly equity program report summary for leadership review using our current metrics and progress.' },
];

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export interface ActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  text: string;
  time: string;
}

interface AgentWebSocketState {
  connectionStatus: ConnectionStatus;
  messages: AgentMessage[];
  streamingMessage: string | null;
  streamingAgent: string | null;
  isProcessing: boolean;
  conversations: Conversation[];
  insights: Insight[];
  activityItems: ActivityItem[];
  activityBarText: string | null;
  activeAgents: Set<string>;
  backendAvailable: boolean;
  conversationId: string | null;
  sendMessage: (text: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadInsights: () => Promise<void>;
  loadConversationMessages: (id: string) => Promise<void>;
  newConversation: () => void;
}

export function useAgentWebSocket(): AgentWebSocketState {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [streamingAgent, setStreamingAgent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([
    { id: '0', icon: '🟢', iconBg: '#d1fae5', text: 'System initialized', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [activityBarText, setActivityBarText] = useState<string | null>(null);
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamBufferRef = useRef('');
  const reconnectCountRef = useRef(0);
  const sessionId = useRef<string>(localStorage.getItem('agent_session_id') || crypto.randomUUID());

  const apiUrl = (window.AGENT_API_URL || 'http://localhost:3000');

  // Persist session
  useEffect(() => {
    localStorage.setItem('agent_session_id', sessionId.current);
  }, []);

  const addActivity = useCallback((icon: string, iconBg: string, text: string) => {
    const item: ActivityItem = {
      id: Date.now().toString(),
      icon, iconBg, text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setActivityItems(prev => [item, ...prev].slice(0, 30));
  }, []);

  const handleWsMessage = useCallback((msg: WsMessage) => {
    switch (msg.type) {
      case 'connected':
        setBackendAvailable(true);
        setConnectionStatus('connected');
        break;

      case 'token':
        if (msg.char) {
          streamBufferRef.current += msg.char;
          setStreamingMessage(streamBufferRef.current);
        }
        break;

      case 'agent_activity': {
        const statusLabels: Record<string, string> = {
          thinking: 'thinking…',
          analyzing_policy: 'analyzing policy…',
          analyzing_workflows: 'examining workflows…',
          analyzing_metrics: 'pulling metrics…',
          curating_learning: 'curating learning assets…',
          scanning_risks_and_actions: 'scanning risks & actions…',
          synthesizing_community_intelligence: 'synthesizing community data…',
          using_tool: `using ${msg.tool?.replace(/_/g, ' ')}…`,
          delegating: 'delegating to specialist…',
          delegation_complete: 'specialist response received',
        };
        const agentName = msg.agent || '';
        const label = statusLabels[msg.status || ''] || msg.status || '';
        setActivityBarText(`${agentName} ${label}`);
        addActivity(
          AGENT_META[agentName?.toLowerCase().replace(/ /g, '_')]?.emoji || '🤖',
          '#dbeafe',
          `<strong>${agentName}</strong> ${label}`
        );
        setStreamingAgent(agentName);
        setActiveAgents(prev => new Set([...prev, agentName]));
        break;
      }

      case 'tool_call':
        addActivity('🔧', '#fef3c7', `<strong>${msg.agent}</strong> used <strong>${(msg.tool || '').replace(/_/g, ' ')}</strong>`);
        break;

      case 'response_complete':
        finalizeStream();
        break;

      case 'scheduled_monitor_complete':
        addActivity('⏰', '#d1fae5', '<strong>Scheduled scan</strong> complete — Risk & Action Monitor');
        break;

      case 'error':
        finalizeStream(msg.error);
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addActivity]);

  const finalizeStream = useCallback((error?: string) => {
    const content = error ? `⚠️ ${error}` : streamBufferRef.current;
    if (content) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content,
        agentName: undefined,
      }]);
    }
    streamBufferRef.current = '';
    setStreamingMessage(null);
    setStreamingAgent(null);
    setActivityBarText(null);
    setActiveAgents(new Set());
    setIsProcessing(false);
  }, []);

  const connectWebSocket = useCallback(() => {
    if (reconnectCountRef.current >= 5) return;
    const wsUrl = apiUrl.replace(/^http/, 'ws') + `/ws?session=${sessionId.current}`;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => {
        reconnectCountRef.current = 0;
        setConnectionStatus('connected');
      };
      ws.onmessage = (event) => {
        try { handleWsMessage(JSON.parse(event.data)); } catch {}
      };
      ws.onclose = () => {
        setConnectionStatus('disconnected');
        reconnectCountRef.current++;
        setTimeout(connectWebSocket, 3000 * reconnectCountRef.current);
      };
      ws.onerror = () => { setConnectionStatus('disconnected'); };
    } catch {
      setConnectionStatus('disconnected');
    }
  }, [apiUrl, handleWsMessage]);

  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setBackendAvailable(true);
        setConnectionStatus('connected');
        // Sync app data
        try {
          await fetch(`${apiUrl}/api/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appData: window.APP_DATA }),
          });
        } catch {}
        return true;
      }
    } catch {}
    setBackendAvailable(false);
    setConnectionStatus('disconnected');
    return false;
  }, [apiUrl]);

  useEffect(() => {
    checkBackendHealth().then(available => {
      if (available) {
        connectWebSocket();
      }
    });
    return () => {
      wsRef.current?.close();
    };
  }, [checkBackendHealth, connectWebSocket]);

  const loadConversations = useCallback(async () => {
    if (!backendAvailable) return;
    try {
      const res = await fetch(`${apiUrl}/api/conversations`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {}
  }, [apiUrl, backendAvailable]);

  const loadInsights = useCallback(async () => {
    if (!backendAvailable) return;
    try {
      const res = await fetch(`${apiUrl}/api/insights?limit=8`);
      const data = await res.json();
      setInsights(data.insights || []);
    } catch {}
  }, [apiUrl, backendAvailable]);

  const loadConversationMessages = useCallback(async (id: string) => {
    if (!backendAvailable) return;
    try {
      const res = await fetch(`${apiUrl}/api/conversations/${id}/messages`);
      const data = await res.json();
      setConversationId(id);
      const msgs: AgentMessage[] = (data.messages || [])
        .filter((m: { role: string }) => m.role !== 'system')
        .map((m: { role: string; content: string; agent_name?: string; tool_calls?: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          agentName: m.agent_name,
          toolsUsed: m.tool_calls ? JSON.parse(m.tool_calls).map((t: { tool: string }) => t.tool) : [],
        }));
      setMessages(msgs);
    } catch {}
  }, [apiUrl, backendAvailable]);

  const staticFallback = useCallback(async (text: string) => {
    const lower = text.toLowerCase();
    let response = '';
    const D = window.APP_DATA;
    if (lower.includes('workflow') || lower.includes('process')) {
      response = `**Workflow Guidance** *(static mode — connect backend for full AI responses)*\n\n`;
      response += (D?.workflows || []).slice(0, 3).map(w => `**${w.id}: ${w.name}**\n${w.description || ''}`).join('\n\n');
    } else if (lower.includes('policy') || lower.includes('law') || lower.includes('compliance')) {
      const docs = (D?.documents || []).filter(d => d.authorityRank <= 3).slice(0, 4);
      response = `**Policy Documents** *(static mode)*\n\n`;
      response += docs.map(d => `**${d.title}**\nAuthority: ${d.authorityType} (Rank ${d.authorityRank})\n${d.purpose || ''}`).join('\n\n');
    } else if (lower.includes('metric') || lower.includes('kpi') || lower.includes('performance')) {
      const kpis = (D?.kpis || []).slice(0, 5);
      response = `**Metrics Summary** *(static mode)*\n\n`;
      response += kpis.map(k => `**${k.name}**: ${k.currentValue} / ${k.target} (${k.trend})`).join('\n');
    } else if (lower.includes('risk')) {
      const risks = (D?.risks || []).filter(r => r.severity === 'High');
      response = `**Risk Summary** *(static mode)*\n\n`;
      response += risks.map(r => `**${r.title}** — ${r.severity}\n${r.mitigationPlan || 'No mitigation plan.'}`).join('\n\n');
    } else {
      response = `**AI Agent System** *(static mode — backend not connected)*\n\nTo enable full multi-agent AI responses, deploy the backend and set \`window.AGENT_API_URL\`.\n\nIn static mode, try asking about:\n- Workflow guidance\n- Policy document lookup\n- Metrics overview\n- Risk summary`;
    }

    // Simulate streaming
    for (const char of response) {
      streamBufferRef.current += char;
      setStreamingMessage(streamBufferRef.current);
      await new Promise(r => setTimeout(r, 5));
    }
    finalizeStream();
  }, [finalizeStream]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    streamBufferRef.current = '';
    setStreamingMessage('');
    setStreamingAgent('equity_compass');

    if (!backendAvailable) {
      await staticFallback(text);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
          sessionId: sessionId.current,
          appData: window.APP_DATA,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      if (data.conversationId) setConversationId(data.conversationId);

      // If WS didn't stream, finalize with the response
      if (streamBufferRef.current === '' && data.response) {
        finalizeStream();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          agentName: data.agent?.name,
        }]);
        setIsProcessing(false);
      } else if (streamBufferRef.current !== '') {
        // WS delivered it
      } else {
        finalizeStream();
      }

      loadConversations();
      loadInsights();
    } catch (err) {
      finalizeStream(`Error: ${(err as Error).message}`);
    }
  }, [apiUrl, backendAvailable, conversationId, finalizeStream, isProcessing, loadConversations, loadInsights, staticFallback]);

  const newConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setStreamingMessage(null);
    setStreamingAgent(null);
  }, []);

  return {
    connectionStatus,
    messages,
    streamingMessage,
    streamingAgent,
    isProcessing,
    conversations,
    insights,
    activityItems,
    activityBarText,
    activeAgents,
    backendAvailable,
    conversationId,
    sendMessage,
    loadConversations,
    loadInsights,
    loadConversationMessages,
    newConversation,
  };
}
