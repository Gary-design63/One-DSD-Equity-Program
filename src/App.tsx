import React, { useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import {
  LayoutDashboard,
  Bot,
  Users,
  BookOpen,
  Target,
  FileText,
  Settings,
  Shield,
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Dashboard from "@/pages/Dashboard";
import AgentsPage from "@/pages/AgentsPage";
import AgentChat from "@/pages/AgentChat";
import CommunityPage from "@/pages/CommunityPage";
import TrainingPage from "@/pages/TrainingPage";
import GoalsPage from "@/pages/GoalsPage";
import PolicyPage from "@/pages/PolicyPage";
import EquityMetricsPage from "@/pages/EquityMetricsPage";
import SettingsPage from "@/pages/SettingsPage";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
    description: "Platform overview and key metrics"
  },
  {
    label: "AI Agents",
    path: "/agents",
    icon: <Bot className="h-5 w-5" />,
    description: "Equity intelligence agents"
  },
  {
    label: "Equity Metrics",
    path: "/metrics",
    icon: <TrendingUp className="h-5 w-5" />,
    description: "Disparity data and analysis"
  },
  {
    label: "Community",
    path: "/community",
    icon: <Users className="h-5 w-5" />,
    description: "Community partnerships and engagement"
  },
  {
    label: "Training",
    path: "/training",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Equity education and workforce development"
  },
  {
    label: "Goals",
    path: "/goals",
    icon: <Target className="h-5 w-5" />,
    description: "Operational goals and key results"
  },
  {
    label: "Policy",
    path: "/policy",
    icon: <FileText className="h-5 w-5" />,
    description: "Policy documents and analysis"
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5" />,
    description: "Platform configuration"
  }
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-[#003865] text-white z-50 transform transition-transform duration-200 ease-in-out flex flex-col",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#78BE21] rounded flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">One DSD</div>
              <div className="text-xs text-white/60 leading-tight">Equity Platform</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className={cn(
                  "transition-colors",
                  isActive ? "text-[#78BE21]" : "text-white/60 group-hover:text-white/80"
                )}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto bg-[#78BE21] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/40" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 leading-relaxed">
            <div className="font-medium text-white/60 mb-1">Primary Directive</div>
            <div className="italic">
              "Every agent must multiply the Consultant's capacity, never divide it."
            </div>
          </div>
          <div className="mt-3 text-xs text-white/30">
            v1.0.0 · Minnesota DHS
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const currentNav = NAV_ITEMS.find(item =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );

  return (
    <header className="bg-white border-b border-border h-14 flex items-center px-4 gap-4 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted-foreground hover:text-foreground"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground hidden sm:inline">One DSD</span>
        <span className="text-muted-foreground hidden sm:inline">/</span>
        <span className="font-medium">{currentNav?.label || "Platform"}</span>
      </div>

      <div className="flex-1 max-w-sm hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents, documents, goals..."
            className="w-full pl-8 pr-4 py-1.5 text-sm bg-muted rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#78BE21] rounded-full"></span>
        </Button>

        <div className="flex items-center gap-2 pl-2 border-l">
          <div className="w-7 h-7 rounded-full bg-[#003865] flex items-center justify-center text-white text-xs font-bold">
            EC
          </div>
          <span className="text-sm hidden sm:inline text-muted-foreground">Equity Consultant</span>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:agentId" element={<AgentChat />} />
            <Route path="/metrics" element={<EquityMetricsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          classNames: {
            toast: "font-sans"
          }
        }}
      />
    </div>
  );
}
