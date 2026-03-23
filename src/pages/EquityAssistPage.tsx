import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { callAIStream } from "@/core/aiProvider";
import { runL1Check } from "@/core/SniffCheckEngine";
import type { ConversationMessage, SniffCheckResult } from "@/types";

/* ───────────────────────────────────────────────────────────────
   KNOWLEDGE BASE — mirrors KnowledgeBasePage documents
   ─────────────────────────────────────────────────────────────── */
interface KBDocument {
  id: string;
  title: string;
  category: string;
  authorityLevel: "federal" | "state" | "agency" | "division" | "operational";
  description: string;
  tags: string[];
  source: string;
}

const KB_DOCUMENTS: KBDocument[] = [
  { id: "kb1", title: "Americans with Disabilities Act (ADA)", category: "Governing", authorityLevel: "federal", description: "Federal civil rights law — Title II applies to all DHS programs.", tags: ["ada", "civil-rights", "title-ii"], source: "U.S. DOJ" },
  { id: "kb2", title: "Section 504 — Rehabilitation Act", category: "Governing", authorityLevel: "federal", description: "Prohibits disability discrimination in federally-funded programs.", tags: ["section-504", "rehabilitation-act"], source: "U.S. HHS" },
  { id: "kb3", title: "HCBS Settings Final Rule", category: "Governing", authorityLevel: "federal", description: "CMS rule for person-centered, community-integrated settings. Compliance deadline March 2027.", tags: ["hcbs", "settings-rule", "cms"], source: "CMS" },
  { id: "kb4", title: "Minnesota Olmstead Plan", category: "Governing", authorityLevel: "state", description: "State plan for community integration of people with disabilities.", tags: ["olmstead", "integration"], source: "Olmstead Implementation Office" },
  { id: "kb5", title: "MN Statutes Ch. 256B — Medical Assistance", category: "Governing", authorityLevel: "state", description: "Statutory authority for CADI, DD, BI, and CAC waivers.", tags: ["statute", "waivers"], source: "MN Legislature" },
  { id: "kb6", title: "DHS Equity Policy — EO 19-01", category: "Equity Tools", authorityLevel: "agency", description: "Agency-wide DEI policy implementing Governor's Executive Order.", tags: ["equity-policy", "dei"], source: "DHS Office of Equity" },
  { id: "kb7", title: "Racial Equity Impact Assessment Tool", category: "Equity Tools", authorityLevel: "agency", description: "Standardized tool for assessing racial equity impacts of policies and programs.", tags: ["reia", "racial-equity"], source: "DHS Office of Equity" },
  { id: "kb8", title: "CHOICE Framework Reference", category: "Equity Tools", authorityLevel: "division", description: "Six-domain equity framework: Community, Home, Occupation, Independence, Connections, Equity.", tags: ["choice", "framework"], source: "DSD Equity Operations" },
  { id: "kb9", title: "Sniff Check Protocol — L1/L2/L3", category: "Equity Tools", authorityLevel: "division", description: "Three-tier QA protocol for equity, accuracy, and cultural responsiveness.", tags: ["sniff-check", "qa"], source: "DSD Equity Operations" },
  { id: "kb10", title: "Logic Model — Equity Operations", category: "Data & Research", authorityLevel: "division", description: "Inputs → Activities → Outputs → Outcomes → Impact mapping.", tags: ["logic-model", "outcomes"], source: "DSD Equity Operations" },
  { id: "kb11", title: "DWRS Rate Methodology", category: "Data & Research", authorityLevel: "state", description: "Disability Waiver Rate System methodology and annual adjustments.", tags: ["dwrs", "rates"], source: "DHS Rate Setting" },
  { id: "kb12", title: "Title VI Language Access Plan", category: "Data & Research", authorityLevel: "agency", description: "Plan for meaningful access for people with limited English proficiency.", tags: ["title-vi", "language-access"], source: "DHS Civil Rights" },
  { id: "kb13", title: "DSP Workforce Data Report 2024", category: "Data & Research", authorityLevel: "division", description: "Annual workforce demographics, wages, turnover, and equity metrics.", tags: ["dsp", "workforce"], source: "DSD Research" },
  { id: "kb14", title: "Community Engagement Protocol", category: "Equity Tools", authorityLevel: "division", description: "Standard protocol for outreach, feedback, and community engagement.", tags: ["engagement", "outreach"], source: "DSD Equity Operations" },
  { id: "kb15", title: "Disability Hub MN Partnership MOU", category: "Data & Research", authorityLevel: "agency", description: "MOU for coordinated service navigation and information sharing.", tags: ["disability-hub", "partnership"], source: "DHS DSD" },
];

