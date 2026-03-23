import React, { useState } from "react";
import { Link } from "react-router-dom";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Agent } from "@/types";

const AGENTS: Agent[] = [
  {
    id: "policy-legislative",
    name: "Policy & Legislative Agent",
    description: "Full policy lifecycle: drafts equity-aligned policy documents, testimony, guidance memos, legislative briefs, bill tracking, comment letters, and impact analyses. Covers both internal policy development and external legislative engagement.",
    category: "policy",
    status: "active",
    capabilities: ["Policy briefs", "Legislative testimony", "Guidance memos", "Bill tracking", "Comment letters", "Legislative impact analysis", "Olmstead compliance review", "Equity impact analysis", "CBSM interpretation", "Budget request support"],
    metaSkillsDomains: ["M1", "M2", "M4"],
    color: "#003865",
    messageCount: 930,
    successRate: 99.1,
    averageResponseTime: 20,
    tags: ["high-use", "policy", "legislative", "olmstead", "testimony"]
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
    id: "community-engagement",
    name: "Community Engagement Agent",
    description: "Unified community voice: creates culturally responsive outreach materials, designs stakeholder engagement processes, manages advisory panels, and tracks community input. Supports East African, Hmong, Latinx, and Indigenous communities with language justice focus.",
    category: "community",
    status: "active",
    capabilities: ["Community newsletters", "Outreach scripts", "Event planning", "Cultural adaptation", "Trusted messenger support", "Language access planning", "Meeting facilitation guides", "Advisory panel design", "Engagement strategy", "Action item tracking", "Community input synthesis"],
    metaSkillsDomains: ["M2", "M5", "M6"],
    color: "#8B4513",
    messageCount: 590,
    successRate: 96.8,
    averageResponseTime: 26,
    tags: ["community", "outreach", "language-access", "engagement", "stakeholders"]
  },
  {
    id: "service-navigation",
    name: "Service Navigation Agent",
    description: "End-to-end waiver navigation, rate analysis, and benefits counseling. Helps staff and communities navigate CADI, DD, BI, EW, and AC waivers, models DWRS rate impacts, and supports Disability Hub MN resource navigation in multiple languages.",
    category: "waiver",
    status: "active",
    capabilities: ["Waiver comparison", "Eligibility guidance", "Plain language summaries", "CBSM navigation", "Rate modeling", "2026 transition analysis", "DSP wage analysis", "Benefits navigation", "Multilingual materials", "Work incentives planning", "Hub coordination"],
    metaSkillsDomains: ["M2", "M3", "M4", "M5", "M6"],
    color: "#003865",
    messageCount: 1133,
    successRate: 98.5,
    averageResponseTime: 20,
    tags: ["waiver", "navigation", "dwrs", "rates", "disability-hub", "benefits"]
  },
  {
    id: "compliance-integration",
    name: "Compliance & Integration Agent",
    description: "Unified compliance monitoring: tracks Olmstead Plan progress, reviews HCBS Settings Rule compliance, monitors Employment First outcomes, generates remediation plans, and ensures community integration across all programs.",
    category: "compliance",
    status: "active",
    capabilities: ["Olmstead progress monitoring", "HCBS settings review", "Employment outcome analysis", "Compliance gap analysis", "Transition planning", "Remediation planning", "Site assessment", "VRS coordination", "Subcabinet reporting", "Institutional settings identification"],
    metaSkillsDomains: ["M1", "M3", "M4", "M5"],
    color: "#1e6b3e",
    messageCount: 496,
    successRate: 98.8,
    averageResponseTime: 25,
    tags: ["olmstead", "hcbs", "compliance", "employment-first", "community-integration"]
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
    name: "Meta-Audit & QA Agent",
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
  policy: "Policy & Legislative",
  data: "Data & Analytics",
  training: "Training",
  community: "Community",
  operations: "Operations & QA",
  communications: "Communications",
  compliance: "Compliance",
  waiver: "Service Navigation"
};

const categoryColors: Record<string, string> = {
  policy: "bg-blue-100 text-blue-700",
  data: "bg-green-100 text-green-700",
  training: "bg-amber-100 text-amber-700",
  community: "bg-purple-100 text-purple-700",
  operations: "bg-gray-100 text-gray-700",
  communications: "bg-pink-100 text-pink-700",
  compliance: "bg-red-100 text-red-700",
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

      <PageToolbar title="Agents" />

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
