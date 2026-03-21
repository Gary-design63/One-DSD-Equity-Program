import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Bot,
  Users,
  Target,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  FileText,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Mock data for dashboard
const communityAccessData = [
  { month: "Jul", black: 32, indigenous: 28, latinx: 38, asian: 45, white: 58 },
  { month: "Aug", black: 33, indigenous: 29, latinx: 39, asian: 46, white: 59 },
  { month: "Sep", black: 34, indigenous: 28, latinx: 40, asian: 47, white: 60 },
  { month: "Oct", black: 35, indigenous: 30, latinx: 41, asian: 47, white: 61 },
  { month: "Nov", black: 36, indigenous: 31, latinx: 42, asian: 48, white: 61 },
  { month: "Dec", black: 37, indigenous: 31, latinx: 43, asian: 49, white: 62 },
  { month: "Jan", black: 38, indigenous: 32, latinx: 44, asian: 50, white: 62 }
];

const employmentOutcomeData = [
  { name: "Black/AA", value: 18, fill: "#1e3a5f" },
  { name: "Indigenous", value: 14, fill: "#78BE21" },
  { name: "Latinx", value: 22, fill: "#003865" },
  { name: "Asian", value: 31, fill: "#4a90d9" },
  { name: "White", value: 41, fill: "#94a3b8" }
];

const waitlistTrend = [
  { month: "Jul '24", total: 4820, bipoc: 2240 },
  { month: "Aug '24", total: 4910, bipoc: 2290 },
  { month: "Sep '24", total: 4780, bipoc: 2180 },
  { month: "Oct '24", total: 4650, bipoc: 2100 },
  { month: "Nov '24", total: 4590, bipoc: 2070 },
  { month: "Dec '24", total: 4510, bipoc: 2020 },
  { month: "Jan '25", total: 4480, bipoc: 2000 }
];

const recentAgentActivity = [
  { agent: "Policy Drafting Agent", action: "Generated Olmstead Progress Brief", time: "12 min ago", status: "success" },
  { agent: "Equity Data Agent", action: "Analyzed CADI waitlist by race/ethnicity", time: "34 min ago", status: "success" },
  { agent: "Training Design Agent", action: "Created Cultural Responsiveness Module 3", time: "1 hr ago", status: "success" },
  { agent: "Community Outreach Agent", action: "Drafted East African community newsletter", time: "2 hr ago", status: "warning" },
  { agent: "DWRS Rate Agent", action: "Calculated 2026 rate impacts by county", time: "3 hr ago", status: "success" }
];

const activeGoals = [
  { title: "Reduce BIPOC waiver waitlist by 15%", progress: 34, status: "on_track", dueDate: "Jun 2025" },
  { title: "Launch Disability Hub MN Somali outreach", progress: 72, status: "on_track", dueDate: "Mar 2025" },
  { title: "Complete DSP workforce equity training", progress: 48, status: "at_risk", dueDate: "Apr 2025" },
  { title: "Publish disaggregated employment data", progress: 89, status: "on_track", dueDate: "Feb 2025" }
];