const KB_CATEGORIES = ["All", "Governing", "Equity Tools", "Data & Research"];

const AUTHORITY_COLORS: Record<string, string> = {
  federal: "bg-red-100 text-red-700",
  state: "bg-purple-100 text-purple-700",
  agency: "bg-blue-100 text-blue-700",
  division: "bg-teal-100 text-teal-700",
  operational: "bg-gray-100 text-gray-700",
};

/* ───────────────────────────────────────────────────────────────
   AGENTS — available for cross-agent research
   ─────────────────────────────────────────────────────────────── */
interface ResearchAgent {
  id: string;
  name: string;
  domain: string;
  icon: string;
}

const RESEARCH_AGENTS: ResearchAgent[] = [
  { id: "policy", name: "Policy Drafting", domain: "Policy & compliance", icon: "" },
  { id: "equity-data", name: "Equity Data", domain: "Disparities & metrics", icon: "" },
  { id: "training", name: "Training Design", domain: "Staff development", icon: "" },
  { id: "community", name: "Community Outreach", domain: "Engagement & partnerships", icon: "" },
  { id: "dwrs", name: "DWRS Rate Analysis", domain: "Waiver rates & funding", icon: "" },
  { id: "olmstead", name: "Olmstead Monitoring", domain: "Integration compliance", icon: "" },
  { id: "employment", name: "Employment First", domain: "Competitive integrated employment", icon: "" },
  { id: "waiver", name: "Waiver Navigator", domain: "CADI/DD/BI/EW navigation", icon: "" },
  { id: "hcbs", name: "HCBS Compliance", domain: "Settings rule & CMS", icon: "" },
  { id: "stakeholder", name: "Stakeholder Engagement", domain: "Advisory & input", icon: "" },
  { id: "legislative", name: "Legislative Affairs", domain: "Bills & fiscal analysis", icon: "" },
  { id: "hub", name: "Disability Hub MN", domain: "Service navigation", icon: "" },
  { id: "comms", name: "Communications", domain: "Plain language & messaging", icon: "" },
  { id: "meta-audit", name: "Meta-Audit & QA", domain: "Cross-system quality", icon: "" },
];

/* ───────────────────────────────────────────────────────────────
   DEEP RESEARCH SYSTEM PROMPT
   ─────────────────────────────────────────────────────────────── */
