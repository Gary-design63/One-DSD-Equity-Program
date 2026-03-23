import React, { useRef, useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Paperclip } from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditProvider, useEditContext } from "@/context/EditContext";
import { AccessibilityBar, SkipLink } from "@/components/AccessibilityBar";
import Dashboard from "@/pages/Dashboard";
import AgentsPage from "@/pages/AgentsPage";
import AgentChat from "@/pages/AgentChat";
import CommunityPage from "@/pages/CommunityPage";
import TrainingPage from "@/pages/TrainingPage";
import GoalsPage from "@/pages/GoalsPage";
import PolicyPage from "@/pages/PolicyPage";
import EquityMetricsPage from "@/pages/EquityMetricsPage";
import SettingsPage from "@/pages/SettingsPage";
import CompletionChecklist from "@/pages/CompletionChecklist";
import KnowledgeBasePage from "@/pages/KnowledgeBasePage";
import WorkflowsPage from "@/pages/WorkflowsPage";
import TemplatesPage from "@/pages/TemplatesPage";
import EquityAssist from "@/components/EquityAssist";

interface NavItem {
  label: string;
  path: string;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  // Operations
  { label: "Dashboard",          path: "/",          group: "Operations" },
  { label: "Agents",             path: "/agents",    group: "Operations" },
  // Analysis
  { label: "Equity Metrics",     path: "/metrics",   group: "Analysis" },
  { label: "Policy Documents",   path: "/policy",    group: "Analysis" },
  { label: "Knowledge Base",     path: "/knowledge", group: "Analysis" },
  // Operations
  { label: "Workflows",          path: "/workflows", group: "Processes" },
  { label: "Templates",          path: "/templates", group: "Processes" },
  // Community & Learning
  { label: "Communities",        path: "/community",  group: "Community" },
  { label: "Training",           path: "/training",   group: "Learning" },
  { label: "Goals",              path: "/goals",      group: "Learning" },
  { label: "Checklist",          path: "/checklist",  group: "Learning" },
  // System
  { label: "Settings",           path: "/settings",   group: "System" },
];

const NAV_GROUPS = ["Operations", "Analysis", "Processes", "Community", "Learning", "System"];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-[#003865] text-white z-50 transform transition-transform duration-200 ease-in-out flex flex-col",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#78BE21] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">DSD</span>
            </div>
            <div>
              <div className="font-bold text-sm leading-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                One <span className="text-[#FFB71B]">DSD</span>
              </div>
              <div className="text-xs text-white/60 leading-tight">Equity Platform</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white text-sm px-1" aria-label="Close menu">
            ✕
          </button>
        </div>

        {/* Navigation grouped */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4" aria-label="Main navigation">
          {NAV_GROUPS.map(group => {
            const items = NAV_ITEMS.filter(i => i.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold px-3 mb-1">{group}</div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive ? "bg-white/15 text-white font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 leading-relaxed">
            <div className="font-medium text-white/60 mb-1">Primary Directive</div>
            <div className="italic">"Every agent must multiply the Consultant's capacity, never divide it."</div>
          </div>
          <div className="mt-3 text-xs text-white/30">v3.0 · Minnesota DHS · DSD</div>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick, zoom, onZoomChange }: { onMenuClick: () => void; zoom: number; onZoomChange: (z: number) => void }) {
  const location = useLocation();
  const { isEditing, toggleEditing, handleSave, handleDownload, handleUpload } = useEditContext();
  const uploadRef = useRef<HTMLInputElement>(null);

  const currentNav = NAV_ITEMS.find(item =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );

  return (
    <>
      {/* Suite bar — gold accent */}
      <div className="h-1 bg-[#FFB71B]" />
      <header className="bg-white border-b border-border h-14 flex items-center px-4 gap-3 sticky top-0 z-30">
        <button onClick={onMenuClick} className="lg:hidden text-muted-foreground hover:text-foreground text-sm font-medium" aria-label="Open menu">
          Menu
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:inline">One DSD</span>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <span className="font-medium">{currentNav?.label || "Platform"}</span>
        </div>

        <div className="flex-1 max-w-xs hidden md:flex">
          <input
            type="text"
            placeholder="Search agents, documents, communities..."
            className="w-full px-4 py-1.5 text-sm bg-muted rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            aria-label="Search the platform"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave} className="text-xs h-8 bg-[#78BE21] hover:bg-[#5fa018] text-white">
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={toggleEditing} className="text-xs h-8">
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={toggleEditing} className="text-xs h-8">
              Edit
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1"
            onClick={() => uploadRef.current?.click()}
            aria-label="Import file"
          >
            <Paperclip className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <input
            ref={uploadRef}
            type="file"
            accept=".json,audio/*,video/*,image/*,.pdf,.doc,.docx,.txt,.csv"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />

          <Button size="sm" variant="outline" onClick={handleDownload} className="text-xs h-8">
            Export
          </Button>

          {/* Zoom control */}
          <div className="hidden lg:flex items-center gap-1 pl-2 border-l ml-1">
            <AccessibilityBar zoom={zoom} onZoomChange={onZoomChange} />
          </div>

          <div className="flex items-center gap-2 pl-2 border-l">
            <div className="w-7 h-7 rounded-full bg-[#003865] flex items-center justify-center text-white text-xs font-bold">
              EC
            </div>
            <span className="text-sm hidden xl:inline text-muted-foreground">Equity Consultant</span>
          </div>
        </div>
      </header>
    </>
  );
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoom, setZoom] = useState(() => {
    try {
      return Number(localStorage.getItem("onedsd-zoom")) || 100;
    } catch {
      return 100;
    }
  });

  useEffect(() => {
    localStorage.setItem("onedsd-zoom", String(zoom));
  }, [zoom]);

  return (
    <div className="min-h-screen bg-background flex">
      <SkipLink />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} zoom={zoom} onZoomChange={setZoom} />
        <main
          id="main-content"
          className="flex-1 overflow-auto"
          style={{ fontSize: `${zoom}%` }}
          tabIndex={-1}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:agentId" element={<AgentChat />} />
            <Route path="/metrics" element={<EquityMetricsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/knowledge" element={<KnowledgeBasePage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/checklist" element={<CompletionChecklist />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {/* Footer */}
        <footer className="bg-white text-center py-3 text-xs text-muted-foreground border-t border-border">
          Minnesota Department of Human Services · Disability Services Division · v3.0 · 2026
        </footer>
      </div>
      <EquityAssist />
      <Toaster position="top-right" richColors toastOptions={{ classNames: { toast: "font-sans" } }} />
    </div>
  );
}

export default function App() {
  return (
    <EditProvider>
      <AppShell />
    </EditProvider>
  );
}