const COLORS = ["#003865", "#78BE21", "#1e3a5f", "#4a90d9", "#94a3b8"];

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

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equity Operations Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          One DSD Equity and Inclusion Platform · Minnesota Department of Human Services
        </p>
      </div>

      {/* Primary Directive banner */}
      <div className="bg-[#003865] text-white rounded-lg p-4 flex items-start gap-3">
        <Activity className="h-5 w-5 text-[#78BE21] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Primary Directive Active</p>
          <p className="text-xs text-white/70 mt-0.5">
            "Every agent, every process, every output must multiply the Consultant's capacity, never divide it."
            — 39 Meta-Skills · 6 Domains · 14 Agents · Sniff Check L1/L2/L3 Active
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Active Waivers</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">47,284</div>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+2.3% from last quarter</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">CADI · DD · BI · EW · AC</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Waitlist (Total)</span>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">4,480</div>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingDown className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs text-green-600 font-medium">-7.1% from last quarter</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">45% BIPOC community members</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Employment Rate</span>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">31.2%</div>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs text-amber-600 font-medium">+1.8% — gap remains</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">BIPOC: 23.4% vs White: 41.2%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Agent Tasks Today</span>
              <Bot className="h-4 w-4 text-[#003865]" />
            </div>
            <div className="text-3xl font-bold text-foreground">127</div>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs text-green-600 font-medium">98.4% sniff check pass rate</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">14 active agents</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Community access trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Waiver Access Rate by Race/Ethnicity</CardTitle>
            <CardDescription>
              Per 1,000 people with disabilities in population · Jan 2024–Jan 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={communityAccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number, name: string) => [`${value}`, name]}
                />
                <Area type="monotone" dataKey="white" name="White" stroke="#94a3b8" fill="#94a3b820" strokeWidth={2} />
                <Area type="monotone" dataKey="asian" name="Asian/PI" stroke="#4a90d9" fill="#4a90d915" strokeWidth={2} />
                <Area type="monotone" dataKey="latinx" name="Latinx" stroke="#78BE21" fill="#78BE2115" strokeWidth={2} />
                <Area type="monotone" dataKey="black" name="Black/AA" stroke="#003865" fill="#00386515" strokeWidth={2.5} />
                <Area type="monotone" dataKey="indigenous" name="Indigenous" stroke="#1e3a5f" fill="#1e3a5f10" strokeWidth={2} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-3 justify-center">
              {[
                { label: "White", color: "#94a3b8" },
                { label: "Asian/PI", color: "#4a90d9" },
                { label: "Latinx", color: "#78BE21" },
                { label: "Black/AA", color: "#003865" },
                { label: "Indigenous", color: "#1e3a5f" }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employment outcomes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Competitive Employment Outcomes</CardTitle>
            <CardDescription>% working-age waiver participants employed · Jan 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={employmentOutcomeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 50]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={65} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number) => [`${value}%`, "Employment rate"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {employmentOutcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-2.5 bg-amber-50 rounded text-xs text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
              23-point gap: Black (18%) vs White (41%). Employment First priority.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waitlist trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Waitlist Reduction Progress</CardTitle>
            <CardDescription>Total and BIPOC waitlist members · Olmstead Goal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={waitlistTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="total" name="Total Waitlist" fill="#003865" radius={[3, 3, 0, 0]} />
                <Bar dataKey="bipoc" name="BIPOC Members" fill="#78BE21" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Active Operational Goals</CardTitle>
              <CardDescription>Equity program priorities</CardDescription>
            </div>
            <Link to="/goals">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
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
                  <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                    <Clock className="h-3 w-3" /> {goal.dueDate}
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
              <CardDescription>AI agent outputs from the last 4 hours</CardDescription>
            </div>
            <Link to="/agents">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                All agents <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAgentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#003865]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-[#003865]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{activity.agent}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${statusColors[activity.status]}`}>
                    {activity.status === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
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
              { label: "Active Agents", value: "14 / 14", icon: <Bot className="h-4 w-4" />, color: "text-green-600" },
              { label: "Communities Tracked", value: "23", icon: <Users className="h-4 w-4" />, color: "text-[#003865]" },
              { label: "Training Courses", value: "31 active", icon: <BookOpen className="h-4 w-4" />, color: "text-[#003865]" },
              { label: "Goals In Progress", value: "18 / 24", icon: <Target className="h-4 w-4" />, color: "text-amber-600" },
              { label: "Policy Docs Ready", value: "7 drafts", icon: <FileText className="h-4 w-4" />, color: "text-[#003865]" },
              { label: "Sniff Check Rate", value: "98.4%", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" },
              { label: "Open Equity Alerts", value: "3 critical", icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-600" },
              { label: "DWRS 2026 Readiness", value: "67%", icon: <Briefcase className="h-4 w-4" />, color: "text-amber-600" }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`${stat.color} flex-shrink-0`}>{stat.icon}</div>
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
