import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DataProvider } from "./store";

// Pages
import Dashboard from "./pages/Dashboard";
import KnowledgeBase from "./pages/KnowledgeBase";
import Workflows from "./pages/Workflows";
import Templates from "./pages/Templates";
import Metrics from "./pages/Metrics";
import Learning from "./pages/Learning";
import Assistant from "./pages/Assistant";
import Roles from "./pages/Roles";
import Actions from "./pages/Actions";
import Risks from "./pages/Risks";

import {
  LayoutDashboard,
  BookOpen,
  GitBranch,
  FileText,
  BarChart2,
  GraduationCap,
  Bot,
  Users,
  CheckSquare,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Program Operations",
    items: [
      { key: "home", label: "Dashboard", icon: LayoutDashboard },
      { key: "kb", label: "Knowledge Base", icon: BookOpen },
      { key: "workflows", label: "Workflows", icon: GitBranch },
      { key: "templates", label: "Templates", icon: FileText },
      { key: "metrics", label: "Metrics", icon: BarChart2 },
    ],
  },
  {
    label: "Resources & Tools",
    items: [
      { key: "learning", label: "Learning Portal", icon: GraduationCap },
      { key: "assistant", label: "Equity Assistant", icon: Bot },
      { key: "roles", label: "Roles", icon: Users },
      { key: "actions", label: "Actions", icon: CheckSquare },
      { key: "risks", label: "Risks", icon: AlertTriangle },
    ],
  },
] as const;

type ViewKey = "home" | "kb" | "workflows" | "templates" | "metrics" | "learning" | "assistant" | "roles" | "actions" | "risks";

const PAGE_COMPONENTS: Record<ViewKey, React.ComponentType> = {
  home: Dashboard,
  kb: KnowledgeBase,
  workflows: Workflows,
  templates: Templates,
  metrics: Metrics,
  learning: Learning,
  assistant: Assistant,
  roles: Roles,
  actions: Actions,
  risks: Risks,
};

const PAGE_TITLES: Record<ViewKey, string> = {
  home: "Dashboard",
  kb: "Knowledge Base",
  workflows: "Workflows",
  templates: "Templates",
  metrics: "Metrics",
  learning: "Learning Portal",
  assistant: "Equity Assistant",
  roles: "Roles",
  actions: "Actions",
  risks: "Risks",
};

const ALL_KEYS = Object.keys(PAGE_COMPONENTS) as ViewKey[];

function parseHash(): ViewKey {
  const raw = window.location.hash.replace("#", "").trim() as ViewKey;
  return ALL_KEYS.includes(raw) ? raw : "home";
}

export default function App() {
  const [view, setView] = useState<ViewKey>(parseHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = () => setView(parseHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  function navigate(key: ViewKey) {
    window.location.hash = key;
    setView(key);
    setSidebarOpen(false);
  }

  const PageComponent = PAGE_COMPONENTS[view];

  return (
    <DataProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200",
            "lg:relative lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div>
              <div className="text-sm font-bold text-blue-700 leading-tight">One DSD</div>
              <div className="text-xs text-gray-500">Equity Program</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-6">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">{group.label}</div>
                {group.items.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => navigate(key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors",
                      view === key
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100">
            <div className="text-xs text-gray-400">Minnesota DHS</div>
            <div className="text-xs text-gray-400">Disability Services Division</div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-4 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
            >
              <Menu size={20} />
            </button>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-gray-500">
              <span className="text-gray-400">One DSD</span>
              <ChevronRight size={13} />
              <span className="font-medium text-gray-900">{PAGE_TITLES[view]}</span>
            </nav>
          </header>

          {/* Page */}
          <main className="flex-1 overflow-y-auto p-6">
            <PageComponent />
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
