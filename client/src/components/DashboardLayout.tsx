import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "./ThemeProvider";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FilePlus,
  GitBranch,
  BarChart3,
  FileCheck,
  Brain,
  BookOpen,
  MessageCircle,
  Settings,
  Sun,
  Moon,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "New Request", href: "/intake", icon: FilePlus },
  { label: "Workflow Center", href: "/workflow-center", icon: GitBranch },
  { label: "KPI Tracker", href: "/kpis", icon: BarChart3 },
  { label: "Policy Review", href: "/policy-review", icon: FileCheck },
  { label: "Equity Memory", href: "/equity-memory", icon: Brain },
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { label: "AI Assistant", href: "/assistant", icon: MessageCircle },
  { label: "Admin", href: "/admin", icon: Settings },
];

function EquityLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-label="One DSD Equity Program logo"
      className="shrink-0"
    >
      {/* Outer circle representing inclusion */}
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      {/* Inner connected shapes representing equity/unity */}
      <circle cx="16" cy="10" r="3" fill="currentColor" opacity="0.9" />
      <circle cx="10.5" cy="19" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="21.5" cy="19" r="3" fill="currentColor" opacity="0.7" />
      {/* Connecting lines */}
      <line x1="14" y1="12.5" x2="12" y2="16.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="18" y1="12.5" x2="20" y2="16.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="13.5" y1="19" x2="18.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function getPageTitle(path: string): string {
  const item = navItems.find(i => i.href === path);
  return item?.label || "Dashboard";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 lg:z-auto h-full flex flex-col
          bg-[hsl(204,50%,12%)] text-white transition-all duration-200
          ${sidebarOpen ? "w-60" : "w-16"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo area */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${!sidebarOpen && "justify-center px-2"}`}>
          <EquityLogo />
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="font-semibold text-sm leading-tight tracking-tight">One DSD</div>
              <div className="text-[11px] text-white/60 leading-tight">Equity Program</div>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            data-testid="button-close-mobile-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? location === "/" : location === item.href || location.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer
                    transition-colors duration-150
                    ${isActive
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                    }
                    ${!sidebarOpen && "justify-center px-2"}
                  `}
                  data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User area */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                DU
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">Dev User</div>
                <div className="text-[11px] text-white/50 truncate">dev@dhs.mn.gov</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`px-4 py-2 border-t border-white/10 ${!sidebarOpen && "px-2 text-center"}`}>
          <span className="text-[11px] text-white/40">Q1 FY2026</span>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 flex items-center gap-4 px-4 lg:px-6 border-b bg-background shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex text-muted-foreground hover:text-foreground"
            data-testid="button-sidebar-toggle"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen && "rotate-180"}`} />
          </button>

          <h1 className="text-base font-semibold text-foreground">{getPageTitle(location)}</h1>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-56 h-9 text-sm bg-muted/50 border-transparent focus:border-border"
                data-testid="input-search"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative h-9 w-9" data-testid="button-notifications">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white border-0">
                3
              </Badge>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
          <div className="px-6 py-4 border-t mt-auto">
            <PerplexityAttribution />
          </div>
        </main>
      </div>
    </div>
  );
}
