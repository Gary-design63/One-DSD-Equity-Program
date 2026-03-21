import React, { useState } from "react";
import { Link } from "react-router-dom";
import { EditableText } from "@/components/EditableText";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Agent } from "@/types";

const AGENTS: Agent[] = [
  {
    id: "policy-drafting",
    name: "Policy Drafting Agent",
    description: "Drafts equity-aligned policy documents, testimony, guidance memos, and legislative briefs. Applies all 39 meta-skills. Outputs are draft-ready, never placeholder.",
    category: "policy",
    status: "active",
    capabilities: ["Policy briefs", "Legislative testimony", "Guidance memos", "Olmstead compliance review", "Equity impact analysis", "CBSM interpretation"],
    metaSkillsDomains: ["M1", "M2", "M4"],
    color: "#003865",
    messageCount: 842,
    successRate: 99.2,
    averageResponseTime: 18,
    tags: ["high-use", "policy", "olmstead"]
  },
  {
    id: "equity-data",
    name: "Equity Data Agent",
    description: "Analyzes disaggregated disability services data by race, ethnicity, geography, and disability type. Identifies disparities, generates visualizations, and proposes data-driven solutions.",
    category: "data",
    status: "active",
    capabilities: ["Disparity analysis", "Disaggregated data reports", "Equity dashboards", "Root cause analysis", "Trend identification", "MMIS data interpretation"],
    metaSkillsDomains: ["M1", "M3"],
    color: "#1e6b3e",
    messageCount: 623,
    successRate: 97.8,
    averageResponseTime: 22,
    tags: ["data", "analytics", "equity"]
  },
  {
    id: "training-design",
    name: "Training Design Agent",
    description: "Creates complete equity training curricula, modules, facilitator guides, and assessments. Ensures ADA accessibility, plain language, and adult learning best practices.",
    category: "training",
    status: "active",
    capabilities: ["Curriculum development", "Module design", "Assessment creation", "Facilitator guides", "Accessibility review", "Learning objective writing"],
    metaSkillsDomains: ["M2", "M5", "M6"],
    color: "#5c3317",
    messageCount: 415,
    successRate: 98.7,
    averageResponseTime: 31,
    tags: ["training", "curriculum", "accessibility"]
  },
  {
    id: "community-outreach",
    name: "Community Outreach Agent",
    description: "Creates culturally responsive outreach materials for BIPOC disability communities. Supports East African, Hmong, Latinx, and Indigenous community engagement. Language justice focused.",
    category: "community",
    status: "active",
    capabilities: ["Community newsletters", "Outreach scripts", "Event planning", "Cultural adaptation", "Trusted messenger support", "Language access planning"],
    metaSkillsDomains: ["M2", "M6"],
    color: "#8B4513",
    messageCount: 389,
    successRate: 96.4,
    averageResponseTime: 25,
    tags: ["community", "outreach", "language-access"]
  },
  {
    id: "dwrs-rate",
    name: "DWRS Rate Analysis Agent",
    description: "Analyzes Disability Waiver Rate System (DWRS) rate impacts, models 2026 transitions, calculates equity implications of rate changes, and supports provider sustainability analysis.",
    category: "waiver",
    status: "active",
    capabilities: ["Rate modeling", "2026 transition analysis", "Provider sustainability", "DSP wage analysis", "Geographic equity", "Budget impact projections"],
    metaSkillsDomains: ["M3", "M4", "M5"],
    color: "#003865",
    messageCount: 278,
    successRate: 98.2,
    averageResponseTime: 28,
    tags: ["dwrs", "rates", "finance"]
  },
  {
    id: "olmstead-monitor",
    name: "Olmstead Monitoring Agent",
    description: "Tracks Minnesota Olmstead Plan progress, identifies compliance gaps, generates transition planning support, and monitors community integration outcomes.",
    category: "compliance",
    status: "active",
    capabilities: ["Progress monitoring", "Compliance gap analysis", "Transition planning", "Community integration reports", "Institutional to community tracking", "Subcabinet reporting"],
    metaSkillsDomains: ["M1", "M4"],
    color: "#003865",
    messageCount: 195,
    successRate: 99.5,
    averageResponseTime: 20,
    tags: ["olmstead", "compliance", "community-integration"]
  },
  {
    id: "employment-first",
    name: "Employment First Agent",
    description: "Supports Employment First policy implementation. Analyzes employment outcome disparities, creates supported employment training content, and generates Employment First compliance materials.",
    category: "employment",
    status: "active",
    capabilities: ["Employment outcome analysis", "VRS coordination", "Provider training", "Customized employment planning", "Disparity reporting", "Policy compliance review"],
    metaSkillsDomains: ["M1", "M3", "M4"],
    color: "#1e6b3e",
    messageCount: 167,
    successRate: 97.6,
    averageResponseTime: 24,
    tags: ["employment-first", "vrs", "outcomes"]
  },
  {
    id: "waiver-navigator",
    name: "Waiver Navigation Agent",
    description: "Helps staff and community partners navigate CADI, DD, BI, EW, and AC waiver programs. Creates plain-language guides, eligibility explanations, and service planning support.",
    category: "waiver",
    status: "active",
    capabilities: ["Waiver comparison", "Eligibility guidance", "Service descriptions", "Plain language summaries", "CBSM navigation", "Person-centered planning support"],
    metaSkillsDomains: ["M2", "M4"],
    color: "#003865",
    messageCount: 543,
    successRate: 98.9,
    averageResponseTime: 16,
    tags: ["waiver", "navigation", "plain-language"]
  },
  {
    id: "hcbs-settings",
    name: "HCBS Settings Compliance Agent",
    description: "Reviews provider settings for HCBS Settings Rule compliance. Conducts virtual site review assessments, generates remediation plans, and tracks compliance timelines.",
    category: "compliance",
    status: "active",
    capabilities: ["Settings review", "Compliance checklist", "Remediation planning", "Site assessment", "Provider guidance", "Institutional settings identification"],
    metaSkillsDomains: ["M4", "M5"],
    color: "#5c3317",
    messageCount: 134,
    successRate: 99.1,
    averageResponseTime: 35,
    tags: ["hcbs", "compliance", "settings-rule"]
  },
  {
    id: "stakeholder-engagement",
    name: "Stakeholder Engagement Agent",
    description: "Designs and manages stakeholder engagement processes, creates meeting materials, generates follow-up summaries, and tracks action items from advisory panels and community sessions.",
    category: "community",
    status: "active",
    capabilities: ["Meeting facilitation guides", "Advisory panel design", "Engagement strategy", "Action item tracking", "Community input synthesis", "Accessibility planning"],
    metaSkillsDomains: ["M5", "M6"],
    color: "#1e6b3e",
    messageCount: 201,
    successRate: 97.3,
    averageResponseTime: 27,
    tags: ["engagement", "stakeholders", "advisory"]
  },
  {
    id: "legislative-affairs",
    name: "Legislative Affairs Agent",
    description: "Monitors Minnesota legislative session, tracks disability equity bills, drafts testimony and comment letters, generates legislative impact analyses for equity implications.",
    category: "policy",
    status: "active",
    capabilities: ["Bill tracking", "Testimony drafting", "Comment letters", "Legislative impact analysis", "Session monitoring", "Budget request support"],
    metaSkillsDomains: ["M2", "M4"],
    color: "#003865",
    messageCount: 88,
    successRate: 98.8,
    averageResponseTime: 33,
    tags: ["legislative", "testimony", "policy"]
  },
  {
    id: "disability-hub",
    name: "Disability Hub MN Agent",
    description: "Supports Disability Hub MN resource navigation, benefits counseling scripts, and community connection workflows. Creates accessible resource guides in multiple languages.",
    category: "operations",
    status: "active",
    capabilities: ["Benefits navigation", "Resource guides", "Multilingual materials", "Community referrals", "Work incentives planning", "Hub coordination"],
    metaSkillsDomains: ["M2", "M6"],
    color: "#1e6b3e",
    messageCount: 312,
    successRate: 98.1,
    averageResponseTime: 19,
    tags: ["disability-hub", "benefits", "navigation"]
  },
  {
    id: "communications",
    name: "Communications Agent",
    description: "Drafts all external communications: press releases, DHS website content, social media, executive communications, and community-facing announcements. Multiple format and audience support.",
    category: "communications",
    status: "active",
    capabilities: ["Press releases", "Web content", "Social media", "Executive memos", "Newsletters", "Infographic scripts", "FAQ documents"],
    metaSkillsDomains: ["M2", "M5"],
    color: "#5c3317",
    messageCount: 447,
    successRate: 97.9,
    averageResponseTime: 21,
    tags: ["communications", "content", "web"]
  },
  {
    id: "meta-audit",
    name: "Meta-Audit and QA Agent",
    description: "Runs L1/L2/L3 Sniff Checks on all agent outputs. Reviews for equity alignment, ableist language, structural analysis quality, and force multiplier compliance. Quality gate for the platform.",
    category: "operations",
    status: "active",
    capabilities: ["L1 automated checks", "L2 equity review", "L3 expert validation", "Language audits", "Structural analysis review", "Output quality scoring"],
    metaSkillsDomains: ["M1", "M2", "M3", "M4", "M5", "M6"],
    color: "#003865",
    messageCount: 1247,
    successRate: 99.8,
    averageResponseTime: 8,
    tags: ["quality", "audit", "sniff-check"]
  }
];