const EQUITY_ASSIST_SYSTEM = `You are EQUITY ASSIST — the primary AI research and consultation interface for the One DSD Equity Program. You are an exponential extension of the Equity and Inclusion Operations Consultant, designed to multiply their capacity across every domain.

ARCHITECTURE:
You have access to the platform's full internal knowledge base and can synthesize information across all 14 specialized agents. You perform DEEP RESEARCH — not surface-level answers.

INTERNAL KNOWLEDGE BASE (query these):
- Governing Documents: ADA, Section 504, HCBS Settings Final Rule, Olmstead Plan, MN Statutes Ch. 256B
- Equity Tools: DHS Equity Policy (EO 19-01), Racial Equity Impact Assessment Tool, CHOICE Framework, Sniff Check Protocol (L1/L2/L3), Community Engagement Protocol
- Data & Research: Logic Model, DWRS Rate Methodology, Title VI Language Access Plan, DSP Workforce Data Report, Disability Hub MN Partnership MOU
- Community Profiles: 30+ Minnesota community cultural profiles with demographics, service gaps, language needs
- Equity Metrics: Disaggregated disparity data across race, ethnicity, language, ability, age

CROSS-AGENT RESEARCH DOMAINS:
When a question spans multiple domains, synthesize across these agent specializations:
- Policy & Compliance (policy drafting, HCBS compliance, legislative affairs)
- Data & Metrics (equity data, DWRS rates, workforce data)
- Community & Engagement (community outreach, stakeholder engagement, Disability Hub)
- Operations & Training (training design, employment first, waiver navigation)
- Quality & Oversight (meta-audit, Olmstead monitoring, Sniff Check)

CONSULTATION TIERS:
- Tier 1 (Quick Guidance): Policy lookups, data points, framework references — respond with specific citations
- Tier 2 (Analysis): Equity impact assessment, community context synthesis, disparity analysis — provide structured analysis with data
- Tier 3 (Strategic): Multi-system recommendations, implementation planning, stakeholder mapping — comprehensive consultation with action items

RESEARCH PROTOCOL:
1. IDENTIFY which knowledge bases and agent domains are relevant
2. SYNTHESIZE across sources — never answer from a single silo
3. CITE specific documents, data points, and frameworks by name
4. APPLY the equity lens: Who benefits? Who is burdened? Who was consulted? Who decides?
5. RECOMMEND concrete next steps grounded in the DEIA 3-year plan phases
6. FLAG insufficient data and recommend what data collection is needed
7. CROSS-REFERENCE CLAS Standards and HCBS requirements where applicable

RESPONSE FORMAT:
- Start with a Research Summary header identifying sources consulted
- Use structured sections for complex analyses
- Include data citations with [Source: Document Name] format
- End with Recommended Actions and any data gaps identified
- Apply the 13-Point Equity Rubric lens to all policy recommendations

You are backed by: DHS Equity Analysis Toolkit, CLAS Standards (15 standards), HCBS Settings Rule, Minnesota community cultural profiles, CHOICE Framework (6 domains), 6-Goal Operational Plan, 8-System DEIA Ecosystem, Sniff Check methodology (3 tiers), and the complete Meta-Skills Framework (39 skills across 6 domains).`;

/* ───────────────────────────────────────────────────────────────
   RESEARCH TEMPLATES
   ─────────────────────────────────────────────────────────────── */
interface ResearchTemplate {
  icon: string;
  label: string;
  tier: string;
  prompt: string;
  agents: string[];
  kbDocs: string[];
}

