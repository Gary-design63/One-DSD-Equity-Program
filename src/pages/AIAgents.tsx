import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Send } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import {
  useAgentWebSocket,
  AGENT_META,
  AGENT_COLORS,
  QUICK_PROMPTS,
  type ConnectionStatus,
} from '@/hooks/useAgentWebSocket';
import type { AgentMessage } from '@/types';
import { cn } from '@/lib/utils';

function ConnectionBanner({ status }: { status: ConnectionStatus }) {
  const configs = {
    connected:    { cls: 'bg-green-50 border-green-200 text-green-700', icon: '●', text: 'AI Agents connected' },
    disconnected: { cls: 'bg-gray-50 border-gray-200 text-gray-600', icon: '○', text: 'Backend offline — static mode' },
    connecting:   { cls: 'bg-blue-50 border-blue-200 text-blue-700', icon: '◌', text: 'Connecting to agents…' },
  };
  const cfg = configs[status] || configs.disconnected;
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-sm mb-4', cfg.cls)}>
      <span>{cfg.icon}</span><span>{cfg.text}</span>
    </div>
  );
}

function MessageBubble({ msg, isStreaming }: { msg: AgentMessage; isStreaming?: boolean }) {
  const isUser = msg.role === 'user';
  const agentMeta = AGENT_META[msg.agentName || 'equity_compass'] || AGENT_META.equity_compass;
  const time = msg.timestamp
    ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">U</div>
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 justify-end mb-1">
            <span className="text-xs text-gray-500">{time}</span>
            <span className="text-xs font-medium text-gray-700">You</span>
          </div>
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{ background: `linear-gradient(135deg, ${agentMeta.color} 0%, #5a9fc7 100%)` }}
      >
        {agentMeta.emoji}
      </div>
      <div className="max-w-2xl flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold" style={{ color: agentMeta.color }}>{agentMeta.label}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <MarkdownRenderer content={msg.content} className="text-sm text-gray-700 prose prose-sm max-w-none" />
          {isStreaming && <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1 align-middle" />}
        </div>
        {(msg.toolsUsed || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {(msg.toolsUsed || []).map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded-full text-xs text-yellow-700">
                🔧 {t.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIAgents() {
  const agent = useAgentWebSocket();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [agent.messages, agent.streamingMessage]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || agent.isProcessing) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await agent.sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAutoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  };

  const usePrompt = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Agent Team</h1>
              <p className="text-sm text-gray-500">Your equity operations team, powered by specialized AI agents</p>
            </div>
            <button
              onClick={agent.newConversation}
              className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-gray-600"
              title="New conversation"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <ConnectionBanner status={agent.connectionStatus} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {agent.messages.length === 0 && !agent.streamingMessage ? (
            /* Welcome screen */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-5xl mb-4">🧭</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Equity Agent Team</h2>
              <p className="text-gray-500 max-w-md mb-8">
                Your AI-powered DEIA operations team. Ask anything about policies, workflows, metrics, learning, risks, or community engagement.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                {QUICK_PROMPTS.slice(0, 6).map(p => (
                  <button
                    key={p.label}
                    onClick={() => usePrompt(p.text)}
                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-xs font-semibold text-blue-600 mb-1">{p.label}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{p.text.slice(0, 55)}…</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {agent.messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {agent.streamingMessage !== null && (
                <MessageBubble
                  msg={{
                    role: 'assistant',
                    content: agent.streamingMessage || '',
                    agentName: agent.streamingAgent || 'equity_compass',
                    timestamp: new Date(),
                  }}
                  isStreaming={true}
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Activity bar */}
        {agent.activityBarText && (
          <div className="px-6 py-2 bg-blue-50 border-t border-blue-200 flex items-center gap-2 text-sm text-blue-700 shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>{agent.activityBarText}</span>
          </div>
        )}

        {/* Input area */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); handleAutoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask your equity agent team anything…"
              rows={1}
              disabled={agent.isProcessing}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 min-h-[44px]"
              style={{ maxHeight: '180px' }}
            />
            <button
              onClick={handleSubmit}
              disabled={agent.isProcessing || !input.trim()}
              className="w-11 h-11 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {QUICK_PROMPTS.slice(0, 4).map(p => (
              <button
                key={p.label}
                onClick={() => usePrompt(p.text)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar panels */}
      <div className="hidden xl:flex w-72 flex-col border-l border-gray-200 bg-gray-50 overflow-y-auto shrink-0">
        {/* Agent Team */}
        <div className="border-b border-gray-200">
          <div className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-500">Agent Team</div>
          <div className="px-3 pb-3 space-y-1">
            {Object.entries(AGENT_META).map(([name, meta], i) => {
              const isActive = agent.activeAgents.has(meta.label);
              return (
                <button
                  key={name}
                  onClick={() => {
                    const prompts: Record<string, string> = {
                      policy_navigator: 'What are the most critical equity policies and laws that govern our work?',
                      workflow_architect: 'What workflows are currently active and what are the next steps for each?',
                      metrics_intelligence: 'Give me a full metrics performance summary with your analysis.',
                      learning_curator: 'What are the most critical learning needs for our staff right now?',
                      risk_action_monitor: 'Run a full risk and action scan and give me your assessment.',
                      community_intelligence: 'Brief me on community engagement priorities.',
                    };
                    usePrompt(prompts[name] || 'Tell me about your role in the equity program.');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-left"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                    style={{ background: AGENT_COLORS[i % AGENT_COLORS.length] }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{meta.label}</div>
                    <div className="text-xs text-gray-500">{isActive ? 'Active' : 'Ready'}</div>
                  </div>
                  <div className={cn('w-2 h-2 rounded-full shrink-0 ml-auto', isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300')} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Activity */}
        <div className="border-b border-gray-200">
          <div className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-500">Live Activity</div>
          <div className="px-3 pb-3 space-y-1 max-h-48 overflow-y-auto">
            {agent.activityItems.map(item => (
              <div key={item.id} className="flex items-start gap-2 py-1">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                  style={{ background: item.iconBg }}
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-xs text-gray-700" dangerouslySetInnerHTML={{ __html: item.text }} />
                  <div className="text-xs text-gray-400">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        {agent.insights.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-500">Insights</div>
            <div className="px-3 pb-3 space-y-2">
              {agent.insights.map(i => {
                const meta = AGENT_META[i.agent_name] || { label: i.agent_name, emoji: '🤖' };
                return (
                  <div key={i.id} className="bg-white border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-blue-300">
                    <div className={cn('text-xs font-semibold mb-1 capitalize', {
                      'text-red-600': i.insight_type === 'risk',
                      'text-blue-600': i.insight_type === 'recommendation',
                      'text-green-600': i.insight_type === 'achievement',
                    })}>
                      {i.insight_type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-700 line-clamp-2">{i.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{meta.emoji} {meta.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Conversation History */}
        <div>
          <div className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-500">History</div>
          <div className="px-3 pb-3 space-y-1">
            {agent.conversations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">No conversations yet</p>
            ) : agent.conversations.map(c => (
              <button
                key={c.id}
                onClick={() => agent.loadConversationMessages(c.id)}
                className={cn(
                  'w-full text-left p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-xs',
                  agent.conversationId === c.id ? 'bg-white shadow-sm' : ''
                )}
              >
                <div className="font-medium text-gray-800 truncate">{c.title || 'Untitled'}</div>
                {c.last_message_at && (
                  <div className="text-gray-400 text-xs mt-0.5">
                    {new Date(c.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
