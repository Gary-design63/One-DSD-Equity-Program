import { useState } from "react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { cn } from "@/lib/utils";

const C = {
  navy: "#003865",
  navyD: "#002a4a",
  navyL: "#e8eef4",
  green: "#5a9e10",
  accent: "#0068ba",
  orange: "#b84a14",
  ok: "#0a7d56",
  warn: "#8a6d00",
  alert: "#b91c1c",
  bg: "#f0f2f5",
  card: "#fff",
  border: "#d4d9e1",
  text: "#1a2332",
  muted: "#5a6577"
};

const BADGE_TYPES: Record<string, string> = {
  default: "bg-gray-100 text-gray-800",
  open: "bg-blue-100 text-blue-800",
  urgent: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  gate1: "bg-blue-100 text-blue-800",
  gate2: "bg-orange-100 text-orange-800",
  gate3: "bg-red-100 text-red-800",
  framework: "bg-purple-100 text-purple-800",
  concept: "bg-blue-100 text-blue-800",
  casestudy: "bg-green-100 text-green-800",
  recommendation: "bg-orange-100 text-orange-800",
  policy: "bg-red-100 text-red-800",
  converted: "bg-green-100 text-green-800"
};

const Badge = ({ text, type = "default" }: { text: string; type?: string }) => (
  <span className={cn("inline-block px-2.5 py-1 rounded text-xs font-medium", BADGE_TYPES[type] ?? BADGE_TYPES.default)}>
    {text}
  </span>
);

const Prog = ({ value, color = C.green }: { value: number; color?: string }) => (
  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div className="h-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
  </div>
);

const Card = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={cn("bg-white rounded-lg border border-gray-200 p-6 shadow-sm", className)} style={style}>
    {children}
  </div>
);