const RESEARCH_TEMPLATES: ResearchTemplate[] = [
  {
    icon: "",
    label: "Equity Disparity Analysis",
    tier: "Tier 2",
    prompt: "Conduct a comprehensive equity disparity analysis across all service dimensions. Pull data from equity metrics, community profiles, and workforce reports. Identify the top 5 most critical gaps, analyze root causes using the 13-Point Equity Rubric, and recommend priority interventions aligned to the DEIA 3-year plan.",
    agents: ["equity-data", "community", "meta-audit"],
    kbDocs: ["kb7", "kb8", "kb13"],
  },
  {
    icon: "",
    label: "Policy Equity Review",
    tier: "Tier 2",
    prompt: "Perform a policy equity review using the Sniff Check methodology and Racial Equity Impact Assessment Tool. Which current policies need review? Apply the equity lens (who benefits, who is burdened, who was consulted, who decides) and cross-reference with CLAS Standards and HCBS requirements.",
    agents: ["policy", "hcbs", "meta-audit"],
    kbDocs: ["kb6", "kb7", "kb9"],
  },
  {
    icon: "",
    label: "Community Context Synthesis",
    tier: "Tier 2",
    prompt: "Synthesize the full community context for current DSD programs. Compile community profiles, cultural contexts, service gaps, language needs, and partnership status. Focus on underserved populations and communities with the widest disparity gaps. Include recommendations for targeted outreach.",
    agents: ["community", "stakeholder", "hub"],
    kbDocs: ["kb12", "kb14", "kb15"],
  },
  {
    icon: "",
    label: "DEIA Goal Progress Assessment",
    tier: "Tier 3",
    prompt: "Assess progress on all equity goals across the 6-Goal Operational Plan and DEIA 3-year implementation plan. For each goal: current status, barriers identified, data trends, and recommended accelerators. Include cross-system dependencies and stakeholder mapping.",
    agents: ["equity-data", "olmstead", "meta-audit", "employment"],
    kbDocs: ["kb4", "kb8", "kb10"],
  },
  {
    icon: "",
    label: "CLAS Standards Compliance",
    tier: "Tier 2",
    prompt: "Evaluate DSD performance against all 15 CLAS Standards. For each standard: current compliance level, evidence, gaps identified, and remediation steps. Pay special attention to Standards 1-3 (Governance), 4-7 (Communication & Language), and 8-14 (Organizational Supports).",
    agents: ["hcbs", "policy", "training"],
    kbDocs: ["kb3", "kb6", "kb12"],
  },
  {
    icon: "",
    label: "Cross-System Research Query",
    tier: "Tier 3",
    prompt: "I need a cross-system research synthesis. Query all 14 agent domains and the full knowledge base to answer: What are the most significant equity gaps across ALL systems (policy, data, training, community, rates, employment, compliance, legislative)? Identify interconnections and recommend a prioritized action plan.",
    agents: RESEARCH_AGENTS.map(a => a.id),
    kbDocs: KB_DOCUMENTS.map(d => d.id),
  },
  {
    icon: "",
    label: "DWRS Rate Equity Analysis",
    tier: "Tier 2",
    prompt: "Analyze the Disability Waiver Rate System through an equity lens. Are rates equitable across demographics and geographies? Identify disparities in provider reimbursement, access gaps in rural/tribal communities, and the impact on workforce stability (DSP wages and turnover). Recommend rate adjustments for equity.",
    agents: ["dwrs", "equity-data", "community"],
    kbDocs: ["kb5", "kb11", "kb13"],
  },
  {
    icon: "",
    label: "HCBS Settings Compliance",
    tier: "Tier 2",
    prompt: "Provide a comprehensive HCBS Settings Rule compliance assessment. Status against the March 2027 deadline, settings that need remediation, person-centered planning gaps, and community integration benchmarks. Cross-reference with Olmstead Plan requirements and CHOICE Framework outcomes.",
    agents: ["hcbs", "olmstead", "waiver"],
    kbDocs: ["kb3", "kb4", "kb8"],
  },
];

/* ───────────────────────────────────────────────────────────────
   COMPONENT
   ─────────────────────────────────────────────────────────────── */
