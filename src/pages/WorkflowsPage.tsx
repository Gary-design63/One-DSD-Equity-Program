import React, { useState } from "react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkflowStage {
  name: string;
  description: string;
  status: "complete" | "in_progress" | "pending";
}

interface Workflow {
  id: string;
  title: string;
  category: string;
  description: string;
  stages: WorkflowStage[];
  estimatedTime: string;
  owner: string;
  sniffCheckLevel: string;
  lastRun: string | null;
  activeRuns: number;
}

const STAGE_COLORS: Record<string, string> = {
  complete: "bg-green-500",
  in_progress: "bg-blue-500",
  pending: "bg-gray-300",
};

const workflows: Workflow[] = [
  {
    id: "wf1",
    title: "Equity Scan",
    category: "Equity Analysis",
    description: "Quick equity review of a document, policy, or communication. Checks for inclusive language, population representation, and alignment with DSD equity commitments.",
    stages: [
      { name: "Document Intake", description: "Upload or paste the document for review", status: "complete" },
      { name: "Language Review", description: "Check for inclusive, person-first language", status: "complete" },
      { name: "Population Check", description: "Verify all served populations are represented", status: "in_progress" },
      { name: "Equity Alignment", description: "Assess alignment with CHOICE framework", status: "pending" },
      { name: "Report Generation", description: "Produce scan results and recommendations", status: "pending" },
    ],
    estimatedTime: "15–30 min",
    owner: "Equity & Inclusion Consultant",
    sniffCheckLevel: "L1",
    lastRun: "Mar 18, 2025",
    activeRuns: 2,
  },
  {
    id: "wf2",
    title: "Full Equity Analysis",
    category: "Equity Analysis",
    description: "Comprehensive equity analysis of a program, policy, or initiative. Includes data analysis, community input review, disparity identification, and actionable recommendations.",
    stages: [
      { name: "Scope Definition", description: "Define analysis scope, populations, and data sources", status: "complete" },
      { name: "Data Collection", description: "Gather quantitative and qualitative data", status: "complete" },
      { name: "Disparity Analysis", description: "Identify disparities across populations", status: "complete" },
      { name: "Root Cause Review", description: "Analyze structural and systemic factors", status: "in_progress" },
      { name: "Community Input", description: "Incorporate lived experience and community feedback", status: "pending" },
      { name: "Recommendations", description: "Develop actionable equity recommendations", status: "pending" },
      { name: "Leadership Review", description: "L3 Sniff Check and leadership approval", status: "pending" },
    ],
    estimatedTime: "2–4 weeks",
    owner: "Equity & Inclusion Consultant",
    sniffCheckLevel: "L3",
    lastRun: "Feb 10, 2025",
    activeRuns: 1,
  },
  {
    id: "wf3",
    title: "Accessibility Review",
    category: "Compliance",
    description: "ADA Title II accessibility review for digital content, physical spaces, or program materials. Ensures compliance with WCAG 2.1 AA and state accessibility standards.",
    stages: [
      { name: "Content Identification", description: "Identify materials to review", status: "complete" },
      { name: "Automated Scan", description: "Run automated accessibility checks", status: "complete" },
      { name: "Manual Review", description: "Expert review of content and navigation", status: "in_progress" },
      { name: "Remediation Plan", description: "Document issues and remediation steps", status: "pending" },
      { name: "Verification", description: "Confirm fixes meet standards", status: "pending" },
    ],
    estimatedTime: "1–2 weeks",
    owner: "Accessibility Lead",
    sniffCheckLevel: "L2",
    lastRun: "Mar 5, 2025",
    activeRuns: 3,
  },
  {
    id: "wf4",
    title: "Community Engagement Process",
    category: "Community",
    description: "Structured process for engaging with communities served by DSD. Ensures authentic engagement, compensated participation, and closed-loop feedback.",
    stages: [
      { name: "Planning", description: "Identify community, set goals, allocate budget", status: "complete" },
      { name: "Relationship Building", description: "Connect with community leaders and organizations", status: "complete" },
      { name: "Engagement Session", description: "Conduct listening session or advisory meeting", status: "complete" },
      { name: "Documentation", description: "Record feedback with community consent", status: "in_progress" },
      { name: "Action Planning", description: "Develop response to community input", status: "pending" },
      { name: "Close the Loop", description: "Report back to community on actions taken", status: "pending" },
    ],
    estimatedTime: "4–8 weeks",
    owner: "Community Engagement Coordinator",
    sniffCheckLevel: "L2",
    lastRun: "Jan 25, 2025",
    activeRuns: 4,
  },
  {
    id: "wf5",
    title: "Policy Document Review",
    category: "Compliance",
    description: "Multi-stage review process for DSD policy documents. Ensures accuracy, equity alignment, plain language, and proper authority chain approval.",
    stages: [
      { name: "Draft Submission", description: "Author submits draft for review", status: "complete" },
      { name: "Equity Scan", description: "L1 equity and inclusion review", status: "complete" },
      { name: "Technical Review", description: "Subject matter expert validation", status: "in_progress" },
      { name: "Plain Language", description: "Readability and accessibility check", status: "pending" },
      { name: "Leadership Approval", description: "Division leadership sign-off", status: "pending" },
      { name: "Publication", description: "Publish and distribute to stakeholders", status: "pending" },
    ],
    estimatedTime: "1–3 weeks",
    owner: "Policy Team Lead",
    sniffCheckLevel: "L2",
    lastRun: "Mar 12, 2025",
    activeRuns: 5,
  },
  {
    id: "wf6",
    title: "Training Development",
    category: "Learning",
    description: "End-to-end workflow for developing equity-focused training modules. Includes needs assessment, content creation, community review, and deployment.",
    stages: [
      { name: "Needs Assessment", description: "Identify training gap and audience", status: "complete" },
      { name: "Content Design", description: "Develop learning objectives and outline", status: "complete" },
      { name: "Content Creation", description: "Build training materials and activities", status: "in_progress" },
      { name: "Community Review", description: "Review by people with lived experience", status: "pending" },
      { name: "Pilot Testing", description: "Test with small group and gather feedback", status: "pending" },
      { name: "Deployment", description: "Publish and assign to staff", status: "pending" },
    ],
    estimatedTime: "4–6 weeks",
    owner: "Training Design Agent",
    sniffCheckLevel: "L2",
    lastRun: "Feb 20, 2025",
    activeRuns: 2,
  },
  {
    id: "wf7",
    title: "DWRS Rate Equity Review",
    category: "Equity Analysis",
    description: "Annual equity review of Disability Waiver Rate System changes. Analyzes impact on BIPOC-owned providers, rural providers, and DSP wage equity.",
    stages: [
      { name: "Rate Change Intake", description: "Receive proposed rate adjustments", status: "complete" },
      { name: "Provider Impact Analysis", description: "Model impact by provider demographics", status: "complete" },
      { name: "Geographic Analysis", description: "Assess rural/urban/tribal impact", status: "complete" },
      { name: "DSP Wage Analysis", description: "Evaluate effect on DSP compensation", status: "complete" },
      { name: "Mitigation Recommendations", description: "Propose adjustments to reduce disparities", status: "in_progress" },
      { name: "Stakeholder Review", description: "Present findings to rate advisory group", status: "pending" },
    ],
    estimatedTime: "3–4 weeks",
    owner: "DWRS Rate Agent",
    sniffCheckLevel: "L3",
    lastRun: "Mar 15, 2025",
    activeRuns: 1,
  },
];

