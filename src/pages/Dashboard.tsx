import React from "react";
import { Link } from "react-router-dom";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Mock data for dashboard — Logic Model aligned
const serviceAccessData = [
  { month: "Jul", urban: 32, rural: 28, suburban: 38, tribal: 22, statewide: 40 },
  { month: "Aug", urban: 33, rural: 29, suburban: 39, tribal: 23, statewide: 41 },
  { month: "Sep", urban: 34, rural: 28, suburban: 40, tribal: 24, statewide: 42 },
  { month: "Oct", urban: 35, rural: 30, suburban: 41, tribal: 25, statewide: 43 },
  { month: "Nov", urban: 36, rural: 31, suburban: 42, tribal: 26, statewide: 43 },
  { month: "Dec", urban: 37, rural: 31, suburban: 43, tribal: 27, statewide: 44 },
  { month: "Jan", urban: 38, rural: 32, suburban: 44, tribal: 28, statewide: 45 }
];

const outcomesByDomain = [
  { name: "Community", value: 34, fill: "#003865" },
  { name: "Home", value: 29, fill: "#78BE21" },
  { name: "Occupation", value: 22, fill: "#1e3a5f" },
  { name: "Independence", value: 38, fill: "#4a90d9" },
  { name: "Connections", value: 31, fill: "#2d6a4f" },
  { name: "Equity", value: 27, fill: "#94a3b8" }
];

const outputsTrend = [
  { month: "Jul '24", documents: 120, trainings: 45 },
  { month: "Aug '24", documents: 135, trainings: 52 },
  { month: "Sep '24", documents: 128, trainings: 48 },
  { month: "Oct '24", documents: 142, trainings: 55 },
  { month: "Nov '24", documents: 150, trainings: 60 },
  { month: "Dec '24", documents: 148, trainings: 58 },
  { month: "Jan '25", documents: 155, trainings: 63 }
];

const recentAgentActivity = [
  { agent: "Policy Drafting Agent", action: "Generated Olmstead Progress Brief", time: "12 min ago", status: "success" },
  { agent: "Equity Data Agent", action: "Analyzed service access across all communities", time: "34 min ago", status: "success" },
  { agent: "Training Design Agent", action: "Created Cultural Responsiveness Module 3", time: "1 hr ago", status: "success" },
  { agent: "Community Outreach Agent", action: "Drafted community engagement newsletter", time: "2 hr ago", status: "warning" },
  { agent: "DWRS Rate Agent", action: "Calculated 2026 rate impacts by county", time: "3 hr ago", status: "success" }
];

const activeGoals = [
  { title: "Improve service access equity across all communities", progress: 34, status: "on_track", dueDate: "Jun 2025" },
  { title: "Expand Disability Hub MN community outreach", progress: 72, status: "on_track", dueDate: "Mar 2025" },
  { title: "Complete DSP workforce equity training", progress: 48, status: "at_risk", dueDate: "Apr 2025" },
  { title: "Publish service outcome data across all populations", progress: 89, status: "on_track", dueDate: "Feb 2025" }
];

const COLORS = ["#003865", "#78BE21", "#1e3a5f", "#4a90d9", "#2d6a4f", "#94a3b8"];

const statusColors: Record<string, string> = {
  success: "text-green-600",
  warning: "text-amber-600",
  error: "text-red-600"
};