export default function EquityAssistPage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sniffResults, setSniffResults] = useState<Record<string, SniffCheckResult>>({});
  const [activeTab, setActiveTab] = useState("research");
  const [kbSearch, setKbSearch] = useState("");
  const [kbCategory, setKbCategory] = useState("All");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [researchMode, setResearchMode] = useState<"standard" | "deep">("standard");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const filteredDocs = KB_DOCUMENTS.filter(doc => {
    const matchesSearch = kbSearch === "" ||
      doc.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
      doc.tags.some(t => t.includes(kbSearch.toLowerCase()));
    const matchesCat = kbCategory === "All" || doc.category === kbCategory;
    return matchesSearch && matchesCat;
  });

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleAgent = (id: string) => {
    setSelectedAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const buildResearchContext = () => {
    const docContext = selectedDocs.length > 0
      ? `\n\nSELECTED KNOWLEDGE BASE DOCUMENTS FOR THIS QUERY:\n${selectedDocs.map(id => {
          const doc = KB_DOCUMENTS.find(d => d.id === id);
          return doc ? `- ${doc.title} [${doc.authorityLevel}] — ${doc.description}` : "";
        }).filter(Boolean).join("\n")}`
      : "";

    const agentContext = selectedAgents.length > 0
      ? `\n\nFOCUS AGENT DOMAINS FOR THIS QUERY:\n${selectedAgents.map(id => {
          const agent = RESEARCH_AGENTS.find(a => a.id === id);
          return agent ? `- ${agent.name}: ${agent.domain}` : "";
        }).filter(Boolean).join("\n")}`
      : "";

    const modeContext = researchMode === "deep"
      ? "\n\nDEEP RESEARCH MODE ACTIVE: Provide exhaustive analysis. Query all relevant knowledge bases. Cite every source. Include quantitative data where available. Minimum 1000 words for Tier 2+."
      : "";

    return docContext + agentContext + modeContext;
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      const errorMsg: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "API key not configured. Please add VITE_ANTHROPIC_API_KEY to environment variables to enable Equity Assist research capabilities.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
      return;
    }

    try {
      const aiMessages = [...messages, userMsg].map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      let fullContent = "";
      const assistantMsgId = `assistant-${Date.now()}`;
      const researchContext = buildResearchContext();

      await callAIStream(
        aiMessages,
        {
          agentId: "equity-assist",
          agentName: "Equity Assist — Research & Consultation",
          agentPurpose: EQUITY_ASSIST_SYSTEM,
          systemPromptAddendum: `Current platform page: ${location.pathname}\nThe user is the Equity and Inclusion Operations Consultant. You are their exponential extension — multiply their capacity across every domain.${researchContext}`,
          maxTokens: researchMode === "deep" ? 8192 : 4096,
          temperature: 0.2,
        },
        (chunk) => {
          if (!chunk.done) {
            fullContent += chunk.delta;
            setStreamingContent(fullContent);
          }
        }
      );

      setStreamingContent("");

      const assistantMsg: ConversationMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: fullContent,
        timestamp: new Date().toISOString(),
        metadata: { model: "claude-opus-4-5" }
      };

      const sniffResult = runL1Check(fullContent, {
        agentId: "equity-assist",
        outputType: "report",
        audience: "staff",
        contentType: "text"
      });

      setSniffResults(prev => ({ ...prev, [assistantMsgId]: sniffResult }));
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ConversationMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Research error: ${error instanceof Error ? error.message : "Unknown error"}. Check API key and try again.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      toast.error("Equity Assist research request failed");
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, location.pathname, selectedDocs, selectedAgents, researchMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const runTemplate = (template: ResearchTemplate) => {
    setSelectedDocs(template.kbDocs);
    setSelectedAgents(template.agents);
    setResearchMode("deep");
    sendMessage(template.prompt);
  };

  const clearSession = () => {
    setMessages([]);
    setSniffResults({});
    setStreamingContent("");
    setSelectedDocs([]);
    setSelectedAgents([]);
  };

  const downloadTranscript = () => {
    const text = messages.map(m =>
      `[${m.role.toUpperCase()}] ${m.timestamp}\n${m.content}\n`
    ).join("\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `equity-assist-research-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Research transcript downloaded");
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#003865]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            <EditableText field="ea-title" defaultValue="Equity Assist" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            <EditableText field="ea-subtitle" defaultValue="AI research & consultation — integrated across all knowledge bases, data systems, and 14 specialized agents" />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "text-xs px-3 py-1",
            researchMode === "deep"
              ? "bg-[#003865] text-white"
              : "bg-muted text-muted-foreground"
          )}>
            {researchMode === "deep" ? "Deep Research" : "Standard"} Mode
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setResearchMode(researchMode === "deep" ? "standard" : "deep")}
            className="text-xs h-8"
          >
            {researchMode === "deep" ? "Switch to Standard" : "Enable Deep Research"}
          </Button>
        </div>
      </div>

      <PageToolbar />

      {/* Status bar */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border rounded-lg px-4 py-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#78BE21] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#78BE21]"></span>
        </span>
        <span>Equity Assist Active</span>
        <span className="mx-1">·</span>
        <span>{KB_DOCUMENTS.length} knowledge base documents</span>
        <span className="mx-1">·</span>
        <span>{RESEARCH_AGENTS.length} agent domains</span>
        <span className="mx-1">·</span>
        <span>Sniff Check L1 Active</span>
        {selectedDocs.length > 0 && (
          <>
            <span className="mx-1">·</span>
            <Badge variant="outline" className="text-[10px] h-5">{selectedDocs.length} docs selected</Badge>
          </>
        )}
        {selectedAgents.length > 0 && (
          <>
            <span className="mx-1">·</span>
            <Badge variant="outline" className="text-[10px] h-5">{selectedAgents.length} agents focused</Badge>
          </>
        )}
      </div>

      {/* Main layout: sidebar + research area */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4" style={{ minHeight: "calc(100vh - 320px)" }}>

        {/* LEFT PANEL — Knowledge & Agents */}
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="research" className="text-xs flex-1">Research Templates</TabsTrigger>
              <TabsTrigger value="knowledge" className="text-xs flex-1">Knowledge Base</TabsTrigger>
              <TabsTrigger value="agents" className="text-xs flex-1">Agents</TabsTrigger>
            </TabsList>

            {/* Research Templates */}
            <TabsContent value="research" className="mt-3 space-y-2">
              {RESEARCH_TEMPLATES.map((template, i) => (
                <button
                  key={i}
                  onClick={() => runTemplate(template)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border hover:border-[#003865]/30 hover:bg-[#003865]/5 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg flex-shrink-0 mt-0.5">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{template.label}</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5">{template.tier}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{template.prompt.substring(0, 100)}...</p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {template.agents.slice(0, 3).map(aId => {
                          const agent = RESEARCH_AGENTS.find(a => a.id === aId);
                          return agent ? (
                            <span key={aId} className="text-[9px] px-1.5 py-0.5 bg-muted rounded-full">{agent.icon} {agent.name}</span>
                          ) : null;
                        })}
                        {template.agents.length > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">+{template.agents.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </TabsContent>

            {/* Knowledge Base */}
            <TabsContent value="knowledge" className="mt-3 space-y-2">
              <Input
                placeholder="Search knowledge base..."
                value={kbSearch}
                onChange={e => setKbSearch(e.target.value)}
                className="text-xs h-8"
              />
              <div className="flex gap-1 flex-wrap">
                {KB_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setKbCategory(cat)}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full border transition-colors",
                      kbCategory === cat
                        ? "bg-[#003865] text-white border-[#003865]"
                        : "hover:bg-muted"
                    )}
                  >
                    {cat}
                  </button>
                ))}
                {selectedDocs.length > 0 && (
                  <button
                    onClick={() => setSelectedDocs([])}
                    className="text-[10px] px-2 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Clear ({selectedDocs.length})
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {filteredDocs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg border transition-all text-xs",
                      selectedDocs.includes(doc.id)
                        ? "border-[#003865] bg-[#003865]/5 ring-1 ring-[#003865]/20"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", selectedDocs.includes(doc.id) ? "bg-[#78BE21]" : "bg-gray-300")} />
                      <span className="font-medium text-[11px] truncate">{doc.title}</span>
                      <Badge className={cn("text-[8px] h-3.5 ml-auto flex-shrink-0", AUTHORITY_COLORS[doc.authorityLevel])}>
                        {doc.authorityLevel}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 ml-3.5 line-clamp-1">{doc.description}</p>
                  </button>
                ))}
              </div>
            </TabsContent>

            {/* Agents */}
            <TabsContent value="agents" className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Select agents to focus research</span>
                {selectedAgents.length > 0 && (
                  <button
                    onClick={() => setSelectedAgents([])}
                    className="text-[10px] text-red-600 hover:underline"
                  >
                    Clear ({selectedAgents.length})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {RESEARCH_AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg border transition-all",
                      selectedAgents.includes(agent.id)
                        ? "border-[#003865] bg-[#003865]/5 ring-1 ring-[#003865]/20"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium block">{agent.name}</span>
                        <span className="text-[10px] text-muted-foreground">{agent.domain}</span>
                      </div>
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", selectedAgents.includes(agent.id) ? "bg-[#78BE21]" : "bg-gray-200")} />
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t">
                <Link to="/agents" className="text-[11px] text-[#003865] hover:underline">
                  View all agents in detail →
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT PANEL — Research Chat */}
        <div className="flex flex-col border rounded-xl bg-white overflow-hidden" style={{ maxHeight: "calc(100vh - 320px)" }}>
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#003865] text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#78BE21]/20 border border-[#78BE21]/30 flex items-center justify-center">
                <span className="text-base"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Equity Assist Research</h3>
                <p className="text-[10px] text-white/60">{researchMode === "deep" ? "Deep Research" : "Standard"} · CLAS · HCBS · DHS Toolkit · Sniff Check L1</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <>
                  <button onClick={downloadTranscript} className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white text-xs" title="Download transcript">
                    ↓
                  </button>
                  <button onClick={clearSession} className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white text-xs" title="New research session">
                    ↻
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 && !isLoading ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003865] to-[#005a9e] mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl"></span>
                </div>
                <h4 className="font-semibold text-base text-[#003865]">Equity Assist Research Interface</h4>
                <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  Your AI research partner integrated across the full knowledge base, equity metrics, community profiles, and all 14 specialized agents. Select research templates, focus on specific knowledge base documents or agents, then query.
                </p>
                <div className="mt-6 flex items-center gap-2 justify-center">
                  <div className="flex-1 h-px bg-border max-w-[100px]" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">How to use</span>
                  <div className="flex-1 h-px bg-border max-w-[100px]" />
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                  <div className="p-3 rounded-xl bg-muted/50 border">
                    <span className="text-base"></span>
                    <p className="text-[11px] font-medium mt-1">Select Sources</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Choose knowledge base docs and agent domains in the left panel</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border">
                    <span className="text-base"></span>
                    <p className="text-[11px] font-medium mt-1">Choose Depth</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Standard for quick lookups, Deep Research for comprehensive analysis</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border">
                    <span className="text-base"></span>
                    <p className="text-[11px] font-medium mt-1">Research</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Use templates or ask your own research question</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {messages.map(message => (
                  <div key={message.id} className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    {message.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg bg-[#78BE21]/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <span className="text-sm"></span>
                      </div>
                    )}
                    {message.role === "user" && (
                      <div className="w-7 h-7 rounded-lg bg-[#003865] flex-shrink-0 flex items-center justify-center mt-0.5">
                        <span className="text-sm text-white font-bold">U</span>
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
                      message.role === "user"
                        ? "bg-[#003865] text-white"
                        : "bg-muted text-foreground"
                    )}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.role === "assistant" && sniffResults[message.id] && (
                        <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2">
                          <Badge
                            className={cn(
                              "text-[9px]",
                              sniffResults[message.id].status === "pass" ? "bg-green-100 text-green-700" :
                              sniffResults[message.id].status === "warn" ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            )}
                          >
                            Sniff Check: {sniffResults[message.id].status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && streamingContent && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#78BE21]/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-sm"></span>
                    </div>
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted text-[13px] leading-relaxed">
                      <div className="whitespace-pre-wrap">{streamingContent}</div>
                      <span className="inline-block w-1 h-4 bg-[#003865] ml-0.5 animate-pulse rounded-sm" />
                    </div>
                  </div>
                )}

                {isLoading && !streamingContent && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#78BE21]/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-sm"></span>
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-muted">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#78BE21] animate-pulse" />
                        Equity Assist is researching across {selectedAgents.length || 14} agent domains and {selectedDocs.length || KB_DOCUMENTS.length} knowledge base sources...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-3 bg-white">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={researchMode === "deep"
                  ? "Ask a deep research question — cross-system synthesis, equity analysis, policy review..."
                  : "Ask Equity Assist — quick lookups, data points, framework references..."}
                className="min-h-[44px] max-h-[120px] resize-none text-sm flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="h-[44px] px-5 bg-[#003865] hover:bg-[#002a4a] text-white"
              >
                {isLoading ? "..." : "Research"}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-muted-foreground">
                DHS Equity Toolkit · CLAS Standards · HCBS Guidance · 13-Point Equity Rubric · Sniff Check L1
              </p>
              {messages.length > 0 && (
                <span className="text-[10px] text-muted-foreground">{messages.length} messages</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