const CATEGORIES = ["All", "Equity Analysis", "Compliance", "Community", "Learning"];

function getProgress(stages: WorkflowStage[]): number {
  const complete = stages.filter(s => s.status === "complete").length;
  const inProgress = stages.filter(s => s.status === "in_progress").length;
  return Math.round(((complete + inProgress * 0.5) / stages.length) * 100);
}

export default function WorkflowsPage() {
  const [tab, setTab] = useState("All");

  const filtered = tab === "All" ? workflows : workflows.filter(w => w.category === tab);

  const totalActive = workflows.reduce((sum, w) => sum + w.activeRuns, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#003865]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          <EditableText field="wf-title" defaultValue="Workflows" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          <EditableText field="wf-subtitle" defaultValue="Guided processes for equity scans, analyses, accessibility reviews, and community engagement" />
        </p>
      </div>

      <PageToolbar />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Workflows", value: workflows.length, color: "text-[#003865]" },
          { label: "Active Runs", value: totalActive, color: "text-blue-600" },
          { label: "Categories", value: CATEGORIES.length - 1, color: "text-teal-600" },
          { label: "Sniff Check Required", value: workflows.filter(w => w.sniffCheckLevel === "L3").length, color: "text-amber-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {CATEGORIES.map(c => (
            <TabsTrigger key={c} value={c} className="text-xs">{c}</TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-4 space-y-4">
            {filtered.map(wf => (
              <Card key={wf.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base text-[#003865]">{wf.title}</CardTitle>
                      <CardDescription className="mt-1">{wf.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                        {wf.activeRuns} active
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-600 text-[10px]">
                        Sniff Check {wf.sniffCheckLevel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <Progress value={getProgress(wf.stages)} className="h-2 flex-1" />
                    <span className="text-xs font-medium text-muted-foreground w-10 text-right">{getProgress(wf.stages)}%</span>
                  </div>

                  {/* Stages */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {wf.stages.map((stage, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                          <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[stage.status]}`} />
                          <span className="text-[11px] text-muted-foreground">{stage.name}</span>
                        </div>
                        {i < wf.stages.length - 1 && <span className="text-muted-foreground/40 text-xs">→</span>}
                      </div>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
                    <span>Owner: {wf.owner}</span>
                    <span>·</span>
                    <span>Est. {wf.estimatedTime}</span>
                    {wf.lastRun && (
                      <>
                        <span>·</span>
                        <span>Last run: {wf.lastRun}</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="text-xs h-8 bg-[#003865] hover:bg-[#002a4a] text-white">Start New Run</Button>
                    <Button size="sm" variant="outline" className="text-xs h-8">View History</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
