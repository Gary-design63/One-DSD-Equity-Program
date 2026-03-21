import React, { useState, useRef, useEffect } from "react";
import { useData } from "../store";
import { AppData } from "../data";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "policy" | "workflow" | "learning";

const MODE_CONFIG: Record<Mode, { label: string; color: string; prompts: string[] }> = {
  policy: {
    label: "Policy & Documents",
    color: "bg-purple-600",
    prompts: [
      "What is the One MN Equity Analysis Toolkit?",
      "What are CLAS Standards?",
      "What documents govern the Equity Program?",
      "What is the ADA Title II guidance?",
      "What is DHS Equity Policy?",
    ],
  },
  workflow: {
    label: "Workflows & Processes",
    color: "bg-blue-600",
    prompts: [
      "How does Consultation Intake work?",
      "What are the stages in a Full Equity Analysis?",
      "How do I start an Accessibility Review?",
      "What triggers the Quarterly Review workflow?",
      "What templates are used in an Equity Scan?",
    ],
  },
  learning: {
    label: "Learning Resources",
    color: "bg-green-600",
    prompts: [
      "What required training do I need?",
      "What is the CLAS Standards course?",
      "Show me job aids for equity analysis",
      "What learning is available for accessibility?",
      "What is the Person-Centered Foundations course?",
    ],
  },
};

function generateResponse(query: string, mode: Mode, data: AppData): string {
  const q = query.toLowerCase();

  if (mode === "policy") {
    const matches = data.documents.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      d.shortTitle?.toLowerCase().includes(q) ||
      d.purpose?.toLowerCase().includes(q) ||
      d.batch?.toLowerCase().includes(q) ||
      d.programRelevance?.toLowerCase().includes(q)
    );
    if (matches.length > 0) {
      return matches
        .slice(0, 3)
        .map((d) => {
          const rankLabel = ["", "Law/Reg", "Federal/State", "Enterprise", "Division", "Program", "Procedure", "Educational", "Archived"][d.authorityRank] ?? "";
          return `**${d.shortTitle || d.title}** (Authority Rank ${d.authorityRank}: ${rankLabel})\n${d.purpose}\n\n*Program relevance:* ${d.programRelevance}`;
        })
        .join("\n\n---\n\n");
    }
    return "I couldn't find specific documents matching your query. Try searching the Knowledge Base for more detailed results.";
  }

  if (mode === "workflow") {
    const wfMatches = data.workflows.filter((w) =>
      w.name.toLowerCase().includes(q) ||
      w.description?.toLowerCase().includes(q) ||
      w.trigger?.toLowerCase().includes(q)
    );
    if (wfMatches.length > 0) {
      return wfMatches
        .slice(0, 2)
        .map((w) => {
          const stages = [...w.stages].sort((a, b) => a.order - b.order).map((s) => `${s.order}. ${s.name}`).join(" → ");
          const tmps = w.outputTemplates.map((id) => data.templates.find((t) => t.id === id)?.name ?? id).join(", ");
          return `**${w.name}**\n${w.description}\n\n*Trigger:* ${w.trigger}\n*Stages:* ${stages}${tmps ? `\n*Output Templates:* ${tmps}` : ""}`;
        })
        .join("\n\n---\n\n");
    }
    // Check templates too
    const tmpMatches = data.templates.filter((t) =>
      t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
    if (tmpMatches.length > 0) {
      return tmpMatches
        .slice(0, 3)
        .map((t) => `**${t.name}** (${t.type}, v${t.version})\n${t.description}`)
        .join("\n\n---\n\n");
    }
    return "No workflow or process information found for that query. Visit the Workflows page to browse all workflows.";
  }

  if (mode === "learning") {
    const matches = data.learningAssets.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.type?.toLowerCase().includes(q) ||
      a.audience?.toLowerCase().includes(q)
    );
    if (matches.length > 0) {
      return matches
        .slice(0, 4)
        .map((a) => `**${a.title}** (${a.type} · ${a.requiredOrOptional} · ${a.estimatedDuration})\n${a.description}`)
        .join("\n\n---\n\n");
    }
    return "No learning assets found for that query. Visit the Learning Portal to browse all available resources.";
  }

  return "Please select a mode above to get started.";
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  // Simple markdown-ish rendering: bold, horizontal rules
  const lines = msg.text.split("\n");
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs", isUser ? "bg-blue-600" : "bg-gray-600")}>
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>
      <div className={cn("max-w-[75%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap", isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800")}>
        {lines.map((line, i) => {
          if (line === "---") return <hr key={i} className="border-gray-300 my-2" />;
          // Bold: **text**
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} className={i > 0 ? "mt-1" : ""}>
              {parts.map((p, j) =>
                p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}

const MAX_MESSAGES = 50;

export default function Assistant() {
  const { data } = useData();
  const [mode, setMode] = useState<Mode>("policy");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hello! I'm your One DSD Equity Program assistant. Select a mode above and ask me a question, or pick a suggested prompt to get started." },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text?: string) {
    const q = (text ?? input).trim();
    if (!q) return;
    const userMsg: Message = { role: "user", text: q };
    const reply = generateResponse(q, mode, data);
    const assistantMsg: Message = { role: "assistant", text: reply };
    setMessages((prev) => {
      const next = [...prev, userMsg, assistantMsg];
      return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
    });
    setInput("");
  }

  const cfg = MODE_CONFIG[mode];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[800px]">
      {/* Mode selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={cn("px-4 py-2 text-sm rounded-lg font-medium transition-colors", mode === key ? `${c.color} text-white` : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {cfg.prompts.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className="text-xs border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 p-4 space-y-4 mb-4">
        {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={`Ask about ${cfg.label.toLowerCase()}…`}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