const goalStatusConfig: Record<string, { label: string; color: string }> = {
  on_track: { label: "On Track", color: "bg-green-100 text-green-700" },
  at_risk: { label: "At Risk", color: "bg-amber-100 text-amber-700" },
  behind: { label: "Behind", color: "bg-red-100 text-red-700" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700" }
};

const logicModelSteps = [
  {
    title: "Inputs",
    color: "bg-[#003865]",
    items: ["150-180 DSD staff", "8 specialized agents", "30 community profiles", "Training portfolio", "Supabase infrastructure"]
  },
  {
    title: "Activities",
    color: "bg-[#1e3a5f]",
    items: ["Equity analyses", "Community engagement", "Training delivery", "Consultation routing", "Document formatting"]
  },
  {
    title: "Outputs",
    color: "bg-[#2d6a4f]",
    items: ["Reviewed documents", "Trained staff", "Formatted materials", "Logged decisions"]
  },
  {
    title: "Outcomes",
    color: "bg-[#78BE21]",
    items: ["Equitable services", "Community trust", "Culturally responsive practices"]
  },
  {
    title: "Impact",
    color: "bg-[#4a90d9]",
    items: ["Minnesotans with disabilities live where they choose with the supports they need"]
  }
];

const choiceDomains = [
  { name: "Community", description: "Participation in community life", color: "border-[#003865] bg-[#003865]/5" },
  { name: "Home", description: "Living where and with whom you choose", color: "border-[#1e3a5f] bg-[#1e3a5f]/5" },
  { name: "Occupation", description: "Meaningful work and daily activities", color: "border-[#2d6a4f] bg-[#2d6a4f]/5" },
  { name: "Independence", description: "Self-determination and personal agency", color: "border-[#78BE21] bg-[#78BE21]/5" },
  { name: "Connections", description: "Relationships and social networks", color: "border-[#4a90d9] bg-[#4a90d9]/5" },
  { name: "Equity", description: "Fair access for all communities served", color: "border-[#94a3b8] bg-[#94a3b8]/10" }
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          <EditableText id="dashboard.title" defaultValue="Equity Operations Dashboard" />
        </h1>
        <p className="text-muted-foreground mt-1">
          <EditableText id="dashboard.subtitle" defaultValue="One DSD Equity and Inclusion Platform · Minnesota Department of Human Services" />
        </p>
      </div>

      <PageToolbar />

      {/* Primary Directive banner */}
      <div className="bg-[#003865] text-white rounded-lg p-4 flex items-start gap-3">
        <div>
          <p className="text-sm font-medium">
            <EditableText id="dashboard.directive.title" defaultValue="Primary Directive Active — CHOICE Framework" className="text-white" />
          </p>
          <p className="text-xs text-white/70 mt-0.5">
            <EditableText id="dashboard.directive.body" defaultValue={"\"Every agent, every process, every output must multiply the Consultant's capacity, never divide it.\" — Logic Model · CHOICE Domains (Community, Home, Occupation, Independence, Connections, Equity) · 8 Specialized Agents · Sniff Check L1/L2/L3 Active"} className="text-white/70" />
          </p>
        </div>
      </div>

      {/* Logic Model Flow */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Logic Model Flow</h2>
        <div className="flex flex-col lg:flex-row items-stretch gap-0">
          {logicModelSteps.map((step, i) => (
            <React.Fragment key={step.title}>
              <Card className="flex-1 min-w-0">
                <CardHeader className={`${step.color} text-white rounded-t-lg py-2 px-3`}>
                  <CardTitle className="text-sm font-semibold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ul className="space-y-1">
                    {step.items.map((item, j) => (
                      <li key={j} className="text-xs text-muted-foreground leading-snug">• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              {i < logicModelSteps.length - 1 && (
                <div className="flex items-center justify-center lg:px-1 py-1 lg:py-0">
                  <span className="text-muted-foreground text-lg font-bold select-none lg:rotate-0 rotate-90">&rarr;</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CHOICE Domains */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">CHOICE Domains</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {choiceDomains.map((domain) => (
            <Card key={domain.name} className={`border-2 ${domain.color}`}>
              <CardContent className="p-3 text-center">
                <p className="text-sm font-semibold text-foreground">{domain.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{domain.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service access trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Service Access Rate by Region</CardTitle>
            <CardDescription>
              Per 1,000 people with disabilities in population · Jan 2024–Jan 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={serviceAccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number, name: string) => [`${value}`, name]}
                />
                <Area type="monotone" dataKey="statewide" name="Statewide" stroke="#94a3b8" fill="#94a3b820" strokeWidth={2} />
                <Area type="monotone" dataKey="suburban" name="Suburban" stroke="#4a90d9" fill="#4a90d915" strokeWidth={2} />
                <Area type="monotone" dataKey="urban" name="Urban" stroke="#78BE21" fill="#78BE2115" strokeWidth={2} />
                <Area type="monotone" dataKey="rural" name="Rural" stroke="#003865" fill="#00386515" strokeWidth={2.5} />
                <Area type="monotone" dataKey="tribal" name="Tribal Nations" stroke="#1e3a5f" fill="#1e3a5f10" strokeWidth={2} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-3 justify-center">
              {[
                { label: "Statewide", color: "#94a3b8" },
                { label: "Suburban", color: "#4a90d9" },
                { label: "Urban", color: "#78BE21" },
                { label: "Rural", color: "#003865" },
                { label: "Tribal Nations", color: "#1e3a5f" }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outcomes by CHOICE Domain */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outcomes by CHOICE Domain</CardTitle>
            <CardDescription>Progress score across all communities served · Jan 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={outcomesByDomain} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 50]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={85} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number) => [`${value}`, "Progress score"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {outcomesByDomain.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-2.5 bg-blue-50 rounded text-xs text-blue-800">
              All six CHOICE domains tracked across every community served equally.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outputs trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outputs Trend</CardTitle>
            <CardDescription>Documents reviewed and trainings delivered · Logic Model Outputs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={outputsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="documents" name="Documents Reviewed" fill="#003865" radius={[3, 3, 0, 0]} />
                <Bar dataKey="trainings" name="Trainings Delivered" fill="#78BE21" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Active Operational Goals</CardTitle>
              <CardDescription>Logic Model outcome targets</CardDescription>
            </div>
            <Link to="/goals" className="text-xs text-[#003865] hover:underline font-medium">
              View all &gt;
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.map((goal, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight flex-1">{goal.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${goalStatusConfig[goal.status]?.color}`}>
                    {goalStatusConfig[goal.status]?.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={goal.progress} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground w-8 text-right">{goal.progress}%</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {goal.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent agent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Agent Activity</CardTitle>
              <CardDescription>Agent outputs from the last 4 hours</CardDescription>
            </div>
            <Link to="/agents" className="text-xs text-[#003865] hover:underline font-medium">
              View all &gt;
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAgentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{activity.agent}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${statusColors[activity.status]}`}>
                    {activity.status === "success" ? "Pass" : "Review"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Health</CardTitle>
            <CardDescription>Current operational status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Active Agents", value: "8 / 8", color: "text-green-600" },
              { label: "Community Profiles", value: "30", color: "text-[#003865]" },
              { label: "Training Courses", value: "31 active", color: "text-[#003865]" },
              { label: "Goals In Progress", value: "18 / 24", color: "text-amber-600" },
              { label: "Documents Reviewed", value: "155 this month", color: "text-[#003865]" },
              { label: "Sniff Check Rate", value: "98.4%", color: "text-green-600" },
              { label: "CHOICE Domains Active", value: "6 / 6", color: "text-green-600" },
              { label: "DSD Staff Supported", value: "162", color: "text-[#003865]" }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground flex-1">{stat.label}</span>
                <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
