import React, { useState, useRef, useEffect } from "react";
import { useData } from "../store";
import { AppData } from "../data";
import { Send, Bot, User, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── DSD System Prompt ────────────────────────────────────────────────────────
// Synthesized from DHS public sources:
// [1] https://www.dhs.state.mn.us/main/idcplg?IdcService=GET_DYNAMIC_CONVERSION&RevisionSelectionMethod=LatestReleased&dDocName=id_000721
// [2] https://mn.gov/dhs/partners-and-providers/grants-rfps/disability-innovation-grants/dsd-grants-faq.jsp
// [3] https://www.dhs.state.mn.us/id_007128/

const DSD_PRINCIPLES = {
  mission:
    "The Disability Services Division (DSD) invests in people, communities, and outcomes to help Minnesotans with disabilities live where they choose with appropriate supports ensuring health, safety, and self-determination.",
  choiceDomains: [
    "Community membership",
    "Health & wellness",
    "Own place to live",
    "Important long-term relationships",
    "Control over supports",
    "Employment earnings & stable income",
  ],
  populations:
    "DSD serves people with acquired brain injury, chronic medical conditions, developmental disabilities, and physical disabilities.",
  disclaimer:
    "⚠️ *For regulatory, compliance, or eligibility decisions, consult official DSD policies, your lead agency manual, or qualified legal counsel. This assistant does not provide legal advice.*",
};

type Mode = "policy" | "workflow" | "learning" | "services";

const MODE_CONFIG: Record<Mode, { label: string; color: string; prompts: string[] }> = {
  policy: {
    label: "Policy & Documents",
    color: "bg-purple-600",
    prompts: [
      "What is the One MN Equity Analysis Toolkit?",
      "What are CLAS Standards?",
      "What documents govern the Equity Program?",
      "What is the ADA Title II accessibility guidance?",
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
    label: "Training & Learning",
    color: "bg-green-600",
    prompts: [
      "What required training do I need?",
      "What person-centered planning resources are available?",
      "Show me job aids for equity analysis",
      "What learning is available for accessibility?",
      "What is the Person-Centered Foundations course?",
    ],
  },
  services: {
    label: "Services & Eligibility",
    color: "bg-orange-500",
    prompts: [
      "What HCBS waivers does DSD administer?",
      "How do the CHOICE domains guide service planning?",
      "What is person-centered assessment?",
      "How does DSD support community membership?",
      "Where can I find DSD grant opportunities?",
    ],
  },
};

// ─── DSD-aware keyword response bank ─────────────────────────────────────────

const SERVICES_KB: { keywords: string[]; response: string }[] = [
  {
    keywords: ["choice", "domain", "six domain", "community membership", "own place", "health wellness", "employment", "relationships", "control over support"],
    response:
      `**DSD CHOICE Domains**\nDSD's services are guided by six life domains that give meaning and quality to the lives of people served:\n\n${DSD_PRINCIPLES.choiceDomains.map((d, i) => `${i + 1}. ${d}`).join("\n")}\n\n*Person-centered planning uses these domains to identify what matters most to each individual and shape their support plan accordingly.*`,
  },
  {
    keywords: ["hcbs", "home and community", "waiver", "medicaid waiver", "245d", "community living"],
    response:
      "**Home & Community-Based Services (HCBS)**\nDSD administers Minnesota's HCBS waiver programs that allow people with disabilities to receive publicly-funded supports in their homes and communities rather than institutions. Programs include waivers for people with developmental disabilities, physical disabilities, acquired brain injury (ABI), and children with complex medical needs.\n\n*Eligibility, scope, and access vary by program. Contact your lead agency or case manager for a person-centered assessment to determine the right fit.*",
  },
  {
    keywords: ["grant", "innovation grant", "disability innovation", "apply for grant", "dsd grant", "rfp", "request for proposal"],
    response:
      "**DSD Grant Opportunities**\nDSD administers Disability Innovation grants and other funding opportunities for lead agencies, advocacy organizations, and community partners. Key points:\n\n- **Who can apply**: Lead agencies, nonprofits, and community organizations working in disability services\n- **How to find opportunities**: Visit the DHS grants portal and the DSD Grants FAQ at mn.gov/dhs\n- **Compliance**: Grantees must meet DHS reporting requirements and program-specific performance measures\n- **Reporting**: Regular progress reports are required; consult the DSD grants FAQ for exact timelines\n\n*Always consult the current DSD Grants FAQ (mn.gov/dhs) for the most up-to-date eligibility and application requirements.*",
  },
  {
    keywords: ["eligibility", "qualify", "who can receive", "who is eligible", "access service", "apply for service"],
    response:
      "**DSD Service Eligibility**\nDSD serves Minnesotans with disabilities including:\n\n- Acquired brain injury (ABI)\n- Chronic medical conditions\n- Developmental disabilities\n- Physical disabilities\n\nEligibility for specific programs (waivers, services) is determined through a person-centered assessment conducted by your lead agency or county social services. Assessments consider functional needs, living situation, and the CHOICE domains to match individuals with the right level and type of support.\n\n*Consult your county/lead agency or DSD directly for program-specific eligibility criteria.*",
  },
  {
    keywords: ["person-centered", "self-determination", "individual choice", "person first", "people first"],
    response:
      "**Person-Centered Practice**\nAll DSD services are grounded in person-centered principles:\n\n- Individuals direct their own support planning using the six CHOICE domains\n- \"People First\" language is used in all communications (e.g., \"person with a disability\" not \"disabled person\")\n- Lead agencies conduct person-centered assessments before placing anyone in a program\n- Self-determination means individuals have genuine choice and control over who supports them, where they live, and how they spend their time\n\n*DSD's TrainLink platform offers webinars and in-person sessions on person-centered planning for DSD staff and lead agency partners.*",
  },
  {
    keywords: ["equity", "disparity", "access", "underserved", "historically underserved", "tribal", "cultural"],
    response:
      "**Equity & Access in Disability Services**\nDSD is committed to:\n\n- Reducing disparities in service access for historically underserved disability groups\n- Strengthening partnerships with tribal nations and cultural communities\n- Ensuring services are available to the right person at the right time\n- Applying the Equity Analysis Toolkit and CLAS Standards to program design\n\nThe One DSD Equity Program supports DSD staff in conducting equity scans and full analyses for policies, programs, and communications to identify and address barriers.",
  },
  {
    keywords: ["training", "webinar", "trainlink", "professional development", "in-person session", "continuing education"],
    response:
      "**DSD Training & Professional Development**\nDSD provides training through TrainLink (dhs.state.mn.us/id_007128), including:\n\n- Scheduled webinars on person-centered planning, equity, HCBS, and service coordination\n- In-person training sessions for lead agency staff\n- Person-centered planning resources and job aids\n- Required and optional courses for DSD program staff\n\n*Use \"People First\" language in all training contexts. Check the Learning Portal in this application for One DSD Equity Program-specific learning assets.*",
  },
  {
    keywords: ["quality", "quality improvement", "accountability", "outcome", "data", "reporting", "transparency"],
    response:
      "**Quality Improvement & Accountability**\nDSD uses data-driven quality improvement to:\n\n- Improve service administration across lead agencies\n- Increase transparency and accountability through measurable outcomes\n- Support evidence-based practices and innovation\n- Strengthen oversight through the Disability Services Quality framework\n\nThe Metrics page in this application tracks One DSD Equity Program KPIs across five groups: Demand & Throughput, Timeliness, Quality & Follow-Through, Learning & Capacity, and Accountability & Progress.",
  },
];

function applyDSDFraming(content: string, needsDisclaimer: boolean): string {
  return needsDisclaimer ? `${content}\n\n---\n\n${DSD_PRINCIPLES.disclaimer}` : content;
}

function generateResponse(query: string, mode: Mode, data: AppData): string {
  const q = query.toLowerCase();

  // ─── Services & Eligibility mode ─────────────────────────────────────────
  if (mode === "services") {
    for (const entry of SERVICES_KB) {
      if (entry.keywords.some((kw) => q.includes(kw))) {
        return applyDSDFraming(entry.response, true);
      }
    }
    // Fall back to cross-search of documents for DSD context
    const docMatches = data.documents.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      d.purpose?.toLowerCase().includes(q) ||
      d.programRelevance?.toLowerCase().includes(q)
    );
    if (docMatches.length > 0) {
      const docText = docMatches.slice(0, 2)
        .map((d) => `**${d.shortTitle || d.title}**\n${d.purpose}`)
        .join("\n\n---\n\n");
      return applyDSDFraming(docText, true);
    }
    return applyDSDFraming(
      `I don't have specific information on that topic in the program database. For DSD service eligibility and program details, please contact your lead agency or visit the official DHS Disability Services page.\n\n**DSD Mission:** ${DSD_PRINCIPLES.mission}\n\n**Populations served:** ${DSD_PRINCIPLES.populations}`,
      true
    );
  }

  // ─── Policy & Documents mode ──────────────────────────────────────────────
  if (mode === "policy") {
    // Check DSD KB first for cross-cutting topics
    for (const entry of SERVICES_KB) {
      if (entry.keywords.some((kw) => q.includes(kw))) {
        return applyDSDFraming(entry.response, q.includes("eligib") || q.includes("grant") || q.includes("waiver"));
      }
    }
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
    return "I couldn't find specific documents matching your query. Try the Knowledge Base page for detailed filtering, or switch to **Services & Eligibility** mode for DSD program questions.";
  }

  // ─── Workflows & Processes mode ───────────────────────────────────────────
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
    const tmpMatches = data.templates.filter((t) =>
      t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
    if (tmpMatches.length > 0) {
      return tmpMatches
        .slice(0, 3)
        .map((t) => `**${t.name}** (${t.type}, v${t.version})\n${t.description}`)
        .join("\n\n---\n\n");
    }
    return "No workflow or process information found for that query. Visit the Workflows page to browse all workflows, or switch to **Services & Eligibility** mode for DSD program process questions.";
  }

  // ─── Training & Learning mode ─────────────────────────────────────────────
  if (mode === "learning") {
    // Check DSD training KB entry first
    const trainingEntry = SERVICES_KB.find((e) => e.keywords.includes("training"));
    if (trainingEntry && trainingEntry.keywords.some((kw) => q.includes(kw))) {
      return applyDSDFraming(trainingEntry.response, false);
    }
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
    return "No learning assets found for that query. Visit the Learning Portal to browse all available resources, or check DSD's TrainLink platform at dhs.state.mn.us/id_007128 for scheduled webinars and in-person sessions.";
  }

  return "Please select a mode above to get started.";
}

// ─── Message rendering ────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  text: string;
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const lines = msg.text.split("\n");
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs", isUser ? "bg-blue-600" : "bg-indigo-700")}>
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>
      <div className={cn("max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap", isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800")}>
        {lines.map((line, i) => {
          if (line === "---") return <hr key={i} className="border-gray-300 my-2" />;
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

const GREETING = `Hello! I'm your **One DSD Equity Program** assistant, aligned with the Minnesota Department of Human Services Disability Services Division (DSD).

I can help you with:
- **Policy & Documents** — governing authority, CLAS Standards, ADA guidance
- **Workflows & Processes** — equity scans, accessibility reviews, consultation intake
- **Training & Learning** — required courses, job aids, person-centered planning resources
- **Services & Eligibility** — HCBS waivers, CHOICE domains, grant opportunities, equity access

Select a mode above and ask me a question, or pick a suggested prompt to get started.`;

export default function Assistant() {
  const { data } = useData();
  const [mode, setMode] = useState<Mode>("policy");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: GREETING },
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
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[820px]">
      {/* DSD identity banner */}
      <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 mb-4 text-xs text-indigo-700">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>
          <strong>DSD Mission:</strong> {DSD_PRINCIPLES.mission} This assistant uses program data and DSD public guidelines to support DSD staff, lead agencies, advocates, and the public.
        </span>
      </div>

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
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          className="px-4 py-3 bg-indigo-700 text-white rounded-xl hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