const categoryLabels: Record<string, string> = {
  policy: "Policy",
  data: "Data",
  training: "Training",
  community: "Community",
  operations: "Operations",
  communications: "Communications",
  compliance: "Compliance",
  employment: "Employment",
  waiver: "Waiver"
};

const categoryColors: Record<string, string> = {
  policy: "bg-blue-100 text-blue-700",
  data: "bg-green-100 text-green-700",
  training: "bg-amber-100 text-amber-700",
  community: "bg-purple-100 text-purple-700",
  operations: "bg-gray-100 text-gray-700",
  communications: "bg-pink-100 text-pink-700",
  compliance: "bg-red-100 text-red-700",
  employment: "bg-teal-100 text-teal-700",
  waiver: "bg-indigo-100 text-indigo-700"
};

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredAgents = AGENTS.filter(agent => {
    const matchesSearch = !searchQuery ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags?.some(tag => tag.includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || agent.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalMessages = AGENTS.reduce((sum, a) => sum + (a.messageCount || 0), 0);
  const avgSuccessRate = AGENTS.reduce((sum, a) => sum + (a.successRate || 0), 0) / AGENTS.length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          <EditableText id="agents.title" defaultValue="Equity Agents" />
        </h1>
        <p className="text-muted-foreground mt-1">
          <EditableText id="agents.subtitle" defaultValue={`${AGENTS.length} specialized agents · All governed by Primary Directive · 39 Meta-Skills applied universally`} />
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{AGENTS.length}</div>
            <div className="text-sm text-muted-foreground">Active Agents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#78BE21]">{totalMessages.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Tasks Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{avgSuccessRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Avg Sniff Check Pass</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">39</div>
            <div className="text-sm text-muted-foreground">Meta-Skills Applied</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Agents grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAgents.map(agent => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${agent.color}15` }}
                  />
                  <div>
                    <CardTitle className="text-sm font-semibold leading-tight">
                      <EditableText id={`agent.${agent.id}.name`} defaultValue={agent.name} />
                    </CardTitle>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${categoryColors[agent.category]}`}>
                      {categoryLabels[agent.category]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <EditableText id={`agent.${agent.id}.desc`} defaultValue={agent.description} multiline className="text-sm text-muted-foreground leading-relaxed line-clamp-3" />

              {/* Capabilities */}
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 4).map((cap, i) => (
                  <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                    {cap}
                  </span>
                ))}
                {agent.capabilities.length > 4 && (
                  <span className="text-xs text-muted-foreground px-1">
                    +{agent.capabilities.length - 4} more
                  </span>
                )}
              </div>

              {/* Meta-skills domains */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Meta-Skills:</span>
                {agent.metaSkillsDomains.map(domain => (
                  <span key={domain} className="text-xs bg-[#003865]/10 text-[#003865] px-1.5 py-0.5 rounded font-medium">
                    {domain}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{agent.messageCount?.toLocaleString()} tasks</span>
                <span>{agent.successRate}%</span>
                <span>~{agent.averageResponseTime}s</span>
              </div>

              <Link to={`/agents/${agent.id}`} className="block">
                <Button className="w-full" size="sm">
                  Open Agent
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No agents found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