const Home = () => (
  <div className="space-y-6">
    <div className="rounded-lg overflow-hidden shadow-md" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.accent} 100%)` }}>
      <div className="p-12 text-white">
        <h1 className="text-4xl font-bold mb-2">One DSD Equity and Inclusion</h1>
        <p className="text-lg opacity-90">Minnesota Department of Human Services - Disability Services Division</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { title: "DSD Equity Strategic Plan", desc: "Long-term vision for equity initiatives" },
        { title: "DHS Analysis Framework", desc: "Comprehensive assessment methodology" },
        { title: "Request a Consultation", desc: "Schedule a consultation with our team" }
      ].map((card) => (
        <Card key={card.title} className="text-center">
          <h3 className="font-semibold text-lg mb-2" style={{ color: C.navy }}>{card.title}</h3>
          <p className="text-sm text-gray-600">{card.desc}</p>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { icon: "📋", title: "Our DSD Strategy", desc: "Strategic initiatives and goals" },
        { icon: "🎯", title: "Programs and Initiatives", desc: "Active programs and projects" },
        { icon: "📚", title: "Training and Learning", desc: "Educational resources" },
        { icon: "📊", title: "Metrics and Progress", desc: "Track our progress" }
      ].map((tile) => (
        <Card key={tile.title}>
          <div className="text-3xl mb-3">{tile.icon}</div>
          <h3 className="font-semibold text-sm mb-1">{tile.title}</h3>
          <p className="text-xs text-gray-600">{tile.desc}</p>
        </Card>
      ))}
    </div>
  </div>
);

const Consultations = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <div className="text-3xl font-bold" style={{ color: C.accent }}>5</div>
        <p className="text-sm text-gray-600">Open Consultations</p>
      </Card>
      <Card>
        <div className="text-3xl font-bold" style={{ color: C.alert }}>2</div>
        <p className="text-sm text-gray-600">Urgent</p>
      </Card>
      <Card>
        <div className="text-3xl font-bold" style={{ color: C.ok }}>2</div>
        <p className="text-sm text-gray-600">Completed</p>
      </Card>
    </div>
    <div className="flex gap-2 border-b border-gray-200">
      {["All", "Open", "Urgent", "Completed"].map((tab) => (
        <button key={tab} className="px-4 py-2 text-sm font-medium border-b-2" style={{ borderColor: tab === "All" ? C.accent : "transparent", color: tab === "All" ? C.accent : C.muted }}>
          {tab}
        </button>
      ))}
    </div>
    <div className="space-y-3">
      {[
        { id: "C-2026-041", title: "Accessibility Review", status: "open" },
        { id: "C-2026-040", title: "Policy Analysis Request", status: "open" },
        { id: "C-2026-039", title: "Staff Training Session", status: "urgent" },
        { id: "C-2026-035", title: "Implementation Support", status: "completed" },
        { id: "C-2026-033", title: "Follow-up Assessment", status: "completed" }
      ].map((item) => (
        <Card key={item.id} className="flex justify-between items-center">
          <div>
            <div className="font-semibold text-sm">{item.id}</div>
            <p className="text-sm text-gray-600">{item.title}</p>
          </div>
          <Badge text={item.status.charAt(0).toUpperCase() + item.status.slice(1)} type={item.status} />
        </Card>
      ))}
    </div>
  </div>
);

const Queue = () => (
  <div className="space-y-6">
    <p className="text-sm text-gray-600">3 items in the equity review queue</p>
    <div className="space-y-4">
      {[
        { id: "Q-001", title: "Policy Document Review", gate: 1 },
        { id: "Q-002", title: "Training Material Assessment", gate: 2 },
        { id: "Q-003", title: "Implementation Plan Review", gate: 3 }
      ].map((item) => (
        <Card key={item.id} style={{ borderLeft: `4px solid ${item.gate === 1 ? C.accent : item.gate === 2 ? C.orange : C.alert}` }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="font-semibold">{item.id}</div>
              <p className="text-sm text-gray-600">{item.title}</p>
            </div>
            <Badge text={`Gate ${item.gate}`} type={`gate${item.gate}`} />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Review</button>
            <button className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100">Details</button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// Hoisted: static data arrays that never change between renders
const TREND_DATA = [
  { month: "Oct", consultations: 45, reviews: 30, training: 20 },
  { month: "Nov", consultations: 52, reviews: 38, training: 28 },
  { month: "Dec", consultations: 48, reviews: 42, training: 35 },
  { month: "Jan", consultations: 60, reviews: 50, training: 40 },
  { month: "Feb", consultations: 65, reviews: 55, training: 42 },
  { month: "Mar", consultations: 68, reviews: 58, training: 45 }
];
const PIE_DATA = [
  { name: "Completed", value: 68, color: C.ok },
  { name: "In Progress", value: 22, color: C.accent },
  { name: "Pending", value: 10, color: C.warn }
];
const KPI_DATA = [
  { label: "Consultations Completed", value: 68, color: C.green },
  { label: "Staff Trained", value: 42, color: C.accent },
  { label: "Equity Reviews", value: 85, color: C.ok }
];
const PARITY_DATA = [
  { label: "Response Parity", value: 0.92 },
  { label: "Performance Ratio", value: 0.90 },
  { label: "Accessibility", value: 1.0, badge: "AA WCAG" },
  { label: "Language Access", value: 0.84 }
];
const ACCOMMODATION_DATA = [
  { label: "Accommodation Rate", value: 91 },
  { label: "Follow-up Completion", value: 94 },
  { label: "Satisfaction Score", value: 96 }
];

const KPIDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {KPI_DATA.map((kpi) => (
        <Card key={kpi.label}>
          <p className="text-sm text-gray-600 mb-3">{kpi.label}</p>
          <div className="text-3xl font-bold mb-3" style={{ color: kpi.color }}>{kpi.value}%</div>
          <Prog value={kpi.value} color={kpi.color} />
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <h3 className="font-semibold mb-4" style={{ color: C.navy }}>Program Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={TREND_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="consultations" stroke={C.accent} fill={C.accent} fillOpacity={0.3} />
            <Area type="monotone" dataKey="reviews" stroke={C.ok} fill={C.ok} fillOpacity={0.3} />
            <Area type="monotone" dataKey="training" stroke={C.orange} fill={C.orange} fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <h3 className="font-semibold mb-4" style={{ color: C.navy }}>Status Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={PIE_DATA}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}
            >
              {PIE_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
    <Card>
      <h3 className="font-semibold mb-4" style={{ color: C.navy }}>Response Parity Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PARITY_DATA.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-gray-600 mb-2">{item.label}</p>
            <div className="text-2xl font-bold" style={{ color: C.accent }}>{item.value.toFixed(2)}</div>
            {item.badge && <Badge text={item.badge} type="default" />}
          </div>
        ))}
      </div>
    </Card>
    <Card>
      <h3 className="font-semibold mb-4" style={{ color: C.navy }}>Accommodation Metrics</h3>
      <div className="space-y-4">
        {ACCOMMODATION_DATA.map((metric) => (
          <div key={metric.label}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{metric.label}</span>
              <span className="text-sm font-semibold" style={{ color: C.green }}>{metric.value}%</span>
            </div>
            <Prog value={metric.value} color={C.ok} />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const Staff = () => (
  <div className="space-y-6">
    <Card>
      <h2 className="text-2xl font-bold mb-6" style={{ color: C.navy }}>The One DSD Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: C.accent }}>People First Commitment</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Our team is dedicated to centering the voices and experiences of people with disabilities in all DSD services and initiatives. We believe in authentic partnership and co-design with the disability community.
          </p>
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h4 className="font-semibold text-sm mb-3">Core Team Members</h4>
            <div className="space-y-3">
              {[
                { name: "Sarah Johnson", role: "Program Director" },
                { name: "Marcus Chen", role: "Senior Consultant" },
                { name: "Amanda Williams", role: "Training Coordinator" }
              ].map((member) => (
                <div key={member.name} className="text-sm">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-gray-600">{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: C.accent }}>One DSD Monthly Meetings</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            We hold monthly all-hands meetings to collaborate, share updates, and ensure alignment across the Equity and Inclusion initiative.
          </p>
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h4 className="font-semibold text-sm mb-3">Upcoming Meetings</h4>
            <div className="space-y-2">
              {[
                { date: "March 28, 2026", time: "2:00 PM - 3:30 PM" },
                { date: "April 25, 2026", time: "2:00 PM - 3:30 PM" },
                { date: "May 29, 2026", time: "2:00 PM - 3:30 PM" }
              ].map((meeting) => (
                <div key={meeting.date} className="text-sm bg-gray-50 p-3 rounded">
                  <div className="font-medium">{meeting.date}</div>
                  <div className="text-gray-600 text-xs">{meeting.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

const MAX_MESSAGES = 50;

const ASSIST_PROMPTS = [
  "Equity review process",
  "Writing help for proposals",
  "Policy analysis support",
  "Training design assistance",
  "Cultural competency brief",
  "Data interpretation guide"
];

const EquityAssist = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm One DSD Equity Assist. How can I help you today?" },
    { role: "user", text: "Can you help me understand equity review processes?" },
    { role: "assistant", text: "Of course! The equity review process at DSD follows a 3-gate model: Gate 1 (Initial Screening) checks for basic compliance, Gate 2 (Deep Analysis) examines disparate impact, and Gate 3 (Community Review) involves stakeholder feedback. Would you like details on any specific gate?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "assistant", text: "Thank you for your question. Our equity team will follow up with detailed guidance on that topic." }
    ].slice(-MAX_MESSAGES));
    setInput("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold mb-4" style={{ color: C.navy }}>One DSD Equity Assist</h2>
        <div className="space-y-4 mb-6" style={{ minHeight: 300, maxHeight: 400, overflowY: "auto" }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {ASSIST_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </Card>
    </div>
  );
};

const ContentClassifier = () => (
  <div className="space-y-6">
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📁</div>
        <h3 className="font-semibold mb-2">Upload Content for Classification</h3>
        <p className="text-sm text-gray-600 mb-4">Drag and drop or click to upload documents</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Choose File</button>
      </div>
    </Card>
    <div className="space-y-3">
      <h3 className="font-semibold" style={{ color: C.navy }}>Recently Uploaded</h3>
      {[
        { name: "DSD_Equity_Policy.pdf", date: "March 18, 2026" },
        { name: "Training_Materials_v2.docx", date: "March 17, 2026" }
      ].map((file) => (
        <Card key={file.name} className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📄</div>
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-600">{file.date}</p>
            </div>
          </div>
          <Badge text="Converted" type="converted" />
        </Card>
      ))}
    </div>
    <Card>
      <h3 className="font-semibold mb-4" style={{ color: C.navy }}>Content Preview</h3>
      <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 h-40 overflow-y-auto">
        <p className="mb-3 font-medium">Document: DSD_Equity_Policy.pdf</p>
        <p className="text-xs text-gray-600 leading-relaxed">
          This document outlines the comprehensive equity and inclusion framework for the Minnesota Department of Human Services, Disability Services Division. It establishes principles for ensuring equitable access to services and programs...
        </p>
      </div>
    </Card>
  </div>
);

const KnowledgeBase = () => (
  <div className="space-y-6">
    <Card>
      <h3 className="font-semibold mb-4" style={{ color: C.navy }}>Source Documents</h3>
      <div className="space-y-3">
        {[
          { title: "DSD Equity Strategic Plan", chapters: 12, source: "Minnesota DHS" },
          { title: "Accessibility Guidelines", chapters: 8, source: "Federal Standards" },
          { title: "Training Curriculum", chapters: 15, source: "Internal Development" },
          { title: "Policy Framework", chapters: 10, source: "State Policy" },
          { title: "Best Practices Guide", chapters: 20, source: "National Resources" }
        ].map((doc) => (
          <div key={doc.title} className="flex justify-between items-start p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">{doc.title}</p>
              <p className="text-xs text-gray-600">{doc.source}</p>
            </div>
            <Badge text={`${doc.chapters} chapters`} type="default" />
          </div>
        ))}
      </div>
    </Card>
    <h3 className="font-semibold" style={{ color: C.navy }}>Knowledge Objects</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { title: "Equity Analysis Framework", type: "framework", label: "Framework" },
        { title: "Accessibility Standards", type: "concept", label: "Concept" },
        { title: "Implementation Case Study", type: "casestudy", label: "Case Study" },
        { title: "Recommendations for Change", type: "recommendation", label: "Recommendation" },
        { title: "Governance Policy", type: "policy", label: "Policy" },
        { title: "Compliance Requirements", type: "framework", label: "Framework" }
      ].map((obj) => (
        <Card key={obj.title}>
          <Badge text={obj.label} type={obj.type} />
          <p className="font-medium text-sm mt-3">{obj.title}</p>
        </Card>
      ))}
    </div>
  </div>
);

const Workflows = () => (
  <div className="space-y-4">
    {[
      { title: "Consultation Request", desc: "Process incoming consultation requests and assign to team", steps: 5 },
      { title: "Equity Review", desc: "Conduct comprehensive equity and inclusion assessment", steps: 7 },
      { title: "Training Delivery", desc: "Schedule and deliver training sessions", steps: 4 },
      { title: "Policy Analysis", desc: "Analyze policies for equity impact", steps: 6 },
      { title: "Implementation Support", desc: "Provide ongoing support for implementation", steps: 8 }
    ].map((workflow) => (
      <Card key={workflow.title}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">{workflow.title}</h3>
            <p className="text-sm text-gray-600">{workflow.desc}</p>
          </div>
          <Badge text={`${workflow.steps} steps`} type="default" />
        </div>
        <div className="flex gap-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          {Array.from({ length: workflow.steps }).map((_, i) => (
            <div key={i} className="flex-1 h-full" style={{ backgroundColor: i < 3 ? C.green : C.border }} />
          ))}
        </div>
      </Card>
    ))}
  </div>
);

const AuditLog = () => (
  <div className="space-y-3">
    {[
      { time: "10:45 AM", action: "Consultation C-2026-041 marked as completed", user: "Sarah Johnson", color: C.ok },
      { time: "09:30 AM", action: "Equity review submitted for policy document", user: "Marcus Chen", color: C.accent },
      { time: "08:15 AM", action: "Training material classifier processed 3 documents", user: "System", color: C.navy },
      { time: "Yesterday 4:20 PM", action: "Access audit completed", user: "Amanda Williams", color: C.warn },
      { time: "Yesterday 2:10 PM", action: "User permission updated", user: "System Admin", color: C.alert }
    ].map((entry) => (
      <Card key={entry.action} style={{ borderLeft: `4px solid ${entry.color}` }}>
        <p className="font-medium text-sm">{entry.action}</p>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-600">{entry.user}</span>
          <span className="text-xs text-gray-500">{entry.time}</span>
        </div>
      </Card>
    ))}
  </div>
);

const views = {
  home: { label: "Home", component: Home },
  consultations: { label: "Consultations", component: Consultations },
  queue: { label: "Queue", component: Queue },
  kpi: { label: "KPI Dashboard", component: KPIDashboard },
  staff: { label: "Staff", component: Staff },
  assist: { label: "Equity Assist", component: EquityAssist },
  classifier: { label: "Content Classifier", component: ContentClassifier },
  kb: { label: "Knowledge Base", component: KnowledgeBase },
  workflows: { label: "Workflows", component: Workflows },
  audit: { label: "Audit Log", component: AuditLog }
} as const;

type ViewKey = keyof typeof views;

const navigation: Record<string, ViewKey[]> = {
  OPERATIONS: ["home", "consultations", "queue", "kpi", "staff"],
  "EQUITY ASSIST": ["assist", "classifier"],
  SYSTEMS: ["kb", "workflows", "audit"]
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewKey>("home");
  const CurrentComponent = views[currentView].component;

  return (
    <div className="flex h-screen" style={{ backgroundColor: C.bg }}>
      <div className="w-64 flex flex-col border-r" style={{ backgroundColor: C.card, borderColor: C.border }}>
        <div className="p-6 border-b" style={{ borderColor: C.border }}>
          <h1 className="font-bold text-lg" style={{ color: C.navy }}>One DSD Equity</h1>
          <p className="text-xs" style={{ color: C.muted }}>MN DHS - Disability Services</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(navigation).map(([section, items]) => (
            <div key={section} className="mb-6">
              <p className="text-xs font-semibold text-gray-500 px-3 mb-2 uppercase">{section}</p>
              <div className="space-y-1">
                {items.map((viewKey) => (
                  <button
                    key={viewKey}
                    onClick={() => setCurrentView(viewKey)}
                    className="w-full text-left px-4 py-2 text-sm rounded transition-colors"
                    style={{
                      backgroundColor: currentView === viewKey ? C.navyL : "transparent",
                      color: currentView === viewKey ? C.navy : C.text,
                      borderRight: currentView === viewKey ? `3px solid ${C.orange}` : "none"
                    }}
                  >
                    {views[viewKey].label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: C.navy }}>GB</div>
            <div className="text-xs">
              <p className="font-semibold" style={{ color: C.navy }}>Gary Banks</p>
              <p style={{ color: C.muted }}>Equity & Inclusion Consultant</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b flex items-center justify-between px-8 shrink-0" style={{ backgroundColor: C.navyD, borderColor: C.border }}>
          <h2 className="text-white font-semibold">One DSD Equity and Inclusion Operations</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600">Upload</button>
            <button className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600">Share</button>
            <button className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600">Save</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <CurrentComponent />
        </div>
      </div>
    </div>
  );
}
